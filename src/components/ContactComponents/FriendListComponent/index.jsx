import React, { useEffect, useState } from "react";
import { RiContactsLine } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";
import { TbArrowsSort } from "react-icons/tb";
import { IoIosMore } from "react-icons/io";
import useFriend from "../../../hooks/useFriend";
import toast from "react-hot-toast";

function FriendListComponent({ language, friends }) {
  const [friendList, setFriendList] = useState([]);
  const [originalFriendList, setOriginalFriendList] = useState([]);
  const [sortDirection, setSortDirection] = useState("asc");
  const { unFriend } = useFriend();

  useEffect(() => {
    setOriginalFriendList(friends);
    setFriendList(friends);
  }, [friends]);

  const searchFriend = (e) => {
    const searchTerm = e.target.value;
    if (searchTerm.trim() === "") {
      setFriendList(originalFriendList);
    } else {
      const filteredFriends = originalFriendList.filter((friend) =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFriendList(filteredFriends);
    }
  };
  const removeFriend = async (friend) => {
    try {
      const rs = await unFriend(friend.phone);
      if (rs) {
        toast.success(
          language == "vi"
            ? `Xóa ${friend.name} khỏi danh sách bạn bè thành công`
            : `Remove ${friend.name} from friend list successfully`
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(
        language == "vi"
          ? `Xóa ${friend.name} khỏi danh sách bạn bè thất bại`
          : `Remove ${friend.name} from friend list failed`
      );
    }
  };
  return (
    <>
      <div className="h-[70px] w-full flex items-center bg-white border-b fixed z-20">
        <RiContactsLine size={20} className="mx-5" />
        <p className="text-xl font-semibold">
          {language == "vi" ? "Danh sách bạn bè" : "Friend list"}
        </p>
      </div>
      <div className="w-full bordered mt-24">
        <div className="h-[calc(100%-70px)] w-full my-6 px-6">
          <p className="font-semibold">
            {language
              ? `Bạn bè (${friendList.length})`
              : `Friends (${friendList.length})`}
          </p>
        </div>

        <div className="bg-white rounded-md mx-3 px-3">
          <div className="my-3 py-3 lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-full flex items-center justify-center px-3 border rounded-lg">
              <CiSearch size={20} />
              <input
                type="text"
                className="h-9 w-full bg-transparent outline-none px-3"
                placeholder="Search"
                onChange={searchFriend}
              />
            </div>
            <div className="lg:w-full flex items-center justify-between mt-5 lg:mt-0 lg:ml-2">
              <div className="mr-2 w-full bg-gray-100 flex items-center justify-center px-3 border rounded dropdown">
                <TbArrowsSort size={20} />
                <select
                  className="h-9 w-full px-3 bg-transparent outline-none"
                  onChange={(e) => setSortDirection(e.target.value)}
                >
                  <option value="asc">
                    {language == "vi" ? "Tên (A - Z )" : "Name (A - Z)"}
                  </option>
                  <option value="desc">
                    {language == "vi" ? "Tên (Z - A )" : "Name (Z - A)"}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="w-full">
            {friendList
              .sort(
                sortDirection == "asc"
                  ? (a, b) => a.name.localeCompare(b.name)
                  : (a, b) => b.name.localeCompare(a.name)
              )
              .map((friend) => (
                <div
                  key={friend.id}
                  className="my-5 flex items-center justify-between px-6 py-5 border-b hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <img
                      src={friend.avatar}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <p className="font-semibold">{friend.name}</p>
                      <p className="text-sm text-gray-500">{friend.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn bg-transparent border-none shadow-none"
                      >
                        <IoIosMore size={20} />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded w-52"
                      >
                        <li className="border-b">
                          <a className="py-3">
                            {language == "vi"
                              ? "Xem thông tin"
                              : "View infomation"}
                          </a>
                        </li>
                        <li>
                          <a className="py-3">
                            {language == "vi" ? "Nhắn Tin" : "Chat"}
                          </a>
                        </li>
                        <li className="border-b">
                          <a className="py-3">
                            {language == "vi"
                              ? "Chặn người dùng"
                              : "Block this user"}
                          </a>
                        </li>
                        <li>
                          <a
                            className="py-3 text-red-500"
                            onClick={() => removeFriend(friend)}
                          >
                            {language == "vi" ? "Xóa Bạn" : "Remove friend"}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default FriendListComponent;
