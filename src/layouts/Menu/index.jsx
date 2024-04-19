import React, { useState } from "react";

import { CiUser, CiCircleInfo } from "react-icons/ci";
import { IoSettingsOutline} from "react-icons/io5";
import { GrLanguage } from "react-icons/gr";
import { IoIosArrowForward } from "react-icons/io";
import useLogout from "../../hooks/useLogout";
import config from "../../api/config";

function MenuComponent({ language, setLanguage, typeMenu, showModal, typeModal }) {
  const [tabSelected, setTabSelected] = useState("");
  const logout = useLogout();
  const user = JSON.parse(localStorage.getItem("authUser"));
  const [isOpenSetup, setIsOpenSetup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [passwordNew, setPasswordNew] = useState("");
  const [showPasswordNew, setShowPasswordNew] = useState(false);

  const [passwordReNew, setPasswordReNew] = useState("");
  const [showPasswordReNew, setShowPasswordReNew] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordNew = () => {
    setShowPasswordNew(!showPasswordNew);
  };

  const togglePasswordReNew = () => {
    setShowPasswordReNew(!showPasswordReNew);
  };

  const toggleModalProfile = () => {
    // setIsOpenSetup(!isOpenSetup);
    typeModal("profile");
    showModal();
  };

  const toggleModalSetting = () => {
    // setIsSecurity(!isOpenSecurity);
    typeModal("setting");
    showModal();
  };

  const handleLogout = async () => {
    await logout();
  };


  return typeMenu == "setting" ? (
    <>
      <div className="w-[225px] bg-white rounded-sm shadow-xl absolute bottom-[85px] -left-16 z-40 grid grid-rows-5">
        <div className="row-span-2">
          <div
            className="px-3 py-2  w-full flex items-center hover:bg-gray-200"
            onClick={toggleModalProfile}
          >
            <CiUser size={20} color="#555555" />
            <p className="text-sm ml-6">
              {language == "vi" ? "Thông tin tài khoản" : "Account infomation"}
            </p>
          </div>
          <div className="p-3 w-full flex items-center hover:bg-gray-200" onClick={toggleModalSetting}>
            <IoSettingsOutline size={18} color="#555555" />
            <p className="text-sm ml-6">
              {language == "vi" ? "Cài đặt" : "Setting"}
            </p>
          </div>
          <hr />
        </div>

        <div className="row-span-2">
          
          <div
            className="px-3 py-[10px]  w-full flex items-center hover:bg-gray-200 justify-between relative"
            onClick={() => {
              setTabSelected(tabSelected == "lang" ? "" : "lang");
            }}
          >
            <GrLanguage size={18} color="#555555" />
            <p className="text-sm w-full ml-8">
              {language == "vi" ? "Ngôn ngữ" : "Language"}
            </p>
            <IoIosArrowForward size={16} color="#555555" />

            <div
              className={
                tabSelected == "lang"
                  ? "z-50 bg-white rounded-sm shadow w-44 absolute -top-12 -right-48 mt-12 mr-4 "
                  : "z-50 bg-white rounded-sm shadow w-44 absolute -top-12 -right-48 mt-12 mr-4 hidden"
              }
            >
              <ul className="py-2 text-sm text-gray-700">
                <li>
                  <p
                    className="block px-4 py-2 hover:bg-gray-200"
                    onClick={() => setLanguage("vi")}
                  >
                    {language == "vi" ? "Tiếng Việt" : "Vietnamese"}
                  </p>
                </li>
                <li>
                  <p
                    className="block px-4 py-2 hover:bg-gray-200"
                    onClick={() => setLanguage("en")}
                  >
                    {language == "vi" ? "Tiếng Anh" : "English"}
                  </p>
                </li>
              </ul>
            </div>
          </div>
          <div
            className="px-3 py-[10px]  w-full flex items-center hover:bg-gray-200 justify-between relative"
            onClick={() => {
              setTabSelected(tabSelected == "about" ? "" : "about");
            }}
          >
            <CiCircleInfo size={22} color="#555555" />
            <p className="text-sm w-full ml-8">
              {language == "vi" ? "Giới thiệu" : "About"}
            </p>
            <IoIosArrowForward size={16} color="#555555" />

            <div
              className={
                tabSelected == "about"
                  ? "z-50 bg-white rounded-sm shadow w-44 absolute -top-12 -right-48 mt-12 mr-4 "
                  : "z-50 bg-white rounded-sm shadow w-44 absolute -top-12 -right-48 mt-12 mr-4 hidden"
              }
            >
              <ul className="py-2 text-sm text-gray-700">
                <li>
                  <a className="block px-4 py-2 hover:bg-gray-200" href={config.baseURL + "/terms_of_service"} target="_blank">
                    {language == "vi" ? "Điều khoản dịch vụ" : "Terms of service"}
                  </a>
                  
                </li>
              </ul>
            </div>
          </div>
          <hr />
        </div>

        <div className="row-span-1">
          <div
            className="p-2 w-full flex items-center hover:bg-gray-200 "
            onClick={handleLogout}
          >
            <p className="text-sm  ml-12 text-red-500">
              {language == "vi" ? "Đăng xuất" : "Logout"}
            </p>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="h-[170px] w-[300px] bg-white rounded shadow-2xl border absolute top-10 left-0 z-40 grid grid-rows-4">
        <div className="row-span-1">
          <p className="font-bold ml-2 p-3">{user?.profile?.name}</p>
          <hr />
        </div>
        <div className="row-span-2">
          <div
            className="px-3 py-[10px] w-full flex items-center hover:bg-gray-200 justify-between relative"
            onClick={toggleModalProfile}
          >
            <p className="text-sm w-full ml-2">
              {language == "vi" ? "Hồ sơ của bạn" : "Profile"}
            </p>
          </div>
          <div
            className="px-3 py-[10px]  w-full flex items-center hover:bg-gray-200 justify-between relative"
            onClick={toggleModalSetting}
          >
            <p className="text-sm w-full ml-2">
              {language == "vi" ? "Cài đặt" : "Setting"}
            </p>

          </div>
          <hr />
        </div>
        <div className="row-span-1">
          <div
            className="p-2 w-full flex items-center hover:bg-gray-200 "
            onClick={handleLogout}
          >
            <p className="text-sm ml-3">
              {language == "vi" ? "Đăng xuất" : "Logout"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default MenuComponent;