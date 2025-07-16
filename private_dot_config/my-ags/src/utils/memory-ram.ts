import GTop from "gi://GTop";

const mem = new GTop.glibtop_mem();

export function getMemoryUsage() {
  GTop.glibtop_get_mem(mem);

  const total = mem.total;
  const available = mem.free + mem.buffer + mem.cached;
  const used = total - available;
  const percentUsed = used / total;

  return {
    totalKB: total,
    availableKB: available,
    usedKB: used,
    percentUsed: percentUsed.toFixed(2),
  };
}
