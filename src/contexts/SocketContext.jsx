import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import config from "../api/config";

const SocketContext = createContext();
export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const url = config.baseURL.replace("/api", "");
  const [socket, setSocket] = useState(null);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const { refreshToken, authUser, setAuthUser, reloadAuthUser } =
    useAuthContext();

  const [isNewSocket, setIsNewSocket] = useState(null);
  const [newSocketData, setNewSocketData] = useState(null);

  const connectSocket = (token) => {
    const newSocket = io(url, {
      query: {
        token: token,
      },
    });
    setSocket(newSocket);
  };

  useEffect(() => {
    if (refreshToken) {
      connectSocket(refreshToken);
    } else {
      setSocket(null);
      socket?.disconnect();
    }
    return () => {
      if (socket) {
        socket?.disconnect();
      }
    };
  }, [refreshToken]);

  useEffect(() => {
    if (socket) {
      socket.on("force_logout", () => {
        if (authUser) {
          toast.error("Your account has been logged out from another device");
        }
        socket.disconnect();
        setAuthUser(null);
        localStorage.clear();
      });
      socket.on("online_friends", (onlineFriends) => {
        setOnlineFriends(onlineFriends);
      });
      socket.on("receive-request-add-friend", handleReceiveFriendRequest);
      socket.on("accept-request-add-friend", handleFriendAcceptAction);
      socket.on("reject-request-add-friend", handleFriendRejectAction);
      socket.on("cancel-request-add-friend", handleFriendAction);
      socket.on("unfriend", handleFriendAction);
      // socket for chat
      socket.on("new_message", handleNewMessage);
      socket.on("delete_message", handleDeleteMessage);
      // socket for group
      socket.on("add-to-group", handleAddToGroup);
      socket.on("remove-from-group", handleRemoveFromGroup);
      socket.on("update-group", handleUpdateGroup);
      socket.on("leave-group", handleLeaveGroup);
      socket.on("delete-group", handleDeleteGroup);
      socket.on("change-admins", handleChangeAdminGroup);
      socket.on("member-to-admin", handleMakeMemberToAdmin);

      return () => {
        socket.off("force_logout");
        // socket for friend
        socket.off("receive-request-add-friend", handleReceiveFriendRequest);
        socket.off("accept-request-add-friend", handleFriendAcceptAction);
        socket.off("reject-request-add-friend", handleFriendRejectAction);
        socket.off("cancel-request-add-friend", handleFriendAction);
        socket.off("unfriend", handleFriendAction);
        // socket for chat
        socket.off("new_message", handleNewMessage);
        socket.off("delete_message", handleDeleteMessage);
        // socket for group
        socket.off("add-to-group", handleAddToGroup);
        socket.off("remove-from-group", handleRemoveFromGroup);
        socket.off("update-group", handleUpdateGroup);
        socket.off("leave-group", handleLeaveGroup);
        socket.off("delete-group", handleDeleteGroup);
        socket.off("change-admins", handleChangeAdminGroup);
        socket.off("member-to-admin", handleMakeMemberToAdmin);
      };
    }
  }, [socket, authUser]);

  const handleReceiveFriendRequest = async (sender) => {
    toast.success(`${sender.sender.name} has sent you a friend request`);
    await reloadAuthUser();
  };

  const handleFriendAcceptAction = async (sender) => {
    toast.success(`${sender.sender.name} has accepted your friend request`);
    await reloadAuthUser();
  };
  const handleFriendRejectAction = async (sender) => {
    console.log("reject", sender);
    toast.error(`${sender.sender.name} has rejected your friend request`);
    await reloadAuthUser();
  };

  const handleFriendAction = async () => {
    await reloadAuthUser();
  };

  // handle for chat
  const handleNewMessage = ({ message }) => {
    setIsNewSocket("new_message");
    setNewSocketData(message);
  };

  const handleDeleteMessage = ({ chatRemove, conversationId, isDeleted }) => {
    setIsNewSocket("delete_message");
    setNewSocketData({ chatRemove, conversationId, isDeleted });
  };

  // handle for group
  const handleAddToGroup = ({ data }) => {
    setIsNewSocket("add-to-group");
    setNewSocketData(data);
  };

  const handleRemoveFromGroup = ({ group }) => {
    setIsNewSocket("remove-from-group");
    setNewSocketData(group);
  };

  const handleUpdateGroup = ({ group }) => {
    setIsNewSocket("update-group");
    setNewSocketData(group);
  };

  const handleLeaveGroup = ({ group }) => {
    setIsNewSocket("leave-group");
    setNewSocketData(group);
  };

  const handleDeleteGroup = ({ group }) => {
    setIsNewSocket("delete-group");
    setNewSocketData(group);
  };

  const handleChangeAdminGroup = ({ group, members, typeChange }) => {
    setIsNewSocket("change-admins");
    setNewSocketData({ group, members, typeChange });
  };

  const handleMakeMemberToAdmin = ({ group }) => {
    console.log("make member to admin", group);
    setIsNewSocket("member-to-admin");
    setNewSocketData(group);
  };

  return (
    <SocketContext.Provider
      value={{ socket, onlineFriends, isNewSocket, newSocketData }}
    >
      {children}
    </SocketContext.Provider>
  );
};
