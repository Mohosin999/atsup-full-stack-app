import { Namespace } from "socket.io";

let adminNamespace: Namespace | null = null;

export const setAdminNamespace = (ns: Namespace | null) => {
  adminNamespace = ns;
};

export const notifyAdminSupport = (payload: any) => {
  adminNamespace?.emit("support", payload);
};