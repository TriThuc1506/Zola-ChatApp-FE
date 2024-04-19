import { MdEmail, MdPhoneIphone } from "react-icons/md";
import { toast, Toaster } from "react-hot-toast";

import { useState } from "react";
import OtpInput from "react-otp-input";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import useRegister from "../../../hooks/useRegister";
import {
  checkDOB,
  checkEmail,
  checkName,
  checkPassword,
  checkPhone,
} from "../../../utils/validation";
import apiConfig from "../../../api/config";

function Register() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("male");
  const [dob, setDob] = useState(new Date());
  const {langue} = useOutletContext();
  const navigate = useNavigate();
  const [password, setPwssword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [confirmPassword, setConfirmPwssword] = useState("");
  const [showConfirmPass, setConfirmShowPass] = useState(false);
  const [isCheckedInter, setIsCheckedInter] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isSendOTP, setIsSendOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const { isLoading, getOTP, verifyEmailAndRegister, isOTPVerified } =
    useRegister();

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleRegister = () => {
    handlePressablePress();
  };

  const handleCheckInter = () => {
    setIsCheckedInter(!isCheckedInter);
  };

  const handlePressablePress = () => {
    if (!checkPhone(phone)) {
      toast.error("Số điện thoại phải từ 10 đến 11 chữ số.");
    } else if (!checkName(name)) {
      toast.error("Vui lòng nhập tên là chữ và ít nhất 2 kí tự chữ");
    } else if (!checkPassword(password)) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
    } else if (!checkEmail(email)) {
      toast.error("Vui lòng nhập email hợp lệ");
    } else if (!checkPassword(password)) {
      toast.error("MK chứa ít nhất 1 chữ,1 số,1 ký tự đặc biệt");
    } else if (!(password === confirmPassword)) {
      toast.error("Vui lòng nhập xác nhận mật khẩu trùng khớp");
    } else if (!isCheckedInter) {
      toast.error("Vui lòng chấp nhận các điều khoản");
    } else if (!checkDOB(dob)) {
      toast.error("Bạn phải trên 16 tuổi để đăng ký tài khoản");
    } else {
      setIsRegister(true);
    }
  };

  const pressSendOTP = async (e) => {
    e.preventDefault();
    const systemOTP = await getOTP(email);
    if (systemOTP) {
      setIsRegister(false);
      setIsSendOTP(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await verifyEmailAndRegister(
      email,
      otp,
      phone,
      name,
      dob,
      gender,
      password
    );
    if (response) {
      openModal();
    }
  };

  const handleXacNhan = () => {
    closeModal();
    navigate("/login", {state: {newEmail: email, newPassword: password}});
  };

  const handleTuChoi = () => {
    closeModal();
    window.location.href = "/login/register";
  };

  // Hàm này sẽ thay thế các ký tự trong chuỗi bí danh từ vị trí thứ hai đến trước ký tự @
  const hideEmail = (email) => {
    const atIndex = email.indexOf("@");
    const firstPart = email.substring(0, atIndex);
    const hiddenPart = firstPart.substring(2).replace(/./g, "*");
    const visiblePart = firstPart.substring(0, 2);
    return visiblePart + hiddenPart + email.substring(atIndex);
  };

  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className=" flex justify-center items-center">
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-center">
                Đăng ký thành công!
              </h2>
              <p>
                {langue == "vi"
                  ? "Bạn có muốn chuyển về trang đăng nhập không?"
                  : "Registration successful! Do you want to return to the login page?"}
              </p>
              <div className="flex justify-around">
                <button
                  className="bg-blue-500 text-white px-4 py-2  mt-4 rounded hover:bg-blue-600 text-center "
                  onClick={handleXacNhan}
                >
                  Yes
                </button>
                <button
                  className="bg-gray-400 text-white px-5 py-2 mt-4 rounded hover:bg-gray-600 text-center"
                  onClick={handleTuChoi}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-[400px] text-sm ">
          <div className="w-full p-1 bg-white flex justify-around">
            <p className="text-center text-sm font-bold uppercase py-3 mb-[-5px] border-b border-black">
              {langue == "vi" ? "Đăng ký" : "Register"}
            </p>
          </div>
          <hr />
          <form className="bg-white shadow-lg rounded px-10 pt-4 pb-5 mb-4">
            <div className="my-6 flex items-center border-b">
              <span>
                <MdPhoneIphone size={16} color="#555555" />
              </span>

              <span className="ml-3">+84</span>
              <input
                className="rounded w-full py-1 px-3 border-none
                text-gray-700 focus:outline-none focus:shadow-outline"
                id="phone"
                type="text"
                placeholder={langue == "vi" ? "Số điện thoại" : "Phone number"}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                }}
              />
            </div>

            <div className="my-6 flex items-center border-b">
              <input
                className=" ml-3 rounded w-full py-1 px-3 border-none
                text-gray-700 focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                placeholder={langue == "vi" ? "Tên" : "User name"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <div className="my-6 flex items-center border-b">
              <input
                className="ml-3 rounded w-full py-1 px-3 border-none
                  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type={showPass ? "text" : "password"}
                placeholder={langue == "vi" ? "Mật khẩu" : "Password"}
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

            {/* email */}
            <div className="my-6 flex items-center border-b">
              <input
                className=" ml-3 rounded w-full py-1 px-3 border-none
                text-gray-700 focus:outline-none focus:shadow-outline"
                id="email"
                type="text"
                placeholder={langue == "vi" ? "email" : "email"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>

            {/* Gender */}
            <div className="my-6 flex items-center border-b pl-5">
              <div className="mr-6">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  id="male"
                  className="radio"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                  style={{ width: "20px", height: "20px" }}
                />
                <label for="male" className="ml-2 ">
                  {langue == "vi" ? "Nam" : "Male"}
                </label>
              </div>
              <div className="mr-6">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  id="female"
                  className="radio"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                  style={{ width: "20px", height: "20px" }}
                />
                <label for="female" className="ml-2">
                  {langue == "vi" ? "Nữ" : "Female"}
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  id="other"
                  className="radio"
                  checked={gender === "other"}
                  onChange={() => setGender("other")}
                  style={{ width: "20px", height: "20px" }}
                />
                <label for="other" className="ml-2">
                  {langue == "vi" ? "Khác" : "Other"}
                </label>
              </div>
            </div>
            {/* Dob */}
            <div className="my-6 flex items-center border-b">
              <input
                type="date"
                name="birthdate"
                className="input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{ width: "500px" }}
              />
            </div>

            <div className="my-6 flex items-center">
              <input
                className="rounded ml-6 mr-3 py-1 px-3 border-none
                text-gray-700 focus:outline-none focus:shadow-outline"
                id="checkedInter"
                type="checkbox"
                checked={isCheckedInter}
                onChange={handleCheckInter}
              />
              <span>
                {langue == "vi"
                  ? "Tôi đồng ý với các điều khoản Mạng xã hội của Zola"
                  : "I agree to Zola's Social Network terms"}
              </span>
            </div>
            <div className="my-6 flex items-center">
              {/* link to terms page */}
              <a
                className="italic hover:underline hover:text-blue-400 text-gray-500"
                href={apiConfig.baseURL + "/terms_of_service"}
                target="_blank"
              >
                {langue == "vi"
                  ? "Điều khoản sử dụng Zola ?"
                  : "Zola's terms of use ?"}
              </a>
            </div>

            <div>
              <button
                className="bg-primary hover:bg-primaryHover text-white 
                    rounded focus:outline-none focus:shadow-outline block w-full disabled:opacity-50 py-3"
                type="button"
                disabled={
                  phone.length === 0 ||
                  password.length === 0 ||
                  name.length === 0 ||
                  confirmPassword === 0 ||
                  email.length === 0 ||
                  gender.length === 0 ||
                  dob.length === 0 ||
                  !isCheckedInter
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleRegister();
                }}
              >
                {isLoading ? (
                  <span className="loading loading-spinner "></span>
                ) : langue == "vi" ? (
                  "Đăng ký"
                ) : (
                  "Register"
                )}
              </button>
              {isRegister && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/5 h-[60%] bg-white rounded-lg shadow-lg text-black text-center">
                  <div className="flex-row items-center justify-center p-4 mt-10 text-base font-semibold h-[10%] ">
                    <p>Xác nhận email:</p>
                    <p>{hideEmail(email)}</p>
                  </div>
                  <div className="flex-col flex items-center justify-center p-4 mt-10 text-base  h-[20%] ">
                    <p>Email này sẽ được dùng để gửi mã xác thực</p>
                    <div>
                      {isLoading && (
                        <span className="loading loading-spinner "></span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end p-4 mt-10 text-base absolute inset-x-0 bottom-0 h-16 ">
                    <button
                      className=" font-semibold text-cyan-500 mr-10"
                      onClick={() => setIsRegister(false)}
                    >
                      {langue == "vi" ? "Hủy" : "Cancel"}
                    </button>
                    <button
                      className="font-semibold text-cyan-500 mr-2"
                      onClick={pressSendOTP}
                    >
                      {langue == "vi" ? "Gửi OTP" : "Send OTP"}
                    </button>
                  </div>
                </div>
              )}
              {isSendOTP && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/5 h-[60%] bg-white rounded-lg shadow-lg text-black text-center">
                  <div className="flex items-center justify-center p-4 mt-10 text-base font-semibold h-[10%] ">
                    <MdEmail fontSize="100" />
                  </div>

                  <div className="flex-row items-center justify-center p-4 mt-10 text-base font-semibold h-[10%] ">
                    <p>Đang gửi mã xác thực đến email:</p>
                    <p>{hideEmail(email)}</p>
                  </div>
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
                  {isOTPVerified ? (
                    <div className="flex items-center justify-center p-4 mt-10 text-base font-semibold h-[10%] ">
                      <FaCheckCircle size={20} color="#08bc08" />
                      <p className="ml-5">
                        {langue == "vi"
                          ? "Đã Xác thực mã OTP, đang xử lý đăng ký"
                          : "OTP verified, processing registration"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4 mt-10 text-base font-semibold h-[10%] ">
                      <button
                        className="font-semibold text-cyan-500 mr-2"
                        onClick={pressSendOTP}
                      >
                        {langue == "vi" ? "Gửi lại OTP" : "Resend OTP"}
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-end p-4 mt-10 text-base absolute inset-x-0 bottom-0 h-16 ">
                    <button
                      className=" font-semibold text-cyan-500 mr-10"
                      // value={isSendOTP}
                      onClick={() => {
                        setIsSendOTP(false), setOtp("");
                      }}
                    >
                      {langue == "vi" ? "Hủy" : "Cancel"}
                    </button>
                    <button
                      className="font-semibold text-cyan-500 mr-2"
                      onClick={handleSubmit}
                    >
                      {langue == "vi" ? "Xác nhận" : "Submit"}
                    </button>
                  </div>
                </div>
              )}
              <Link
                className="block hover:underline hover:text-blue-400 text-gray-700 my-3"
                to={"/"}
              >
                {langue == "vi" ? "<< Quay lại" : "<< Back"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;
