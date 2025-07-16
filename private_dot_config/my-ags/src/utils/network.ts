import NM from "gi://NM";

export const getHasVpn = (
  activeConnections: NM.ActiveConnection[] = [],
): boolean => {
  return activeConnections.some((ac) => {
    if (ac.get_vpn()) {
      return true;
    }

    const type = ac.get_connection_type();

    if (["wireguard", "openvpn", "ipsec", "ikev2"].includes(type)) {
      return true;
    }

    return false;
  });
};
