import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
const useConversation = () => {
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  const getConversations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "conversations/getConversations"
      );
      if (response.status === 200) {
        const newConversationList = response.data.map((conversation) => {
          return {
            id: conversation._id,
            participants: conversation.participants,
            messages: conversation.messages,
            lastMessage: conversation.lastMessage,
            tag: conversation.tag,
          };
        });
        setConversations(newConversationList);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to get conversations");
    }
    setLoading(false);
  };

  const deleteConversation = async (conversationId) => {
    try {
      const response = await axiosInstance.post(
        `conversations/deleted/${conversationId}`
      );
      if (response.status === 200) {
        toast.success("Conversation deleted successfully");
        getConversations();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete conversation");
    }
  };

  const getConversationByParticipants = async (participants) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "conversations/getByParticipants",
        {
          participants,
        }
      );
      if (response.status === 200) {
        return response.data;
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getConversationByID = async (conversationId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `conversations/get/${conversationId}`
      );
      if (response.status === 200) {
        setConversation(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      throw new Error("Failed to get conversation");
    }
  };

  return {
    conversations,
    conversation,
    loading,
    getConversations,
    deleteConversation,
    getConversationByID,
    getConversationByParticipants,
  };
};

export default useConversation;
