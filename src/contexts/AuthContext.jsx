/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("authUser"))
  );
  const [accessToken, setAccessToken] = useState(
    JSON.parse(localStorage.getItem("accessToken"))
  );
  const [refreshToken, setRefreshToken] = useState(
    JSON.parse(localStorage.getItem("refreshToken"))
  );

  useEffect(() => {
    if (authUser) {
      localStorage.setItem("authUser", JSON.stringify(authUser));
    } else {
      localStorage.removeItem("authUser");
    }
    if (accessToken) {
      localStorage.setItem("accessToken", JSON.stringify(accessToken));
    } else {
      localStorage.removeItem("accessToken");
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
    } else {
      localStorage.removeItem("refreshToken");
    }
  }, [authUser, accessToken, refreshToken]);

  const reloadAuthUser = async () => {
    try {
      const response = await axiosInstance.get("users/get/me");
      if (response.status === 200) {
        setAuthUser(response.data.user);
        return true;
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to get user information");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        accessToken,
        setAccessToken,
        refreshToken,
        setRefreshToken,
        reloadAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
