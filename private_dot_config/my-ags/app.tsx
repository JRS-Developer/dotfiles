import app from "ags/gtk4/app";
import style from "./style.scss";
import Bar from "./src/widget/Bar";
import MainSearchWindow from "./src/widget/MainSearch/MainSearchWindow";
import { MainSearchWindowContext } from "./src/context/MainSearchWindowContext";
import { createState } from "ags";
import { windowNames } from "./src/constants/windows";
import { getKeyboard } from "./src/utils/keyboard";
// import NotificationWindow from "./src/widget/Notifications/NotificationWindow";

const [isVisibleMainSearch, setIsVisibleMainSearch] = createState(false);
const [keyboard, setKeyboard] = createState(getKeyboard());

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
    app.get_monitors().map((monitor, i) => {
      return (
        <MainSearchWindowContext
          value={{
            visible: isVisibleMainSearch,
            setVisible: setIsVisibleMainSearch,
          }}
        >
          {() => {
            return (
              <>
                <Bar
                  gdkmonitor={monitor}
                  index={i}
                  keyboard={keyboard}
                  setKeyboard={setKeyboard}
                />
                <MainSearchWindow gdkmonitor={monitor} />
                {/* <NotificationWindow gdkmonitor={monitor} /> */}
              </>
            );
          }}
        </MainSearchWindowContext>
      );
    });
    // NotificationWindow causes a high cpu usge of 8% (the normal is 0.3%) when swaync is running
    // so it's better to have this component done (and working perfectly) before replacing swaync
    // (it has issues with receiving notifications, new notifications are not always added, the docs have an example so I might see that)
    // app.get_monitors().map(NotificationWindow);
  },
});
