import { useEffect, useRef, useState } from "react";
import { BsLayoutSidebarReverse, BsTrash3 } from "react-icons/bs";
import { IoIosLink, IoMdShareAlt } from "react-icons/io";
import { GrUserAdmin } from "react-icons/gr";
import {
  IoImageOutline,
  IoTrashOutline,
  IoPersonRemoveOutline,
  IoPersonAddOutline,
  IoKeyOutline,
} from "react-icons/io5";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { LuPencilLine, LuSticker } from "react-icons/lu";
import { MdOutlineCancel, MdOutlinePublishedWithChanges } from "react-icons/md";
import { PiTagSimpleLight } from "react-icons/pi";
import { RiDoubleQuotesR } from "react-icons/ri";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { CiCircleCheck } from "react-icons/ci";
import axiosInstance from "../../../api/axiosInstance";
import { format } from "date-fns";
import { useSocketContext } from "../../../contexts/SocketContext";
import EmojiPicker from "emoji-picker-react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useAuthContext } from "../../../contexts/AuthContext";
import useConversation from "../../../hooks/useConversation";
import useGroup from "../../../hooks/useGroup";
import toast from "react-hot-toast";

function PeopleChatComponent({
  language,
  userChat,
  showModal,
  shareMessage,
  groupToChange,
}) {
  // State for current user
  const [thisUser, setThisUser] = useState(userChat);

  // State for chat content
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const scrollRef = useRef(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isAddingMessages, setIsAddingMessages] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [contentReply, setContentReply] = useState("");
  const [messageReplyId, setMessageReplyId] = useState("");
  const [truncatedContent, setTruncatedContent] = useState("");

  // Context
  const { authUser } = useAuthContext();
  const { isNewSocket, newSocketData } = useSocketContext();
  // Custom hook
  const { getConversationByID, conversation } = useConversation();
  const {
    grLoading,
    updateGroup,
    removeMember,
    deleteGroup,
    leaveGroup,
    changeAdmins,
  } = useGroup();

  // State for sidebar and group info
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [listMembers, setListMembers] = useState([]);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangeAvatar, setIsChangeAvatar] = useState(false);
  const [name, setName] = useState("");

  //state for admin change modal
  const [isShowAdminChange, setIsShowAdminChange] = useState(false);
  const [isShowConfirmChange, setIsShowConfirmChange] = useState(false);
  const [memberChange, setMemberChange] = useState(null);
  const [typeModal, setTypeModal] = useState("removeAdmin");
  const [isInputFocusGroup, setIsInputFocusGroup] = useState(false);
  const [valueSearch, setValueSearch] = useState("");
  const [originalListMember, setOriginalListMember] = useState([]);

  useEffect(() => {
    setThisUser(userChat);

    if (!userChat || userChat?.tag !== "group") {
      setSidebarVisible(false);
    }
    if (userChat?.admins?.includes(authUser._id)) {
      if (userChat?.creator?._id === authUser._id) {
        setIsCreator(true);
      }
      setIsGroupAdmin(true);
    } else {
      setIsGroupAdmin(false);
      setIsCreator(false);
    }
    setName(userChat?.name);

    if (userChat?.conversationId) {
      getConversationByID(userChat?.conversationId);
    } else {
      setMessages([]);
    }
  }, [userChat]);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
      setListMembers(conversation.participants);
      setOriginalListMember(conversation.participants);
    }
  }, [conversation]);

  // socket event
  useEffect(() => {
    if (thisUser) {
      if (isNewSocket === "new_message") {
        const message = newSocketData;
        if (
          message.conversationId === userChat.conversationId ||
          (!thisUser.conversationId &&
            message.retrunMessage.senderId === userChat.id &&
            message.retrunMessage.isGroup === (thisUser.tag === "group"))
        ) {
          if (message.retrunMessage.senderId !== authUser._id) {
            setMessages((prevMessages) => {
              const newMessages = [...prevMessages];
              const index = newMessages.findIndex(
                (m) => m._id === message.retrunMessage._id
              );
              if (index === -1) {
                newMessages.push(message.retrunMessage);
              } else {
                newMessages[index] = message.retrunMessage;
              }
              return newMessages;
            });
          }
        }
      }
      if (isNewSocket === "delete_message") {
        const { conversationId, isDeleted } = newSocketData;
        if (isDeleted) {
          setMessages([]);
        } else {
          try {
            if (thisUser && thisUser.conversationId === conversationId) {
              getConversationByID(conversationId);
            }
          } catch (error) {
            console.error(error);
            setMessages([]);
          }
        }
      }

      if (isNewSocket === "add-to-group") {
        const data = newSocketData;
        if (data?.group._id === thisUser.id) {
          getConversationByID(thisUser.conversationId);
        }
      }

      if (isNewSocket === "remove-from-group") {
        const group = newSocketData;
        if (group.removeMember?.includes(authUser._id)) {
          if (authUser._id === group.createBy) {
            toast.error(
              language === "vi"
                ? `Bạn đã rời khỏi nhóm ${group.name}`
                : `You have left the group ${group.name}`
            );
          }
        } else {
          group?.removeMembers?.forEach((member) => {
            setListMembers((prevMembers) =>
              prevMembers.filter((m) => m._id !== member)
            );
          });
        }
      }

      if (isNewSocket === "update-group") {
        const group = newSocketData;
        if (group.id === thisUser.id) {
          setThisUser({
            ...thisUser,
            name: group.name,
            avatar: group.avatar,
            background: group.avatar,
          });
          setName(group.name);
        }
      }

      if (isNewSocket === "leave-group") {
        const group = newSocketData;
        if (group.removeMember?.includes(authUser._id)) {
          toast.error(
            language === "vi"
              ? `Bạn đã rời khỏi nhóm ${group.name}`
              : `You have left the group ${group.name}`
          );
        } else {
          const leaveMember = listMembers?.find(
            (member) => member._id === group.leaveMember
          );

          setListMembers((prevMembers) =>
            prevMembers.filter((m) => m._id !== group.leaveMember)
          );
          toast.error(
            language === "vi"
              ? `${leaveMember?.profile.name} đã rời khỏi nhóm ${group.name}`
              : `${leaveMember?.profile.name} has left the group ${group.name}`
          );
        }
      }

      if (isNewSocket === "change-admins") {
        const { group, members, typeChange } = newSocketData;
        if (group?.id === thisUser.id) {
          setThisUser({
            ...thisUser,
            admins: group?.admins,
          });
          if (typeChange === "remove") {
            members.forEach((member) => {
              if (member === authUser._id) {
                setIsGroupAdmin(false);
                toast.error(
                  language === "vi"
                    ? "Bạn đã bị hủy quyền quản trị viên"
                    : "You have been removed as an admin"
                );
              }
            });
          }
          if (typeChange === "add") {
            members.forEach((member) => {
              if (member === authUser._id) {
                setIsGroupAdmin(true);
                toast.success(
                  language === "vi"
                    ? "Bạn đã được thêm làm quản trị viên"
                    : "You have been added as an admin"
                );
              }
            });
          }
        }
      }
      if (isNewSocket === "member-to-admin") {
        const group = newSocketData;
        if (group?.id === thisUser.id) {
          setThisUser({
            ...thisUser,
            creator: group?.createBy,
            admins: group?.admins,
          });

          if (group?.createBy._id === authUser._id) {
            setIsCreator(true);
            setIsGroupAdmin(true);
          } else {
            setIsCreator(false);
            setIsGroupAdmin(false);
          }
        }
      }
    }
  }, [isNewSocket, newSocketData]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };
  useEffect(scrollToBottom, []);
  useEffect(() => {
    if (!isAddingMessages) {
      scrollToBottom();
    }
  }, [messages, isAddingMessages]);

  useEffect(() => {
    if (contentReply.data && contentReply.data.length > 40) {
      setTruncatedContent(contentReply.data.substring(0, 40) + "...");
    } else {
      setTruncatedContent(contentReply.data);
    }
  }, [contentReply]);

  const sendMessage = async (data, receiverId, replyMessageId, isGroup) => {
    setLoadingMedia(true);
    try {
      if (!data || data.trim === "") return;
      let messageType;

      if (receiverId) {
        if (data.type === "text") {
          messageType = "sendText";
        } else if (data?.file?.type.startsWith("image/")) {
          messageType = "sendImages";
        } else if (data[0].type.startsWith("video/")) {
          messageType = "sendVideo";
        } else {
          messageType = "sendFiles";
        }

        const response = await axiosInstance.post(
          `chats/${receiverId}/${messageType}`,
          { data: data, replyMessageId, isGroup },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setMessages((prevMessages) => [
          ...prevMessages,
          response.data.data.message,
        ]);
        userChat.conversationId = response.data.data.conversationId;
        setContent("");
        setContentReply("");
        setMessageReplyId("");
        setIsAddingMessages(false);
        scrollToBottom();
        setShowPicker(false);
        setLoadingMedia(false);
        if (response.status === 201) {
          if (
            !thisUser.conversationId ||
            thisUser.conversationId !== response.data.data.conversationId
          ) {
            thisUser.conversationId = response.data.data.conversationId;
            await getConversationByID(response.data.data.conversationId);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoadingMedia(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (userChat.tag === "friend" || !userChat.tag) {
        if (messageReplyId) {
          sendMessage(
            { type: "text", data: content },
            thisUser?.id,
            messageReplyId,
            false
          );
        } else {
          sendMessage(
            { type: "text", data: content },
            thisUser?.id,
            null,
            false
          );
        }
      } else {
        if (messageReplyId) {
          sendMessage(
            { type: "text", data: content },
            thisUser?.id,
            messageReplyId,
            true
          );
        } else {
          sendMessage(
            { type: "text", data: content },
            thisUser?.id,
            null,
            true
          );
        }
      }
    }
  };

  const deleteChat = async (chatId) => {
    setLoadingMedia(true);
    try {
      const converId = thisUser?.conversationId;
      const response = await axiosInstance.post(`/chats/${chatId}/delete`);
      if (response.status === 200) {
        if (messages.length === 1) {
          setMessages([]);
          // setThisUser(null);
        } else {
          const updatedMessagesResponse = await axiosInstance.get(
            `conversations/get/messages/${converId}`
          );
          if (updatedMessagesResponse.status === 200) {
            const dataUpdate = updatedMessagesResponse.data;
            setMessages([...dataUpdate]);
          }
          setContextMenuStates({});
        }
      }
      setLoadingMedia(false);
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
      if (error.status === 403) {
        toast.error(
          language === "vi"
            ? "Bạn không được phép xóa tin nhắn này"
            : "You are not authorized to delete this message"
        );
      } else {
        toast.error(
          language === "vi"
            ? "Lỗi khi xóa tin nhắn, vui lòng thử lại"
            : "Error deleting message, please try again"
        );
      }
      setLoadingMedia(false);
      throw error;
    }
  };

  // Hàm xử lý chức năng xóa chỉ phía tôi
  const handleDeleteOnlyMySide = async (chatId) => {
    try {
      await axiosInstance.post(
        `conversations/deleteOnMySelf/${thisUser?.conversationId}/${chatId}`
      );
      const updatedMessages = messages.filter(
        (message) => message._id !== chatId
      );
      setMessages([...updatedMessages]);
    } catch (error) {
      console.error(error);
    }
  };

  const togglePicker = () => {
    setShowPicker((prevState) => !prevState);
  };

  const isoStringToTime = (isoString) => {
    const date = new Date(isoString);
    return format(date, "HH:mm");
  };

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const handleSelectImageClick = () => {
    const fileInput = document.getElementById("fileInput");
    fileInput.click();
  };

  const handleSelectFileClick = () => {
    const fileInput = document.getElementById("filePDF");
    fileInput.click();
  };

  const handleUpload = async (event) => {
    const files = event.target.files;
    try {
      if (userChat.tag === "friend") {
        if (messageReplyId) {
          await sendMessage(files, userChat?.id, messageReplyId, false);
        } else {
          await sendMessage(files, userChat?.id, null, false);
        }
      } else {
        if (messageReplyId) {
          await sendMessage(files, userChat?.id, messageReplyId, true);
        } else {
          await sendMessage(files, userChat?.id, null, true);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuStates, setContextMenuStates] = useState({});

  const handleContextMenu = (e, chatId) => {
    e.preventDefault();
    const newPosition = { x: e.pageX, y: e.pageY };

    setContextMenuStates((prevState) => ({
      ...prevState,
      [chatId]: true,
    }));

    setContextMenuPosition(newPosition);
  };

  const handleHideContextMenu = () => {
    setContextMenuStates({});
  };

  const updateGroupInfo = async (e) => {
    if (name.trim() === "") {
      setName(thisUser?.name);
      setIsEditing(false);
      return;
    }
    try {
      setIsChangeAvatar(true);
      let response;
      const avatar = e?.target?.files?.[0];
      if (avatar) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("avatar", avatar);
        response = await updateGroup(thisUser.id, formData);
      } else {
        response = await updateGroup(thisUser.id, { name });
      }

      if (response) {
        setIsEditing(false);
        toast.success(
          language === "vi"
            ? "Cập nhật thông tin nhóm thành công"
            : "Update group info successfully"
        );
        sendMessage(
          {
            type: "text",
            data: `${authUser?.profile?.name} đã cập nhật thông tin nhóm`,
          },
          thisUser?.id,
          null,
          true
        );
      }
      setIsChangeAvatar(false);
    } catch (error) {
      console.error(error);
      toast.error(
        language === "vi"
          ? "Cập nhật thông tin nhóm thất bại"
          : "Update group info failed"
      );
      setIsChangeAvatar(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await removeMember(thisUser.id, { members: [memberId] });
      if (response) {
        setThisUser({
          ...thisUser,
          admins: response.group?.admins,
        });

        toast.success(
          language === "vi"
            ? "Xóa thành viên khỏi nhóm thành công"
            : "Remove member from group successfully"
        );
        const member = listMembers.find((m) => m._id === memberId);
        sendMessage(
          {
            type: "text",
            data: `${authUser?.profile?.name} đã xóa ${member?.profile?.name} khỏi nhóm`,
          },
          thisUser?.id,
          null,
          true
        );
      }
    } catch (error) {
      console.error(error);
      if (error.response.data.error === "Group must have at least 2 members") {
        toast.error(
          language === "vi"
            ? "Nhóm phải có ít nhất 2 thành viên"
            : "Group must have at least 2 members"
        );
      } else {
        toast.error(
          language === "vi"
            ? "Xóa thành viên khỏi nhóm thất bại"
            : "Remove member from group failed"
        );
      }
    }
  };

  const handleAddMember = async () => {
    groupToChange(thisUser.id);
    showModal("addGroup");
    getConversationByID(thisUser.conversationId);
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await deleteGroup(thisUser.id);
      if (response) {
        toast.success(
          language === "vi"
            ? "Xóa nhóm thành công"
            : "Delete group successfully"
        );
        setThisUser(null);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        language === "vi" ? "Xóa nhóm thất bại" : "Delete group failed"
      );
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await leaveGroup(thisUser.id);
      if (response) {
        toast.success(
          language === "vi"
            ? "Rời khỏi nhóm thành công"
            : "Leave group successfully"
        );
        sendMessage(
          {
            type: "text",
            data: `${authUser?.profile?.name} đã rời khỏi nhóm`,
          },
          thisUser?.id,
          null,
          true
        );
        setSidebarVisible(false);
        setThisUser(null);
      }
    } catch (error) {
      console.error(error);
      if (error.response.data.error === "Group must have at least 2 members") {
        toast.error(
          language === "vi"
            ? "Nhóm phải có ít nhất 2 thành viên"
            : "Group must have at least 2 members"
        );
      } else {
        toast.error(
          language === "vi" ? "Rời khỏi nhóm thất bại" : "Leave group failed"
        );
      }
    }
  };

  const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setValueSearch(searchTerm);
    if (searchTerm.trim() === "") {
      setListMembers(originalListMember);
    } else {
      const filteredFriends = originalListMember.filter((member) =>
        member?.profile?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setListMembers(filteredFriends);
    }
  };

  const handleChangeAdmin = async (memberId, typeChange) => {
    try {
      const response = await changeAdmins(thisUser.id, [memberId], typeChange);
      if (response) {
        setThisUser({
          ...thisUser,
          admins: response.group?.admins,
          creator: response.group?.createBy,
        });
        setListMembers(response.group?.conversation?.participants);
        toast.success(
          language === "vi"
            ? "Thay đổi quyền quản trị viên thành công"
            : "Change admin successfully"
        );
        const type = typeChange === "remove" ? "thu hồi" : "thêm";
        sendMessage(
          {
            type: "text",
            data: `${authUser?.profile?.name} đã ${type} quyền quản trị ${response.group?.createBy?.profile?.name}`,
          },
          thisUser?.id,
          null,
          true
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        language === "vi"
          ? "Thay đổi quyền quản trị viên thất bại"
          : "Change admin failed"
      );
    }
  };

  const makeMemberToAdmin = async (memberId) => {
    try {
      const response = await changeAdmins(thisUser.id, memberId, "makeAdmin");
      if (response) {
        setThisUser({
          ...thisUser,
          admins: response.group?.admins,
          creator: response.group?.createBy,
        });
        setListMembers(response.group?.conversation?.participants);
        toast.success(
          language === "vi"
            ? "Thay đổi quyền quản trị viên thành công"
            : "Change admin successfully"
        );
        sendMessage(
          {
            type: "text",
            data: `${authUser?.profile?.name} đã chuyển quyền quản trị cho ${response.group?.createBy?.profile?.name}`,
          },
          thisUser?.id,
          null,
          true
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        language === "vi"
          ? "Thay đổi quyền quản trị viên thất bại"
          : "Change admin failed"
      );
    }
  };

  return (
    <>
      {thisUser && (
        <div
          className=" bg-white h-screen sm:w-[calc(100%-24rem)] w-0 border-r overflow-auto"
          onClick={handleHideContextMenu}
        >
          <div className="h-[10vh] bg-white flex justify-between items-center border-b">
            <div className="flex items-center w-14 h-14 mr-3 pl-2">
              <img
                src={thisUser?.avatar}
                alt="avatar"
                className="w-12 h-12 object-cover rounded-full border "
              />
            </div>
            <div className="flex-col items-center mr-auto ml-2">
              <p className="text-lg font-semibold">{thisUser?.name}</p>
              <button className="">
                <PiTagSimpleLight size={18} className="hover:fill-blue-700" />
              </button>
            </div>
            {thisUser?.tag === "group" && (
              <div className="flex items-center mr-3">
                <button
                  className="hover:bg-gray-300 p-2 rounded"
                  onClick={toggleSidebar}
                >
                  <BsLayoutSidebarReverse size={22} />
                </button>
              </div>
            )}
          </div>

          {messages?.length === 0 ? (
            <div
              className={`flex flex-col justify-center items-center bg-slate-50 overflow-y-auto ${
                contentReply ? "h-[58vh]" : "h-[74vh]"
              }`}
            >
              <p className="text-lg text-center">
                {language === "vi" ? (
                  <span>
                    Chưa có tin nhắn nào với <strong>{thisUser?.name}</strong>
                  </span>
                ) : (
                  <soan>No message yet</soan>
                )}
              </p>

              <div className="flex flex-col items-center w-96 h-[45%] mt-5 p-1">
                <img
                  src={thisUser?.background}
                  alt="background's friend"
                  className="object-cover w-full h-2/3 rounded-lg mt-1 shadow-lg"
                />
                <div className="flex p-3 -mt-3 rounded-lg border shadow-lg w-full h-full bg-gray-100">
                  <img
                    src={thisUser?.avatar}
                    alt="avatar"
                    className="w-16 h-16 object-cover rounded-full border mr-3"
                  />
                  <h2 className="text-2xl font-semibold text-primary mt-3 mr-5">
                    {thisUser?.name}
                  </h2>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col bg-slate-50 overflow-y-auto mb-2 ${
                contentReply ? "h-[61vh]" : "h-[77vh]"
              }`}
              ref={scrollRef}
            >
              {messages?.map((message, index) => {
                if (message.senderId === authUser._id) {
                  if (message.status === 0 || message.status === 2) {
                    return (
                      <div
                        key={index++}
                        className={
                          authUser._id === message.senderId
                            ? "chat chat-end"
                            : "chat chat-start w-fit"
                        }
                        onContextMenu={(e) => handleContextMenu(e, message._id)}
                      >
                        {conversation?.participants.map((user, index) => {
                          if (user._id === message.senderId) {
                            return (
                              <div key={index++} className="chat-image avatar">
                                <div className="ml-2 w-10 rounded-full">
                                  <img
                                    alt="avatar"
                                    className="object-cover w-10 h-10 rounded-full"
                                    src={
                                      user.profile.avatar?.url || "/zalo.svg"
                                    }
                                  />
                                </div>
                              </div>
                            );
                          }
                        })}

                        <div
                          className={`flex flex-col chat-bubble md:max-w-[70%] max-w-[50%] ${
                            authUser._id === message.senderId
                              ? "bg-[#e5efff]"
                              : "bg-white"
                          } `}
                        >
                          {message.replyMessageId && (
                            <div className="m-2 rounded-lg bg-sky-200 p-2 text-black ">
                              <div className="flex flex-col border-l-2 border-sky-300">
                                {message.replyMessageId?.contents[0].type ===
                                "text" ? (
                                  <div>
                                    <p className="ml-2 text-base font-semibold">
                                      {thisUser.name}
                                    </p>
                                    <p className="ml-2 text-sm truncate">
                                      {message.replyMessageId.contents[0].data}
                                    </p>
                                  </div>
                                ) : message.replyMessageId.contents[0].type ===
                                  "image" ? (
                                  <div className="flex items-center">
                                    <img
                                      src={
                                        message.replyMessageId.contents[0].data
                                      }
                                      alt="Image"
                                      className="ml-2 h-10 w-10"
                                    />
                                    <div className="flex flex-col">
                                      <p className="ml-2 text-base font-semibold">
                                        {thisUser.name}
                                      </p>

                                      <p className="ml-2 text-sm">[Hình ảnh]</p>
                                    </div>
                                  </div>
                                ) : message.replyMessageId.contents[0].type ===
                                  "video" ? (
                                  <div className="flex items-center">
                                    <video controls className="ml-2 h-10 w-10">
                                      <source
                                        src={
                                          message.replyMessageId.contents[0]
                                            .data
                                        }
                                        type="video/mp4"
                                      />
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                    <div className="flex flex-col">
                                      <p className="ml-2 text-base font-semibold">
                                        {thisUser.name}
                                      </p>

                                      <p className="ml-2 text-sm">[Hình ảnh]</p>
                                    </div>
                                  </div>
                                ) : message.replyMessageId.contents[0].type ===
                                  "file" ? (
                                  <div className="flex items-center">
                                    <a
                                      href={contentReply.data}
                                      className="ml-2 text-sm"
                                      download
                                    >
                                      {contentReply.filename}
                                    </a>
                                    <div className="flex flex-col">
                                      <div className="flex items-center ml-2">
                                        <RiDoubleQuotesR
                                          className="mr-2"
                                          size={15}
                                          color="gray"
                                        />
                                        <p>Trả lời</p>
                                      </div>
                                      <p className="ml-2 text-sm">[File]</p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="ml-2 text-sm">
                                    {message.replyMessageId.contents[0].data}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {message.contents.map((content, contentIndex) => {
                            const maxImagesPerRow = 3;
                            const imagesCount = message.contents.filter(
                              (c) => c.type === "image"
                            ).length;
                            const imagesPerRow = Math.ceil(
                              imagesCount / maxImagesPerRow
                            );
                            const imageWidth = `calc(100% / ${imagesPerRow})`;
                            const imageHeight = "auto";
                            return (
                              <div
                                key={contentIndex++}
                                className="message-container break-all"
                              >
                                {content.type === "text" ? (
                                  <div className="flex flex-col break-all ">
                                    <span className="text-base text-black break-all ">
                                      {content.data}
                                    </span>
                                    <time className="text-xs opacity-50 text-stone-500">
                                      {isoStringToTime(message.timestamp)}
                                    </time>
                                  </div>
                                ) : content.type === "image" ? (
                                  <img
                                    src={content.data}
                                    alt="image"
                                    className="pr-2 pb-2 flex flex-wrap"
                                    style={{
                                      width:
                                        imagesPerRow === 1
                                          ? "300px"
                                          : imageWidth,
                                      height: imageHeight,
                                    }}
                                  />
                                ) : content.type === "video" ? (
                                  <div>
                                    <video
                                      controls
                                      className="pr-2 pb-2"
                                      style={{
                                        width: "auto",
                                        height: "250px",
                                      }}
                                    >
                                      <source
                                        src={content.data}
                                        type="video/mp4"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/webm"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/ogg"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/x-matroska"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/x-msvideo"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/quicktime"
                                      />
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                    <time className="text-xs opacity-50 text-stone-500">
                                      {isoStringToTime(message.timestamp)}
                                    </time>
                                  </div>
                                ) : (
                                  <div>
                                    <DocViewer
                                      documents={{ uri: content.data }}
                                      pluginRenderers={DocViewerRenderers}
                                      style={{ height: "400px" }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {contextMenuStates[message._id] && (
                          <div
                            className="flex flex-col z-10 fixed top-1/2 transform -translate-x-40 -translate-y-40 w-52  bg-white rounded-2xl shadow shadow-gray-300 "
                            style={{
                              top: contextMenuPosition.y,
                              left: contextMenuPosition.x,
                            }}
                            key={index}
                            onClick={handleHideContextMenu} // Ẩn context menu khi click ra ngoài
                          >
                            <div
                              className="flex p-2 text-black items-center rounded-xl border-b border-gray-100 hover:bg-gray-100"
                              onClick={() => {
                                setContentReply(message.contents[0]);
                                setMessageReplyId(message._id);
                              }}
                            >
                              <RiDoubleQuotesR
                                className="mr-3"
                                size={14}
                                color="black"
                              />
                              <p>{language === "vi" ? "Trả lời" : "Reply"}</p>
                            </div>
                            <div
                              className="flex p-2 text-black items-center rounded-xl border-b border-gray-100 hover:bg-gray-100"
                              onClick={() => {
                                shareMessage(message);
                                showModal("share");
                              }}
                            >
                              <IoMdShareAlt
                                className="mr-3"
                                size={14}
                                color="black"
                              />

                              <p>
                                {language === "vi" ? "Chuyển tiếp" : "Forward"}
                              </p>
                            </div>
                            {message.senderId === authUser._id && (
                              <div
                                className="flex p-2 text-red-400 items-center rounded-xl border-b border-gray-100 hover:bg-gray-100"
                                onClick={() => deleteChat(message._id)}
                              >
                                <FaArrowRotateLeft
                                  className="mr-3"
                                  size={14}
                                  color="red"
                                />
                                <p>
                                  {language === "vi" ? "Thu hồi" : "Recall"}
                                </p>
                              </div>
                            )}

                            <div
                              className="flex p-2 text-red-400 items-center rounded-xl border-b border-gray-100 hover:bg-gray-100"
                              onClick={() => {
                                handleDeleteOnlyMySide(message._id);
                              }}
                            >
                              <BsTrash3
                                className="mr-3"
                                size={16}
                                color="red"
                              />
                              <p>
                                {language === "vi"
                                  ? "Xóa chỉ phía tôi"
                                  : "Delete only my side"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                } else {
                  if (message.status === 0 || message.status === 1) {
                    return (
                      <div
                        key={message._id}
                        className={
                          authUser._id === message.senderId
                            ? "chat chat-end"
                            : "chat chat-start"
                        }
                        onContextMenu={(e) => handleContextMenu(e, message._id)}
                      >
                        {conversation?.participants.map((user, index) => {
                          if (user._id === message.senderId) {
                            return (
                              <>
                                <div key={index++} className="flex chat-header">
                                  <p className="text-sm">{user.profile.name}</p>
                                </div>
                                <div key={index} className="chat-image avatar">
                                  <div className="ml-2 w-10 rounded-full">
                                    <img
                                      alt="avatar"
                                      className="object-cover w-10 h-10 rounded-full"
                                      src={
                                        user.profile.avatar?.url || "/zalo.svg"
                                      }
                                    />
                                  </div>
                                </div>
                              </>
                            );
                          }
                        })}

                        <div
                          className={`flex flex-col chat-bubble border  ${
                            authUser._id === message.senderId
                              ? "bg-[#e5efff]"
                              : "bg-white"
                          }`}
                        >
                          {message.replyMessageId && (
                            <div className="h-16 m-2 rounded-lg bg-sky-200 p-2 text-black">
                              <div className="flex flex-col border-l-2 border-sky-500">
                                {message.replyMessageId.contents[0].type ===
                                "text" ? (
                                  <div>
                                    <p className="ml-2 text-base font-semibold truncate">
                                      {thisUser.name}
                                    </p>
                                    <p className="ml-2 text-sm truncate">
                                      {message.replyMessageId.contents[0].data}
                                    </p>
                                  </div>
                                ) : message.replyMessageId.contents[0].type ===
                                  "image" ? (
                                  <div className="flex items-center">
                                    <img
                                      src={
                                        message.replyMessageId.contents[0].data
                                      }
                                      alt="Image"
                                      className="ml-2 h-10 w-10"
                                    />
                                    <div className="flex flex-col">
                                      <p className="ml-2 text-base font-semibold">
                                        {thisUser.name}
                                      </p>

                                      <p className="ml-2 text-sm">[Hình ảnh]</p>
                                    </div>
                                  </div>
                                ) : message.replyMessageId.contents[0].type ===
                                  "video" ? (
                                  <div className="flex items-center">
                                    <video controls className="ml-2 h-10 w-10">
                                      <source
                                        src={
                                          message.replyMessageId.contents[0]
                                            .data
                                        }
                                        type="video/mp4"
                                      />
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                    <div className="flex flex-col">
                                      <p className="ml-2 text-base font-semibold">
                                        {thisUser.name}
                                      </p>

                                      <p className="ml-2 text-sm">[Hình ảnh]</p>
                                    </div>
                                  </div>
                                ) : message.replyMessageId.contents[0].type ===
                                  "file" ? (
                                  <div className="flex items-center">
                                    <a
                                      href={contentReply.data}
                                      className="ml-2 text-sm"
                                      download
                                    >
                                      {contentReply.filename}
                                    </a>
                                    <div className="flex flex-col">
                                      <div className="flex items-center ml-2">
                                        <RiDoubleQuotesR
                                          className="mr-2"
                                          size={15}
                                          color="gray"
                                        />
                                        <p>Trả lời</p>
                                      </div>
                                      <p className="ml-2 text-sm">[File]</p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="ml-2 text-sm">
                                    {message.replyMessageId.contents[0].data}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {message.contents.map((content, contentIndex) => {
                            const maxImagesPerRow = 3;
                            const imagesCount = message.contents.filter(
                              (c) => c.type === "image"
                            ).length;
                            const imagesPerRow = Math.ceil(
                              imagesCount / maxImagesPerRow
                            );
                            const imageWidth = `calc(100% / ${imagesPerRow})`;
                            const imageHeight = "auto";

                            return (
                              <div
                                key={contentIndex++}
                                className="message-container break-all"
                              >
                                {/* Render nội dung của message */}
                                {content.type === "text" ? (
                                  <div className="flex flex-col break-all">
                                    <span className="text-base text-black break-all">
                                      {content.data}
                                    </span>
                                    <time className="text-xs opacity-50 text-stone-500">
                                      {isoStringToTime(message.timestamp)}
                                    </time>
                                  </div>
                                ) : content.type === "image" ? (
                                  <img
                                    src={content.data}
                                    alt="image"
                                    className="pr-2 pb-2 "
                                    style={{
                                      width:
                                        imagesPerRow === 1
                                          ? "300px"
                                          : imageWidth,
                                      height: imageHeight,
                                    }}
                                  />
                                ) : content.type === "video" ? (
                                  <div>
                                    <video
                                      controls
                                      className="pr-2 pb-2"
                                      style={{
                                        width: "auto",
                                        height: "250px",
                                      }}
                                    >
                                      <source
                                        src={content.data}
                                        type="video/mp4"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/webm"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/ogg"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/x-matroska"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/x-msvideo"
                                      />
                                      <source
                                        src={content.data}
                                        type="video/quicktime"
                                      />
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                    <time className="text-xs opacity-50 text-stone-500">
                                      {isoStringToTime(message.timestamp)}
                                    </time>
                                  </div>
                                ) : (
                                  <div>
                                    <DocViewer
                                      documents={[{ uri: content.data }]}
                                      pluginRenderers={DocViewerRenderers}
                                      style={{ height: "400px" }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {contextMenuStates[message._id] && (
                          <div
                            className="flex flex-col z-10 fixed top-1/2 transform -translate-x-40 -translate-y-40 w-52  bg-white rounded-2xl shadow shadow-gray-300 "
                            style={{
                              top: contextMenuPosition.y,
                              left: contextMenuPosition.x,
                            }}
                            key={index}
                            onClick={handleHideContextMenu} // Ẩn context menu khi click ra ngoài
                          >
                            <div
                              className="flex p-2 text-black items-center rounded-xl border-b border-gray-100 hover:bg-gray-100"
                              onClick={() => {
                                setContentReply(message.contents[0]);
                                setMessageReplyId(message._id);
                              }}
                            >
                              <RiDoubleQuotesR
                                className="mr-3"
                                size={14}
                                color="black"
                              />
                              <p>{language === "vi" ? "Trả lời" : "Reply"}</p>
                            </div>
                            <div
                              className="flex p-2 text-black items-center rounded-xl border-b border-gray-100 hover:bg-gray-100"
                              onClick={() => {
                                shareMessage(message);
                                showModal("share");
                              }}
                            >
                              <IoMdShareAlt
                                className="mr-3"
                                size={14}
                                color="black"
                              />
                              <p>
                                {language === "vi" ? "Chuyển tiếp" : "Forward"}
                              </p>
                            </div>
                            {message.senderId !== thisUser.id && (
                              <div
                                className="flex p-2 text-red-400 items-center rounded-xl border-b border-gray-100 hover:bg-gray-100"
                                onClick={() => deleteChat(message._id)}
                              >
                                <FaArrowRotateLeft
                                  className="mr-3"
                                  size={14}
                                  color="red"
                                />
                                <p>
                                  {language === "vi" ? "Thu hồi" : "Recall"}
                                </p>
                              </div>
                            )}

                            <div
                              className="flex p-2 text-red-400 items-center rounded-xl border-b border-gray-100 hover:bg-gray-100"
                              onClick={() =>
                                handleDeleteOnlyMySide(message._id)
                              }
                            >
                              <BsTrash3
                                className="mr-3"
                                size={16}
                                color="red"
                              />
                              <p>
                                {language === "vi"
                                  ? "Xóa chỉ phía tôi"
                                  : "Delete only my side"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                }
              })}
              {isFetchingMore && (
                <div className="flex justify-center items-center h-16">
                  <span className="loading loading-bars loading-lg bg-cyan-500"></span>
                </div>
              )}
              {loadingMedia && (
                <div className="flex justify-center items-center h-16">
                  <span className="loading loading-bars loading-lg bg-cyan-500"></span>
                </div>
              )}
            </div>
          )}

          <div
            className={`${
              contentReply ? "h-[28vh]" : "h-[12vh]"
            } bg-white flex-col border-t`}
          >
            <div
              className={`${
                contentReply ? "h-[20%]" : "h-[40%]"
              } bg-white flex justify-start items-center border-b p-1`}
            >
              <button
                className="hover:bg-gray-300 p-2 rounded mx-8"
                onClick={togglePicker}
              >
                <LuSticker size={22} />
              </button>

              {showPicker && (
                <EmojiPicker
                  className="-translate-y-60"
                  style={{ width: "100%" }}
                  onEmojiClick={(e) => {
                    setContent((prevInput) => prevInput + e.emoji);
                    setShowPicker(false);
                  }}
                />
              )}

              <button
                className="hover:bg-gray-300 p-2 rounded mx-8"
                onClick={handleSelectImageClick}
              >
                <IoImageOutline size={22} />
              </button>
              <button
                className="hover:bg-gray-300 p-2 rounded mx-8"
                onClick={handleSelectFileClick}
              >
                <IoIosLink size={22} />
              </button>
            </div>
            <div className={`${contentReply ? "h-[80%]" : "h-[60%]"} flex `}>
              <div className="flex flex-col w-full justify-between">
                {contentReply && (
                  <div className="flex h-16 m-2 rounded-lg bg-gray-200 p-2 justify-between">
                    <div className="flex flex-col border-l-2 border-sky-500">
                      {contentReply.type === "text" ? (
                        <div>
                          <div className="flex items-center ml-2">
                            <RiDoubleQuotesR
                              className="mr-2"
                              size={15}
                              color="gray"
                            />
                            <p>Trả lời</p>
                          </div>
                          <p className="ml-2 text-sm">{truncatedContent}</p>
                        </div>
                      ) : contentReply.type === "image" ? (
                        <div className="flex items-center">
                          <img
                            src={contentReply.data}
                            alt="Image"
                            className="ml-2 h-10 w-10"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center ml-2">
                              <RiDoubleQuotesR
                                className="mr-2"
                                size={15}
                                color="gray"
                              />
                              <p>Trả lời</p>
                            </div>
                            <p className="ml-2 text-sm">[Hình ảnh]</p>
                          </div>
                        </div>
                      ) : contentReply.type === "video" ? (
                        <div className="flex items-center">
                          <video controls className="ml-2 h-10 w-10">
                            <source src={contentReply.data} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          <div className="flex flex-col">
                            <div className="flex items-center ml-2">
                              <RiDoubleQuotesR
                                className="mr-2"
                                size={15}
                                color="gray"
                              />
                              <p>Trả lời</p>
                            </div>
                            <p className="ml-2 text-sm">[Video]</p>
                          </div>
                        </div>
                      ) : contentReply.type === "file" ? (
                        <div className="flex items-center">
                          <a
                            href={contentReply.data}
                            className="ml-2 text-sm"
                            download
                          >
                            {contentReply.filename}
                          </a>
                          <div className="flex flex-col">
                            <div className="flex items-center ml-2">
                              <RiDoubleQuotesR
                                className="mr-2"
                                size={15}
                                color="gray"
                              />
                              <p>Trả lời</p>
                            </div>
                            <p className="ml-2 text-sm">[File]</p>
                          </div>
                        </div>
                      ) : (
                        <p className="ml-2 text-sm">{truncatedContent}</p>
                      )}
                    </div>
                    <button
                      className="flex mr-3 text-lg font-semibold"
                      onClick={() => {
                        setContentReply("");
                        setMessageReplyId("");
                      }}
                    >
                      x
                    </button>
                  </div>
                )}
                <div className="flex justify-center items-center py-1 h-full">
                  <textarea
                    type="text"
                    autoFocus="true"
                    placeholder={
                      language === "vi"
                        ? "Nhập tin nhắn..."
                        : "Type a message..."
                    }
                    className={`w-full break-all outline-none px-5 py-2 ${
                      contentReply ? "h-[50%] max-h-fit" : "h-full"
                    }  rounded-full`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
            </div>
            <input
              type="file"
              id="fileInput"
              accept="image/*, video/*"
              multiple
              style={{ display: "none" }}
              onChange={handleUpload}
            />
            <input
              type="file"
              id="filePDF"
              accept="application/pdf"
              multiple
              style={{ display: "none" }}
              onChange={handleUpload}
            />
          </div>
        </div>
      )}

      {!thisUser && (
        <div className=" bg-white h-screen sm:w-[calc(100%-24rem)] w-0 border-r relative z-0 flex flex-col justify-center items-center">
          <div className="text-lg text-center">
            {language === "vi" ? (
              <>
                <p className="text-[#0184e0] text-2xl">
                  Chào mừng đến với <strong>Zola 💕</strong>{" "}
                </p>
                <p>
                  <i>cùng nhau trò chuyện thỏa thích</i>
                </p>
                <p>
                  <i>Chọn một hội thoại để bắt đầu trò chuyện</i>
                </p>
              </>
            ) : (
              <>
                <p className="text-[#0184e0] text-2xl">
                  Hi there ! Wellcome to <strong>Zola 💕</strong>
                </p>
                <p>
                  <i>Let's start chatting with your friends or family</i>
                </p>
                <p>
                  <i>
                    Choose a chat to start chatting with your friends or family
                  </i>
                </p>
              </>
            )}
          </div>

          <div className="flex items-center justify-center w-full mt-5">
            <img
              src="https://chat.zalo.me/assets/inapp-welcome-screen-0.19afb7ab96c7506bb92b41134c4e334c.jpg"
              alt="zalo"
              className="w-1/2"
            />
          </div>
        </div>
      )}

      {isSidebarVisible && (
        <div className="fixed top-0 right-0 z-50 h-screen bg-gray w-4/12 bg-gray-300 border-l drop-shadow-2xl">
          <div className="rounded-t-xl h-[6%] bg-primary flex justify-center items-center border-b">
            <p className="flex text-lg font-medium text-white">
              {language === "vi" ? "Thông tin" : "Information"}
            </p>
            <button
              className="flex top-1 right-2 fixed border boder-red-500 rounded-full bg-red-500 text-white hover:bg-red-600 hover:text-white w-7 h-7"
              onClick={toggleSidebar}
            >
              <p className="text-center w-full h-full">x</p>
            </button>
          </div>
          <div className="h-[20%] bg-white items-center flex-col">
            <div className="flex justify-center pt-2">
              <img
                src={thisUser?.avatar}
                alt="avatar"
                className={`w-20 h-20 object-cover rounded-full border-2 border-gray-200  ${
                  !isEditing ? "" : "border border-success cursor-pointer"
                }

                ${
                  isChangeAvatar
                    ? "loading loading-spinner bg-blue-400 loading-sm"
                    : ""
                }
                
                `}
                onClick={() => {
                  if (isEditing) document.getElementById("groupAvt").click();
                }}
              />

              <input
                type="file"
                name="groupAvt"
                id="groupAvt"
                hidden={true}
                onChange={updateGroupInfo}
              />
            </div>
            <div className="relative flex justify-center items-center pt-2">
              <input
                className={`text-lg font-semibold text-center focus:outline-none rounded-xl w-full mx-2 ${
                  !isEditing ? "" : "border focus:border-success p-1"
                }`}
                value={name}
                readOnly={!isEditing}
                onChange={(e) => setName(e.target.value)}
              />
              {isGroupAdmin && (
                <div className="absolute -top-1 right-4 rounded-full flex items-center ml-2">
                  {isEditing ? (
                    <div className="flex">
                      <button onClick={updateGroupInfo}>
                        <CiCircleCheck
                          size={25}
                          color="green"
                          className="mx-1"
                        />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setName(thisUser?.name);
                        }}
                      >
                        <MdOutlineCancel
                          size={25}
                          color="red"
                          className="ml-2"
                        />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(!isEditing);
                      }}
                    >
                      <LuPencilLine size={22} color="green" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-center items-center h-[20%] w-full border-warning border rounded-full mt-5 mx-2">
              <p>{language === "vi" ? "Quản Trị Viên :" : "Admin :"}</p>
              <p className="ml-2 font-semibold">
                {thisUser?.creator?.profile?.name}
              </p>
            </div>
          </div>

          {thisUser?.tag === "group" && (
            <div className="h-[55%] bg-white items-center flex-col mt-[1px]">
              <div className="h-[5%] flex justify-center relative pt-2">
                <p className="text-lg font-semibold">
                  {language === "vi" ? "Danh sách thành viên" : "Member list"}
                </p>
                <button
                  className="absolute top-3 right-5"
                  onClick={handleAddMember}
                >
                  <IoPersonAddOutline size={20} color="green" />
                </button>
              </div>
              {grLoading && !isChangeAvatar ? (
                <div className="flex justify-center items-center h-[90%] w-full">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <div className="flex flex-col h-[90%] w-full mt-5 mx-2 overflow-scroll">
                  {listMembers?.map((member, index) => {
                    const memberIsCreator =
                      thisUser?.creator?._id === member._id;
                    const memberIsAdmin = thisUser?.admins?.includes(
                      member._id
                    );
                    const isMe = member._id === authUser._id;

                    return (
                      <div
                        key={index++}
                        className="flex items-center justify-between w-full p-3 hover:bg-gray-200"
                      >
                        <div className="flex items-center w-[70%]">
                          <img
                            src={member.profile?.avatar?.url}
                            alt="avatar"
                            className="w-10 h-10 object-cover rounded-full border"
                          />
                          <p className="ml-2">{member.profile?.name}</p>
                        </div>
                        <div className="flex items-center justify-end w-[30%]">
                          {memberIsCreator ? (
                            <IoKeyOutline size={23} color="orange" />
                          ) : (
                            <>
                              {memberIsAdmin && (
                                <IoKeyOutline size={23} color="gray" />
                              )}
                            </>
                          )}

                          {!isMe || isGroupAdmin || !memberIsAdmin &&(
                            <div className="flex items-center ml-5">
                              <button
                                onClick={() => {
                                  handleRemoveMember(member._id);
                                }}
                              >
                                {grLoading && !isChangeAvatar ? (
                                  <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                  <IoPersonRemoveOutline
                                    size={20}
                                    color="red"
                                  />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className=" flex flex-col bg-white h-[20%] mt-[1px]">
            <div className="h-[20%] flex justify-center pt-2">
              <p className="text-lg font-semibold">
                {language === "vi" ? "Thiết lập nhóm" : "Group setting"}
              </p>
            </div>
            <div className="flex flex-col">
              {isCreator && (
                <div className="flex items-center justify-between pt-4 pb-4 hover:bg-gray-200">
                  <button className="ml-5">
                    <GrUserAdmin size={20} color="gray" />
                  </button>

                  <button
                    className="flex items-center mr-auto ml-2 text-gray-600"
                    onClick={() => setIsShowAdminChange(true)}
                  >
                    <p>{language === "vi" ? "Quản trị viên" : "Admin"}</p>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 pb-4 hover:bg-gray-200">
                {isCreator ? (
                  <button className="flex" onClick={handleDeleteGroup}>
                    <div className="ml-4">
                      <IoTrashOutline size={20} stroke="red" />
                    </div>
                    <div className="flex items-center mr-auto ml-2 text-red-600">
                      <p>
                        {language === "vi" ? "Giải tán nhóm" : "Dissolve group"}
                      </p>
                    </div>
                  </button>
                ) : (
                  <button className="flex" onClick={handleLeaveGroup}>
                    <div className="ml-4">
                      <IoTrashOutline size={20} stroke="red" />
                    </div>
                    <div className="flex items-center mr-auto ml-2 text-red-600">
                      <p>{language === "vi" ? "Rời nhóm" : "Leave group"}</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isShowAdminChange && (
        <div className="z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/5 h-[90%] bg-white rounded-lg shadow-lg ">
          <div className="relative flex items-center justify-between p-4 border-b text-lg font-semibold h-[10%]">
            <p>
              {language == "vi"
                ? "Thiết lập quản trị viên"
                : "Set up administrators"}
            </p>
            <button
              onClick={() => {
                setIsShowAdminChange(false);
                setIsInputFocusGroup(false);
                setValueSearch("");
                setListMembers(originalListMember);
              }}
              className="absolute flex justify-center items-center top-2 right-2 cursor-pointer border rounded-full p-2 hover:bg-gray-200 w-10 h-10 "
            >
              x
            </button>
          </div>

          <div
            className={` h-[6%] flex items-center rounded-full border  m-4 mt-2 mb-2 ${
              isInputFocusGroup === true ? " border-blue-500 " : ""
            } `}
          >
            <HiMagnifyingGlass size={18} className="ml-2" />
            <input
              type="text"
              className="w-[89%] outline-none ml-2 "
              placeholder={language == "vi" ? "Tìm kiếm " : "Search"}
              value={valueSearch}
              onChange={handleInputChange}
              onFocus={() => setIsInputFocusGroup(true)}
              onBlur={() => setIsInputFocusGroup(false)}
            />
          </div>

          {/* tab change type modal */}
          <div className="flex justify-center items-center mx-5 my-3 h-[4%]">
            <button
              className={`mx-5 w-1/3 h-full ${
                typeModal === "removeAdmin" ? "border-b-blue-400 border-b " : ""
              }`}
              onClick={() => setTypeModal("removeAdmin")}
            >
              <p
                className={`text-md ${
                  typeModal === "removeAdmin" ? "font-semibold" : ""
                }`}
              >
                {language == "vi" ? "Xóa quản trị viên" : "Remove admin"}
              </p>
            </button>
            <button
              className={`mx-5 w-1/3 h-full ${
                typeModal === "addAdmin" ? "border-b-blue-400 border-b " : ""
              }`}
              onClick={() => setTypeModal("addAdmin")}
            >
              <p
                className={`text-md ${
                  typeModal === "addAdmin" ? "font-semibold" : ""
                }`}
              >
                {language == "vi" ? "Thêm quản trị viên" : "Add admin"}
              </p>
            </button>
            <button
              className={`mx-5 w-1/3 h-full ${
                typeModal === "changeAdmin" ? "border-b-blue-400 border-b " : ""
              }`}
              onClick={() => setTypeModal("changeAdmin")}
            >
              <p
                className={`text-md ${
                  typeModal === "changeAdmin" ? "font-semibold" : ""
                }`}
              >
                {language == "vi" ? "Chuyển Trưởng Nhóm" : "Change Admin"}
              </p>
            </button>
          </div>

          <div className=" h-[66%] flex-col pt-2 p-4 items-center overflow-y-auto">
            <p className="font-semibold">
              {typeModal === "removeAdmin"
                ? language == "vi"
                  ? "Danh sách quản trị viên"
                  : "List of administrators"
                : language == "vi"
                ? "Danh sách thành viên"
                : "List of members"}
            </p>
            <div className="flex-col max-h-44 mt-2">
              {listMembers.map((member, index) => {
                const isMe = member._id === authUser._id;
                const isAdmin = thisUser?.admins?.includes(member._id);
                if (typeModal === "removeAdmin") {
                  return (
                    isAdmin &&
                    !isMe && (
                      <div
                        key={index}
                        className="flex items-center justify-between w-full p-3 hover:bg-gray-200"
                      >
                        <div className="flex items-center">
                          <img
                            src={member.profile?.avatar?.url}
                            alt="avatar"
                            className="w-10 h-10 object-cover rounded-full border"
                          />
                          <p className="ml-2">{member.profile?.name}</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              handleChangeAdmin(member._id, "remove");
                            }}
                          >
                            {grLoading ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <IoPersonRemoveOutline size={20} color="red" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  );
                } else if (typeModal === "addAdmin") {
                  return (
                    !isAdmin && (
                      <div
                        key={index}
                        className="flex items-center justify-between w-full p-3 hover:bg-gray-200"
                      >
                        <div className="flex items-center">
                          <img
                            src={member.profile?.avatar?.url}
                            alt="avatar"
                            className="w-10 h-10 object-cover rounded-full border"
                          />
                          <p className="ml-2">{member.profile?.name}</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              handleChangeAdmin(member._id, "add");
                            }}
                          >
                            {grLoading ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <IoPersonAddOutline size={20} color="green" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  );
                } else {
                  return (
                    !isMe && (
                      <div
                        key={index}
                        className="flex items-center justify-between w-full p-3 hover:bg-gray-200"
                      >
                        <div className="flex items-center">
                          <img
                            src={member.profile?.avatar?.url}
                            alt="avatar"
                            className="w-10 h-10 object-cover rounded-full border"
                          />
                          <p className="ml-2">{member.profile?.name}</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              setIsShowConfirmChange(true);
                              setMemberChange(member);
                            }}
                          >
                            {grLoading ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <MdOutlinePublishedWithChanges
                                size={22}
                                color="orange"
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  );
                }
              })}
            </div>
          </div>

          {/* Modal to comfirm change member to admin  */}
          {isShowConfirmChange && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-[20%] bg-white rounded-lg shadow-lg flex flex-col items-center">
              <p className="text-lg font-semibold text-center m-3">
                {language == "vi"
                  ? "Xác nhận thay đổi quản trị viên"
                  : "Confirm change admin"}
              </p>
              <div className="flex items-center justify-center w-full mt-12">
                <button
                  className="mx-2 btn btn-outline w-[40%]"
                  onClick={() => {
                    setIsShowConfirmChange(false);
                    setMemberChange(null);
                  }}
                >
                  <MdOutlineCancel size={25} color="red" />
                </button>
                <button
                  className="mx-2 btn btn-outline w-[40%]"
                  onClick={() => {
                    makeMemberToAdmin(memberChange._id);
                    setMemberChange(null);
                    setIsShowConfirmChange(false);
                    setIsShowAdminChange(false);
                  }}
                >
                  <CiCircleCheck size={25} color="green" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end border-t h-[10%]">
            <button
              className="rounded-lg bg-gray-200 p-3 pl-6 pr-6 mr-3 hover:bg-gray-300"
              onClick={() => {
                setIsShowAdminChange(false);
                setIsInputFocusGroup(false);
                setValueSearch("");
                setListMembers(originalListMember);
              }}
            >
              <p className="text-lg font-semibold">
                {language == "vi" ? "Đóng" : "Close"}
              </p>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PeopleChatComponent;
