import { MdPhoneIphone } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";

import { useState, useEffect } from "react";
import { Link, useOutletContext, useLocation } from "react-router-dom";
import useLogin from "../../../hooks/useLogin";

function LoginForm() {
  const location = useLocation();
  const emailForgot = location.state?.email;
  const passwordForgot = location.state?.password;
  const emailFromChangePassword = location.state?.emailFromChangePassword;

  const newEmail = location.state?.newEmail;
  const newPassword = location.state?.newPassword;

  const [phone, setPhone] = useState(
    emailForgot || newEmail || emailFromChangePassword || ""
  );
  const [password, setPassword] = useState(passwordForgot || newPassword || "");
  const [showPass, setShowPass] = useState(false);
  const { langue, setEmailForgot } = useOutletContext();
  const [code, setCode] = useState("+84");
  const [phoneId, setPhoneId] = useState([]);

  const { loading, login } = useLogin();

  // useEffect(() => {
  //   const getPhoneId = async () => {
  //     const res = await fetch("https://restcountries.com/v3.1/all");
  //     const data = await res.json();
  //     data.forEach((item) => {
  //       if (item.cca2) {
  //         setPhoneId((phoneId) => [
  //           ...phoneId.filter((phone) => phone.id !== item.cca2),
  //           {
  //             id: item.cca2,
  //             name: item.name.common,
  //             flag: item.flags.png,
  //             phone: item.idd.root + item.idd.suffixes?.[0],
  //           },
  //         ]);
  //       }
  //     });
  //   };
  //   getPhoneId();
  // }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (phone.length === 0 || password.length < 6) {
      return;
    }
    await login(phone, password);
  };

  const selectedCode = (item) => {
    document.querySelector(".dropdown").removeAttribute("open");
    setCode(item.phone);
  };
  return (
    <>
      <div className="w-[400px] text-sm h-full">
        <div className="w-full p-1 bg-white flex justify-around">
          <p className="text-center text-sm font-bold uppercase py-3 mb-[-5px] border-b border-black">
            {langue == "vi"
              ? "Đăng nhập với số điện thoại hoặc email"
              : "Login with phone number or email"}
          </p>
        </div>
        <hr />
        <form className="bg-white shadow-lg rounded px-10 pt-4 pb-5 mb-4">
          <div className="my-6 flex items-center border-b-2">
            <span>
              <MdPhoneIphone size={16} color="#555555" />
            </span>
            <details className="dropdown mx-3">
              <summary
                tabIndex={0}
                role="button"
                className="flex items-center justify-between"
              >
                {code}
                <IoMdArrowDropdown size={16} color="#555555" className="ml-3" />
              </summary>
              <ul
                tabIndex={0}
                className="dropdown-content z-50 absolute left-0 mt-2 py-1 w-72 bg-white border border-gray-200 rounded-md overflow-y-auto max-h-96"
              >
                {phoneId
                  //sort by name country alphabet
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer w-full my-2 z-50"
                      key={item.id}
                      onClick={() => selectedCode(item)}
                    >
                      <img
                        src={item.flag}
                        alt={item.name}
                        className="w-6 h-4 mr-2 inline-block"
                      />
                      <span>{item.name}</span>
                      <span className="text-gray-400 text-sm">
                        {item.phone}
                      </span>
                    </li>
                  ))}
              </ul>
            </details>

            <input
              className="rounded w-full py-1 px-3 border-none
                text-gray-700 focus:outline-none focus:shadow-outline"
              id="phone"
              type="text"
              placeholder={
                langue == "vi"
                  ? "Số điện thoại hoặc email"
                  : "Phone number or email"
              }
              value={phone}
              onChange={(e) => {
                // setPhone(e.target.value.replace(/\D/g, ""));
                setPhone(e.target.value);
                setEmailForgot(e.target.value);
              }}
            />
          </div>
          <div className="my-6 flex items-center border-b-2">
            <span>
              <FaLock size={16} color="#555555" />
            </span>

            <input
              className="ml-3 rounded w-full py-1 px-3 border-none
                  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type={showPass ? "text" : "password"}
              placeholder={langue == "vi" ? "Mật khẩu" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <p className="text-red-500 text-xs italic hidden">
            {langue == "vi" ? "Sai Mật khẩu." : "Wrong password."}
          </p>
          <div>
            <button
              className="bg-primary hover:bg-primaryHover text-white 
                    rounded focus:outline-none focus:shadow-outline block w-full disabled:opacity-50 py-3"
              type="button"
              disabled={phone.length === 0 || password.length < 6}
              onClick={handleLogin}
            >
              {loading ? (
                <span className="loading loading-spinner "></span>
              ) : langue == "vi" ? (
                "Đăng nhập bằng mật khẩu"
              ) : (
                "Login with password"
              )}
            </button>

            <Link
              className="hover:border-[#0068ff] border text-[#0190f3] rounded block w-full my-3 py-3 disabled:opacity-70 text-center"
              to="register"
            >
              {langue == "vi" ? "Đăng ký" : "Register"}
            </Link>
            <Link
              className="block hover:underline hover:text-blue-400 text-center text-gray-700"
              to={"/login/forgot"}
            >
              {langue == "vi" ? "Quên mật khẩu?" : "Forgot password?"}
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default LoginForm;
