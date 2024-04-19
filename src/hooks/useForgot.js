import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import VerifyOTPModule from "../utils/verifyOTP";

const useForgot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [systemOTP, setSystemOTP] = useState(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  const getOTP = async (email) => {
    try {
      setIsLoading(true);
      setIsOTPVerified(false);
      await axiosInstance.post("/users/check-email", {
        email,
      });
      const otp = await VerifyOTPModule.sendOTP(email);
      toast.success("OTP sent to your email");
      setIsLoading(false);
      setSystemOTP(otp);
      return true;
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to send OTP");
      }
      setIsOTPVerified(false);
      setIsLoading(false);
      return false;
    }
  };

  const verifyOTP = async (userOTP) => {
    setIsLoading(true);
    const verified = await VerifyOTPModule.verifyOTP(userOTP, systemOTP);
    if (verified) {
      setIsOTPVerified(true);
      setIsLoading(false);
      return true;
    } else {
      toast.error("OTP is incorrect");
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/auth/reset-password", {
        email,
        newPassword,
      });

      if (response.status === 200) {
        toast.success("Password reset successfully");
        setIsLoading(false);
        return true;
      } else {
        toast.error("Failed to reset password");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to reset password");
      setIsLoading(false);
      return false;
    }
  };

  return { getOTP, verifyOTP, resetPassword, isLoading, isOTPVerified };
};

export default useForgot;
