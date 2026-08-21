let adminNamespace = null;
export const setAdminNamespace = (ns) => {
    adminNamespace = ns;
};
export const notifyAdminSupport = (payload) => {
    adminNamespace?.emit("support", payload);
};
