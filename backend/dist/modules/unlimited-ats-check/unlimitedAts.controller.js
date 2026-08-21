import fs from "fs";
import { prisma } from "../../lib/prisma";
import { runUnlimitedAtsCheck } from "./unlimitedAts.service";
export const analyzeUnlimitedAts = async (req, res) => {
    let filePath;
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume PDF file is required",
            });
        }
        filePath = req.file.path;
        const jobDescription = (req.body.jobDescription || req.body.description || "").trim();
        if (!jobDescription || jobDescription.length < 20) {
            return res.status(400).json({
                success: false,
                message: "Job description is too short. Please provide a detailed job description.",
            });
        }
        const result = await runUnlimitedAtsCheck(filePath, req.file.mimetype, jobDescription);
        const resumeName = (req.body.resumeName ||
            req.file.originalname ||
            "Untitled Resume").trim();
        const score = result.score;
        const saved = await prisma.atsScoreHistory.create({
            data: {
                userId: req.user.id,
                title: resumeName,
                resumeName,
                overallScore: score.overallScore,
                sectionScores: {
                    ...score.sectionScores,
                    ...(score.matchBreakdown
                        ? { matchBreakdown: score.matchBreakdown }
                        : {}),
                    categories: score.categories,
                },
                atsFriendliness: score.atsFriendliness,
                suggestions: score.suggestions,
                resumeContent: result.resumeContent,
            },
        });
        res.status(200).json({
            success: true,
            data: {
                ...result,
                history: saved,
            },
        });
    }
    catch (error) {
        console.error("Unlimited ATS check error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to analyze resume",
        });
    }
    finally {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};
