// useVerifyOTP.js

import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import VerifyOTPModule from "../utils/verifyOTP";
const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [systemOTP, setSystemOTP] = useState(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  const getOTP = async (email) => {
    try {
      setIsLoading(true);
      setIsOTPVerified(false);
      const otp = await VerifyOTPModule.sendOTP(email);

      if (otp) {
        toast.success("OTP sent to your email");
        setIsLoading(false);
        setSystemOTP(otp);
        return true;
      } else {
        toast.error("Failed to send OTP");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP");
      setIsLoading(false);
      return false;
    }
  };

  const verifyEmailAndRegister = async (
    email,
    userOTP,
    phone,
    name,
    dob,
    gender,
    password
  ) => {
    const verified = await VerifyOTPModule.verifyOTP(userOTP, systemOTP);
    setIsOTPVerified(verified);
    try {
      setIsLoading(true);
      if (verified) {
        const response = await axiosInstance.post("/auth/register", {
          email,
          phone,
          name,
          dob,
          gender,
          password,
        });
        setIsOTPVerified(true);
        const data = response.data;

        if (response.status === 201) {
          setIsLoading(false);
          toast.success("Account created successfully");
          return true;
        } else {
          setIsLoading(false);
          toast.error(data.response.message);
          return false;
        }
      } else {
        toast.error("Invalid OTP");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.log(error);
      setIsOTPVerified(true);
      setIsLoading(false);
      toast.error(error.response.data.message);
      return false;
    }
  };

  return { isLoading,isOTPVerified, getOTP, verifyEmailAndRegister };
};

export default useRegister;
