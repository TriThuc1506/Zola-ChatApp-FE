import ContactMenu from "../ContactMenu";
import FriendListComponent from "../FriendListComponent";
import JoinGroupComponent from "../JoinedGroupComponent";
import FriendRequestComponent from "../FriendRequestComponent";
import useFriend from "../../../hooks/useFriend";

import { useEffect, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { PiUserSwitchThin } from "react-icons/pi";
import { MdCameraAlt } from "react-icons/md";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useAuthContext } from "../../../contexts/AuthContext";
import { toast } from "react-hot-toast";

function ContactComponent({ language }) {
  const [tabSelected, setTabSelected] = useState(0);
  const [isAddFriend, setIsAddFriend] = useState(false);
  const [isAddGroup, setIsAddGroup] = useState(false);
  const {
    friends,
    recommendedFriends,
    loading,
    getAllFriends,
    getFriendByPhone,
    getFriendById,
    getRecommendedFriends,
    addFriend,
    acceptFriend,
    unFriend,
    rejectFriend,
    cancelFriendRequest,
  } = useFriend();
  const { authUser, reloadAuthUser } = useAuthContext();
  const [friendToAdd, setFriendToAdd] = useState("");

  const [phone, setPhone] = useState("");
  const [nameGroup, setNameGroup] = useState("");
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [isInputFocusGroup, setIsInputFocusGroup] = useState(false);
  const [friendList, setFriendList] = useState([]);
  const [showAllNewFriends, setShowAllNewFriends] = useState(false);
  const [recommentFriendList, setRecommentFriendList] = useState([]);

  const [friendRecieved, setFriendRecieved] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  const visibleFriends = showAllNewFriends
    ? recommentFriendList
    : recommentFriendList.slice(0, 3);

  useEffect(() => {
    const fetchFriends = async () => {
      await getAllFriends();
      await getRecommendedFriends();
    };
    const fetchFriendData = async () => {
      const requestPromises = authUser.requestSent?.map((uid) =>
        getFriendById(uid)
      );
      const receivedPromises = authUser.requestReceived?.map((uid) =>
        getFriendById(uid)
      );

      if (requestPromises && requestPromises.length > 0) {
        const requestResults = await Promise.all(requestPromises);
        setFriendRecieved(requestResults);
      }

      if (receivedPromises && receivedPromises.length > 0) {
        const receivedResults = await Promise.all(receivedPromises);
        setFriendRequests(receivedResults);
      }
    };

    fetchFriendData();
    fetchFriends();
  }, [authUser]);

  useEffect(() => {
    setFriendList(friends);
    setRecommentFriendList(recommendedFriends);
  }, [friends, recommendedFriends]);

  const handleRadioChange = (friendId) => {
    setFriendList((prevList) =>
      prevList.map((friend) =>
        friend.id === friendId
          ? { ...friend, isChecked: !friend.isChecked }
          : friend
      )
    );
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

  const handleAcceptFriend = async (friend) => {
    await acceptFriend(friend.phone);
    await reloadAuthUser();
  };

  const handleUnFriend = async (friend) => {
    await unFriend(friend.phone);
    await reloadAuthUser();
  };

  const handleRejectFriend = async (friend) => {
    await rejectFriend(friend.phone);
    await reloadAuthUser();
  };

  const handleCancelFriendRequest = async (friend) => {
    await cancelFriendRequest(friend.phone);
    await reloadAuthUser();
  };

  const changeTab = (tab) => {
    setTabSelected(tab);
  };
  return (
    <>
      <div className="bg-gray-100 h-screen w-full flex">
        <div className="h-screen w-full sm:w-96 bg-white">
          <ContactMenu
            language={language}
            changeTab={changeTab}
            isAddFriend={setIsAddFriend}
            isAddGroup={setIsAddFriend}
            friends={friendList}
          />
        </div>
        <div className="h-screen sm:w-[calc(100%-24rem)] w-0 overflow-auto">
          {tabSelected == 0 ? (
            <FriendListComponent language={language} friends={friendList} />
          ) : tabSelected == 1 ? (
            <JoinGroupComponent language={language} />
          ) : (
            <FriendRequestComponent
              language={language}
              reqFriends={friendRequests}
              receivedFriends={friendRecieved}
            />
          )}
        </div>

        {isAddFriend && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/5 h-[90%] bg-white rounded-lg shadow-lg ">
            <div className=" flex items-center justify-between p-4 border-b text-lg font-semibold h-[10%]">
              <p>Thêm bạn </p>
              <button
                onClick={() => {
                  setIsAddFriend(false);
                  setShowAllNewFriends(false);
                  setRecommentFriendList(recommendedFriends);
                  setPhone("");
                }}
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
                    ? " w-full flex items-center border-b mr-auto ml-6 border-blue-500 "
                    : "w-full flex items-center border-b mr-auto ml-6 "
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
                          className="rounded-full w-10 h-10"
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
                  onClick={() => setIsAddFriend(false)}
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
        {isAddGroup && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/5 h-[90%] bg-white rounded-lg shadow-lg ">
            <div className=" flex items-center justify-between p-4 border-b text-lg font-semibold h-[10%]">
              <p>Tạo nhóm</p>
              <button
                onClick={() => {
                  setIsAddGroup(false);
                  setShowAllNewFriends(false);
                }}
              >
                x
              </button>
            </div>
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
                  placeholder="Tên nhóm"
                  value={nameGroup}
                  onChange={(e) => setNameGroup(e.target.nameGroup)}
                  onFocus={() => setIsInputFocusGroup(true)}
                  onBlur={() => setIsInputFocusGroup(false)}
                />
              </div>
            </div>
            <div
              className={` h-[8%] flex items-center rounded-full border  m-4 mt-2 mb-2 ${
                isInputFocusGroup === true ? " border-blue-500 " : ""
              } `}
            >
              <HiMagnifyingGlass size={18} className="ml-2" />
              <input
                type="text"
                className="h-[97%] w-[89%] outline-none ml-2 "
                placeholder="Nhập tên, số điện thoại hoặc danh sách số điện thoại"
                value={nameGroup}
                onChange={(e) => setNameGroup(e.target.nameGroup)}
                onFocus={() => setIsInputFocusGroup(true)}
                onBlur={() => setIsInputFocusGroup(false)}
              />
            </div>

            <div className=" h-[42%] flex-col pt-2 p-4 items-center overflow-y-auto">
              <p className="font-semibold">Trò chuyện gần đây</p>
              <div className="flex-col max-h-44 mt-2">
                {friendList.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center  justify-between hover:bg-gray-200 transition-colors duration-300 ease-in-out p-2"
                  >
                    <input
                      type="radio"
                      className="mr-2"
                      checked={friend.isChecked}
                      onChange={() => handleRadioChange(friend.id)}
                    />
                    <div className="bg-blue w-10 ">
                      <img
                        className="rounded-full w-10 h-10"
                        src={friend.avatar}
                        alt="cloud"
                      />
                    </div>
                    <div className="flex mr-auto ml-2 p-1">
                      <p className="font-semibold ">{friend.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center border-t h-[15%]">
              <div className="flex ml-auto mb-auto mt-1">
                <button
                  className="rounded-lg bg-gray-300 p-3 pl-6 pr-6 mr-3 hover:bg-gray-500"
                  onClick={() => setIsAddGroup(false)}
                >
                  <p className="text-lg font-semibold">Hủy</p>
                </button>
                <button className="rounded-lg bg-blue-500 p-3 pl-6 pr-6 mr-3 hover:bg-blue-800">
                  <p className="text-lg font-semibold">Tìm kiếm</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ContactComponent;
