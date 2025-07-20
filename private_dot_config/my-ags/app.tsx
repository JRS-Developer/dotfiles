import app from "ags/gtk4/app";
import style from "./style.scss";
import Bar from "./src/widget/Bar";
import MainSearchWindow from "./src/widget/MainSearch/MainSearchWindow";
import { MainSearchWindowContext } from "./src/context/MainSearchWindowContext";
import { createState } from "ags";
import { windowNames } from "./src/constants/windows";
import { getKeyboard } from "./src/utils/keyboard";
import LogoutPanelWindow from "./src/widget/LogoutPanel/LogoutPanelWindow";
import { LogoutPanelWindowContext } from "./src/context/LogoutPanelWindowContext";
import NotificationWindow from "./src/widget/Notifications/NotificationWindow";
import { removeNotificationsFileList } from "./src/utils/notifications";
import { timeout } from "ags/time";
import SideBar from "./src/widget/SideBar";

const [isVisibleMainSearch, setIsVisibleMainSearch] = createState(false);
const [isVisibleLogoutWindow, setIsVisibleLogoutWindow] = createState(false);
const [keyboard, setKeyboard] = createState(getKeyboard());
// we need the timeout to set visible because doing it true by default causes
// the window to ignore the layer BOTTOM
const [visibleBars, setVisibleBars] = createState(false);

timeout(1000, () => {
  setVisibleBars(true);
});

app.start({
  css: style,
  icons: "/home/jose/.config/my-ags/icons",
  requestHandler: (request, res) => {
    if (request === windowNames.MainSearchWindow) {
      setIsVisibleMainSearch(true);
      res(`opened window`);
      return;
    } else if (request === "keyboard-changed") {
      setKeyboard(getKeyboard());
      res("keyboard changed");
      return;
    }

    res("unknown command");
  },
  main() {
    removeNotificationsFileList();

    app.get_monitors().map((monitor, i) => {
      return (
        <MainSearchWindowContext
          value={{
            visible: isVisibleMainSearch,
            setVisible: setIsVisibleMainSearch,
          }}
        >
          {() => (
            <LogoutPanelWindowContext
              value={{
                visible: isVisibleLogoutWindow,
                setVisible: setIsVisibleLogoutWindow,
              }}
            >
              {() => {
                return (
                  <>
                    <SideBar
                      visible={visibleBars}
                      gdkmonitor={monitor}
                      position="left"
                    />

                    <SideBar
                      visible={visibleBars}
                      gdkmonitor={monitor}
                      position="right"
                    />
                    <Bar
                      visible={visibleBars}
                      gdkmonitor={monitor}
                      index={i}
                      keyboard={keyboard}
                      setKeyboard={setKeyboard}
                    />

                    <SideBar
                      visible={visibleBars}
                      gdkmonitor={monitor}
                      position="bottom"
                    />
                    <MainSearchWindow gdkmonitor={monitor} />
                    <LogoutPanelWindow gdkmonitor={monitor} />
                    <NotificationWindow gdkmonitor={monitor} />
                  </>
                );
              }}
            </LogoutPanelWindowContext>
          )}
        </MainSearchWindowContext>
      );
    });
  },
});
