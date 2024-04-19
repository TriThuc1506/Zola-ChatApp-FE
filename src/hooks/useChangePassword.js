import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

const useChangePassword = () => {
    const [isLoading, setIsLoading] = useState(false);
  const changePassword = async (oldPassword, newPassword) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      if (response.status === 403) {
        return false;
      } else if (response.status === 400) {
        return false;
      } else if (response.status === 200) {
        setIsLoading(false);
        return true;
      } else {
        toast.error("Failed to change password");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error(error.response.data.message);
      return false;
    }
  };

  return { isLoading, changePassword };
};

export default useChangePassword;
