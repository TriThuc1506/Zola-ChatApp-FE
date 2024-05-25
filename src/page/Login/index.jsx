import { useState } from "react";
import { Outlet } from "react-router-dom";

const Login = () => {
  const [langue, setLangue] = useState("vi"); // [vi, en]
  const [emailForgot, setEmailForgot] = useState("");

  
  return (
    <div className="w-screen h-screen bg-[url('/bg-login.svg')] bg-cover bg-center font-roboto">
      <div className="pt-10">
        <h1 className="text-[#0068ff] text-center font-semibold text-[3.5rem]">
          ZolaFake
        </h1>
        <p className="text-xl leading-8 text-center whitespace-pre mb-3 text-gray-700">
          {langue == "vi"
            ? "Đăng nhập tài khoản Zola \n để kết nối với ứng dụng Zola Web"
            : "Sign in to Zola Fake account \n to connect to Zola Web Fake"}
        </p>
      </div>
      <div className="flex justify-center items-center">
        <Outlet context={{langue, setEmailForgot, emailForgot}}/>
        
      </div>
      <div className="flex justify-center mt-20 mb-40 text-sm">
        <button
          className={
            langue === "vi"
              ? "text-blue-500 hover:text-blue-400 mr-3 font-semibold "
              : "text-blue-500 hover:text-blue-400 mr-3"
          }
          onClick={() => setLangue("vi")}
        >
          Tiếng Việt
        </button>
        <button
          className={
            langue === "en"
              ? "text-blue-500 hover:text-blue-400 font-semibold "
              : "text-blue-500 hover:text-blue-400"
          }
          onClick={() => setLangue("en")}
        >
          English
        </button>
      </div>
    </div>
  );
}

export default Login;
