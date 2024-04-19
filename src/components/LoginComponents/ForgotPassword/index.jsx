import { CiMail } from "react-icons/ci";
import { IoEyeOff, IoEye } from "react-icons/io5";

import OtpInput from "react-otp-input";
import { useState } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { checkEmail, checkPassword } from "../../../utils/validation";
import useForgot from "../../../hooks/useForgot";
import toast from "react-hot-toast";

function ForgotPassword() {
  const { langue, emailForgot } = useOutletContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    emailForgot.includes("@") ? emailForgot : ""
  );
  const [isInputEmail, setIsInputEmail] = useState(true);
  const [isInputCode, setIsInputCode] = useState(false);
  const [isInputPassword, setIsInputPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState("");
  // const [newPassword, setNewPassword] = useState("");

  const [password, setPwssword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [confirmPassword, setConfirmPwssword] = useState("");
  const [showConfirmPass, setConfirmShowPass] = useState(false);

  const { getOTP, isLoading, verifyOTP, resetPassword } = useForgot();

  const handleResetPassword = async () => {
    if (!checkPassword(password)) {
      toast.error(
        langue == "vi"
          ? "Mật khẩu phải chứa ít nhất 6 ký tự, bao gồm chữ cái và số và ký tự đặc biệt"
          : "Password must contain at least 6 characters, including letters and numbers and special characters"
      );
      return;
    } else if (password !== confirmPassword) {
      toast.error(
        langue == "vi"
          ? "Mật khẩu xác nhận không khớp"
          : "Password confirmation does not match"
      );
      return;
    } else {
      const rs = await resetPassword(email, password);
      if (rs) {
        setShowModal(true);
      }
    }
  };

  const handleGetOTP = async () => {
    if (checkEmail(email)) {
      const sendEmail = await getOTP(email);
      if (!sendEmail) return;
      setOtp("");
      setIsInputEmail(false);
      setIsInputCode(true);
    }
  };

  const handleVerifyOTP = async () => {
    if (await verifyOTP(otp)) {
      setIsInputCode(false);
      setIsInputPassword(true);
    }
  };

  return (
    <>
      {isInputEmail && (
        <div className="w-[450px] text-sm">
          <div className="w-full text-base pt-5 pb-3 bg-white">
            <p className="text-center mt-10 whitespace-normal break-words px-3">
              {emailForgot.includes("@")
                ? langue == "vi"
                  ? "Email bên dưới của bạn sẽ nhận được mã OTP để đặt lại mật khẩu"
                  : "The email below will receive the OTP to reset the password"
                : langue == "vi"
                ? "Nhập email đã liên kết với tài khoản của bạn để lấy mã xác nhận"
                : "Enter the email associated with your account to get the confirmation code"}
            </p>
            <p className="text-center whitespace-normal break-words px-3 italic text-sm">
              {emailForgot.includes("@")
                ? langue == "vi"
                  ? "Bấm xác nhận để nhận mã OTP "
                  : "Press confirm to receive the OTP"
                : ""}
            </p>
          </div>
          <form className="bg-white shadow-lg rounded px-10 pt-4 pb-5 mb-4">
            <div className="mb-6 flex items-center border-b">
              <CiMail className="text-2xl mr-3" />
              <input
                className="rounded w-full py-1 px-3 border-none
                text-gray-700 focus:outline-none focus:shadow-outline "
                id="email"
                type="email"
                placeholder={langue == "vi" ? "Nhập email" : "Enter your email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={emailForgot.includes("@")}
              />
            </div>
            <div>
              <button
                className="bg-primary hover:bg-primaryHover text-white 
                    rounded focus:outline-none focus:shadow-outline block w-full disabled:opacity-50 py-3"
                type="button"
                onClick={handleGetOTP}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : langue == "vi" ? (
                  "Xác Nhận"
                ) : (
                  "Confirm"
                )}
              </button>

              <Link
                className="block hover:underline hover:text-blue-400 text-gray-700 my-3"
                to={"/"}
              >
                {langue == "vi" ? "<< Quay lại" : "<< Back"}
              </Link>
            </div>
          </form>
        </div>
      )}
      {isInputCode && (
        <div className="w-[450px] text-sm">
          <div className="w-full text-base pt-5 pb-3 bg-white flex flex-col justify-center items-center">
            <p className="text-center mt-10 ">
              {langue == "vi"
                ? "Nhập mã xác nhận đã được gửi đến email của bạn"
                : "Enter the confirmation code that was sent to your email"}
            </p>
            <div className="flex justify-center mt-3">
              <button
                className="text-primary hover:underline"
                onClick={() => {
                  setOtp("");
                  handleGetOTP();
                }}
              >
                {langue == "vi" ? "Gửi lại mã xác nhận" : "Resend confirmation"}
              </button>
            </div>
            {isLoading && (
              <span className="loading loading-spinner text-green-500 mt-5"></span>
            )}
          </div>
          <form className="bg-white shadow-lg rounded px-10 pt-4 pb-5 mb-4">
            <div className="mb-6 flex items-center border-b">
              <div className="flex items-center justify-center p-4 mt-10 text-base font-semibold  overflow-hidden">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  renderSeparator={<span>-</span>}
                  renderInput={(props) => <input {...props} />}
                  inputStyle={{
                    width: "40px",
                    height: "40px",
                    margin: "0 5px",
                    fontSize: "20px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                />
              </div>
            </div>
            <div>
              <button
                className="bg-primary hover:bg-primaryHover text-white 
                    rounded focus:outline-none focus:shadow-outline block w-full disabled:opacity-50 py-3"
                type="button"
                disabled={otp.length !== 6}
                onClick={handleVerifyOTP}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : langue == "vi" ? (
                  "Xác Nhận"
                ) : (
                  "Confirm"
                )}
              </button>

              <button
                className="block hover:underline hover:text-blue-400 text-gray-700 my-3"
                onClick={() => {
                  setIsInputEmail(true);
                  setIsInputCode(false);
                }}
              >
                {langue == "vi" ? "<< Quay lại" : "<< Back"}
              </button>
            </div>
          </form>
        </div>
      )}
      {isInputPassword && (
        <div className="w-[450px] text-sm">
          <div className="w-full text-base pt-5 pb-3 bg-white">
            <p className="text-center mt-10 ">
              {langue == "vi"
                ? "Nhập mật khẩu mới của bạn"
                : "Enter your new password"}
            </p>
          </div>
          <form className="bg-white shadow-lg rounded px-10 pt-4 pb-5 mb-4">
            {/* <div className="mb-6 flex items-center border-b">
              <input
                className="rounded w-full py-1 px-3 border-none
                text-gray-700 focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder={
                  langue == "vi" ? "Nhập mật khẩu mới" : "Enter new password"
                }
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div> */}
            <div className="my-6 flex items-center border-b">
              <input
                className="ml-3 rounded w-full py-1 px-3 border-none
                  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type={showPass ? "text" : "password"}
                placeholder={langue == "vi" ? "Mật khẩu Mới" : "New Password"}
                value={password}
                onChange={(e) => setPwssword(e.target.value)}
              />
              {showPass ? (
                <IoEyeOff
                  className="mr-2 opacity-75"
                  size={16}
                  color="#555555"
                  onClick={() => setShowPass(!showPass)}
                />
              ) : (
                <IoEye
                  className="mr-2 opacity-75"
                  size={16}
                  color="#555555"
                  onClick={() => setShowPass(!showPass)}
                />
              )}
            </div>
            <div className="my-6 flex items-center border-b">
              <input
                className="ml-3 rounded w-full py-1 px-3 border-none
                  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type={showConfirmPass ? "text" : "password"}
                placeholder={
                  langue == "vi"
                    ? "Nhập lại mật khẩu"
                    : "Enter confirm password"
                }
                value={confirmPassword}
                onChange={(e) => setConfirmPwssword(e.target.value)}
              />
              {showConfirmPass ? (
                <IoEyeOff
                  className="mr-2 opacity-75"
                  size={16}
                  color="#555555"
                  onClick={() => setConfirmShowPass(!showConfirmPass)}
                />
              ) : (
                <IoEye
                  className="mr-2 opacity-75"
                  size={16}
                  color="#555555"
                  onClick={() => setConfirmShowPass(!showConfirmPass)}
                />
              )}
            </div>
            <div>
              <button
                className="bg-primary hover:bg-primaryHover text-white 
                    rounded focus:outline-none focus:shadow-outline block w-full disabled:opacity-50 py-3"
                type="button"
                disabled={password.length === 0}
                onClick={handleResetPassword}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : langue == "vi" ? (
                  "Cập Nhật Mật Khẩu"
                ) : (
                  "Update Password"
                )}
              </button>

              <button
                className="block hover:underline hover:text-blue-400 text-gray-700 my-3"
                onClick={() => {
                  setIsInputCode(true);
                  setIsInputPassword(false);
                }}
              >
                {langue == "vi" ? "<< Quay lại" : "<< Back"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* modal notify for resetpasswword successfuly  */}
      {showModal && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-5 w-96">
            <div className="text-center">
              <p className="text-xl font-semibold">
                {langue == "vi"
                  ? "Đặt lại mật khẩu thành công"
                  : "Reset password successfully"}
              </p>
              <p className="text-sm mt-3">
                {langue == "vi"
                  ? "Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới của mình"
                  : "Your password has been reset successfully. Now you can log in with your new password"}
              </p>
            </div>
            <div className="mt-5">
              <button
                className="bg-primary hover:bg-primaryHover text-white 
                    rounded focus:outline-none focus:shadow-outline block w-full py-3"
                onClick={() => {
                  setShowModal(false);
                  navigate("/login", { state: { email, password } });
                }}
              >
                {langue == "vi" ? "Đóng" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ForgotPassword;
