export const formatResponse = (success, data, message) => {
    return {
        success,
        ...(data && { data }),
        ...(message && { message })
    };
};
export const paginate = (page, limit) => {
    const skip = (page - 1) * limit;
    return { skip, limit };
};
export const experienceText = (exp) => (exp.responsibilities ?? []).join(" ");
export const projectText = (proj) => (proj.description ?? []).join(" ");
