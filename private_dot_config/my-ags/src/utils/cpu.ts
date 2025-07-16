import GTop from "gi://GTop";

const cpu: GTop.glibtop_cpu = new GTop.glibtop_cpu();

export function getCpuUsage() {
  GTop.glibtop_get_cpu(cpu);

  const used =
    cpu.user + cpu.sys + cpu.nice + cpu.irq + cpu.softirq + cpu.iowait;
  const total = used + cpu.idle + cpu.iowait;

  return { used, total };
}

export function calculateCpuLoad(
  prev: ReturnType<typeof getCpuUsage>,
  curr: ReturnType<typeof getCpuUsage>,
) {
  if (!prev || !curr) return null;

  const diffUsed = curr.used - prev.used;
  const diffTotal = curr.total - prev.total;

  const res = diffUsed / diffTotal;

  return res;
}
