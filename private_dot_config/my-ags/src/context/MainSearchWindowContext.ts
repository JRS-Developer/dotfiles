import { Accessor, createContext, Setter } from "ags";

export const MainSearchWindowContext = createContext<{
  visible: Accessor<boolean> | undefined;
  setVisible: Setter<boolean> | undefined;
}>({ setVisible: undefined, visible: undefined });
