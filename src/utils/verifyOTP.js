import axiosInstance from "../api/axiosInstance";

const verifyOTP = async (userOTP, systemOTP) => {
  if (userOTP === systemOTP.otp && systemOTP.expires >= Date.now()) {
    return true;
  } else {
    return false;
  }
};

const sendOTP = async (email) => {
  const response = await axiosInstance.post("/auth/send-otp", {
    email,
  });
  const data = response.data;
  return data.totp;
};

export default { verifyOTP, sendOTP };
