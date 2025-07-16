import { createPoll } from "ags/time";
import { getMemoryUsage } from "../utils/memory-ram";

export const useMemoryRamUsage = () => {
  const data = createPoll(
    {
      memoryUsage: 0,
      memoryUsageInFraction: 0,
    },
    1000,
    () => {
      const load = getMemoryUsage();

      if (!load) return { memoryUsage: 0, memoryUsageInFraction: 0 };

      const used = Number(load.percentUsed) * 100;

      return {
        memoryUsage: used,
        memoryUsageInFraction: used / 100,
      };
    },
  );

  return data;
};
