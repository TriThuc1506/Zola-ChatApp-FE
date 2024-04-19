import Sidebar from "../../layouts/Sidebar";
import { useEffect, useState } from "react";
import MenuComponent from "../../layouts/Menu";
import ModalComponent from "../../layouts/Modal/index";
import ContactComponent from "../../components/ContactComponents/ContactComponent";
import ChatComponents from "../../components/ChatComponents/ChatComponent";
import { useAuthContext } from "../../contexts/AuthContext";

function MainLayout() {
  const [showModal, setShowModal] = useState(false);
  const [typeModal, setTypeModal] = useState("");
  const [curentTab, setCurentTab] = useState(1);
  const [currentMenu, setCurrentMenu] = useState();
  const [userInfo, setUserInfo] = useState({});
  const [language, setLanguage] = useState("vi");
  const { authUser } = useAuthContext();

  const showModalProfile = () => {
    setShowModal(!showModal);

    setCurrentMenu();
  };

  const changeTab = (tab) => {
    setCurentTab(tab);
  };

  const changeMenu = (menu) => {
    if (currentMenu == menu) {
      setCurrentMenu();
    } else {
      setCurrentMenu(menu);
    }
  };
  const changeTypeModal = (type) => {
    setTypeModal(type);
  };

  useEffect(() => {
    setUserInfo(authUser);
  }, [authUser]);

  return (
    <>
      <div className="w-screen h-screen flex">
        <div className="h-screen">
          <Sidebar
            curentTab={curentTab}
            changeTab={changeTab}
            changeMenu={changeMenu}
            useInfo={userInfo}
          />
        </div>
        <div className="h-screen w-full relative">
          {curentTab == 1 ? (
            <>
              <ChatComponents language={language} />

              {currentMenu == 1 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"profile"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : currentMenu == 2 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"setting"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : (
                <> </>
              )}
            </>
          ) : curentTab == 2 ? (
            <>
              <ContactComponent language={language} />
              {currentMenu == 1 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"profile"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : currentMenu == 2 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"setting"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : (
                <> </>
              )}
            </>
          ) : curentTab == 3 ? (
            <>
              {currentMenu == 1 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"profile"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : currentMenu == 2 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"setting"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : (
                <> </>
              )}
            </>
          ) : curentTab == 4 ? (
            <>
              {currentMenu == 1 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"profile"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : currentMenu == 2 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"setting"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : (
                <> </>
              )}
            </>
          ) : (
            <>
              {currentMenu == 1 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"profile"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : currentMenu == 2 ? (
                <MenuComponent
                  language={language}
                  setLanguage={setLanguage}
                  typeMenu={"setting"}
                  showModal={showModalProfile}
                  typeModal={changeTypeModal}
                />
              ) : (
                <> </>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <>
          {typeModal == "profile" ? (
            <ModalComponent
              typeModal={typeModal}
              showModal={showModalProfile}
              language={language}
              userInfo={userInfo}
            />
          ) : typeModal == "setting" ? (
            <ModalComponent
              typeModal={typeModal}
              showModal={showModalProfile}
              language={language}
              userInfo={userInfo}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
}

export default MainLayout;
