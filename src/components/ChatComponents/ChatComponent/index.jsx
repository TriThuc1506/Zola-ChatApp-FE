import { useEffect, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { PiUserSwitchThin } from "react-icons/pi";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import ListChatComponent from "../ListChatComponent";
import PeopleChatComponent from "../PeopleChatComponent";
import { MdCameraAlt } from "react-icons/md";
import { HiMagnifyingGlass } from "react-icons/hi2";
import useFriend from "../../../hooks/useFriend";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../../contexts/AuthContext";
import useGroup from "../../../hooks/useGroup";
import axiosInstance from "../../../api/axiosInstance";
import useConversation from "../../../hooks/useConversation";

function ChatComponents({ language }) {
  const [userChat, setUserChat] = useState(null);
  const {
    friends,
    recommendedFriends,
    loading,
    getAllFriends,
    getFriendByPhone,
    getRecommendedFriends,
    addFriend,
  } = useFriend();
  const { authUser, reloadAuthUser } = useAuthContext();
  const { conversations, getConversations } = useConversation();
  const { createGroup, addMember, grLoading, getGroups, groups } = useGroup();

  const [phone, setPhone] = useState("");
  const [nameGroup, setNameGroup] = useState("");
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [isInputFocusGroup, setIsInputFocusGroup] = useState(false);
  const [friendList, setFriendList] = useState([]);
  const [showAllNewFriends, setShowAllNewFriends] = useState(false);
  const [recommentFriendList, setRecommentFriendList] = useState();
  const [friendToAdd, setFriendToAdd] = useState("");
  const [isShowModal, setIsShowModal] = useState("");
  const [shareMessage, setShareMessage] = useState();
  const [groupToChange, setGroupToChange] = useState(null);
  const [valueSearch, setValueSearch] = useState("");
  const [originalFriendList, setOriginalFriendList] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [listChatCurrent, setListChatCurrent] = useState([]);

  const [members, setMembers] = useState([]);

  const sendMessage = async (data, receiverId, isGroup) => {
    try {
      if (!data || data.trim === "") return;
      let messageType;
      if (receiverId) {
        if (data.type === "text") {
          messageType = "sendText";
        } else if (data.type === "image") {
          messageType = "sendImages";
        } else if (data.type === "video") {
          messageType = "sendVideo";
        } else {
          messageType = "sendFiles";
        }

        await axiosInstance.post(
          `chats/${receiverId}/${messageType}`,
          { data: data, isGroup },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const visibleFriends = showAllNewFriends
    ? isShowModal === "addFriend"
      ? recommentFriendList
      : friendList
    : (isShowModal === "addFriend" ? recommentFriendList : friendList).slice(
        0,
        3
      );

  useEffect(() => {
    const fetchFriends = async () => {
      await getAllFriends();
      await getRecommendedFriends();
    };
    fetchFriends();
    getConversations();
    getGroups();
  }, [authUser]);

  useEffect(() => {
    const listGroup = groups.map((group) => {
      return {
        id: group._id,
        conversationId: group.conversation._id,
        name: group.groupName,
        avatar: group.avatar.url,
        background: group.avatar.url,
        lastMessage: group.lastMessage,
        tag: group.conversation.tag,
        creator: group.createBy,
        admins: group.admins,
        timestamp: group.lastMessage.timestamp,
      };
    });
    // sort list group by last message timestamp
    listGroup.sort((a, b) => {
      const lastTimeA = new Date(a.lastMessage?.timestamp);
      const lastTimeB = new Date(b.lastMessage?.timestamp);
      return lastTimeB - lastTimeA;
    });

    setFriendList([...friends, ...listGroup]);
    setOriginalFriendList(friends);
    setRecommentFriendList(recommendedFriends);
    setListChatCurrent(conversations);
  }, [friends, recommendedFriends, conversations, groups]);

  const changeShowModal = (modal) => {
    setIsShowModal(modal);
  };

  const handleSearch = async () => {
    if (phone === "") {
      setRecommentFriendList(recommendedFriends);
      toast.error(
        language == "vi"
          ? "Vui lòng nhập số điện thoại để tìm kiếm"
          : "Please enter a phone number to search"
      );
      return;
    }
    const userSearch = await getFriendByPhone(phone);
    if (userSearch) {
      setRecommentFriendList([userSearch]);
      setShowAllNewFriends(true);
    }
    return;
  };

  const handleAddFriend = async (friend) => {
    setFriendToAdd(friend.phone);
    await addFriend(friend.phone);
    await reloadAuthUser();
  };

  const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setValueSearch(searchTerm);
    if (searchTerm.trim() === "") {
      setFriendList(originalFriendList);
    } else {
      const filteredFriends = originalFriendList.filter((friend) =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFriendList(filteredFriends);
    }
  };

  const handleCheckboxChange = (friend) => {
    if (selectedFriends.includes(friend.id)) {
      setSelectedFriends(selectedFriends.filter((f) => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const sendMessageToSelectedFriends = async (content) => {
    selectedFriends.forEach((friend) => {
      sendMessage(content, friend.id, friend.tag === "group");
    });
  };

  const handleSendButtonClick = () => {
    if (selectedFriends.length === 0) {
      return;
    }
    sendMessageToSelectedFriends(shareMessage.contents[0]);
    setIsShowModal(false);
  };

  const handleAddGroup = async () => {
    if (members.length < 2) {
      toast.error(
        language == "vi"
          ? "Tạo nhóm cần có thêm ít nhất 2 thành viên"
          : "Creating a group requires at least 2 members"
      );
      return;
    }
    if (nameGroup === "") {
      toast.error(
        language == "vi"
          ? "Vui lòng nhập tên nhóm để tiếp tục"
          : "Please enter a group name to continue"
      );
      return;
    }
    const groupData = {
      name: nameGroup,
      members: members.map((member) => member.id),
    };
    const rs = await createGroup(groupData);
    if (rs) {
      setIsShowModal("");
      setMembers([]);
      setNameGroup("");
      toast.success(
        language == "vi" ? "Tạo nhóm thành công" : "Create group successfully"
      );
    }
  };

  const handleAddMemberToGroup = async () => {
    if (members.length < 1) {
      toast.error(
        language == "vi"
          ? "Vui lòng chọn ít nhất 1 thành viên để thêm vào nhóm"
          : "Please select at least 1 member to add to the group"
      );
      return;
    }
    const groupData = {
      groupId: groupToChange,
      members: members.map((member) => member.id),
    };
    const rs = await addMember(groupToChange, groupData);
    if (rs) {
      setIsShowModal("");
      setMembers([]);
      toast.success(
        language == "vi"
          ? "Thêm thành viên vào nhóm thành công"
          : "Add members to group successfully"
      );
      // const newMembers = 
      await axiosInstance.post(
        `chats/${groupToChange}/sendText`,
        {
          data: {
            type: "text",
            data: `${authUser?.profile?.name} đã thêm ${members[0]?.name} vào nhóm`,
          },
          replyMessageId : null,
          isGroup : true,
        }
      );
      
      rs?.forEach((message) => {
        toast.success(message);
      });

    }
  };

  return (
    <>
      <div className="relative bg-gray-100 h-screen w-full flex">
        <div className="h-screen w-full sm:w-96 bg-white">
          <ListChatComponent
            language={language}
            changeUserChat={setUserChat}
            showModal={changeShowModal}
            friends={friendList}
            conversations={listChatCurrent}
          />
        </div>
        <PeopleChatComponent
          language={language}
          userChat={userChat}
          showModal={changeShowModal}
          shareMessage={setShareMessage}
          groupToChange={setGroupToChange}
        />
        {isShowModal === "addFriend" && (
          <div className="z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/5 h-[90%] bg-white rounded-lg shadow-lg ">
            <div className="relative flex items-center justify-between p-4 border-b text-lg font-semibold h-[10%]">
              <p>{language == "vi" ? "Thêm Bạn" : "Add Friend"}</p>
              <button
                onClick={() => {
                  setIsShowModal("");
                  setShowAllNewFriends(false);
                  setRecommentFriendList(recommendedFriends);
                  setPhone("");
                }}
                className="absolute flex justify-center items-center top-2 right-2 cursor-pointer border rounded-full p-2 hover:bg-gray-200 w-10 h-10 "
              >
                x
              </button>
            </div>
            <div className=" flex items-center justify-between p-4 h-[10%]">
              <button className="flex items-center border-b pb-1 w-40">
                <img
                  src="https://emojigraph.org/media/apple/flag-vietnam_1f1fb-1f1f3.png"
                  alt="flag"
                  className="w-8 h-8"
                />
                <p className="text-base font-semibold ml-2">(+84)</p>
                <FaCaretDown size={23} fill="gray" className="ml-2" />
              </button>

              <div
                className={`${
                  isInputFocus === true
                    ? "flex border-b mr-auto ml-6 w-full border-blue-500  "
                    : "flex  border-b mr-auto ml-6 w-full "
                }`}
              >
                <input
                  type="text"
                  className="h-9 w-full outline-none"
                  placeholder={
                    language == "vi"
                      ? "Nhập số điện thoại"
                      : "Enter your phone number"
                  }
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setIsInputFocus(true)}
                  onBlur={() => setIsInputFocus(false)}
                />
              </div>
            </div>
            <div
              className={`flex-col p-4 mb-3 h-[65%] ${
                showAllNewFriends ? "overflow-y-auto" : "overflow-y-hidden"
              }`}
            >
              <div className="flex items-center">
                <PiUserSwitchThin size={16} fill="gray" />
                <p className="text-sm text-gray-500 ml-2">Có thể bạn quen</p>
              </div>
              <div className="flex-col h-screen mt-2">
                {visibleFriends.map((friend) => {
                  const isFriend = friendList.some((f) => f.id === friend.id);
                  const isSent = authUser?.requestSent?.some(
                    (f) => f === friend.id
                  );

                  return (
                    <div
                      key={friend.id}
                      className="flex justify-between hover:bg-gray-200 transition-colors duration-300 ease-in-out p-2"
                    >
                      <div className="bg-blue w-10 ">
                        <img
                          className="rounded-full w-10 h-10 object-cover"
                          src={friend.avatar || "/zalo.svg"}
                          alt="cloud"
                        />
                      </div>
                      <div className="flex mr-auto ml-2 p-1">
                        <p className="font-semibold ">
                          {friend.name || friend.profile.name}
                        </p>
                      </div>

                      {!isFriend && (
                        <>
                          {!isSent ? (
                            <button
                              className="bg-primary p-2 pl-4 pr-4 rounded-lg hover:bg-primaryHover"
                              onClick={() => handleAddFriend(friend)}
                            >
                              <p className="text-white">
                                {loading && friendToAdd === friend.phone ? (
                                  <span className="loading loading-spinner"></span>
                                ) : language == "vi" ? (
                                  "Kết bạn"
                                ) : (
                                  "Add friend"
                                )}
                              </p>
                            </button>
                          ) : (
                            <button className="bg-gray-200 p-2 pl-4 pr-4 rounded-lg hover:bg-slate-300">
                              <p className="text-md hover:font-semibold">
                                {language == "vi" ? "Đã gửi" : "Sent"}
                              </p>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                {!showAllNewFriends && visibleFriends.length <= 3 && (
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setShowAllNewFriends(true)}
                  >
                    Xem thêm
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center border-t h-[15%]">
              <div className="flex ml-auto mb-auto mt-3">
                <button
                  className="rounded-lg bg-gray-300 p-3 pl-6 pr-6 mr-3 hover:bg-gray-500"
                  onClick={() => {
                    setShowAllNewFriends(false);
                    setIsShowModal("");
                  }}
                >
                  <p className="text-lg font-semibold">
                    {language == "vi" ? "Hủy" : "Cancel"}
                  </p>
                </button>
                <button
                  className="rounded-lg bg-primary p-3 pl-6 pr-6 mr-3 hover:bg-primaryHover"
                  onClick={handleSearch}
                >
                  <p className="text-lg font-semibold text-white">
                    {language == "vi" ? "Tìm Kiếm" : "Search"}
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
        {isShowModal === "addGroup" && (
          <div className="z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/5 h-[90%] bg-white rounded-lg shadow-lg ">
            <div className="relative flex items-center justify-between p-4 border-b text-lg font-semibold h-[10%]">
              <p>
                {groupToChange
                  ? language == "vi"
                    ? "Thêm thành viên"
                    : "Add members"
                  : language == "vi"
                  ? "Tạo nhóm"
                  : "Create group"}
              </p>
              <button
                onClick={() => {
                  setIsShowModal("");
                  setShowAllNewFriends(false);
                  setMembers([]);
                  setGroupToChange(null);
                }}
                className="absolute flex justify-center items-center top-2 right-2 cursor-pointer border rounded-full p-2 hover:bg-gray-200 w-10 h-10 "
              >
                x
              </button>
            </div>
            {!groupToChange && (
              <div className=" flex items-center justify-between pl-4 pr-4 pt-2 h-[10%]">
                <button className="flex rounded-full border p-3">
                  <MdCameraAlt size={25} fill="gray" />
                </button>
                <div
                  className={`${
                    isInputFocusGroup === true
                      ? "flex border-b mr-auto ml-6 w-full border-blue-500  "
                      : "flex  border-b mr-auto ml-6 w-full "
                  } `}
                >
                  <input
                    type="text"
                    className="h-9 w-full outline-none "
                    placeholder={
                      language == "vi"
                        ? "Nhập tên nhóm"
                        : "Enter the group name"
                    }
                    value={nameGroup}
                    onChange={(e) => setNameGroup(e.target.value)}
                    onFocus={() => setIsInputFocusGroup(true)}
                    onBlur={() => setIsInputFocusGroup(false)}
                  />
                </div>
              </div>
            )}
            <div
              className={` h-[6%] flex items-center rounded-full border  m-4 mt-2 mb-2 ${
                isInputFocusGroup === true ? " border-blue-500 " : ""
              } `}
            >
              <HiMagnifyingGlass size={18} className="ml-2" />
              <input
                type="text"
                className="w-[89%] outline-none ml-2 "
                placeholder={
                  language == "vi" ? "Tìm kiếm bạn bè" : "Search for friends"
                }
                value={valueSearch}
                onChange={handleInputChange}
                onFocus={() => setIsInputFocusGroup(true)}
                onBlur={() => setIsInputFocusGroup(false)}
              />
            </div>
            <div className="flex justify-start items-center mb-3">
              <p className="col-span-2 font-semibold mx-5">
                {language == "vi" ? "Danh sách thành viên" : "List of members"}
              </p>
              <AiOutlineUsergroupAdd
                size={22}
                fill="green"
                onClick={() => setIsShowModal("addFriend")}
                className="cursor-pointer"
              />
            </div>
            <div className=" h-[15%] grid grid-cols-3 gap-3 px-4 pb-4 overflow-x-auto  w-full border-b">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-between p-2 border rounded-3xl max-h-16 w-full"
                >
                  <div className="w-14 h-10 ">
                    <img
                      className="rounded-full w-10 h-10 object-cover"
                      src={member.avatar || "/zalo.svg"}
                      alt="cloud"
                    />
                  </div>
                  <div className="flex mr-auto ml-2 p-1">
                    <p className="text-sm font-semibold">{member?.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMembers((prev) => prev.filter((i) => i !== member));
                    }}
                    className="cursor-pointer absolute bg-red-300 hover:bg-red-500  flex items-center justify-center h-5 w-5 rounded-full hover:scale-110 transition-transform duration-300 ease-in-out top-0 right-0"
                  >
                    <span className="text-gray-600 hover:text-white">x</span>
                  </button>
                </div>
              ))}
            </div>
            <div className=" h-[42%] flex-col pt-2 p-4 items-center overflow-y-auto">
              <p className="font-semibold">
                {language == "vi" ? "Danh sách bạn bè" : "List of friends"}
              </p>
              <div className="flex-col max-h-44 mt-2">
                {visibleFriends.map((friend) => {
                  if (friend.tag !== "group") {
                    return (
                      <div
                        key={friend.id}
                        onClick={() => {
                          setMembers((prev) => {
                            if (prev.includes(friend)) {
                              return prev.filter((i) => i !== friend);
                            }
                            return [...prev, friend];
                          });
                        }}
                        className="cursor-pointer flex items-center  justify-between hover:bg-gray-200 transition-colors duration-300 ease-in-out p-2"
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={members.includes(friend)}
                          onChange={() => {
                            setMembers((prev) => {
                              if (prev.includes(friend)) {
                                return prev.filter((i) => i !== friend);
                              }
                              return [...prev, friend];
                            });
                          }}
                        />
                        <div className="bg-blue w-10 ">
                          <img
                            className="rounded-full w-10 h-10 object-cover"
                            src={friend.avatar}
                            alt="cloud"
                          />
                        </div>
                        <div className="flex mr-auto ml-2 p-1">
                          <p className="font-semibold ">{friend.name}</p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
              {!showAllNewFriends &&
                visibleFriends.length <= 3 &&
                friendList.length > 3 && (
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setShowAllNewFriends(true)}
                  >
                    Xem thêm
                  </button>
                )}
            </div>

            <div className="flex items-center border-t h-[10%]">
              <div className="flex ml-auto mt-1">
                <button
                  className="rounded-lg bg-gray-200 p-3 pl-6 pr-6 mr-3 hover:bg-gray-300"
                  onClick={() => {
                    setIsShowModal("");
                    setShowAllNewFriends(false);
                    setMembers([]);
                    setGroupToChange(null);
                  }}
                >
                  <p className="text-lg font-semibold">
                    {language == "vi" ? "Hủy" : "Cancel"}
                  </p>
                </button>
                {groupToChange ? (
                  <button
                    className="rounded-lg bg-primaryHover p-3 pl-6 pr-6 mr-3 hover:bg-primary"
                    onClick={handleAddMemberToGroup}
                  >
                    {grLoading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <p className="text-lg font-semibold text-white">
                        {language == "vi" ? "Thêm thành viên" : "Add members"}
                      </p>
                    )}
                  </button>
                ) : (
                  <button
                    className="rounded-lg bg-primaryHover p-3 pl-6 pr-6 mr-3 hover:bg-primary"
                    onClick={handleAddGroup}
                    disabled={grLoading}
                  >
                    {grLoading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <p className="text-lg font-semibold text-white">
                        {language == "vi" ? "Tạo nhóm" : "Create group"}
                      </p>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {isShowModal === "share" && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/5 h-[90%] bg-white rounded-lg shadow-lg ">
            <div className="relative flex items-center justify-between p-4 border-b text-lg font-semibold h-[10%]">
              <p>{language == "vi" ? "Chia Sẻ" : "Share"}</p>
              <button
                onClick={() => {
                  setIsShowModal("");
                  setShowAllNewFriends(false);
                }}
                className="absolute flex justify-center items-center top-2 right-2 cursor-pointer border rounded-full p-2 hover:bg-gray-200 w-10 h-10 "
              >
                x
              </button>
            </div>

            <div className=" flex items-center justify-between p-4 h-[10%]">
              <div className="flex  border-b mr-auto ml-6 w-full justify-between items-center">
                <HiMagnifyingGlass size={18} className="mx-3" />
                <input
                  type="text"
                  className="h-9 w-full outline-none"
                  placeholder={
                    language == "vi" ? "Tìm Kiếm bạn bè" : "Search for friends"
                  }
                  value={valueSearch}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className=" h-[50%] flex-col pt-2 p-4 items-center overflow-y-auto">
              <p className="font-semibold">
                {language == "vi" ? "Danh sách bạn bè" : "List of friends"}
              </p>
              <div className="flex-col max-h-44 mt-2">
                {friendList.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center  justify-between hover:bg-gray-200 transition-colors duration-300 ease-in-out p-2"
                  >
                    <div className="bg-blue w-10 flex">
                      <input
                        className=""
                        type="checkbox"
                        checked={selectedFriends.includes(friend)}
                        onChange={() => handleCheckboxChange(friend)}
                      />
                      <img
                        className="rounded-full w-10 h-10 ml-2 object-cover"
                        src={friend.avatar}
                        alt="cloud"
                      />
                    </div>
                    <div className="flex mr-auto ml-6 p-1">
                      <p className="font-semibold ">{friend.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col pl-4 pr-4 pb-4 overflow-x-auto h-[20%] border w-full rounded-lg">
              <h1 className="font-bold w-full border-b py-2">
                {language == "vi"
                  ? "Nội dung chia sẻ:"
                  : "Content to be shared :"}
              </h1>

              {shareMessage.contents[0].type === "text" && (
                <p className="text-base font-semibold">
                  {shareMessage.contents[0].data}
                </p>
              )}
              {shareMessage.contents[0].type === "image" && (
                <div className="p-3 flex justify-center items-center">
                  <img
                    src={shareMessage.contents[0].data}
                    alt="share"
                    className="w-full h-full rounded-sm object-cover"
                  />
                </div>
              )}

              {shareMessage.contents[0].type === "video" && (
                <div>
                  <video
                    controls
                    className="pr-2 pb-2"
                    style={{ width: "auto", height: "250px" }}
                  >
                    <source
                      src={shareMessage.contents[0].data}
                      type="video/mp4"
                    />
                    <source
                      src={shareMessage.contents[0].data}
                      type="video/webm"
                    />
                    <source
                      src={shareMessage.contents[0].data}
                      type="video/ogg"
                    />
                    <source
                      src={shareMessage.contents[0].data}
                      type="video/x-matroska"
                    />
                    <source
                      src={shareMessage.contents[0].data}
                      type="video/x-msvideo"
                    />
                    <source
                      src={shareMessage.contents[0].data}
                      type="video/quicktime"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            <div className="flex items-center h-[10%] ">
              <div className="flex ml-auto mb-auto mt-1">
                <button
                  className="rounded-lg bg-gray-300 p-2 pl-6 pr-6 mr-3 hover:bg-gray-500"
                  onClick={() => {
                    setShowAllNewFriends(false);
                    setIsShowModal("");
                  }}
                >
                  <p className="text-lg font-semibold">
                    {language == "vi" ? "Hủy" : "Cancel"}
                  </p>
                </button>
                <button
                  className="rounded-lg bg-primary  p-2 pl-6 pr-6 mr-3 hover:bg-primaryHover"
                  onClick={handleSendButtonClick}
                >
                  <p className="text-lg text-white font-semibold">
                    {language == "vi" ? "Chia sẻ" : "Share"}
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ChatComponents;
