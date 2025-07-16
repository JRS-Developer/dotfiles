import { createPoll } from "ags/time";
import GLib from "gi://GLib";

export const useFormattedTime = (format: "time" | "time-with-pm") => {
  const timeString = createPoll("", 500, () => {
    let now = GLib.DateTime.new_now_local();
    const formatToUse = format === "time" ? "%I:%M" : "%I:%M %p";
    return now.format(formatToUse) ?? "";
  });

  return timeString;
};
