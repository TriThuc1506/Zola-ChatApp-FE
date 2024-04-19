import { CiSearch } from "react-icons/ci";
import { AiOutlineUsergroupAdd, AiOutlineUserAdd } from "react-icons/ai";
import { RiContactsLine } from "react-icons/ri";
import { RiGroupLine } from "react-icons/ri";
import { LuMailOpen } from "react-icons/lu";

import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { faker } from "@faker-js/faker/locale/af_ZA";

function ContactMenu({ language, changeTab, isAddFriend, isAddGroup, friends }) {
  const [tabSelected, setTabSelected] = useState(0);
  const [valueSearch, setValueSearch] = useState("");
  const [friendList, setFriendList] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [originalFriendList, setOriginalFriendList] = useState([]);
  useEffect(() => {
    setOriginalFriendList(friends);
    setFriendList(friends);
  }, [friends]);

  //Lọc dữ liệu tên bạn bè
  const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setValueSearch(searchTerm);

    if (searchTerm.trim() === "") {
      setFriendList(originalFriendList);
    } else {
      const filteredFriends = originalFriendList.filter((friend) =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFriendList(filteredFriends);
    }
  };

  

  return (
    <>
      <div className="border-r h-[10%]">
        <div className="bg-white flex justify-between items-center h-[90%]">
          <div className="bg-gray-200 rounded-lg ml-5 w-8/12">
            <div
              className={`${
                isInputFocused === true
                  ? "flex items-center justify-center px-3 border border-blue-500 bg-white rounded-lg"
                  : "flex items-center justify-center px-3 "
              }`}
            >
              <CiSearch size={20} />
              <input
                type="text"
                className="h-9 w-full bg-transparent outline-none px-3"
                placeholder="Search"
                value={valueSearch}
                onChange={handleInputChange}
                onFocus={() => setIsInputFocused(true)}
              />
            </div>
          </div>
          <div className="px-3 w-1/4 flex items-center justify-around">
            {isInputFocused ? (
              <button onClick={() => setIsInputFocused(false)}>Đóng</button>
            ) : (
              <>
                <button
                  className="p-2 rounded-lg hover:bg-gray-300"
                  onClick={() => isAddFriend(true)}
                >
                  <AiOutlineUserAdd size={18} opacity={0.8} />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-gray-300"
                  onClick={() => isAddGroup(true)}
                >
                  <AiOutlineUsergroupAdd size={20} opacity={0.8} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex h-[10%] items-center px-5 mt-1 pb-2 text-sm">
          {isInputFocused ? (
            <div>
              <p className="font-semibold">Tìm gần đây</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      <div className="h-[90%] bg-white border">
        {isInputFocused ? (
          <>
            {friendList.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between hover:bg-gray-200 transition-colors duration-300 ease-in-out p-2"
                
                onClick={() => {
                  userChat(friend);
                  setListChatCurrent((prev) => {
                    const newList = [...prev];
                    const index = newList.findIndex(
                      (item) => item.id === friend.id
                    );
                    if (index !== -1) {
                      newList.splice(index, 1);
                    }
                    newList.unshift(friend);
                    return newList;
                  });
                  setIsInputFocused(false);
                  setIsChatSelected(friend.id);
                }}
              >
                <div className="bg-blue w-14 ">
                  <img
                    className="rounded-full"
                    src={friend.avatar}
                    alt="cloud"
                  />
                </div>
                <div className="flex mr-auto ml-2 p-1">
                  <p className="font-semibold ">{friend.name}</p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="h-full w-full">
            <div
              className={[
                "flex items-center text-xl font-semibold py-5 ",
                tabSelected == 0 ? " bg-[#e5efff] " : " hover:bg-gray-100 ",
              ]}
              onClick={() => {
                setTabSelected(0);
                changeTab(0);
              }}
            >
              <RiContactsLine size={18} className="mx-5" />
              <p className="text-xl">
                {language == "vi" ? "Danh sách bạn bè" : "Friend list"}
              </p>
            </div>
            <div
              className={[
                "flex items-center text-xl font-semibold py-5 ",
                tabSelected == 1 ? " bg-[#e5efff] " : " hover:bg-gray-100 ",
              ]}
              onClick={() => {
                setTabSelected(1);
                changeTab(1);
              }}
            >
              <RiGroupLine size={18} className="mx-5" />
              <p className="text-xl">
                {language == "vi" ? "Danh sách nhóm" : "Joined groups"}
              </p>
            </div>
            <div
              className={[
                "flex items-center text-xl font-semibold py-5 ",
                tabSelected == 2 ? " bg-[#e5efff] " : " hover:bg-gray-100 ",
              ]}
              onClick={() => {
                setTabSelected(2);
                changeTab(2);
              }}
            >
              <LuMailOpen size={18} className="mx-5" />
              <p className="text-xl">
                {language == "vi" ? "Lời mời kết bạn" : "Friend requests"}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ContactMenu;
