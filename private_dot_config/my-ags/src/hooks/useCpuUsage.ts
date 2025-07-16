import { createState } from "ags";
import { calculateCpuLoad, getCpuUsage } from "../utils/cpu";
import { createPoll } from "ags/time";

export const useCpuUsage = () => {
  const [prev, setPrev] = createState(getCpuUsage());

  const data = createPoll(
    {
      cpuUsage: 0,
      cpuUsageInFraction: 0,
    },
    1000,
    () => {
      const curr = getCpuUsage();
      const load = calculateCpuLoad(prev.get(), curr);

      if (!load) return { cpuUsage: 0, cpuUsageInFraction: 0 };

      setPrev(curr);

      const cpuUsage = Number(load) * 100;
      return {
        cpuUsage,
        cpuUsageInFraction: cpuUsage / 100,
      };
    },
  );

  return data;
};
