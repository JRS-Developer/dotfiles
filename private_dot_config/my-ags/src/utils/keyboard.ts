import { exec } from "ags/process";

export const getKeyboard = () => {
  return exec([
    "bash",
    "-c",
    "hyprctl devices -j | jq -r '.keyboards[] | select(.main == true) | .active_keymap'",
  ]);
};

export const formatKeyboard = (keyboard: string) => {
  if (keyboard === "Spanish" || keyboard === "Español") {
    return "ES";
  } else if (keyboard?.includes("English")) {
    return "US";
  }

  return keyboard;
};
