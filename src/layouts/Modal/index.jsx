import React, { useState } from "react";
import { CiEdit, CiCamera } from "react-icons/ci";
import OtpInput from "react-otp-input";
import useUpdate from "../../hooks/useUpdate";
import useChangePassword from "../../hooks/useChangePassword";
import {
  checkDOB,
  checkEmail,
  checkName,
  checkPassword,
} from "../../utils/validation";
import toast from "react-hot-toast";
import { HiMiniLockClosed } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

function ModalComponent({ showModal, language, userInfo, typeModal }) {
  const [showUpdate, setShowUpdate] = useState(false);
  const {
    updateProfile,
    loading,
    getOTP,
    verifyOTP,
    updateAvatar,
    updateBackground,
  } = useUpdate();
  const { changePassword } = useChangePassword();
  const navigate = useNavigate();

  const [usName, setUsName] = useState(userInfo?.profile.name);
  const [usEmail, setUsEmail] = useState(userInfo?.email);
  const [usGender, setUsGender] = useState(userInfo?.profile.gender);
  const [usDob, setUsDob] = useState(new Date(userInfo?.profile.dob));

  const [isUpdateEmail, setIsUpdateEmail] = useState(false);
  const [otp, setOtp] = useState("");
  const [isValidate, setIsValidate] = useState(false);
  const [isSendOTP, setIsSendOTP] = useState(false);
  const [isVerifyOTP, setIsVerifyOTP] = useState(false);

  const [avatar, setAvatar] = useState(
    userInfo?.profile.avatar?.url || "./zalo.svg"
  );
  const [background, setBackground] = useState(
    userInfo?.profile.background?.url || "./zalo.svg"
  );
  const [isOpenSecurity, setIsSecurity] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [passwordNew, setPasswordNew] = useState("");
  const [showPasswordNew, setShowPasswordNew] = useState(false);

  const [passwordReNew, setPasswordReNew] = useState("");
  const [showPasswordReNew, setShowPasswordReNew] = useState(false);
  const [showModalUpAVT, setShowModalUpAVT] = useState(false);

  const [loadingButtonAVT, setLoadingButtonAVT] = useState(false);
  const [showModalUpBgr, setShowModalUpBgr] = useState(false);
  const [loadingButtonBgr, setLoadingButtonBgr] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordNew = () => {
    setShowPasswordNew(!showPasswordNew);
  };

  const togglePasswordReNew = () => {
    setShowPasswordReNew(!showPasswordReNew);
  };
  const toggleModalSecurity = () => {
    setIsSecurity(!isOpenSecurity);
  };

  const handleUpdate = async () => {
    const selectedDay = document.getElementById("day").value;
    const selectedMonth = document.getElementById("month").value;
    const selectedYear = document.getElementById("year").value;
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);

    if (!checkDOB(selectedDate)) {
      toast.error(
        language === "vi"
          ? "Bạn phải trên 16 tuổi"
          : "You must be over 16 years old"
      );
      return;
    } else if (!isVerifyOTP && isUpdateEmail) {
      toast.error(
        language === "vi"
          ? "Vui lòng xác nhận email"
          : "Please confirm your email"
      );
      return;
    }

    await updateProfile({
      name: usName,
      email: usEmail,
      gender: usGender,
      dob: selectedDate
    }).then((rs) => {
      if (rs) {
        handleCancel();
        showModal(false);
      }
    });
  };

  const handleCancel = () => {
    setShowUpdate(false);
    setIsUpdateEmail(false);
    setIsSendOTP(false);
    setIsVerifyOTP(false);
    setIsValidate(false);

    setUsEmail(userInfo.email);
    setUsName(userInfo.profile.name);
    setUsGender(userInfo.profile.gender);
    setUsDob(new Date(userInfo.profile.dob));
    setOtp("");
  };

  const handleGetOTP = async () => {
    if (checkEmail(usEmail)) {
      const sendEmail = await getOTP(usEmail);
      setIsSendOTP(sendEmail);
      setOtp("");
    }
  };

  const handleVerifyOTP = async () => {
    const checkOTP = await verifyOTP(otp);
    setIsVerifyOTP(checkOTP);
    if (checkOTP) {
      setIsValidate(true);
    }
  };

  const checkusName = () => {
    if (usName !== userInfo.profile.name) {
      if (checkName(usName)) {
        if (isUpdateEmail) {
          setIsValidate(true);
        }
      } else {
        toast.error(language === "vi" ? "Tên không hợp lệ" : "Invalid name");
        setIsValidate(false);
      }
      setIsValidate(true);
    } else {
      toast.success(
        language === "vi" ? "Tên không thay đổi" : "Name not change"
      );
      setIsValidate(false);
    }
  };
  const checkUsEmail = () => {
    if (usEmail !== userInfo.email) {
      if (checkEmail(usEmail)) {
        setIsValidate(true);
        setIsUpdateEmail(true);
      } else {
        toast.error(language === "vi" ? "Email không hợp lệ" : "Invalid email");
        setIsValidate(false);
        setIsUpdateEmail(false);
      }
    } else {
      toast.success(
        language === "vi" ? "Email không thay đổi" : "Email not change"
      );
      setIsValidate(false);
      setIsUpdateEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !checkPassword(passwordCurrent) ||
      !checkPassword(passwordNew) ||
      passwordNew !== passwordReNew
    ) {
      toast.error("Mật khẩu không hợp lệ");
      return;
    } else {
      const rsChange = await changePassword(passwordCurrent, passwordNew);
      if (rsChange) {
        toast.success("Đổi mật khẩu thành công, vui lòng đăng nhập lại");
        setShowChangePassword(false);
        localStorage.clear();
        navigate("/login", { state: { emailFromChangePassword: usEmail } });
        window.location.reload();
      }
    }
  };

  const handleOpenModalUpAVT = () => {
    setShowModalUpAVT(true);
  };

  const handleCloseModalUpAVT = () => {
    setShowModalUpAVT(false);
  };
  const handleUpdateAvatar = async (event) => {
    try {
      setLoadingButtonAVT(true);
      const file = event.target.files[0];
      const newAvatarUrl = URL.createObjectURL(file);
      setAvatar(newAvatarUrl);
      await updateAvatar(file);
      setShowModalUpAVT(false);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setLoadingButtonAVT(false);
    }
  };
  const handleOpenModalBgr = () => {
    setShowModalUpBgr(true);
  };

  const handleCloseModalUpBgr = () => {
    setShowModalUpBgr(false);
  };
  const handleUpdateBackground = async (event) => {
    try {
      setLoadingButtonBgr(true);
      const file = event.target.files[0];
      const newBackgroundUrl = URL.createObjectURL(file);
      setBackground(newBackgroundUrl);
      await updateBackground(file);
      setShowModalUpBgr(false);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setLoadingButtonBgr(false);
    }
  };

  const showNoti = () => {
    toast.error(
      language === "vi"
        ? "Tính năng chưa hoàn thiện"
        : "Function is not complete"
    );
  };


  return typeModal === "profile" ? (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 ">
        <div className="relative w-[440px] h-[560px] my-6 mx-auto">
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-center justify-between p-3 border-b border-solid border-blueGray-200 rounded-t">
              <h1 className="font-semibold">
                {!showUpdate
                  ? language == "vi"
                    ? "Thông tin tài khoản"
                    : "Profile"
                  : language == "vi"
                  ? "Cập nhật thông tin"
                  : "Update profile"}
              </h1>
              <button
                className="mr-2 float-right uppercase"
                onClick={() => showModal(false)}
              >
                <span className="block">x</span>
              </button>
            </div>
            {showUpdate ? (
              <div className="my-3 px-5 h-[425px]">
                <label htmlFor="usname">
                  {language == "vi" ? "Tên hiển thị" : "Display name"}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded my-3"
                  id="usname"
                  value={usName}
                  onChange={(e) => setUsName(e.target.value)}
                  onBlur={checkusName}
                />
                <label htmlFor="usname">
                  {language == "vi" ? "Email hiển thị" : "Display mail"}
                </label>
                <input
                  type="email"
                  className={`w-full border border-gray-300 p-2 rounded my-3 ${
                    isUpdateEmail
                      ? isVerifyOTP
                        ? "border-green-500"
                        : "border-yellow-400"
                      : ""
                  } `}
                  id="usEmail"
                  value={usEmail}
                  onChange={(e) => setUsEmail(e.target.value)}
                  onBlur={checkUsEmail}
                />
                {}
                <h1 htmlFor="gender" className="font-semibold text-xl">
                  {language == "vi"
                    ? "Thông tin cá nhân"
                    : "Personal Infomation"}
                </h1>
                <div className="flex my-5">
                  <div className="mr-5">
                    <input
                      type="radio"
                      name="gender"
                      id="male"
                      checked={usGender === "male"}
                      onChange={() => setUsGender("male")}
                    />
                    <label htmlFor="male" className="ml-3">
                      {language == "vi" ? "Nam" : "Male"}
                    </label>
                  </div>
                  <div className="ml-5">
                    <input
                      type="radio"
                      name="gender"
                      id="female"
                      checked={usGender === "female"}
                      onChange={() => setUsGender("female")}
                    />
                    <label htmlFor="female" className="ml-3">
                      {language == "vi" ? "Nữ" : "Female"}
                    </label>
                  </div>
                  <div className="ml-10">
                    <input
                      type="radio"
                      name="gender"
                      id="other"
                      checked={usGender === "other"}
                      onChange={() => setUsGender("other")}
                    />
                    <label htmlFor="other" className="ml-3">
                      {language == "vi" ? "Khác" : "Other"}
                    </label>
                  </div>
                </div>

                <h1 className="mt-5">
                  {language == "vi" ? "Ngày sinh" : "Birthday"}
                </h1>
                <div className="flex my-5 w-full justify-between items-center">
                  <div className="w-[30%]">
                    <select
                      name="day"
                      id="day"
                      className="h-10 max-h-20 w-full overflow-y-auto border rounded px-3"
                      value={usDob.getDate()}
                      onChange={(e) => {
                        const dob = new Date(usDob);
                        dob.setDate(parseInt(e.target.value));
                        setUsDob(dob);
                        setIsValidate(checkDOB(dob));
                      }}
                    >
                      {[...Array(31)].map((e, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-[30%]">
                    <select
                      name="month"
                      id="month"
                      className="h-10 max-h-20 w-full overflow-y-auto border rounded px-3"
                      value={usDob.getMonth()}
                      onChange={(e) => {
                        const dob = new Date(usDob);
                        dob.setMonth(parseInt(e.target.value));
                        setUsDob(dob);
                        setIsValidate(checkDOB(dob));
                      }}
                    >
                      {[...Array(12)].map((e, i) => (
                        <option key={i + 1} value={i}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-[30%]">
                    <select
                      name="year"
                      id="year"
                      className="h-10 max-h-20 w-full overflow-y-auto border rounded px-3"
                      value={usDob.getFullYear()}
                      onChange={(e) => {
                        const dob = new Date(usDob);
                        dob.setFullYear(parseInt(e.target.value));
                        setUsDob(dob);
                        setIsValidate(checkDOB(dob));
                      }}
                    >
                      {[...Array(121)].map((e, i) => (
                        <option key={i + 1920} value={i + 1920}>
                          {i + 1920}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-200">
                <div className="h-[170px]">
                  <button
                    onClick={handleOpenModalBgr}
                    className="h-full w-full"
                  >
                    <img
                      src={background}
                      className="object-cover h-full w-full"
                      alt="Background"
                    />
                  </button>
                </div>
                <div className="-mt-6 ">
                  <div className="flex bg-white px-3">
                    <div className="relative">
                      <img
                        className="rounded-full h-24 w-24 object-cover border-2 border-white"
                        src={avatar}
                        alt="avatar"
                      />
                      <CiCamera
                        className="absolute bottom-3 right-0 border-spacing-4 rounded-full border-white bg-gray-300"
                        size={26}
                        onClick={handleOpenModalUpAVT}
                      />
                    </div>
                    <div className="flex items-center">
                      <h1 className="text-xl font-semibold mx-3">{usName}</h1>
                    </div>
                  </div>
                  <div className="mt-1 px-5 bg-white">
                    <h1 className="text-xl font-semibold pt-5">
                      {language == "vi"
                        ? "Thông tin cá nhân"
                        : "Personal Infomation"}
                    </h1>
                    <div className="flex items-center my-3">
                      <h1 className="w-1/3 text-gray-500">
                        {language == "vi" ? "Giới tính" : "Gender"}:
                      </h1>
                      <h1 className="w-2/3">
                        {usGender === undefined
                          ? language === "vi"
                            ? "Chưa cập nhật"
                            : "Not updated"
                          : usGender === "female"
                          ? language === "vi"
                            ? "Nữ"
                            : "Female"
                          : usGender === "other"
                          ? language === "vi"
                            ? "Khác"
                            : "Other"
                          : language === "vi"
                          ? "Nam"
                          : "Male"}
                      </h1>
                    </div>

                    <div className="flex items-center my-3">
                      <h1 className="w-1/3 text-gray-500">
                        {language == "vi" ? "Ngày sinh" : "Birthday"}:
                      </h1>
                      <h1 className="w-2/3">
                        {userInfo.profile.dob
                          ? usDob.getDate() +
                            "/" +
                            (usDob.getMonth() + 1) +
                            "/" +
                            usDob.getFullYear()
                          : language == "vi"
                          ? "Chưa cập nhật"
                          : "Not updated"}
                      </h1>
                    </div>
                    <div className="flex items-center my-3">
                      <h1 className="w-1/3 text-gray-500">
                        {language == "vi" ? "Điện thoại" : "Phone number"}:
                      </h1>
                      <h1 className="w-2/3">{userInfo.phone}</h1>
                    </div>
                    <div className="flex items-center pb-3">
                      <h1 className="w-1/3 text-gray-500">Email :</h1>
                      <h1 className="w-2/3">{userInfo.email}</h1>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* modal upload ảnh đại diện */}
            {showModalUpAVT && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Profile Picture</h1>
                    <button
                      className="text-red-500"
                      onClick={() => handleCloseModalUpAVT()}
                      disabled={loadingButtonAVT} // Disable nút khi đang trong quá trình loading
                    >
                      {loadingButtonAVT ? "Loading..." : "Close"}{" "}
                      {/* Điều chỉnh nội dung của nút */}
                    </button>
                  </div>
                  <img
                    src={avatar}
                    className="mt-4 object-cover h-40 w-full rounded-lg"
                    alt="Avatar"
                  />
                  <input
                    type="file"
                    onChange={handleUpdateAvatar}
                    accept="image/*"
                  />
                </div>
              </div>
            )}
            {/* modal upload ảnh bìa */}
            {showModalUpBgr && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Cập nhật ảnh bìa</h1>
                    <button
                      className="text-red-500"
                      onClick={() => handleCloseModalUpBgr()}
                      disabled={loadingButtonBgr}
                    >
                      {loadingButtonBgr ? "Loading..." : "Close"}{" "}
                      {/* Điều chỉnh nội dung của nút */}
                    </button>
                  </div>
                  <img
                    src={background}
                    className="mt-4 object-cover h-40 w-full rounded-lg"
                    alt="Avatar"
                  />
                  <input
                    type="file"
                    onChange={handleUpdateBackground}
                    accept="image/*"
                  />
                </div>
              </div>
            )}

            <div
              className={`border ${
                isUpdateEmail
                  ? isVerifyOTP
                    ? "border-green-500"
                    : "border-yellow-400"
                  : ""
              } relative flex flex-col w-full bg-white outline-none focus:outline-none`}
            >
              {isUpdateEmail && !isVerifyOTP && (
                <form className="bg-white px-10 pt-4 pb-5 mb-4">
                  <h1 className="text-xl font-semibold text-center">
                    {language == "vi" ? "Xác nhận email" : "Confirm your email"}
                  </h1>
                  <p className="text-gray-500 text-sm text-center">
                    {language == "vi"
                      ? "Chúng tôi sẽ gửi mã xác nhận đến email của bạn"
                      : "We will send a confirmation code to your email"}
                  </p>

                  {isSendOTP && (
                    <p
                      className="text-center text-primary italic hover:underline mt-1"
                      onClick={() => {
                        setOtp("");
                        handleGetOTP();
                      }}
                    >
                      {language == "vi" ? "Gửi lại mã xác nhận" : "Resend OTP"}
                    </p>
                  )}

                  <div className="mb-6 flex items-center border-b">
                    <div className="flex items-center justify-center p-4 mt-3 text-base font-semibold  overflow-hidden">
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
                    {isSendOTP ? (
                      <button
                        className="bg-primary hover:bg-primaryHover text-white 
                    rounded focus:outline-none focus:shadow-outline block w-full disabled:opacity-50 py-3"
                        type="button"
                        disabled={otp.length !== 6}
                        onClick={handleVerifyOTP}
                      >
                        {loading ? (
                          <span className="loading loading-spinner"></span>
                        ) : language == "vi" ? (
                          "Xác Nhận"
                        ) : (
                          "Confirm"
                        )}
                      </button>
                    ) : (
                      <button
                        className="bg-primary hover:bg-primaryHover text-white 
                    rounded focus:outline-none focus:shadow-outline block w-full disabled:opacity-50 py-3"
                        type="button"
                        onClick={handleGetOTP}
                      >
                        {loading ? (
                          <span className="loading loading-spinner"></span>
                        ) : language == "vi" ? (
                          "Lấy mã xác nhận"
                        ) : (
                          "Get OTP"
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}
              {isUpdateEmail && isVerifyOTP && (
                <div className="bg-white shadow-lg rounded px-10 pt-4 pb-5 mb-4">
                  <h1 className="text-xl font-semibold text-center">
                    {language == "vi" ? "Xác nhận email" : "Confirm your email"}
                  </h1>
                  <p className="text-green-500 text-sm text-center">
                    {language == "vi"
                      ? "Email đã được xác nhận"
                      : "Email has been confirmed"}
                  </p>
                </div>
              )}
            </div>

            {/*footer*/}
            <div className="py-1 px-3 border-t border-solid border-blueGray-200 rounded-b">
              {showUpdate ? (
                <div className="flex items-center justify-end">
                  <button
                    className="my-2 mr-3 font-semibold text-xl  px-3 py-2 rounded bg-gray-200 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleCancel}
                  >
                    {language === "vi" ? "Hủy" : "Cancel"}
                  </button>
                  <button
                    className={`my-2 font-semibold text-xl text-white px-3 py-2 rounded bg-[#0068ff] disabled:opacity-50 ease-linear transition-all duration-150`}
                    type="button"
                    onClick={handleUpdate}
                    disabled={!isValidate}
                  >
                    {loading ? (
                      <span className="loading loading-spinner "></span>
                    ) : language === "vi" ? (
                      "Cập nhật"
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              ) : (
                <button
                  className=" w-full my-2 font-semibold text-xl py-2 hover:rounded hover:bg-gray-200 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => setShowUpdate(true)}
                >
                  <CiEdit className="inline-block mr-2" size={18} />
                  {language === "vi" ? "Cập nhật" : "Update"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  ) : (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/5 h-[60%] bg-white border rounded-lg shadow-lg ">
      <div className="absolute left-0 top-0 h-full w-5/12  border-r bg-wihite overflow-auto">
        <div className="flex p-2 items-center h-20 ">
          <p className="text-xl font-semibold">Cài đặt</p>
        </div>

        <div
          className="flex items-center justify-start h-12 hover:bg-sky-100"
          onClick={(e) => {
            toggleModalSecurity();
          }}
        >
          <HiMiniLockClosed size={20} className="mr-5 ml-5" />
          <p className="text-base font-semibold">Riêng tư và bảo mật</p>
        </div>
      </div>
      <div className="absolute right-0 top-0 h-full w-7/12 overflow-auto">
        <div className="flex p-2 justify-end h-15" onClick={showModal}>
          <button className="text-2xl mr-3">x</button>
        </div>

        {isOpenSecurity && (
          <div className="p-2">
            <p className="text-base font-semibold">Mật khẩu đăng nhập</p>
            <button
              className="rounded mt-5 bg-gray-200 p-2 font-semibold text-black hover:bg-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setShowChangePassword(true);
              }}
            >
              Đổi mật khẩu
            </button>
            {showChangePassword && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-[90%] bg-white rounded-lg shadow-lg ">
                <div className="p-4 text-xl font-semibold text-black border-b">
                  <p>Tạo mật khẩu mới</p>
                </div>
                <div className="p-4 ">
                  <p className="text-sm">
                    {language === "vi"
                      ? "Lưu ý: Mật khẩu bao gồm chữ kèm theo số hoặc ký tự đặc biệt, tối thiểu 8 ký tự trở lên & tối đa 32 ký tự."
                      : "Note: Password includes letters with numbers or special characters, minimum 8 characters & maximum 32 characters."}
                  </p>
                  <p className="mt-2 pb-2">Mật khẩu hiện tại</p>
                  <div className="flex justify-between p-2 border rounded border-sky-500 ">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu hiện tại"
                      value={passwordCurrent}
                      onChange={(e) => setPasswordCurrent(e.target.value)}
                      className="w-full rounded focus:outline-none "
                    />
                    <div onClick={togglePasswordVisibility}>
                      <p className="text-sky-500 font-semibold">
                        {!showPassword ? "Hiện" : "Ẩn"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 border-t pt-2 pb-2">Mật khẩu mới</p>
                  <div className="flex justify-between p-2 border rounded border-sky-300 ">
                    <input
                      type={showPasswordNew ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      value={passwordNew}
                      onChange={(e) => setPasswordNew(e.target.value)}
                      className="w-full rounded focus:outline-none "
                    />
                    <div onClick={togglePasswordNew}>
                      <p className="text-sky-500 font-semibold">
                        {!showPasswordNew ? "Hiện" : "Ẩn"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 border-t pt-2 pb-2">
                    Nhập lại mật khẩu mới
                  </p>
                  <div className="flex justify-between p-2 border rounded border-sky-300 ">
                    <input
                      type={showPasswordReNew ? "text" : "password"}
                      placeholder="Nhập mật khẩu hiện tại"
                      value={passwordReNew}
                      onChange={(e) => setPasswordReNew(e.target.value)}
                      className="w-full rounded focus:outline-none "
                    />
                    <div onClick={togglePasswordReNew}>
                      <p className="text-sky-500 font-semibold">
                        {!showPasswordNew ? "Hiện" : "Ẩn"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      className="flex items-center justify-center text-lg font-semibold p-2 pl-3 pr-3 mr-5 bg-gray-200 rounded-lg hover:bg-gray-400"
                      onClick={() => setShowChangePassword(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className="flex items-center justify-center text-lg font-semibold p-2 pl-3 pr-3  bg-primary rounded-lg hover:bg-blue-500 text-white"
                      onClick={handleChangePassword}
                    >
                      Cập nhật
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-2 border-t">
              <p className="text-base font-semibold mt-2">Khóa màn hình Zalo</p>
              <p className="text-sm text-gray-300  mt-2">
                Khóa màn hình Zalo của bạn bằng Ctrl + L, khi bạn không sử dụng
                máy tính.
              </p>
              <button className="rounded mt-5 bg-sky-100 p-2 font-semibold text-sky-600 hover:bg-sky-200" onClick={showNoti}>
                Tạo mã khóa màn hình
              </button>
            </div>

            <div className="mt-2 border-t">
              <p className="text-base font-semibold mt-2">Bảo mật 2 lớp</p>
              <div className="flex justify-around">
                <p className="text-sm text-gray-300  mt-2">
                  Sau khi bật, bạn sẽ được yêu cầu nhập mã OTP hoặc xác thực từ
                  thiết bị di động sau khi đăng nhập trên thiết bị lạ.
                </p>
                <div className="form-control" onClick={showNoti}>
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalComponent;
