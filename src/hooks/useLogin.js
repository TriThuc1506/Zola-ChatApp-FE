import { useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser, setAccessToken, setRefreshToken } = useAuthContext();

  const login = async (phone, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", {
        phone,
        password,
      });

      const data = response.data;
      if (response.status === 200) {
        setAuthUser(data.user);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Login failed! Please try again.");
      }
    }
    setLoading(false);
  };

  return { login, loading };
};

export default useLogin;
