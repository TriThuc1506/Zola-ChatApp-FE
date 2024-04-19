import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { useAuthContext } from "../contexts/AuthContext";

const useFriend = () => {
  const [friends, setFriends] = useState([]);
  const [recommendedFriends, setRecommendedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { reloadAuthUser } = useAuthContext();

  const getAllFriends = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("users/get/friends");
      if (response.status === 200) {
        const newFriendList = response.data.friends.map((friend) => ({
          id: friend.userId,
          phone: friend.phone,
          name: friend.profile.name,
          avatar: friend.profile.avatar.url ?? "/zalo.svg",
          background: friend.profile.background.url ?? "/zalo.svg",
          tag: "friend",
        }));
        setFriends(newFriendList);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to get friends");
    }
    setLoading(false);
  };

  const getRecommendedFriends = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("users/get/random-not-friends");
      if (response.status === 200) {
        const newFriendList = response.data.users.map((friend) => ({
          id: friend.userId,
          phone: friend.phone,
          name: friend.profile.name,
          avatar: friend.profile.avatar.url ?? "/zalo.svg",
          background: friend.profile.background.url ?? "/zalo.svg",
        }));
        setRecommendedFriends(newFriendList);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to get recommended friends");
    }
    setLoading(false);
  };

  const getFriendByPhone = async (phone) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`users/get/phone/${phone}`);
      console.log(response.data);
      if (response.status === 200) {
        return response.data.user;
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to get friend by phone");
    }
    setLoading(false);
  };
  const getFriendById = async (uid) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`users/get/uid/${uid}`);
      if (response.status === 200) {
        return response.data.user;
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to get friend by id");
    }
    setLoading(false);
  };

  const addFriend = async (phone) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("users/send-add-friend", {
        phone,
      });
      if (response.status === 200) {
        toast.success("Friend request sent");
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to send friend request");
      }
    }
    setLoading(false);
  };

  const acceptFriend = async (phone) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/users/accept-add-friend", {
        phone,
      });
      if (response.status === 200) {
        toast.success("Friend request accepted");
        await reloadAuthUser();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to accept friend request");
    }
    setLoading(false);
  };

  const rejectFriend = async (phone) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/users/reject-request-add-friend",
        {
          phone,
        }
      );
      if (response.status === 200) {
        toast.success("Friend request rejected");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to reject friend request");
    }
    setLoading(false);
  };

  const cancelFriendRequest = async (phone) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/users/cancel-request-add-friend",
        {
          phone,
        }
      );
      if (response.status === 200) {
        toast.success("Friend request canceled");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to cancel friend request");
    }
    setLoading(false);
  };
  const unFriend = async (phone) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/users/unfriend", {
        phone,
      });
      if (response.status === 200) {
        await reloadAuthUser();
        return true;
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to unfriend");
      return false;
    }
    setLoading(false);
  };

  return {
    friends,
    recommendedFriends,
    loading,
    getAllFriends,
    getFriendByPhone,
    getFriendById,
    getRecommendedFriends,
    addFriend,
    acceptFriend,
    rejectFriend,
    cancelFriendRequest,
    unFriend,
  };
};

export default useFriend;
