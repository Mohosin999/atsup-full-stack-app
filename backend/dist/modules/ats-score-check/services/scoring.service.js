import { calculateLocalMatchScore } from "../../../shared/scoring";
export const calculateAtsScore = (resume, structuredJD) => {
    return calculateLocalMatchScore(resume, structuredJD);
};
