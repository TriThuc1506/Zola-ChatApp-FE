import axiosInstance from "../api/axiosInstance";
import { useAuthContext } from "../contexts/AuthContext";

const useLogout = () => {
  const { setAuthUser, setAccessToken, setRefreshToken } = useAuthContext();
  const logout = async () => {
    try {
      const refreshToken = JSON.parse(localStorage.getItem("refreshToken"));
      if (refreshToken) {
        const response = await axiosInstance.post("/auth/logout", {
          refreshToken,
        });
        if (response.status === 200) {
          localStorage.clear();
          setAuthUser(null);
          setAccessToken(null);
          setRefreshToken(null);
        }
      }
    } catch (error) {
      throw error;
    }
  };
  return logout;
};

export default useLogout;
