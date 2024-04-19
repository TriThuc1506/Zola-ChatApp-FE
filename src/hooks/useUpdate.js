import { useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import VerifyOTPModule from "../utils/verifyOTP";

const useUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [systemOTP, setSystemOTP] = useState(null);

  const { reloadAuthUser } = useAuthContext();

  const  updateAvatar = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axiosInstance.post(
        "/users/upload-avatar",
        formData
      );

      const { data, status } = response;

      if (status === 200) {
        const { avatar } = data;
        if (avatar) {
          toast.success("Avatar updated successfully");
          await reloadAuthUser();
        } else {
          throw new Error("Failed to update avatar");
        }
      } else {
        throw new Error(data.message || "Failed to update avatar");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response.data.message ||
          "Failed to update avatar! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateBackground = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("background", file);

      const response = await axiosInstance.post(
        "/users/upload-background",
        formData
      );

      const { data, status } = response;

      if (status === 200) {
        const { background } = data;
        if (background) {
          toast.success("Background updated successfully");
          await reloadAuthUser();
        } else {
          throw new Error("Failed to update background");
        }
      } else {
        throw new Error(data.message || "Failed to update background");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.message || "Failed to update background! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/users/update-profile",
        userData
      );
      const { data, status } = response;

      if (status === 200) {
        const { user } = data;
        if (user) {
          toast.success("Profile updated successfully");
          const rs = await reloadAuthUser();
          return rs;

        } else {
          throw new Error("Failed to update profile");
        }
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response.data.message ||
          "Failed to update profile! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const getOTP = async (email) => {
    try {
      setLoading(true);
      await axiosInstance.post("/users/check-email", {
        email,
      });
      const otp = await VerifyOTPModule.sendOTP(email);
      toast.success("OTP sent to your email");
      setLoading(false);
      setSystemOTP(otp);
      return true;
    } catch (error) {
      if (error.response.status === 404) {
        const otp = await VerifyOTPModule.sendOTP(email);
        toast.success("OTP sent to your email");
        setLoading(false);
        setSystemOTP(otp);

        return true;
      } else {
        toast.error("Failed to send OTP");
      }
      setLoading(false);
      return false;
    }
  };

  const verifyOTP = async (userOTP) => {
    setLoading(true);
    const verified = await VerifyOTPModule.verifyOTP(userOTP, systemOTP);
    if (verified) {
      setLoading(false);
      return true;
    } else {
      toast.error("OTP is incorrect");
      setLoading(false);
      return false;
    }
  };

  return {
    updateAvatar,
    updateBackground,
    updateProfile,
    loading,
    getOTP,
    verifyOTP,
  };
};

export default useUpdate;
