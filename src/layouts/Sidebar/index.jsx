import React, { useEffect, useState } from "react";

import { BsChatText, BsChatTextFill } from "react-icons/bs";
import { RiContactsBookLine, RiContactsBookFill } from "react-icons/ri";
import { FaCheckSquare } from "react-icons/fa";
import { FaRegSquareCheck } from "react-icons/fa6";
import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import { CiCloudOn } from "react-icons/ci";

function Sidebar({ changeTab, changeMenu, useInfo }) {
  const [tabSelected, setTabSelected] = useState();
  const [settingClick, setSettingClick] = useState(false);
  const [user, setUser] = useState(useInfo || {});
  const [avtUrl, setAvtUrl] = useState("/zalo.svg");

  useEffect(() => {
    setUser(useInfo);
  }, [useInfo]);

  useEffect(() => {
    if (user.profile) {
      setAvtUrl(user.profile?.avatar?.url || "/zalo.svg");
    }
  }, [user]);

  return (
    <div className="bg-[#0091ff] h-full flex flex-col items-center justify-between">
      <div>
        <div
          className="h-20 w-[75px] flex justify-center items-center mt-5"
          onClick={() => changeMenu(1)}
        >
          <img src={avtUrl} alt="avatar" className="w-14 h-14 rounded-full" />
        </div>
        <div>
          {[1, 2].map((tab) => (
            <div
              key={tab}
              className={`h-20 w-[75px] flex justify-center items-center hover:bg-[#006edc] ${
                tabSelected === tab ? "bg-[#006edc]" : ""
              }`}
              onClick={() => {
                setTabSelected(tab);
                changeTab(tab);
                setSettingClick(false);
                changeMenu();
              }}
            >
              {tabSelected === tab ? (
                tab === 1 ? (
                  <BsChatTextFill size={28} color="#ffffff" />
                ) : tab === 2 ? (
                  <RiContactsBookFill size={28} color="#ffffff" />
                ) : (
                  <></>
                )
              ) : tab === 1 ? (
                <BsChatText size={28} color="#ffffff" />
              ) : tab === 2 ? (
                <RiContactsBookLine size={28} color="#ffffff" />
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        
        <div
          className={`h-20 w-[75px] flex justify-center items-center hover:bg-[#006edc] ${
            settingClick ? "bg-[#006edc]" : ""
          }`}
          onClick={() => {
            setSettingClick(!settingClick);
            changeMenu(2);
          }}
        >
          {settingClick ? (
            <IoSettingsSharp size={28} color="#ffffff" />
          ) : (
            <IoSettingsOutline size={28} color="#ffffff" />
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
