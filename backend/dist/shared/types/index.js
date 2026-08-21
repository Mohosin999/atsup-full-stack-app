export const DEFAULT_ANALYSIS_CONFIG = {
    weights: {
        keywordMatching: 30,
        skillsMatch: 30,
        sectionCompleteness: 30,
        experienceRelevance: 10,
    },
    thresholds: {
        excellent: 80,
        good: 60,
        fair: 40,
    },
    minWordCount: {
        summary: 30,
        experience: 50,
    },
};
