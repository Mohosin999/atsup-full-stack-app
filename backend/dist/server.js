var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/shared/resume-parser/index.ts
var resume_parser_exports = {};
__export(resume_parser_exports, {
  parseResumeFile: () => parseResumeFile
});
import fs2 from "fs";
import path4 from "path";
var parseResumeFile, parsePDF;
var init_resume_parser = __esm({
  "src/shared/resume-parser/index.ts"() {
    "use strict";
    parseResumeFile = async (filePath, _mimeType) => {
      const ext = path4.extname(filePath).toLowerCase();
      if (ext === ".pdf") {
        return parsePDF(filePath);
      } else {
        throw new Error("Unsupported file format. Only PDF is supported.");
      }
    };
    parsePDF = async (filePath) => {
      try {
        const { default: pdf } = await import("pdf-parse");
        const dataBuffer = fs2.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        console.log(data.text);
        return { text: data.text };
      } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to parse PDF file");
      }
    };
  }
});

// src/server.ts
import http from "http";

// src/app.ts
import express2 from "express";
import dotenv2 from "dotenv";

// src/modules/auth/auth.routes.ts
import { Router } from "express";
import passport3 from "passport";

// src/shared/config/jwt.ts
import jwt from "jsonwebtoken";

// src/shared/config/env.ts
import dotenv from "dotenv";
dotenv.config();
var getEnvNumber = (key, defaultValue) => {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};
var env = {
  port: getEnvNumber("PORT", 5e3),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiApiKeySecondary: process.env.GEMINI_API_KEY_SECONDARY || "",
  frontendUrl: process.env.FRONTEND_URL || "",
  maxFileSize: getEnvNumber("MAX_FILE_SIZE", 5 * 1024 * 1024),
  promptVersion: process.env.PROMPT_VERSION || "v1",
  aiCacheTtl: getEnvNumber("AI_CACHE_TTL", 7 * 24 * 60 * 60)
};

// src/shared/config/jwt.ts
var generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "15m"
  });
};
var generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: "1d"
  });
};
var verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};
var verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwtRefreshSecret);
};

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";

// src/generated/prisma/client.ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.9.1",
  "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id                String    @id @default(cuid())\n  email             String    @unique @db.VarChar(255)\n  name              String    @db.VarChar(255)\n  googleId          String?   @unique @db.VarChar(255)\n  password          String?   @db.VarChar(255)\n  picture           String?\n  preferences       Json?\n  subscription      Json?\n  createdAt         DateTime  @default(now()) @db.Timestamp()\n  updatedAt         DateTime  @updatedAt @db.Timestamp()\n  lastLoginAt       DateTime? @db.Timestamp()\n  role              String    @default("user")\n  isBanned          Boolean   @default(false)\n  isActive          Boolean   @default(true)\n  lastActiveAt      DateTime? @db.Timestamp()\n  lastSeenSupportAt DateTime? @db.Timestamp()\n  lastSeenReviewsAt DateTime? @db.Timestamp()\n\n  resumes           Resume[]\n  analyses          Analysis[]\n  atsScores         AtsScore[]\n  atsScoreHistories AtsScoreHistory[]\n  jobDescriptions   JobDescription[]\n  payments          Payment[]\n  supportTickets    SupportTicket[]\n  feedbacks         Feedback[]\n\n  @@index([role, isActive])\n  @@map("users")\n}\n\nmodel Resume {\n  id             String   @id @default(cuid())\n  userId         String\n  sourceType     String   @default("uploaded") @db.VarChar(50)\n  originalFormat Json?\n  content        Json\n  metadata       Json\n  tags           String[]\n  isActive       Boolean  @default(true)\n  createdAt      DateTime @default(now()) @db.Timestamp()\n  updatedAt      DateTime @updatedAt @db.Timestamp()\n\n  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)\n  analyses  Analysis[]\n  atsScores AtsScore[]\n\n  @@index([userId, createdAt])\n  @@map("resumes")\n}\n\nmodel Analysis {\n  id                   String   @id @default(cuid())\n  userId               String\n  resumeId             String\n  jobDescription       String   @default("") @db.Text\n  jobTitle             String?\n  company              String?\n  score                Int      @default(0)\n  atsScore             Int      @default(0)\n  atsBreakdown         Json?\n  jobMatchingBreakdown Json?\n  atsSuggestions       String[]\n  jobMatchSuggestions  String[]\n  feedback             Json\n  sectionScores        Json\n  keywords             Json\n  missingKeywords      Json\n  recommendedKeywords  String[]\n  howToUseKeywords     String[]\n  resumeImprovements   String[]\n  jobMatch             Json?\n  existingSections     Json\n  createdAt            DateTime @default(now()) @db.Timestamp()\n  updatedAt            DateTime @updatedAt @db.Timestamp()\n\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n  resume Resume @relation(fields: [resumeId], references: [id], onDelete: Cascade)\n\n  @@index([userId, createdAt])\n  @@map("analyses")\n}\n\nmodel AtsScore {\n  id              String   @id @default(cuid())\n  userId          String\n  resumeId        String\n  overallScore    Int      @db.Integer\n  sectionScores   Json\n  atsFriendliness Int      @db.Integer\n  suggestions     String[]\n  createdAt       DateTime @default(now()) @db.Timestamp()\n  updatedAt       DateTime @updatedAt @db.Timestamp()\n\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n  resume Resume @relation(fields: [resumeId], references: [id], onDelete: Cascade)\n\n  @@index([userId, createdAt])\n  @@index([resumeId])\n  @@map("ats_scores")\n}\n\nmodel AtsScoreHistory {\n  id              String   @id @default(cuid())\n  userId          String\n  title           String   @db.VarChar(255)\n  resumeName      String   @db.VarChar(255)\n  overallScore    Int      @db.Integer\n  sectionScores   Json\n  atsFriendliness Int      @db.Integer\n  suggestions     String[]\n  resumeContent   Json\n  aiResearch      Json?\n  createdAt       DateTime @default(now()) @db.Timestamp()\n  updatedAt       DateTime @updatedAt @db.Timestamp()\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, createdAt])\n  @@map("ats_score_histories")\n}\n\nmodel JobDescription {\n  id          String   @id @default(cuid())\n  userId      String\n  description String   @db.Text\n  createdAt   DateTime @default(now()) @db.Timestamp()\n  updatedAt   DateTime @updatedAt @db.Timestamp()\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, createdAt])\n  @@map("job_descriptions")\n}\n\nmodel Payment {\n  id                 String   @id @default(cuid())\n  userId             String\n  email              String   @db.VarChar(255)\n  amount             Int\n  currency           String   @default("usd") @db.VarChar(10)\n  status             String   @default("pending") @db.VarChar(50)\n  paymentMethod      String   @db.VarChar(50)\n  planId             String   @db.VarChar(50)\n  credits            Int\n  stripeSessionId    String?  @unique @db.VarChar(255)\n  bkashTransactionId String?  @db.VarChar(255)\n  createdAt          DateTime @default(now()) @db.Timestamp()\n  updatedAt          DateTime @updatedAt @db.Timestamp()\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, createdAt])\n  @@map("payments")\n}\n\nmodel SupportTicket {\n  id         String   @id @default(cuid())\n  userId     String\n  type       String   @default("bug") @db.VarChar(50)\n  title      String   @db.VarChar(255)\n  message    String   @db.Text\n  attachment String?\n  status     String   @default("open") @db.VarChar(50)\n  createdAt  DateTime @default(now()) @db.Timestamp()\n  updatedAt  DateTime @updatedAt @db.Timestamp()\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, createdAt])\n  @@index([status])\n  @@map("support_tickets")\n}\n\nmodel Feedback {\n  id         String   @id @default(cuid())\n  userId     String\n  rating     Int      @db.Integer\n  message    String   @db.Text\n  showOnHome Boolean  @default(false)\n  createdAt  DateTime @default(now()) @db.Timestamp()\n  updatedAt  DateTime @updatedAt @db.Timestamp()\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, createdAt])\n  @@map("feedbacks")\n}\n\nmodel Visitor {\n  id          String   @id @default(cuid())\n  fingerprint String\n  ipAddress   String?\n  userAgent   String?\n  lastVisitAt DateTime @default(now())\n  createdAt   DateTime @default(now())\n\n  @@unique([fingerprint])\n  @@index([lastVisitAt])\n  @@map("visitors")\n}\n\nmodel SiteStats {\n  id                  String   @id @default("singleton")\n  totalUniqueVisitors Int      @default(0)\n  updatedAt           DateTime @updatedAt\n\n  @@map("site_stats")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"preferences","kind":"scalar","type":"Json"},{"name":"subscription","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"lastLoginAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"scalar","type":"String"},{"name":"isBanned","kind":"scalar","type":"Boolean"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"lastActiveAt","kind":"scalar","type":"DateTime"},{"name":"lastSeenSupportAt","kind":"scalar","type":"DateTime"},{"name":"lastSeenReviewsAt","kind":"scalar","type":"DateTime"},{"name":"resumes","kind":"object","type":"Resume","relationName":"ResumeToUser"},{"name":"analyses","kind":"object","type":"Analysis","relationName":"AnalysisToUser"},{"name":"atsScores","kind":"object","type":"AtsScore","relationName":"AtsScoreToUser"},{"name":"atsScoreHistories","kind":"object","type":"AtsScoreHistory","relationName":"AtsScoreHistoryToUser"},{"name":"jobDescriptions","kind":"object","type":"JobDescription","relationName":"JobDescriptionToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"supportTickets","kind":"object","type":"SupportTicket","relationName":"SupportTicketToUser"},{"name":"feedbacks","kind":"object","type":"Feedback","relationName":"FeedbackToUser"}],"dbName":"users"},"Resume":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"sourceType","kind":"scalar","type":"String"},{"name":"originalFormat","kind":"scalar","type":"Json"},{"name":"content","kind":"scalar","type":"Json"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"tags","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"ResumeToUser"},{"name":"analyses","kind":"object","type":"Analysis","relationName":"AnalysisToResume"},{"name":"atsScores","kind":"object","type":"AtsScore","relationName":"AtsScoreToResume"}],"dbName":"resumes"},"Analysis":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"resumeId","kind":"scalar","type":"String"},{"name":"jobDescription","kind":"scalar","type":"String"},{"name":"jobTitle","kind":"scalar","type":"String"},{"name":"company","kind":"scalar","type":"String"},{"name":"score","kind":"scalar","type":"Int"},{"name":"atsScore","kind":"scalar","type":"Int"},{"name":"atsBreakdown","kind":"scalar","type":"Json"},{"name":"jobMatchingBreakdown","kind":"scalar","type":"Json"},{"name":"atsSuggestions","kind":"scalar","type":"String"},{"name":"jobMatchSuggestions","kind":"scalar","type":"String"},{"name":"feedback","kind":"scalar","type":"Json"},{"name":"sectionScores","kind":"scalar","type":"Json"},{"name":"keywords","kind":"scalar","type":"Json"},{"name":"missingKeywords","kind":"scalar","type":"Json"},{"name":"recommendedKeywords","kind":"scalar","type":"String"},{"name":"howToUseKeywords","kind":"scalar","type":"String"},{"name":"resumeImprovements","kind":"scalar","type":"String"},{"name":"jobMatch","kind":"scalar","type":"Json"},{"name":"existingSections","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AnalysisToUser"},{"name":"resume","kind":"object","type":"Resume","relationName":"AnalysisToResume"}],"dbName":"analyses"},"AtsScore":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"resumeId","kind":"scalar","type":"String"},{"name":"overallScore","kind":"scalar","type":"Int"},{"name":"sectionScores","kind":"scalar","type":"Json"},{"name":"atsFriendliness","kind":"scalar","type":"Int"},{"name":"suggestions","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AtsScoreToUser"},{"name":"resume","kind":"object","type":"Resume","relationName":"AtsScoreToResume"}],"dbName":"ats_scores"},"AtsScoreHistory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"resumeName","kind":"scalar","type":"String"},{"name":"overallScore","kind":"scalar","type":"Int"},{"name":"sectionScores","kind":"scalar","type":"Json"},{"name":"atsFriendliness","kind":"scalar","type":"Int"},{"name":"suggestions","kind":"scalar","type":"String"},{"name":"resumeContent","kind":"scalar","type":"Json"},{"name":"aiResearch","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AtsScoreHistoryToUser"}],"dbName":"ats_score_histories"},"JobDescription":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"JobDescriptionToUser"}],"dbName":"job_descriptions"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Int"},{"name":"currency","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"planId","kind":"scalar","type":"String"},{"name":"credits","kind":"scalar","type":"Int"},{"name":"stripeSessionId","kind":"scalar","type":"String"},{"name":"bkashTransactionId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"}],"dbName":"payments"},"SupportTicket":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"type","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"attachment","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"SupportTicketToUser"}],"dbName":"support_tickets"},"Feedback":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"message","kind":"scalar","type":"String"},{"name":"showOnHome","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"FeedbackToUser"}],"dbName":"feedbacks"},"Visitor":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"fingerprint","kind":"scalar","type":"String"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"lastVisitAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"visitors"},"SiteStats":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"totalUniqueVisitors","kind":"scalar","type":"Int"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"site_stats"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","resume","analyses","atsScores","_count","resumes","atsScoreHistories","jobDescriptions","payments","supportTickets","feedbacks","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Resume.findUnique","Resume.findUniqueOrThrow","Resume.findFirst","Resume.findFirstOrThrow","Resume.findMany","Resume.createOne","Resume.createMany","Resume.createManyAndReturn","Resume.updateOne","Resume.updateMany","Resume.updateManyAndReturn","Resume.upsertOne","Resume.deleteOne","Resume.deleteMany","Resume.groupBy","Resume.aggregate","Analysis.findUnique","Analysis.findUniqueOrThrow","Analysis.findFirst","Analysis.findFirstOrThrow","Analysis.findMany","Analysis.createOne","Analysis.createMany","Analysis.createManyAndReturn","Analysis.updateOne","Analysis.updateMany","Analysis.updateManyAndReturn","Analysis.upsertOne","Analysis.deleteOne","Analysis.deleteMany","_avg","_sum","Analysis.groupBy","Analysis.aggregate","AtsScore.findUnique","AtsScore.findUniqueOrThrow","AtsScore.findFirst","AtsScore.findFirstOrThrow","AtsScore.findMany","AtsScore.createOne","AtsScore.createMany","AtsScore.createManyAndReturn","AtsScore.updateOne","AtsScore.updateMany","AtsScore.updateManyAndReturn","AtsScore.upsertOne","AtsScore.deleteOne","AtsScore.deleteMany","AtsScore.groupBy","AtsScore.aggregate","AtsScoreHistory.findUnique","AtsScoreHistory.findUniqueOrThrow","AtsScoreHistory.findFirst","AtsScoreHistory.findFirstOrThrow","AtsScoreHistory.findMany","AtsScoreHistory.createOne","AtsScoreHistory.createMany","AtsScoreHistory.createManyAndReturn","AtsScoreHistory.updateOne","AtsScoreHistory.updateMany","AtsScoreHistory.updateManyAndReturn","AtsScoreHistory.upsertOne","AtsScoreHistory.deleteOne","AtsScoreHistory.deleteMany","AtsScoreHistory.groupBy","AtsScoreHistory.aggregate","JobDescription.findUnique","JobDescription.findUniqueOrThrow","JobDescription.findFirst","JobDescription.findFirstOrThrow","JobDescription.findMany","JobDescription.createOne","JobDescription.createMany","JobDescription.createManyAndReturn","JobDescription.updateOne","JobDescription.updateMany","JobDescription.updateManyAndReturn","JobDescription.upsertOne","JobDescription.deleteOne","JobDescription.deleteMany","JobDescription.groupBy","JobDescription.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","SupportTicket.findUnique","SupportTicket.findUniqueOrThrow","SupportTicket.findFirst","SupportTicket.findFirstOrThrow","SupportTicket.findMany","SupportTicket.createOne","SupportTicket.createMany","SupportTicket.createManyAndReturn","SupportTicket.updateOne","SupportTicket.updateMany","SupportTicket.updateManyAndReturn","SupportTicket.upsertOne","SupportTicket.deleteOne","SupportTicket.deleteMany","SupportTicket.groupBy","SupportTicket.aggregate","Feedback.findUnique","Feedback.findUniqueOrThrow","Feedback.findFirst","Feedback.findFirstOrThrow","Feedback.findMany","Feedback.createOne","Feedback.createMany","Feedback.createManyAndReturn","Feedback.updateOne","Feedback.updateMany","Feedback.updateManyAndReturn","Feedback.upsertOne","Feedback.deleteOne","Feedback.deleteMany","Feedback.groupBy","Feedback.aggregate","Visitor.findUnique","Visitor.findUniqueOrThrow","Visitor.findFirst","Visitor.findFirstOrThrow","Visitor.findMany","Visitor.createOne","Visitor.createMany","Visitor.createManyAndReturn","Visitor.updateOne","Visitor.updateMany","Visitor.updateManyAndReturn","Visitor.upsertOne","Visitor.deleteOne","Visitor.deleteMany","Visitor.groupBy","Visitor.aggregate","SiteStats.findUnique","SiteStats.findUniqueOrThrow","SiteStats.findFirst","SiteStats.findFirstOrThrow","SiteStats.findMany","SiteStats.createOne","SiteStats.createMany","SiteStats.createManyAndReturn","SiteStats.updateOne","SiteStats.updateMany","SiteStats.updateManyAndReturn","SiteStats.upsertOne","SiteStats.deleteOne","SiteStats.deleteMany","SiteStats.groupBy","SiteStats.aggregate","AND","OR","NOT","id","totalUniqueVisitors","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","fingerprint","ipAddress","userAgent","lastVisitAt","createdAt","userId","rating","message","showOnHome","type","title","attachment","status","email","amount","currency","paymentMethod","planId","credits","stripeSessionId","bkashTransactionId","description","resumeName","overallScore","sectionScores","atsFriendliness","suggestions","resumeContent","aiResearch","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","has","hasEvery","hasSome","resumeId","jobDescription","jobTitle","company","score","atsScore","atsBreakdown","jobMatchingBreakdown","atsSuggestions","jobMatchSuggestions","feedback","keywords","missingKeywords","recommendedKeywords","howToUseKeywords","resumeImprovements","jobMatch","existingSections","sourceType","originalFormat","content","metadata","tags","isActive","name","googleId","password","picture","preferences","subscription","lastLoginAt","role","isBanned","lastActiveAt","lastSeenSupportAt","lastSeenReviewsAt","every","some","none","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "jAVnsAEcBQAA1wIAIAYAANgCACAIAADWAgAgCQAA2QIAIAoAANoCACALAADbAgAgDAAA3AIAIA0AAN0CACDGAQAA0gIAMMcBAAAwABDIAQAA0gIAMMkBAQAAAAHLAUAAtgIAIdsBQAC2AgAh5AEBAAAAAZQCIADVAgAhlQIBALQCACGWAgEAAAABlwIBAL0CACGYAgEAvQIAIZkCAADTAgAgmgIAANMCACCbAkAA1AIAIZwCAQC0AgAhnQIgANUCACGeAkAA1AIAIZ8CQADUAgAhoAJAANQCACEBAAAAAQAgEAMAAN8CACAFAADXAgAgBgAA2AIAIMYBAADoAgAwxwEAAAMAEMgBAADoAgAwyQEBALQCACHLAUAAtgIAIdsBQAC2AgAh3AEBALQCACGPAgEAtAIAIZACAADTAgAgkQIAAOQCACCSAgAA5AIAIJMCAADHAgAglAIgANUCACEEAwAAzwQAIAUAAMgEACAGAADJBAAgkAIAAPECACAQAwAA3wIAIAUAANcCACAGAADYAgAgxgEAAOgCADDHAQAAAwAQyAEAAOgCADDJAQEAAAABywFAALYCACHbAUAAtgIAIdwBAQC0AgAhjwIBALQCACGQAgAA0wIAIJECAADkAgAgkgIAAOQCACCTAgAAxwIAIJQCIADVAgAhAwAAAAMAIAEAAAQAMAIAAAUAIBwDAADfAgAgBAAA5gIAIMYBAADnAgAwxwEAAAcAEMgBAADnAgAwyQEBALQCACHLAUAAtgIAIdsBQAC2AgAh3AEBALQCACHvAQAA5AIAIP0BAQC0AgAh_gEBALQCACH_AQEAvQIAIYACAQC9AgAhgQICALUCACGCAgIAtQIAIYMCAADTAgAghAIAANMCACCFAgAAxwIAIIYCAADHAgAghwIAAOQCACCIAgAA5AIAIIkCAADkAgAgigIAAMcCACCLAgAAxwIAIIwCAADHAgAgjQIAANMCACCOAgAA5AIAIAcDAADPBAAgBAAA0AQAIP8BAADxAgAggAIAAPECACCDAgAA8QIAIIQCAADxAgAgjQIAAPECACAcAwAA3wIAIAQAAOYCACDGAQAA5wIAMMcBAAAHABDIAQAA5wIAMMkBAQAAAAHLAUAAtgIAIdsBQAC2AgAh3AEBALQCACHvAQAA5AIAIP0BAQC0AgAh_gEBALQCACH_AQEAvQIAIYACAQC9AgAhgQICALUCACGCAgIAtQIAIYMCAADTAgAghAIAANMCACCFAgAAxwIAIIYCAADHAgAghwIAAOQCACCIAgAA5AIAIIkCAADkAgAgigIAAMcCACCLAgAAxwIAIIwCAADHAgAgjQIAANMCACCOAgAA5AIAIAMAAAAHACABAAAIADACAAAJACAOAwAA3wIAIAQAAOYCACDGAQAA5QIAMMcBAAALABDIAQAA5QIAMMkBAQC0AgAhywFAALYCACHbAUAAtgIAIdwBAQC0AgAh7gECALUCACHvAQAA5AIAIPABAgC1AgAh8QEAAMcCACD9AQEAtAIAIQIDAADPBAAgBAAA0AQAIA4DAADfAgAgBAAA5gIAIMYBAADlAgAwxwEAAAsAEMgBAADlAgAwyQEBAAAAAcsBQAC2AgAh2wFAALYCACHcAQEAtAIAIe4BAgC1AgAh7wEAAOQCACDwAQIAtQIAIfEBAADHAgAg_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_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_gEBAAAAAf8BAQAAAAGAAgEAAAABgQICAAAAAYICAgAAAAGDAoAAAAABhAKAAAAAAYUCAACvAwAghgIAALADACCHAoAAAAABiAKAAAAAAYkCgAAAAAGKAgAAsQMAIIsCAACyAwAgjAIAALMDACCNAoAAAAABjgKAAAAAAQETAABhACAXyQEBAAAAAcsBQAAAAAHbAUAAAAAB3AEBAAAAAe8BgAAAAAH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQICAAAAAYICAgAAAAGDAoAAAAABhAKAAAAAAYUCAACvAwAghgIAALADACCHAoAAAAABiAKAAAAAAYkCgAAAAAGKAgAAsQMAIIsCAACyAwAgjAIAALMDACCNAoAAAAABjgKAAAAAAQETAABjADABEwAAYwAwGQMAAK0DACAEAACuAwAgyQEBAO4CACHLAUAA8AIAIdsBQADwAgAh3AEBAO4CACHvAYAAAAAB_QEBAO4CACH-AQEA7gIAIf8BAQD1AgAhgAIBAPUCACGBAgIA7wIAIYICAgDvAgAhgwKAAAAAAYQCgAAAAAGFAgAAqAMAIIYCAACpAwAghwKAAAAAAYgCgAAAAAGJAoAAAAABigIAAKoDACCLAgAAqwMAIIwCAACsAwAgjQKAAAAAAY4CgAAAAAECAAAACQAgEwAAZgAgF8kBAQDuAgAhywFAAPACACHbAUAA8AIAIdwBAQDuAgAh7wGAAAAAAf0BAQDuAgAh_gEBAO4CACH_AQEA9QIAIYACAQD1AgAhgQICAO8CACGCAgIA7wIAIYMCgAAAAAGEAoAAAAABhQIAAKgDACCGAgAAqQMAIIcCgAAAAAGIAoAAAAABiQKAAAAAAYoCAACqAwAgiwIAAKsDACCMAgAArAMAII0CgAAAAAGOAoAAAAABAgAAAAcAIBMAAGgAIAIAAAAHACATAABoACADAAAACQAgGgAAYQAgGwAAZgAgAQAAAAkAIAEAAAAHACAKBwAAowMAICAAAKYDACAhAAClAwAgQgAApAMAIEMAAKcDACD_AQAA8QIAIIACAADxAgAggwIAAPECACCEAgAA8QIAII0CAADxAgAgGsYBAADMAgAwxwEAAG8AEMgBAADMAgAwyQEBAKkCACHLAUAAqwIAIdsBQACrAgAh3AEBAKkCACHvAQAAxgIAIP0BAQCpAgAh_gEBAKkCACH_AQEAuAIAIYACAQC4AgAhgQICAKoCACGCAgIAqgIAIYMCAADIAgAghAIAAMgCACCFAgAAxwIAIIYCAADHAgAghwIAAMYCACCIAgAAxgIAIIkCAADGAgAgigIAAMcCACCLAgAAxwIAIIwCAADHAgAgjQIAAMgCACCOAgAAxgIAIAMAAAAHACABAABuADAfAABvACADAAAABwAgAQAACAAwAgAACQAgAQAAAA0AIAEAAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACALAwAAoQMAIAQAAKIDACDJAQEAAAABywFAAAAAAdsBQAAAAAHcAQEAAAAB7gECAAAAAe8BgAAAAAHwAQIAAAAB8QEAAKADACD9AQEAAAABARMAAHcAIAnJAQEAAAABywFAAAAAAdsBQAAAAAHcAQEAAAAB7gECAAAAAe8BgAAAAAHwAQIAAAAB8QEAAKADACD9AQEAAAABARMAAHkAMAETAAB5ADALAwAAngMAIAQAAJ8DACDJAQEA7gIAIcsBQADwAgAh2wFAAPACACHcAQEA7gIAIe4BAgDvAgAh7wGAAAAAAfABAgDvAgAh8QEAAJ0DACD9AQEA7gIAIQIAAAANACATAAB8ACAJyQEBAO4CACHLAUAA8AIAIdsBQADwAgAh3AEBAO4CACHuAQIA7wIAIe8BgAAAAAHwAQIA7wIAIfEBAACdAwAg_QEBAO4CACECAAAACwAgEwAAfgAgAgAAAAsAIBMAAH4AIAMAAAANACAaAAB3ACAbAAB8ACABAAAADQAgAQAAAAsAIAUHAACYAwAgIAAAmwMAICEAAJoDACBCAACZAwAgQwAAnAMAIAzGAQAAywIAMMcBAACFAQAQyAEAAMsCADDJAQEAqQIAIcsBQACrAgAh2wFAAKsCACHcAQEAqQIAIe4BAgCqAgAh7wEAAMYCACDwAQIAqgIAIfEBAADHAgAg_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_QIAIMkBAQAAAAHLAUAAAAAB2wFAAAAAAdwBAQAAAAHdAQIAAAAB3gEBAAAAAd8BIAAAAAEBEwAA5QEAIAfJAQEAAAABywFAAAAAAdsBQAAAAAHcAQEAAAAB3QECAAAAAd4BAQAAAAHfASAAAAABARMAAOcBADABEwAA5wEAMAgDAAD8AgAgyQEBAO4CACHLAUAA8AIAIdsBQADwAgAh3AEBAO4CACHdAQIA7wIAId4BAQDuAgAh3wEgAPsCACECAAAAJQAgEwAA6gEAIAfJAQEA7gIAIcsBQADwAgAh2wFAAPACACHcAQEA7gIAId0BAgDvAgAh3gEBAO4CACHfASAA-wIAIQIAAAAjACATAADsAQAgAgAAACMAIBMAAOwBACADAAAAJQAgGgAA5QEAIBsAAOoBACABAAAAJQAgAQAAACMAIAUHAAD2AgAgIAAA-QIAICEAAPgCACBCAAD3AgAgQwAA-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_AgAhBQcAAK0CACAgAADBAgAgIQAAwQIAIMwBIAAAAAHTASAAwAIAIQUHAACtAgAgIAAAwQIAICEAAMECACDMASAAAAAB0wEgAMACACECzAEgAAAAAdMBIADBAgAhDMYBAADCAgAwxwEAAN0BABDIAQAAwgIAMMkBAQCpAgAhywFAAKsCACHbAUAAqwIAIdwBAQCpAgAh3gEBAKkCACHgAQEAqQIAIeEBAQCpAgAh4gEBALgCACHjAQEAqQIAIRDGAQAAwwIAMMcBAADHAQAQyAEAAMMCADDJAQEAqQIAIcsBQACrAgAh2wFAAKsCACHcAQEAqQIAIeMBAQCpAgAh5AEBAKkCACHlAQIAqgIAIeYBAQCpAgAh5wEBAKkCACHoAQEAqQIAIekBAgCqAgAh6gEBALgCACHrAQEAuAIAIQjGAQAAxAIAMMcBAACxAQAQyAEAAMQCADDJAQEAqQIAIcsBQACrAgAh2wFAAKsCACHcAQEAqQIAIewBAQCpAgAhD8YBAADFAgAwxwEAAJsBABDIAQAAxQIAMMkBAQCpAgAhywFAAKsCACHbAUAAqwIAIdwBAQCpAgAh4QEBAKkCACHtAQEAqQIAIe4BAgCqAgAh7wEAAMYCACDwAQIAqgIAIfEBAADHAgAg8gEAAMYCACDzAQAAyAIAIA8HAACtAgAgIAAAygIAICEAAMoCACDMAYAAAAABzwGAAAAAAdABgAAAAAHRAYAAAAAB0gGAAAAAAdMBgAAAAAH0AQEAAAAB9QEBAAAAAfYBAQAAAAH3AYAAAAAB-AGAAAAAAfkBgAAAAAEEzAEBAAAABfoBAQAAAAH7AQEAAAAE_AEBAAAABA8HAAC6AgAgIAAAyQIAICEAAMkCACDMAYAAAAABzwGAAAAAAdABgAAAAAHRAYAAAAAB0gGAAAAAAdMBgAAAAAH0AQEAAAAB9QEBAAAAAfYBAQAAAAH3AYAAAAAB-AGAAAAAAfkBgAAAAAEMzAGAAAAAAc8BgAAAAAHQAYAAAAAB0QGAAAAAAdIBgAAAAAHTAYAAAAAB9AEBAAAAAfUBAQAAAAH2AQEAAAAB9wGAAAAAAfgBgAAAAAH5AYAAAAABDMwBgAAAAAHPAYAAAAAB0AGAAAAAAdEBgAAAAAHSAYAAAAAB0wGAAAAAAfQBAQAAAAH1AQEAAAAB9gEBAAAAAfcBgAAAAAH4AYAAAAAB-QGAAAAAAQzGAQAAywIAMMcBAACFAQAQyAEAAMsCADDJAQEAqQIAIcsBQACrAgAh2wFAAKsCACHcAQEAqQIAIe4BAgCqAgAh7wEAAMYCACDwAQIAqgIAIfEBAADHAgAg_QEBAKkCACEaxgEAAMwCADDHAQAAbwAQyAEAAMwCADDJAQEAqQIAIcsBQACrAgAh2wFAAKsCACHcAQEAqQIAIe8BAADGAgAg_QEBAKkCACH-AQEAqQIAIf8BAQC4AgAhgAIBALgCACGBAgIAqgIAIYICAgCqAgAhgwIAAMgCACCEAgAAyAIAIIUCAADHAgAghgIAAMcCACCHAgAAxgIAIIgCAADGAgAgiQIAAMYCACCKAgAAxwIAIIsCAADHAgAgjAIAAMcCACCNAgAAyAIAII4CAADGAgAgDcYBAADNAgAwxwEAAFkAEMgBAADNAgAwyQEBAKkCACHLAUAAqwIAIdsBQACrAgAh3AEBAKkCACGPAgEAqQIAIZACAADIAgAgkQIAAMYCACCSAgAAxgIAIJMCAADHAgAglAIgAL8CACEUxgEAAM4CADDHAQAAQwAQyAEAAM4CADDJAQEAqQIAIcsBQACrAgAh2wFAAKsCACHkAQEAqQIAIZQCIAC_AgAhlQIBAKkCACGWAgEAuAIAIZcCAQC4AgAhmAIBALgCACGZAgAAyAIAIJoCAADIAgAgmwJAAM8CACGcAgEAqQIAIZ0CIAC_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_QEBALQCACESAwAA3wIAIAUAANcCACAGAADYAgAgxgEAAOgCADDHAQAAAwAQyAEAAOgCADDJAQEAtAIAIcsBQAC2AgAh2wFAALYCACHcAQEAtAIAIY8CAQC0AgAhkAIAANMCACCRAgAA5AIAIJICAADkAgAgkwIAAMcCACCUAiAA1QIAIaQCAAADACClAgAAAwAgHAMAAN8CACAEAADmAgAgxgEAAOcCADDHAQAABwAQyAEAAOcCADDJAQEAtAIAIcsBQAC2AgAh2wFAALYCACHcAQEAtAIAIe8BAADkAgAg_QEBALQCACH-AQEAtAIAIf8BAQC9AgAhgAIBAL0CACGBAgIAtQIAIYICAgC1AgAhgwIAANMCACCEAgAA0wIAIIUCAADHAgAghgIAAMcCACCHAgAA5AIAIIgCAADkAgAgiQIAAOQCACCKAgAAxwIAIIsCAADHAgAgjAIAAMcCACCNAgAA0wIAII4CAADkAgAgEAMAAN8CACAFAADXAgAgBgAA2AIAIMYBAADoAgAwxwEAAAMAEMgBAADoAgAwyQEBALQCACHLAUAAtgIAIdsBQAC2AgAh3AEBALQCACGPAgEAtAIAIZACAADTAgAgkQIAAOQCACCSAgAA5AIAIJMCAADHAgAglAIgANUCACEAAAAAAAGpAgEAAAABBakCAgAAAAGwAgIAAAABsQICAAAAAbICAgAAAAGzAgIAAAABAakCQAAAAAEAAAAAAakCAQAAAAEAAAAAAAGpAiAAAAABBRoAAIgFACAbAACLBQAgpgIAAIkFACCnAgAAigUAIKwCAAABACADGgAAiAUAIKYCAACJBQAgrAIAAAEAIAAAAAUaAACDBQAgGwAAhgUAIKYCAACEBQAgpwIAAIUFACCsAgAAAQAgAxoAAIMFACCmAgAAhAUAIKwCAAABACAAAAAAAAUaAAD-BAAgGwAAgQUAIKYCAAD_BAAgpwIAAIAFACCsAgAAAQAgAxoAAP4EACCmAgAA_wQAIKwCAAABACAAAAAFGgAA-QQAIBsAAPwEACCmAgAA-gQAIKcCAAD7BAAgrAIAAAEAIAMaAAD5BAAgpgIAAPoEACCsAgAAAQAgAAAAAAACqQIBAAAABK8CAQAAAAUFGgAA9AQAIBsAAPcEACCmAgAA9QQAIKcCAAD2BAAgrAIAAAEAIAGpAgEAAAAEAxoAAPQEACCmAgAA9QQAIKwCAAABACAAAAAAAAKpAgEAAAAErwIBAAAABQUaAADsBAAgGwAA8gQAIKYCAADtBAAgpwIAAPEEACCsAgAAAQAgBRoAAOoEACAbAADvBAAgpgIAAOsEACCnAgAA7gQAIKwCAAAFACABqQIBAAAABAMaAADsBAAgpgIAAO0EACCsAgAAAQAgAxoAAOoEACCmAgAA6wQAIKwCAAAFACAAAAAAAAKpAgEAAAAErwIBAAAABQKpAgEAAAAErwIBAAAABQKpAgEAAAAErwIBAAAABQKpAgEAAAAErwIBAAAABQKpAgEAAAAErwIBAAAABQUaAADiBAAgGwAA6AQAIKYCAADjBAAgpwIAAOcEACCsAgAAAQAgBRoAAOAEACAbAADlBAAgpgIAAOEEACCnAgAA5AQAIKwCAAAFACABqQIBAAAABAGpAgEAAAAEAakCAQAAAAQBqQIBAAAABAGpAgEAAAAEAxoAAOIEACCmAgAA4wQAIKwCAAABACADGgAA4AQAIKYCAADhBAAgrAIAAAUAIAAAAAKpAgEAAAAErwIBAAAABQUaAADZBAAgGwAA3gQAIKYCAADaBAAgpwIAAN0EACCsAgAAAQAgCxoAAMkDADAbAADOAwAwpgIAAMoDADCnAgAAywMAMKgCAADMAwAgqQIAAM0DADCqAgAAzQMAMKsCAADNAwAwrAIAAM0DADCtAgAAzwMAMK4CAADQAwAwCxoAAL0DADAbAADCAwAwpgIAAL4DADCnAgAAvwMAMKgCAADAAwAgqQIAAMEDADCqAgAAwQMAMKsCAADBAwAwrAIAAMEDADCtAgAAwwMAMK4CAADEAwAwCQMAAKEDACDJAQEAAAABywFAAAAAAdsBQAAAAAHcAQEAAAAB7gECAAAAAe8BgAAAAAHwAQIAAAAB8QEAAKADACACAAAADQAgGgAAyAMAIAMAAAANACAaAADIAwAgGwAAxwMAIAETAADcBAAwDgMAAN8CACAEAADmAgAgxgEAAOUCADDHAQAACwAQyAEAAOUCADDJAQEAAAABywFAALYCACHbAUAAtgIAIdwBAQC0AgAh7gECALUCACHvAQAA5AIAIPABAgC1AgAh8QEAAMcCACD9AQEAtAIAIQIAAAANACATAADHAwAgAgAAAMUDACATAADGAwAgDMYBAADEAwAwxwEAAMUDABDIAQAAxAMAMMkBAQC0AgAhywFAALYCACHbAUAAtgIAIdwBAQC0AgAh7gECALUCACHvAQAA5AIAIPABAgC1AgAh8QEAAMcCACD9AQEAtAIAIQzGAQAAxAMAMMcBAADFAwAQyAEAAMQDADDJAQEAtAIAIcsBQAC2AgAh2wFAALYCACHcAQEAtAIAIe4BAgC1AgAh7wEAAOQCACDwAQIAtQIAIfEBAADHAgAg_QEBALQCACEIyQEBAO4CACHLAUAA8AIAIdsBQADwAgAh3AEBAO4CACHuAQIA7wIAIe8BgAAAAAHwAQIA7wIAIfEBAACdAwAgCQMAAJ4DACDJAQEA7gIAIcsBQADwAgAh2wFAAPACACHcAQEA7gIAIe4BAgDvAgAh7wGAAAAAAfABAgDvAgAh8QEAAJ0DACAJAwAAoQMAIMkBAQAAAAHLAUAAAAAB2wFAAAAAAdwBAQAAAAHuAQIAAAAB7wGAAAAAAfABAgAAAAHxAQAAoAMAIBcDAAC0AwAgyQEBAAAAAcsBQAAAAAHbAUAAAAAB3AEBAAAAAe8BgAAAAAH-AQEAAAAB_wEBAAAAAYACAQAAAAGBAgIAAAABggICAAAAAYMCgAAAAAGEAoAAAAABhQIAAK8DACCGAgAAsAMAIIcCgAAAAAGIAoAAAAABiQKAAAAAAYoCAACxAwAgiwIAALIDACCMAgAAswMAII0CgAAAAAGOAoAAAAABAgAAAAkAIBoAANQDACADAAAACQAgGgAA1AMAIBsAANMDACABEwAA2wQAMBwDAADfAgAgBAAA5gIAIMYBAADnAgAwxwEAAAcAEMgBAADnAgAwyQEBAAAAAcsBQAC2AgAh2wFAALYCACHcAQEAtAIAIe8BAADkAgAg_QEBALQCACH-AQEAtAIAIf8BAQC9AgAhgAIBAL0CACGBAgIAtQIAIYICAgC1AgAhgwIAANMCACCEAgAA0wIAIIUCAADHAgAghgIAAMcCACCHAgAA5AIAIIgCAADkAgAgiQIAAOQCACCKAgAAxwIAIIsCAADHAgAgjAIAAMcCACCNAgAA0wIAII4CAADkAgAgAgAAAAkAIBMAANMDACACAAAA0QMAIBMAANIDACAaxgEAANADADDHAQAA0QMAEMgBAADQAwAwyQEBALQCACHLAUAAtgIAIdsBQAC2AgAh3AEBALQCACHvAQAA5AIAIP0BAQC0AgAh_gEBALQCACH_AQEAvQIAIYACAQC9AgAhgQICALUCACGCAgIAtQIAIYMCAADTAgAghAIAANMCACCFAgAAxwIAIIYCAADHAgAghwIAAOQCACCIAgAA5AIAIIkCAADkAgAgigIAAMcCACCLAgAAxwIAIIwCAADHAgAgjQIAANMCACCOAgAA5AIAIBrGAQAA0AMAMMcBAADRAwAQyAEAANADADDJAQEAtAIAIcsBQAC2AgAh2wFAALYCACHcAQEAtAIAIe8BAADkAgAg_QEBALQCACH-AQEAtAIAIf8BAQC9AgAhgAIBAL0CACGBAgIAtQIAIYICAgC1AgAhgwIAANMCACCEAgAA0wIAIIUCAADHAgAghgIAAMcCACCHAgAA5AIAIIgCAADkAgAgiQIAAOQCACCKAgAAxwIAIIsCAADHAgAgjAIAAMcCACCNAgAA0wIAII4CAADkAgAgFskBAQDuAgAhywFAAPACACHbAUAA8AIAIdwBAQDuAgAh7wGAAAAAAf4BAQDuAgAh_wEBAPUCACGAAgEA9QIAIYECAgDvAgAhggICAO8CACGDAoAAAAABhAKAAAAAAYUCAACoAwAghgIAAKkDACCHAoAAAAABiAKAAAAAAYkCgAAAAAGKAgAAqgMAIIsCAACrAwAgjAIAAKwDACCNAoAAAAABjgKAAAAAARcDAACtAwAgyQEBAO4CACHLAUAA8AIAIdsBQADwAgAh3AEBAO4CACHvAYAAAAAB_gEBAO4CACH_AQEA9QIAIYACAQD1AgAhgQICAO8CACGCAgIA7wIAIYMCgAAAAAGEAoAAAAABhQIAAKgDACCGAgAAqQMAIIcCgAAAAAGIAoAAAAABiQKAAAAAAYoCAACqAwAgiwIAAKsDACCMAgAArAMAII0CgAAAAAGOAoAAAAABFwMAALQDACDJAQEAAAABywFAAAAAAdsBQAAAAAHcAQEAAAAB7wGAAAAAAf4BAQAAAAH_AQEAAAABgAIBAAAAAYECAgAAAAGCAgIAAAABgwKAAAAAAYQCgAAAAAGFAgAArwMAIIYCAACwAwAghwKAAAAAAYgCgAAAAAGJAoAAAAABigIAALEDACCLAgAAsgMAIIwCAACzAwAgjQKAAAAAAY4CgAAAAAEBqQIBAAAABAMaAADZBAAgpgIAANoEACCsAgAAAQAgBBoAAMkDADCmAgAAygMAMKgCAADMAwAgrAIAAM0DADAEGgAAvQMAMKYCAAC-AwAwqAIAAMADACCsAgAAwQMAMAAAAAGpAkAAAAABCxoAALMEADAbAAC4BAAwpgIAALQEADCnAgAAtQQAMKgCAAC2BAAgqQIAALcEADCqAgAAtwQAMKsCAAC3BAAwrAIAALcEADCtAgAAuQQAMK4CAAC6BAAwCxoAAKoEADAbAACuBAAwpgIAAKsEADCnAgAArAQAMKgCAACtBAAgqQIAAM0DADCqAgAAzQMAMKsCAADNAwAwrAIAAM0DADCtAgAArwQAMK4CAADQAwAwCxoAAKEEADAbAAClBAAwpgIAAKIEADCnAgAAowQAMKgCAACkBAAgqQIAAMEDADCqAgAAwQMAMKsCAADBAwAwrAIAAMEDADCtAgAApgQAMK4CAADEAwAwCxoAAJUEADAbAACaBAAwpgIAAJYEADCnAgAAlwQAMKgCAACYBAAgqQIAAJkEADCqAgAAmQQAMKsCAACZBAAwrAIAAJkEADCtAgAAmwQAMK4CAACcBAAwCxoAAIkEADAbAACOBAAwpgIAAIoEADCnAgAAiwQAMKgCAACMBAAgqQIAAI0EADCqAgAAjQQAMKsCAACNBAAwrAIAAI0EADCtAgAAjwQAMK4CAACQBAAwCxoAAP0DADAbAACCBAAwpgIAAP4DADCnAgAA_wMAMKgCAACABAAgqQIAAIEEADCqAgAAgQQAMKsCAACBBAAwrAIAAIEEADCtAgAAgwQAMK4CAACEBAAwCxoAAPEDADAbAAD2AwAwpgIAAPIDADCnAgAA8wMAMKgCAAD0AwAgqQIAAPUDADCqAgAA9QMAMKsCAAD1AwAwrAIAAPUDADCtAgAA9wMAMK4CAAD4AwAwCxoAAOUDADAbAADqAwAwpgIAAOYDADCnAgAA5wMAMKgCAADoAwAgqQIAAOkDADCqAgAA6QMAMKsCAADpAwAwrAIAAOkDADCtAgAA6wMAMK4CAADsAwAwBskBAQAAAAHLAUAAAAAB2wFAAAAAAd0BAgAAAAHeAQEAAAAB3wEgAAAAAQIAAAAlACAaAADwAwAgAwAAACUAIBoAAPADACAbAADvAwAgARMAANgEADALAwAA3wIAIMYBAADeAgAwxwEAACMAEMgBAADeAgAwyQEBAAAAAcsBQAC2AgAh2wFAALYCACHcAQEAtAIAId0BAgC1AgAh3gEBALQCACHfASAA1QIAIQIAAAAlACATAADvAwAgAgAAAO0DACATAADuAwAgCsYBAADsAwAwxwEAAO0DABDIAQAA7AMAMMkBAQC0AgAhywFAALYCACHbAUAAtgIAIdwBAQC0AgAh3QECALUCACHeAQEAtAIAId8BIADVAgAhCsYBAADsAwAwxwEAAO0DABDIAQAA7AMAMMkBAQC0AgAhywFAALYCACHbAUAAtgIAIdwBAQC0AgAh3QECALUCACHeAQEAtAIAId8BIADVAgAhBskBAQDuAgAhywFAAPACACHbAUAA8AIAId0BAgDvAgAh3gEBAO4CACHfASAA-wIAIQbJAQEA7gIAIcsBQADwAgAh2wFAAPACACHdAQIA7wIAId4BAQDuAgAh3wEgAPsCACEGyQEBAAAAAcsBQAAAAAHbAUAAAAAB3QECAAAAAd4BAQAAAAHfASAAAAABCMkBAQAAAAHLAUAAAAAB2wFAAAAAAd4BAQAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQEAAAABAgAAACEAIBoAAPwDACADAAAAIQAgGgAA_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_GAQAAnAQAMMcBAACdBAAQyAEAAJwEADDJAQEAtAIAIcsBQAC2AgAh2wFAALYCACHcAQEAtAIAIeEBAQC0AgAh7QEBALQCACHuAQIAtQIAIe8BAADkAgAg8AECALUCACHxAQAAxwIAIPIBAADkAgAg8wEAANMCACALyQEBAO4CACHLAUAA8AIAIdsBQADwAgAh4QEBAO4CACHtAQEA7gIAIe4BAgDvAgAh7wGAAAAAAfABAgDvAgAh8QEAAJQDACDyAYAAAAAB8wGAAAAAAQvJAQEA7gIAIcsBQADwAgAh2wFAAPACACHhAQEA7gIAIe0BAQDuAgAh7gECAO8CACHvAYAAAAAB8AECAO8CACHxAQAAlAMAIPIBgAAAAAHzAYAAAAABC8kBAQAAAAHLAUAAAAAB2wFAAAAAAeEBAQAAAAHtAQEAAAAB7gECAAAAAe8BgAAAAAHwAQIAAAAB8QEAAJYDACDyAYAAAAAB8wGAAAAAAQkEAACiAwAgyQEBAAAAAcsBQAAAAAHbAUAAAAAB7gECAAAAAe8BgAAAAAHwAQIAAAAB8QEAAKADACD9AQEAAAABAgAAAA0AIBoAAKkEACADAAAADQAgGgAAqQQAIBsAAKgEACABEwAA0wQAMAIAAAANACATAACoBAAgAgAAAMUDACATAACnBAAgCMkBAQDuAgAhywFAAPACACHbAUAA8AIAIe4BAgDvAgAh7wGAAAAAAfABAgDvAgAh8QEAAJ0DACD9AQEA7gIAIQkEAACfAwAgyQEBAO4CACHLAUAA8AIAIdsBQADwAgAh7gECAO8CACHvAYAAAAAB8AECAO8CACHxAQAAnQMAIP0BAQDuAgAhCQQAAKIDACDJAQEAAAABywFAAAAAAdsBQAAAAAHuAQIAAAAB7wGAAAAAAfABAgAAAAHxAQAAoAMAIP0BAQAAAAEXBAAAtQMAIMkBAQAAAAHLAUAAAAAB2wFAAAAAAe8BgAAAAAH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQICAAAAAYICAgAAAAGDAoAAAAABhAKAAAAAAYUCAACvAwAghgIAALADACCHAoAAAAABiAKAAAAAAYkCgAAAAAGKAgAAsQMAIIsCAACyAwAgjAIAALMDACCNAoAAAAABjgKAAAAAAQIAAAAJACAaAACyBAAgAwAAAAkAIBoAALIEACAbAACxBAAgARMAANIEADACAAAACQAgEwAAsQQAIAIAAADRAwAgEwAAsAQAIBbJAQEA7gIAIcsBQADwAgAh2wFAAPACACHvAYAAAAAB_QEBAO4CACH-AQEA7gIAIf8BAQD1AgAhgAIBAPUCACGBAgIA7wIAIYICAgDvAgAhgwKAAAAAAYQCgAAAAAGFAgAAqAMAIIYCAACpAwAghwKAAAAAAYgCgAAAAAGJAoAAAAABigIAAKoDACCLAgAAqwMAIIwCAACsAwAgjQKAAAAAAY4CgAAAAAEXBAAArgMAIMkBAQDuAgAhywFAAPACACHbAUAA8AIAIe8BgAAAAAH9AQEA7gIAIf4BAQDuAgAh_wEBAPUCACGAAgEA9QIAIYECAgDvAgAhggICAO8CACGDAoAAAAABhAKAAAAAAYUCAACoAwAghgIAAKkDACCHAoAAAAABiAKAAAAAAYkCgAAAAAGKAgAAqgMAIIsCAACrAwAgjAIAAKwDACCNAoAAAAABjgKAAAAAARcEAAC1AwAgyQEBAAAAAcsBQAAAAAHbAUAAAAAB7wGAAAAAAf0BAQAAAAH-AQEAAAAB_wEBAAAAAYACAQAAAAGBAgIAAAABggICAAAAAYMCgAAAAAGEAoAAAAABhQIAAK8DACCGAgAAsAMAIIcCgAAAAAGIAoAAAAABiQKAAAAAAYoCAACxAwAgiwIAALIDACCMAgAAswMAII0CgAAAAAGOAoAAAAABCwUAANcDACAGAADYAwAgyQEBAAAAAcsBQAAAAAHbAUAAAAABjwIBAAAAAZACgAAAAAGRAoAAAAABkgKAAAAAAZMCAADVAwAglAIgAAAAAQIAAAAFACAaAAC-BAAgAwAAAAUAIBoAAL4EACAbAAC9BAAgARMAANEEADAQAwAA3wIAIAUAANcCACAGAADYAgAgxgEAAOgCADDHAQAAAwAQyAEAAOgCADDJAQEAAAABywFAALYCACHbAUAAtgIAIdwBAQC0AgAhjwIBALQCACGQAgAA0wIAIJECAADkAgAgkgIAAOQCACCTAgAAxwIAIJQCIADVAgAhAgAAAAUAIBMAAL0EACACAAAAuwQAIBMAALwEACANxgEAALoEADDHAQAAuwQAEMgBAAC6BAAwyQEBALQCACHLAUAAtgIAIdsBQAC2AgAh3AEBALQCACGPAgEAtAIAIZACAADTAgAgkQIAAOQCACCSAgAA5AIAIJMCAADHAgAglAIgANUCACENxgEAALoEADDHAQAAuwQAEMgBAAC6BAAwyQEBALQCACHLAUAAtgIAIdsBQAC2AgAh3AEBALQCACGPAgEAtAIAIZACAADTAgAgkQIAAOQCACCSAgAA5AIAIJMCAADHAgAglAIgANUCACEJyQEBAO4CACHLAUAA8AIAIdsBQADwAgAhjwIBAO4CACGQAoAAAAABkQKAAAAAAZICgAAAAAGTAgAAuQMAIJQCIAD7AgAhCwUAALsDACAGAAC8AwAgyQEBAO4CACHLAUAA8AIAIdsBQADwAgAhjwIBAO4CACGQAoAAAAABkQKAAAAAAZICgAAAAAGTAgAAuQMAIJQCIAD7AgAhCwUAANcDACAGAADYAwAgyQEBAAAAAcsBQAAAAAHbAUAAAAABjwIBAAAAAZACgAAAAAGRAoAAAAABkgKAAAAAAZMCAADVAwAglAIgAAAAAQQaAACzBAAwpgIAALQEADCoAgAAtgQAIKwCAAC3BAAwBBoAAKoEADCmAgAAqwQAMKgCAACtBAAgrAIAAM0DADAEGgAAoQQAMKYCAACiBAAwqAIAAKQEACCsAgAAwQMAMAQaAACVBAAwpgIAAJYEADCoAgAAmAQAIKwCAACZBAAwBBoAAIkEADCmAgAAigQAMKgCAACMBAAgrAIAAI0EADAEGgAA_QMAMKYCAAD-AwAwqAIAAIAEACCsAgAAgQQAMAQaAADxAwAwpgIAAPIDADCoAgAA9AMAIKwCAAD1AwAwBBoAAOUDADCmAgAA5gMAMKgCAADoAwAgrAIAAOkDADAAAAAAAAAAABEFAADIBAAgBgAAyQQAIAgAAMcEACAJAADKBAAgCgAAywQAIAsAAMwEACAMAADNBAAgDQAAzgQAIJYCAADxAgAglwIAAPECACCYAgAA8QIAIJkCAADxAgAgmgIAAPECACCbAgAA8QIAIJ4CAADxAgAgnwIAAPECACCgAgAA8QIAIAQDAADPBAAgBQAAyAQAIAYAAMkEACCQAgAA8QIAIAnJAQEAAAABywFAAAAAAdsBQAAAAAGPAgEAAAABkAKAAAAAAZECgAAAAAGSAoAAAAABkwIAANUDACCUAiAAAAABFskBAQAAAAHLAUAAAAAB2wFAAAAAAe8BgAAAAAH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQICAAAAAYICAgAAAAGDAoAAAAABhAKAAAAAAYUCAACvAwAghgIAALADACCHAoAAAAABiAKAAAAAAYkCgAAAAAGKAgAAsQMAIIsCAACyAwAgjAIAALMDACCNAoAAAAABjgKAAAAAAQjJAQEAAAABywFAAAAAAdsBQAAAAAHuAQIAAAAB7wGAAAAAAfABAgAAAAHxAQAAoAMAIP0BAQAAAAELyQEBAAAAAcsBQAAAAAHbAUAAAAAB4QEBAAAAAe0BAQAAAAHuAQIAAAAB7wGAAAAAAfABAgAAAAHxAQAAlgMAIPIBgAAAAAHzAYAAAAABBMkBAQAAAAHLAUAAAAAB2wFAAAAAAewBAQAAAAEMyQEBAAAAAcsBQAAAAAHbAUAAAAAB4wEBAAAAAeQBAQAAAAHlAQIAAAAB5gEBAAAAAecBAQAAAAHoAQEAAAAB6QECAAAAAeoBAQAAAAHrAQEAAAABCMkBAQAAAAHLAUAAAAAB2wFAAAAAAd4BAQAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQEAAAABBskBAQAAAAHLAUAAAAAB2wFAAAAAAd0BAgAAAAHeAQEAAAAB3wEgAAAAARgFAADABAAgBgAAwQQAIAkAAMIEACAKAADDBAAgCwAAxAQAIAwAAMUEACANAADGBAAgyQEBAAAAAcsBQAAAAAHbAUAAAAAB5AEBAAAAAZQCIAAAAAGVAgEAAAABlgIBAAAAAZcCAQAAAAGYAgEAAAABmQKAAAAAAZoCgAAAAAGbAkAAAAABnAIBAAAAAZ0CIAAAAAGeAkAAAAABnwJAAAAAAaACQAAAAAECAAAAAQAgGgAA2QQAIBbJAQEAAAABywFAAAAAAdsBQAAAAAHcAQEAAAAB7wGAAAAAAf4BAQAAAAH_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-Dhw_AR1AAR5BDCJEDyNFEyRGAiVHAiZIAidJAihKAilMAipODCtPFCxRAi1TDC5UFS9VAjBWAjFXDDJaFjNbGjRcAzVdAzZeAzdfAzhgAzliAzpkDDtlGzxnAz1pDD5qHD9rA0BsA0FtDERwHUVxI0ZyBEdzBEh0BEl1BEp2BEt4BEx6DE17JE59BE9_DFCAASVRgQEEUoIBBFODAQxUhgEmVYcBLFaIAQZXiQEGWIoBBlmLAQZajAEGW44BBlyQAQxdkQEtXpMBBl-VAQxglgEuYZcBBmKYAQZjmQEMZJwBL2WdATVmngEHZ58BB2igAQdpoQEHaqIBB2ukAQdspgEMbacBNm6pAQdvqwEMcKwBN3GtAQdyrgEHc68BDHSyATh1swE8drQBCHe1AQh4tgEIebcBCHq4AQh7ugEIfLwBDH29AT1-vwEIf8EBDIABwgE-gQHDAQiCAcQBCIMBxQEMhAHIAT-FAckBRYYBygEJhwHLAQmIAcwBCYkBzQEJigHOAQmLAdABCYwB0gEMjQHTAUaOAdUBCY8B1wEMkAHYAUeRAdkBCZIB2gEJkwHbAQyUAd4BSJUB3wFMlgHgAQqXAeEBCpgB4gEKmQHjAQqaAeQBCpsB5gEKnAHoAQydAekBTZ4B6wEKnwHtAQygAe4BTqEB7wEKogHwAQqjAfEBDKQB9AFPpQH1AVWmAfcBVqcB-AFWqAH7AVapAfwBVqoB_QFWqwH_AVasAYECDK0BggJXrgGEAlavAYYCDLABhwJYsQGIAlayAYkCVrMBigIMtAGNAlm1AY4CXbYBkAJetwGRAl64AZQCXrkBlQJeugGWAl67AZgCXrwBmgIMvQGbAl--AZ0CXr8BnwIMwAGgAmDBAaECXsIBogJewwGjAgzEAaYCYcUBpwJn"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("node:buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaNeon({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/shared/utils/credits.ts
var getBangladeshCreditDateKey = () => {
  const now = /* @__PURE__ */ new Date();
  const dhakaMs = now.getTime() + 6 * 60 * 60 * 1e3;
  const dhaka = new Date(dhakaMs);
  const hour = dhaka.getUTCHours();
  if (hour < 16) {
    dhaka.setUTCDate(dhaka.getUTCDate() - 1);
  }
  return dhaka.toISOString().slice(0, 10);
};
var applyDailyCreditReset = async (userId, subscription) => {
  const today = getBangladeshCreditDateKey();
  const updatedSubscription = { ...subscription || {} };
  if ((updatedSubscription.lastAiScanResetDate ?? "") !== today) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    if (dbUser?.role === "admin") {
      return updatedSubscription;
    }
    updatedSubscription.credits = 3;
    updatedSubscription.lastAiScanResetDate = today;
    await prisma.user.update({
      where: { id: userId },
      data: { subscription: updatedSubscription }
    });
  }
  return updatedSubscription;
};

// src/shared/middlewares/auth.ts
var authenticate = async (req, res, next) => {
  let token = req.cookies.accessToken;
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided"
    });
  }
  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found"
      });
    }
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned"
      });
    }
    const subscription = await applyDailyCreditReset(user.id, user.subscription);
    const userRecord = {
      id: user.id,
      email: user.email,
      name: user.name,
      googleId: user.googleId || void 0,
      picture: user.picture || void 0,
      preferences: user.preferences,
      subscription: user.subscription,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
    };
    req.user = userRecord;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token"
    });
  }
};

// src/shared/middlewares/middlewareConfig.ts
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import express from "express";
import cookieParser from "cookie-parser";
import passport2 from "passport";
import path2 from "path";

// src/shared/config/passport.ts
import passport from "passport";
import {
  Strategy as GoogleStrategy
} from "passport-google-oauth20";
var configureGoogleStrategy = () => {
  return new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id }
        });
        if (!user) {
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await prisma.user.findUnique({
              where: { email }
            });
            if (user) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  googleId: profile.id,
                  picture: profile.photos?.[0]?.value
                }
              });
            }
          }
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: email || `user_${profile.id}@google.local`,
                name: profile.displayName,
                googleId: profile.id,
                picture: profile.photos?.[0]?.value,
                subscription: {
                  plan: "free",
                  credits: 3
                }
              }
            });
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, void 0);
      }
    }
  );
};
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// src/lib/redis.ts
import Redis from "ioredis";
var redis = null;
function getRedisClient() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : void 0,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2e3);
        return delay;
      }
    });
    redis.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
    redis.on("connect", () => {
      console.log("Connected to Redis");
    });
  }
  return redis;
}
var REFRESH_PREFIX = "refresh:";
async function storeRefreshToken(token, userId, expiresInSec) {
  const redis2 = getRedisClient();
  await redis2.setex(
    `${REFRESH_PREFIX}${token}`,
    expiresInSec,
    JSON.stringify({ userId })
  );
}
async function deleteRefreshToken(token) {
  const redis2 = getRedisClient();
  await redis2.del(`${REFRESH_PREFIX}${token}`);
}
async function deleteAllRefreshTokensForUser(userId) {
  const redis2 = getRedisClient();
  const keys2 = await redis2.keys(`${REFRESH_PREFIX}*`);
  if (keys2.length === 0) return;
  const pipeline = redis2.pipeline();
  for (const key of keys2) {
    const value = await redis2.get(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.userId === userId) {
          pipeline.del(key);
        }
      } catch {
      }
    }
  }
  await pipeline.exec();
}

// src/shared/middlewares/middlewareConfig.ts
var getClientIp = (req) => {
  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (typeof cfConnectingIp === "string" && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};
var getRateLimitKey = (req) => {
  const userId = req.user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${getClientIp(req)}`;
};
var createRedisStore = (prefix) => new RedisStore({
  sendCommand: (...args) => getRedisClient().call(args[0], ...args.slice(1)),
  prefix
});
var generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 300,
  keyGenerator: getRateLimitKey,
  store: createRedisStore("rl:general:"),
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 50,
  keyGenerator: (req) => `ip:${getClientIp(req)}`,
  store: createRedisStore("rl:auth:"),
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
var atsLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 15,
  keyGenerator: getRateLimitKey,
  store: createRedisStore("rl:ats:"),
  message: { message: "ATS scan limit reached. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
var resumeLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 20,
  keyGenerator: getRateLimitKey,
  store: createRedisStore("rl:resume:"),
  message: { message: "Resume builder limit reached. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
var applyMiddleware = (app2) => {
  app2.use(
    /** ----------------------------------------------
     * Security Headers (Helmet)
     * Protects against common web vulnerabilities
     ------------------------------------------------*/
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app2.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          env.frontendUrl,
          "http://localhost:5173",
          "http://localhost:4173",
          "http://localhost:3000"
        ];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  app2.use(express.json({ limit: "10mb" }));
  app2.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app2.use(cookieParser());
  const uploadsDir2 = path2.join(__dirname, "..", "..", "uploads");
  app2.use("/uploads", express.static(uploadsDir2));
  passport2.use(configureGoogleStrategy());
  app2.use("/api/auth/login", authLimiter);
  app2.use("/api/auth/register", authLimiter);
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
var createUser = async (userData) => {
  const { name, email, password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      preferences: {
        theme: "system",
        notifications: true
      },
      subscription: {
        plan: "free",
        credits: 3
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      preferences: true,
      role: true,
      subscription: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return user;
};
var findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      googleId: true,
      picture: true,
      preferences: true,
      role: true,
      isBanned: true,
      subscription: true,
      createdAt: true,
      updatedAt: true
    }
  });
};
var findUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      preferences: true,
      role: true,
      subscription: true,
      createdAt: true,
      updatedAt: true
    }
  });
};
var validatePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
var createTokens = (userId, email) => {
  const accessToken = generateAccessToken({
    userId,
    email
  });
  const refreshToken2 = generateRefreshToken({
    userId,
    email
  });
  return { accessToken, refreshToken: refreshToken2 };
};
var verifyRefreshTokenAndGetUserId = (refreshToken2) => {
  return verifyRefreshToken(refreshToken2);
};
var generateNewAccessToken = (userId, email) => {
  return generateAccessToken({ userId, email });
};

// src/modules/auth/auth.controller.ts
var register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }
    const user = await createUser({ name, email, password });
    const { accessToken, refreshToken: refreshToken2 } = createTokens(user.id, user.email);
    await deleteAllRefreshTokensForUser(user.id);
    await storeRefreshToken(refreshToken2, user.id, 1 * 24 * 60 * 60);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          preferences: user.preferences,
          subscription: user.subscription
        },
        accessToken,
        refreshToken: refreshToken2
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user"
    });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Please login with Google"
      });
    }
    const isMatch = await validatePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Contact support."
      });
    }
    const subscription = await applyDailyCreditReset(
      user.id,
      user.subscription
    );
    const { accessToken, refreshToken: refreshToken2 } = createTokens(user.id, user.email);
    await deleteAllRefreshTokensForUser(user.id);
    await storeRefreshToken(refreshToken2, user.id, 1 * 24 * 60 * 60);
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          preferences: user.preferences,
          subscription
        },
        accessToken,
        refreshToken: refreshToken2
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in"
    });
  }
};
var getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user"
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : void 0;
    const refreshTokenValue = bearerToken || req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshTokenValue) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided"
      });
    }
    const decoded = verifyRefreshTokenAndGetUserId(refreshTokenValue);
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    const newAccessToken = generateNewAccessToken(user.id, user.email);
    res.json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken: newAccessToken,
        refreshToken: refreshTokenValue
      }
    });
  } catch (error) {
    console.error("[refresh] failed:", error);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }
};
var logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : void 0;
    const refreshToken2 = bearerToken || req.cookies?.refreshToken || req.body.refreshToken;
    if (refreshToken2) {
      await deleteRefreshToken(refreshToken2);
    }
    if (req.cookies?.accessToken || req.cookies?.refreshToken) {
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });
    }
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  }
};

// src/modules/auth/auth.routes.ts
var router = Router();
router.post("/register", register);
router.post("/login", login);
router.get(
  "/google",
  authLimiter,
  passport3.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account"
  })
);
router.get(
  "/google/callback",
  passport3.authenticate("google", {
    session: false,
    failureRedirect: `${env.frontendUrl}/login?error=auth_failed`
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email
      });
      const refreshToken2 = generateRefreshToken({
        userId: user.id,
        email: user.email
      });
      await deleteAllRefreshTokensForUser(user.id);
      await storeRefreshToken(refreshToken2, user.id, 1 * 24 * 60 * 60);
      const redirectUrl = new URL(`${env.frontendUrl}/`);
      redirectUrl.searchParams.set("accessToken", accessToken);
      redirectUrl.searchParams.set("refreshToken", refreshToken2);
      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${env.frontendUrl}/login?error=callback_failed`);
    }
  }
);
router.get("/me", authenticate, getMe);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
var auth_routes_default = router;

// src/modules/users/users.routes.ts
import { Router as Router2 } from "express";

// src/modules/users/users.service.ts
var getUserProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      preferences: true,
      subscription: true,
      createdAt: true,
      updatedAt: true
    }
  });
};
var updateUserProfile = async (userId, updateData) => {
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      preferences: true,
      subscription: true,
      createdAt: true,
      updatedAt: true
    }
  });
};
var deleteUserAccount = async (userId) => {
  await prisma.payment.deleteMany({ where: { userId } });
  await prisma.atsScoreHistory.deleteMany({ where: { userId } });
  await prisma.analysis.deleteMany({ where: { userId } });
  await prisma.atsScore.deleteMany({ where: { userId } });
  await prisma.resume.deleteMany({ where: { userId } });
  return prisma.user.delete({ where: { id: userId } });
};

// src/modules/users/users.validation.ts
import { z } from "zod";
var updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    defaultTemplate: z.string().optional(),
    notifications: z.boolean().optional()
  }).optional()
});

// src/modules/users/users.controller.ts
var getProfile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile"
    });
  }
};
var updateProfile = async (req, res) => {
  try {
    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message
      });
    }
    const user = await updateUserProfile(req.user.id, result.data);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
};
var deleteAccount = async (req, res) => {
  try {
    await deleteUserAccount(req.user.id);
    const isProduction = env.nodeEnv === "production";
    const cookieConfig = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/"
    };
    res.cookie("accessToken", "", { ...cookieConfig, maxAge: 0 });
    res.cookie("refreshToken", "", { ...cookieConfig, maxAge: 0 });
    res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting account"
    });
  }
};

// src/modules/users/users.routes.ts
var router2 = Router2();
router2.get("/profile", authenticate, getProfile);
router2.put("/profile", authenticate, updateProfile);
router2.delete("/account", authenticate, deleteAccount);
var users_routes_default = router2;

// src/modules/ats-score-check/atsScoreCheck.routes.ts
import { Router as Router3 } from "express";

// src/shared/config/multer.ts
import multer from "multer";
import path3 from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
var isVercel = process.env.VERCEL === "1";
var uploadsDir;
if (isVercel) {
  uploadsDir = "/tmp/uploads";
} else {
  uploadsDir = path3.join(__dirname, "..", "..", "uploads");
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var getUploadsDir = () => uploadsDir;
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path3.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
var fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf"
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
var upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSize
  }
});
var uploadErrorHandler = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${env.maxFileSize / (1024 * 1024)}MB.`
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// src/modules/ats-score-check/atsScoreCheck.controller.ts
import fs4 from "fs";

// src/modules/ats-score-check/services/resumeParser.service.ts
init_resume_parser();
import fs3 from "fs";

// src/shared/config/gemini.ts
import { GoogleGenAI } from "@google/genai";

// src/shared/ai/gemini/geminiErrors.ts
import { ApiError } from "@google/genai";
var AiQuotaError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "AiQuotaError";
  }
};
var isGeminiQuotaError = (error) => {
  if (error instanceof ApiError) {
    return error.status === 429 || error.status === 403;
  }
  const err = error;
  const msg = String(err?.message ?? error ?? "").toLowerCase();
  return msg.includes("quota") || msg.includes("rate limit") || msg.includes("resource_exhausted") || msg.includes("429") || msg.includes("403");
};
var throwIfQuotaError = (error) => {
  if (isGeminiQuotaError(error)) {
    throw new AiQuotaError(
      "AI service quota exceeded. Please try again tomorrow."
    );
  }
};

// src/shared/config/gemini.ts
var GEMINI_MODEL = "gemini-2.5-flash";
var keys = [env.geminiApiKey, env.geminiApiKeySecondary].filter(
  Boolean
);
var activeIndex = 0;
function getClient(index) {
  return new GoogleGenAI({ apiKey: keys[index] });
}
async function generateContentWithFailover(params) {
  for (let attempt = 0; attempt < keys.length + 1; attempt++) {
    const keyIndex = (activeIndex + attempt) % keys.length;
    try {
      const client = getClient(keyIndex);
      const result = await client.models.generateContent(params);
      activeIndex = keyIndex;
      return result;
    } catch (error) {
      if (!isGeminiQuotaError(error)) throw error;
      console.warn(`[gemini] key ${keyIndex} quota exceeded`);
    }
  }
  throw new Error("AI service quota exceeded. Please try again tomorrow.");
}

// src/shared/ai/cache/aiCache.ts
import crypto from "crypto";
var DEFAULT_TTL = env.aiCacheTtl || 7 * 24 * 60 * 60;
function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
function normalizeJD(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ").replace(/[•\-–—]/g, " ").replace(/\s*([.,;:!?])\s*/g, "$1 ").replace(/\s+/g, " ").trim();
}
function hashJD(text) {
  return crypto.createHash("sha256").update(normalizeJD(text)).digest("hex");
}
function buildResumeKey(hash) {
  return `ai:resume:${env.promptVersion}:${hash}`;
}
function buildJDKey(hash) {
  return `ai:jd:${env.promptVersion}:${hash}`;
}
async function getCache(key) {
  try {
    const redis2 = getRedisClient();
    const val = await redis2.get(key);
    if (!val) return null;
    return JSON.parse(val);
  } catch (err) {
    console.warn(`[cache] get failed for ${key}`, err);
    return null;
  }
}
async function setCache(key, value, ttlSec = DEFAULT_TTL) {
  try {
    const redis2 = getRedisClient();
    await redis2.setex(key, ttlSec, JSON.stringify(value));
  } catch (err) {
    console.warn(`[cache] set failed for ${key}`, err);
  }
}

// src/shared/ai/gemini/pdfResumeResearch.ts
var RESEARCH_PROMPT = `
You are an expert AI resume researcher. Your task is to analyze the provided resume VERY carefully and extract all information from it accurately.

RESEARCH THE FOLLOWING DETAILS:
1. Personal info (full name, job title, contact: address, email, phone)
2. Professional summary
3. Work experience (role, company, startDate, endDate, responsibilities as bullet points)
4. Education (degree, field of study, education level (e.g. "Bachelor's", "Master's", "PhD", "Associate's"), startDate, endDate)
5. Skills:
   - hardSkills: ONLY technical skills and keywords (programming languages, frameworks, libraries, databases, cloud platforms, DevOps tools, software, technologies, APIs, etc.) - return ONLY the keyword names
   - softSkills: ONLY non-technical interpersonal and professional skills (communication, leadership, teamwork, problem-solving, time management, adaptability, etc.) - DO NOT include any technical skills or technologies
6. Projects (name, description as bullet points, startDate, endDate)
 7. yearsOfExperience: total years of professional work experience (e.g. "5 years" or "5+ years")
 8. measurableResults: array of strings \u2014 every experience bullet that contains a measurable impacts. More focus on experience section and less focus on projects section. Return [] if none.
 9. actionVerbs: array of strings \u2014 the distinct strong action verbs found at the start of experience bullets (e.g. "led", "built", "optimized", "launched"). ore focus on experience section and less focus on projects section. Return [] if none.
 10. wordCount: total number of words in the resume.
10. educationSection: true if an education section exists.
11. experienceSection: true if an experience/work section exists.
12. workHistory: true if there is AT LEAST ONE work experience entry.
13. dateFormatting: true if dates use "MM/YY or MM/YYYY or Month YYYY" format (e.g. 03/19, 03/2019, Mar 2019 or March 2019). false otherwise.
14. layout: analyze the given PDF very carefully and answer the following questions correctly:
    - isSingleColumn: true if the resume uses a single column layout
    - hasTables: true if tables are used in the layout
    - hasImages: true if images/photos are present
    - hasIcons: true if icons/graphics are present
    - hasMultiColumn: true if the resume uses a multi-column layout
16. fontCheck: analyze the given PDF very carefully and answer the following questions correctly. I must need these answer correctly:
    - isStandardFont: true if a standard/ATS-friendly font is used (Arial, Calibri, Times New Roman, Helvetica, Georgia, Verdana, etc.)
    - fontName: the primary font name of resume text.
    - isReadableSize: true if the font size is readable (typically 10-12pt body text)

STRICT RULES:
- NO field is required. If a piece of information is NOT present in the resume, set it to empty: "" for strings, [] for arrays, false for booleans.
- Do NOT invent or hallucinate information. Only extract what is actually present in the resume.
- CANONICALIZE hardSkills: for each distinct technology/framework/library/tool, return EXACTLY ONE canonical keyword. Merge all spelling variants of the same skill into a single name (e.g. "React", "React.js", "ReactJS", "react js" \u2192 "React"; "Node.js", "NodeJS", "Node" \u2192 "Node.js"; "JavaScript", "JS" \u2192 "JavaScript"; "Next.js", "NextJS" \u2192 "Next.js"). NEVER list two different spellings of the same skill as separate entries.
- Each hardSkills entry must be a single skill name - never phrases like "X and Y" or "X, Y".
- Return ONLY valid JSON matching the exact structure below. No markdown, no extra text, no explanations.

JSON STRUCTURE:
{
  "personal_info": {
    "fullName": "",
    "jobTitle": "",
    "contact": {
      "address": "",
      "email": "",
      "phone": "",
    }
  },
  "summary": "",
  "experience": [
    {
      "role": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": [""]
    }
  ],
  "education": [
    {
      "degree": "",
      "field": "",
      "education_level": "",
      "startDate": "",
      "endDate": "",
    }
  ],
  "skills": {
    "hardSkills": [""],
    "softSkills": [""]
  },
  "projects": [
    {
      "name": "",
      "description": [""],
      "startDate": "",
      "endDate": "",
    }
  ]
  ],
  "yearsOfExperience": "",
  "measurableResults": [],
  "actionVerbs": [],
  "wordCount": "",
  "educationSection": false,
  "experienceSection": false,
  "workHistory": false,
  "dateFormatting": false,
  "layout": {
    "isSingleColumn": false,
    "hasTables": false,
    "hasImages": false,
    "hasIcons": false,
    "hasMultiColumn": false
  },
  "fontCheck": {
    "isStandardFont": false,
    "fontName": "",
    "isReadableSize": false,
  }
}
`;
var researchResume = async (resumeText, fileBase64, mimeType, fileBuffer) => {
  if (fileBuffer && fileBase64 && mimeType) {
    const hash = hashBuffer(fileBuffer);
    const key = buildResumeKey(hash);
    const cached = await getCache(key);
    if (cached) {
      console.log(`[cache] resume hit ${key}`);
      return cached;
    }
  }
  const parts = [];
  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        mimeType,
        data: fileBase64
      }
    });
    parts.push({ text: RESEARCH_PROMPT });
  } else {
    const textPart = `${RESEARCH_PROMPT}

FULL RESUME CONTENT:
${resumeText}

Research this resume thoroughly and return ONLY the valid JSON structure specified above.
`;
    parts.push({ text: textPart });
  }
  try {
    const result = await generateContentWithFailover({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts }]
    });
    const text = result.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }
    const raw2 = JSON.parse(jsonMatch[0]);
    const normalized = normalizeResearchResult(raw2);
    if (fileBuffer) {
      const hash = hashBuffer(fileBuffer);
      const key = buildResumeKey(hash);
      await setCache(key, normalized);
      console.log(`[cache] resume set ${key}`);
    }
    return normalized;
  } catch (error) {
    console.error("Resume research error:", error);
    throwIfQuotaError(error);
    throw new Error("Failed to research resume");
  }
};
var normalizeResearchResult = (raw2) => {
  const str = (v, fallback = "") => {
    if (typeof v === "string") return v;
    if (v == null) return fallback;
    return String(v);
  };
  const bool = (v, fallback = false) => {
    if (typeof v === "boolean") return v;
    if (v == null) return fallback;
    return Boolean(v);
  };
  const arr = (v) => {
    if (Array.isArray(v)) return v;
    return [];
  };
  return {
    personal_info: {
      fullName: str(raw2?.personal_info?.fullName),
      jobTitle: str(raw2?.personal_info?.jobTitle),
      contact: {
        address: str(raw2?.personal_info?.contact?.address),
        email: str(raw2?.personal_info?.contact?.email),
        phone: str(raw2?.personal_info?.contact?.phone)
      }
    },
    summary: str(raw2?.summary),
    experience: arr(raw2?.experience).map((exp) => ({
      role: str(exp?.role),
      company: str(exp?.company),
      startDate: str(exp?.startDate),
      endDate: str(exp?.endDate),
      responsibilities: arr(exp?.responsibilities).map((v) => str(v))
    })),
    education: arr(raw2?.education).map((edu) => ({
      degree: str(edu?.degree),
      field: str(edu?.field),
      education_level: str(edu?.education_level),
      startDate: str(edu?.startDate),
      endDate: str(edu?.endDate)
    })),
    skills: {
      // hardSkills: normalizeHardSkills(
      //   arr(raw?.skills?.hardSkills).map((v: any) => str(v)),
      // ),
      hardSkills: arr(raw2?.skills?.hardSkills).map((v) => str(v)),
      softSkills: arr(raw2?.skills?.softSkills).map((v) => str(v))
    },
    projects: arr(raw2?.projects).map((proj) => ({
      name: str(proj?.name),
      description: arr(proj?.description).map((v) => str(v)),
      startDate: str(proj?.startDate),
      endDate: str(proj?.endDate)
    })),
    yearsOfExperience: str(raw2?.yearsOfExperience),
    measurableResults: arr(raw2?.measurableResults).map((v) => str(v)),
    actionVerbs: arr(raw2?.actionVerbs).map((v) => str(v)),
    wordCount: str(raw2?.wordCount),
    educationSection: bool(raw2?.educationSection),
    experienceSection: bool(raw2?.experienceSection),
    workHistory: bool(raw2?.workHistory),
    dateFormatting: bool(raw2?.dateFormatting),
    layout: {
      isSingleColumn: bool(raw2?.layout?.isSingleColumn, true),
      hasTables: bool(raw2?.layout?.hasTables),
      hasImages: bool(raw2?.layout?.hasImages),
      hasIcons: bool(raw2?.layout?.hasIcons),
      hasMultiColumn: bool(raw2?.layout?.hasMultiColumn)
    },
    fontCheck: {
      isStandardFont: bool(raw2?.fontCheck?.isStandardFont, true),
      fontName: str(raw2?.fontCheck?.fontName),
      isReadableSize: bool(raw2?.fontCheck?.isReadableSize, true)
    }
  };
};

// src/modules/ats-score-check/services/resumeParser.service.ts
var parseResume = async (filePath, originalName, mimetype) => {
  const parsed = await parseResumeFile(filePath, mimetype);
  const fileBuffer = fs3.readFileSync(filePath);
  const fileBase64 = fileBuffer.toString("base64");
  let aiResearch = null;
  try {
    aiResearch = await researchResume(parsed.text, fileBase64, mimetype, fileBuffer);
  } catch (aiError) {
    console.error("AI research failed, falling back to parsed data:", aiError);
  }
  return {
    resumeName: originalName,
    aiResearch
  };
};

// src/shared/ai/gemini/jobDescriptionResearch.ts
var JD_RESEARCH_PROMPT = `
You are an expert AI job description researcher. Analyze the provided job description VERY carefully and extract all information accurately.

RESEARCH THE FOLLOWING DETAILS:
1. jobTitle: The job title/position being offered (e.g. "Senior Software Engineer", "Data Analyst")
2. education: Required education background:
   - degree: The specific degree name (e.g. "Bachelor of Science", "Bachelor's")
   - field: The field of study (e.g. "Computer Science", "Engineering")
   - education_level: The education level (e.g. "Bachelor's", "Master's", "PhD", "Associate's")
3. skills:
   - hardSkills: ONLY technical skills and keywords (programming languages, frameworks, libraries, databases, cloud platforms, DevOps tools, software, technologies, APIs, etc.) - return ONLY the keyword names
   - softSkills: ONLY non-technical interpersonal and professional skills (communication, leadership, teamwork, problem-solving, time management, adaptability, etc.) - DO NOT include any technical skills or technologies
4. yearsOfExperience: Total years of experience required (e.g. "3-5 years", "5+ years", "2 years")

STRICT RULES:
- NO field is required. If a piece of information is NOT present in the job description, set it to empty: "" for strings, [] for arrays.
- Do NOT invent or hallucinate information. Only extract what is actually present.
- hardSkills must ONLY contain pure keyword names, never descriptions or phrases.
- CANONICALIZE hardSkills: for each distinct technology/framework/library/tool, return EXACTLY ONE canonical keyword. Merge all spelling variants of the same skill into a single name (e.g. "React", "React.js", "ReactJS", "react js" \u2192 "React"; "Node.js", "NodeJS", "Node" \u2192 "Node.js"; "JavaScript", "JS" \u2192 "JavaScript"; "Next.js", "NextJS" \u2192 "Next.js"). NEVER list two different spellings of the same skill as separate entries.
- Each hardSkills entry must be a single skill name - never phrases like "X and Y" or "X, Y".
- Return ONLY valid JSON matching the exact structure below. No markdown, no extra text, no explanations.

JSON STRUCTURE:
{
  "jobTitle": "",
  "education": {
    "degree": "",
    "field": "",
    "education_level": ""
  },
  "skills": {
    "hardSkills": [""],
    "softSkills": [""]
  },
  "yearsOfExperience": ""
}
`;
var researchJobDescription = async (jdText) => {
  const hash = hashJD(jdText);
  const key = buildJDKey(hash);
  const cached = await getCache(key);
  if (cached) {
    console.log(`[cache] jd hit ${key}`);
    return cached;
  }
  const textPart = `${JD_RESEARCH_PROMPT}

FULL JOB DESCRIPTION:
${jdText}

Research this job description thoroughly and return ONLY the valid JSON structure specified above.
`;
  try {
    const result = await generateContentWithFailover({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: textPart }] }]
    });
    const text = result.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }
    const raw2 = JSON.parse(jsonMatch[0]);
    const normalized = normalizeJDResearchResult(raw2);
    await setCache(key, normalized);
    console.log(`[cache] jd set ${key}`);
    return normalized;
  } catch (error) {
    console.error("Job description research error:", error);
    throwIfQuotaError(error);
    throw new Error("Failed to research job description");
  }
};
var normalizeJDResearchResult = (raw2) => {
  const str = (v, fallback = "") => {
    if (typeof v === "string") return v;
    if (v == null) return fallback;
    return String(v);
  };
  const arr = (v) => {
    if (Array.isArray(v)) return v;
    return [];
  };
  return {
    jobTitle: str(raw2?.jobTitle),
    education: {
      degree: str(raw2?.education?.degree),
      field: str(raw2?.education?.field),
      education_level: str(raw2?.education?.education_level)
    },
    skills: {
      // hardSkills: normalizeHardSkills(
      //   arr(raw?.skills?.hardSkills).map((v: any) => str(v)),
      // ),
      hardSkills: arr(raw2?.skills?.hardSkills).map((v) => str(v)),
      softSkills: arr(raw2?.skills?.softSkills).map((v) => str(v))
    },
    yearsOfExperience: str(raw2?.yearsOfExperience)
  };
};

// src/modules/ats-score-check/services/jobDescription.service.ts
var parseJobDescription = async (description) => {
  return researchJobDescription(description.trim());
};
var mapAIToStructuredJD = (aiJD) => {
  if (!aiJD || !aiJD.skills) return null;
  const yearsMatch = (aiJD.yearsOfExperience || "").match(/(\d+)/);
  const experienceYearsRequired = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
  return {
    jobTitle: aiJD.jobTitle || "",
    education: {
      degree: aiJD.education?.degree || "",
      field: aiJD.education?.field || "",
      education_level: aiJD.education?.education_level || ""
    },
    skills: {
      hardSkills: aiJD.skills.hardSkills || [],
      softSkills: aiJD.skills.softSkills || []
    },
    yearsOfExperience: aiJD.yearsOfExperience || "",
    experienceYearsRequired
  };
};

// src/shared/scoring/constants.ts
var CATEGORY_WEIGHTS = {
  hardSkills: 40,
  searchability: 25,
  formatting: 15,
  softSkills: 10,
  recruiterTips: 10
};
var ATS_DATE_RE = /^(present|current|now|ongoing|\d{1,2}\/\d{2}(\d{2})?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s?\d{4})$/i;

// src/shared/scoring/keywords.ts
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function normalizeJobTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "").trim();
}
function jobTitleMatches(resumeText, jdTitle) {
  if (!jdTitle) return false;
  const normalizedJd = normalizeJobTitle(jdTitle);
  const normalizedResume = normalizeJobTitle(resumeText);
  if (!normalizedJd) return false;
  if (normalizedResume.includes(normalizedJd)) return true;
  const jdTokens = normalizedJd.split(/\s+/).filter(Boolean);
  return jdTokens.length > 0 && jdTokens.every((t) => normalizedResume.includes(t));
}
function getSkillVariants(canonical) {
  return [canonical];
}
function countVariantsInText(text, variants) {
  const textLower = text.toLowerCase();
  return variants.reduce((total, variant, index) => {
    const isAlias = index > 0;
    const escaped = escapeRegex(variant);
    const pattern = isAlias ? `(?<![\\w.-])${escaped}(?![\\w-])` : `\\b${escaped}\\b`;
    const matches = textLower.match(new RegExp(pattern, "gi"));
    return total + (matches ? matches.length : 0);
  }, 0);
}

// src/shared/scoring/utils.ts
var toResumeText = (resume) => {
  const parts = [];
  if (resume.personalInfo?.fullName) parts.push(resume.personalInfo.fullName);
  if (resume.personalInfo?.jobTitle) parts.push(resume.personalInfo.jobTitle);
  if (resume.summary) parts.push(resume.summary);
  resume.experience?.forEach((exp) => {
    parts.push(`${exp.role || ""} at ${exp.company || ""}`);
    parts.push((exp.responsibilities || []).join(" "));
  });
  if (resume.skills?.hardSkills?.length)
    parts.push(resume.skills.hardSkills.join(" "));
  if (resume.skills?.softSkills?.length)
    parts.push(resume.skills.softSkills.join(" "));
  resume.education?.forEach((edu) => {
    parts.push(`${edu.degree || ""} || ""}`);
  });
  resume.projects?.forEach((proj) => {
    parts.push(`${proj.name || ""}: ${(proj.description || []).join(" ")}`);
  });
  return parts.filter(Boolean).join("\n");
};
var buildMatchCategory = (resumeText, items, isPresent) => {
  if (!items?.length) {
    return { score: 0, matched: [], missing: [], items: [] };
  }
  const results = items.map((item) => {
    const present = isPresent(resumeText, item);
    return {
      item,
      status: present ? "matched" : "missing",
      jdCount: 1,
      resumeCount: present ? 1 : 0,
      itemScore: present ? 100 : 0
    };
  });
  const score = Math.round(
    results.reduce((sum2, r) => sum2 + r.itemScore, 0) / results.length
  );
  return {
    score,
    matched: results.filter((r) => r.status === "matched").map((r) => r.item),
    missing: results.filter((r) => r.status === "missing").map((r) => r.item),
    items: results.map(({ item, status, jdCount, resumeCount }) => ({
      item,
      status,
      jdCount,
      resumeCount
    }))
  };
};
var scoreFromChecks = (checks) => {
  let earned = 0, total = 0;
  for (const c of checks) {
    if (c.status === "not-applicable" || c.weight <= 0) continue;
    total += c.weight;
    if (c.status === "passed") earned += c.weight;
  }
  return total === 0 ? 0 : Math.round(earned / total * 100);
};
var scoreFromSubgroups = (subgroups) => {
  let earned = 0, total = 0;
  for (const s of subgroups) {
    const allNotApplicable = s.checks.every((c) => c.status === "not-applicable");
    if (allNotApplicable) continue;
    total += s.weight;
    earned += s.score / 100 * s.weight;
  }
  return total === 0 ? 0 : Math.round(earned / total * 100);
};
var deriveFeedback = (checks) => {
  const strengths = [];
  const improvements = [];
  for (const c of checks) {
    if (c.status === "not-applicable" || c.weight <= 0) continue;
    if (c.status === "passed") strengths.push(c.detail);
    else improvements.push(`${c.label}: ${c.detail}`);
  }
  return { strengths, improvements };
};
var educationScore = (resume, jdEducation) => {
  const resumeEdu = resume.education || [];
  const LEVEL_RANK = {
    "high school": 1,
    secondary: 1,
    diploma: 2,
    associate: 2,
    "associate's degree": 2,
    bachelor: 3,
    "bachelor's": 3,
    "bachelor's degree": 3,
    undergraduate: 3,
    bsc: 3,
    ba: 3,
    master: 4,
    "master's": 4,
    "master's degree": 4,
    msc: 4,
    ma: 4,
    mba: 4,
    postgraduate: 4,
    phd: 5,
    doctorate: 5,
    doctoral: 5
  };
  const getRank = (text) => {
    const t = text.toLowerCase();
    let bestRank = 0;
    for (const key in LEVEL_RANK) {
      if (t.includes(key)) {
        bestRank = Math.max(bestRank, LEVEL_RANK[key]);
      }
    }
    return bestRank;
  };
  if (!jdEducation || !jdEducation.education_level) {
    return 0;
  }
  if (!resumeEdu.length) return 0;
  const jdRank = getRank(jdEducation.education_level);
  const resumeRanks = resumeEdu.map(
    (edu) => getRank(`${edu.degree} ${edu.field} ${edu.education_level}`)
  );
  const resumeMaxRank = Math.max(...resumeRanks, 0);
  if (jdRank === 0) {
    const eduText = resumeEdu.map((edu) => `${edu.degree} ${edu.field} ${edu.education_level}`).join(" ").toLowerCase();
    const jdLevel = jdEducation.education_level.toLowerCase().trim();
    return eduText.includes(jdLevel) ? 100 : 45;
  }
  if (resumeMaxRank === 0) return 45;
  if (resumeMaxRank === jdRank) return 100;
  if (resumeMaxRank > jdRank) return 95;
  if (resumeMaxRank === jdRank - 1) return 55;
  return 30;
};
var parseYearsOfExperience = (raw2) => {
  if (raw2 == null || raw2 === "") return 0;
  if (typeof raw2 === "number") return isNaN(raw2) ? 0 : Math.round(raw2 * 10) / 10;
  const str = String(raw2).toLowerCase().trim();
  if (!str) return 0;
  let totalYears = 0;
  let foundUnit = false;
  const yearRe = /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\b/g;
  let m;
  while ((m = yearRe.exec(str)) !== null) {
    totalYears += parseFloat(m[1]);
    foundUnit = true;
  }
  const monthRe = /(\d+(?:\.\d+)?)\s*(?:months?|mos?)\b/g;
  while ((m = monthRe.exec(str)) !== null) {
    totalYears += parseFloat(m[1]) / 12;
    foundUnit = true;
  }
  if (foundUnit) return Math.round(totalYears * 10) / 10;
  const nums = str.match(/\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
};
var computeYearsFromExperienceDates = (resume) => {
  if (!resume.experience?.length) return 0;
  const MONTH_MAP = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11
  };
  const parseDate = (raw2) => {
    const s = raw2.trim().toLowerCase();
    if (!s || /^(present|current|now|ongoing|till date)$/.test(s)) return /* @__PURE__ */ new Date();
    const native = new Date(raw2);
    if (!isNaN(native.getTime()) && /\d{4}/.test(raw2)) return native;
    const mmmY = s.match(/^([a-z]+)\s+(\d{4})$/);
    if (mmmY) {
      const mon = MONTH_MAP[mmmY[1]];
      const yr = parseInt(mmmY[2], 10);
      if (mon !== void 0 && !isNaN(yr)) return new Date(yr, mon, 1);
    }
    const mmY = s.match(/^(\d{1,2})[\/\-](\d{4})$/);
    if (mmY) {
      const mon = parseInt(mmY[1], 10) - 1;
      const yr = parseInt(mmY[2], 10);
      if (mon >= 0 && mon < 12) return new Date(yr, mon, 1);
    }
    return null;
  };
  let totalMonths = 0;
  for (const exp of resume.experience) {
    const start = exp.startDate ? parseDate(exp.startDate) : null;
    const end = exp.endDate ? parseDate(exp.endDate) : /* @__PURE__ */ new Date();
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) continue;
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months > 0 && months < 600) totalMonths += months;
  }
  if (totalMonths <= 0) return 0;
  return Math.round(totalMonths / 12 * 10) / 10;
};
var getResumeYears = (resume) => {
  const parsed = parseYearsOfExperience(resume.yearsOfExperience);
  if (parsed > 0) return parsed;
  return computeYearsFromExperienceDates(resume);
};
var countMeasurableResults = (resume) => {
  const found = Array.isArray(resume.measurableResults) ? resume.measurableResults : [];
  return { count: found.length, found: found.slice(0, 5) };
};
var measurableResultsScore = (count) => count >= 5 ? 100 : count === 4 ? 80 : count === 3 ? 60 : count === 2 ? 40 : count === 1 ? 20 : 0;
var countActionVerbs = (resume) => {
  const found = Array.isArray(resume.actionVerbs) ? resume.actionVerbs : [];
  return { count: found.length, found: found.slice(0, 5) };
};
var actionVerbsScore = (count) => count >= 5 ? 100 : count === 4 ? 80 : count === 3 ? 60 : count === 2 ? 40 : count === 1 ? 20 : 0;
var summaryScore = (summaryWords) => summaryWords >= 30 && summaryWords <= 80 ? 100 : summaryWords >= 80 ? 60 : summaryWords >= 10 ? 40 : summaryWords > 0 ? 20 : 0;
var collectResumeDates = (resume) => {
  const dates = [];
  const push = (raw2) => {
    if (!raw2) return;
    raw2.split(/\s*(?:–|-|to)\s*/i).map((p) => p.trim()).filter(Boolean).forEach((p) => dates.push(p));
  };
  resume.experience?.forEach((exp) => {
    push(exp.startDate);
    if (exp.endDate) push(exp.endDate);
  });
  resume.education?.forEach((edu) => {
    push(edu.startDate);
    if (edu.endDate) push(edu.endDate);
  });
  resume.projects?.forEach((p) => {
    push(p.startDate);
    if (p.endDate) push(p.endDate);
  });
  return dates;
};

// src/shared/scoring/searchability.ts
var buildContactInfoSubgroup = (resume) => {
  const contact = resume.personalInfo?.contact || {};
  const address = contact.address;
  const hasEmail = !!contact.email;
  const hasPhone = !!contact.phone || !!resume.personalInfo?.phone;
  const hasAddress = typeof address === "string" ? address.trim().length > 0 : !!(address?.city || address?.state);
  const checks = [
    {
      label: "Physical address",
      status: hasAddress ? "passed" : "failed",
      detail: hasAddress ? "Your physical address is included, allowing recruiters to verify your location eligibility for role requirements." : "No physical address found. Adding your city and state helps recruiters assess location fit for your role.",
      weight: 10
    },
    {
      label: "Email address",
      status: hasEmail ? "passed" : "failed",
      detail: hasEmail ? "You provided your email. Recruiters use your email to contact you for job matches." : "No email address found. This is a critical missing field\u2014without it, recruiters cannot reach you for opportunities.",
      weight: 10
    },
    {
      label: "Phone number",
      status: hasPhone ? "passed" : "failed",
      detail: hasPhone ? "You provided your phone number." : "No phone number found. You should include it.",
      weight: 10
    }
  ];
  const passed = checks.filter((c) => c.status === "passed").length;
  return {
    key: "contactInfo",
    title: "Contact Information",
    score: scoreFromChecks(checks),
    weight: 30,
    summary: passed === 3 ? "Full contact information provided." : `${passed} of 3 contact details provided.`,
    checks
  };
};
var buildSectionHeadingsSubgroup = (resume) => {
  const educationCount = resume.education?.length || 0;
  const experienceCount = resume.experience?.length || 0;
  const hasEducation = educationCount > 0;
  const hasExperience = experienceCount > 0;
  const checks = [
    {
      label: "Education section",
      status: hasEducation ? "passed" : "failed",
      detail: hasEducation ? `Your resume includes an education section heading, which helps ATS systems properly identify and parse your academic credentials for better job matching.` : `Your resume is missing an education section heading. ATS systems rely on standard section labels to categorize your information correctly.`,
      weight: 10
    },
    {
      label: "Experience section heading",
      status: hasExperience ? "passed" : "failed",
      detail: hasExperience ? `Your resume includes a recognized experience section heading, which helps ATS properly identify your work history.` : `Your resume is missing a recognized experience section heading. ATS systems rely on standard section labels to categorize your information correctly.`,
      weight: 10
    },
    {
      label: "Work history found",
      status: hasExperience ? "passed" : "failed",
      detail: hasExperience ? `We found work history in your resume.` : "No work history found in your resume.",
      weight: 10
    }
  ];
  const passed = checks.filter((c) => c.status === "passed").length;
  return {
    key: "sectionHeadings",
    title: "Section Headings",
    score: scoreFromChecks(checks),
    weight: 30,
    summary: passed === 3 ? "All standard section headings recognized." : `${passed} of 3 section checks passed.`,
    checks
  };
};
var buildJobTitleSubgroup = (resumeText, jd) => {
  const title = jd?.jobTitle || "";
  let status;
  let detail = "";
  if (!title) {
    status = "failed";
    detail = "No job title detected from job description. Add a job title at the top of your provided job description.";
  } else {
    const hasMatch = jobTitleMatches(resumeText, title);
    status = hasMatch ? "passed" : "failed";
    detail = hasMatch ? `The job title "${title}" from the job description was found in your resume, indicating a strong match with the role you're applying for.` : `The job title "${title}" from the job description was not found in your resume. We recommend having the exact title of the job for which you're applying in your resume.`;
  }
  const checks = [
    { label: "Job title match", status, detail, weight: 20 }
  ];
  return {
    key: "jobTitleMatch",
    title: "Job Title Match",
    score: scoreFromChecks(checks),
    weight: 20,
    summary: status === "passed" ? `Job title "${title}" found.` : `Job title "${title}" not found.`,
    checks
  };
};
var buildDateFormattingSubgroup = (resume) => {
  const dates = collectResumeDates(resume);
  const bad = dates.filter((d) => !ATS_DATE_RE.test(d));
  let status;
  let detail;
  if (!dates.length) {
    status = "failed";
    detail = "No dates found to check for ATS-friendly formats (e.g. 03/26, 03/2026, Mar 2026 or March 2026).";
  } else if (!bad.length) {
    status = "passed";
    detail = "All dates are properly formatted in ATS-friendly format (e.g. 03/26, 03/2026, Mar 2026 or March 2026).";
  } else {
    status = "failed";
    detail = `ATS and recruiters prefer specific date formatting for your work experience. Please use the following formats: \u201CMM/YY or MM/YYYY or Month YYYY\u201D (e.g. 03/26, 03/2026, Mar 2026 or March 2026).`;
  }
  const checks = [
    { label: "Date formatting", status, detail, weight: 10 }
  ];
  return {
    key: "dateFormatting",
    title: "Date Formatting",
    score: scoreFromChecks(checks),
    weight: 10,
    summary: status === "passed" ? "All dates ATS-friendly." : "Dates missing or not ATS-friendly.",
    checks
  };
};
var buildEducationMatchSubgroup = (jd, eduScore) => {
  let status = "not-applicable";
  let detail = "No education requirement listed.";
  if (jd?.education?.education_level) {
    if (eduScore >= 80) {
      status = "passed";
      detail = `Your education matches the preferred (Bachelor's, ged) education listed in the job description.`;
    } else {
      status = "failed";
      detail = `Your education doesn't match the preferred (Bachelor's, ged) education listed in the job description.`;
    }
  }
  const checks = [
    { label: "Education match", status, detail, weight: 10 }
  ];
  return {
    key: "educationMatch",
    title: "Education Match",
    score: scoreFromChecks(checks),
    weight: 10,
    summary: status === "passed" ? "Education matches JD." : status === "not-applicable" ? "Not evaluated." : "Education doesn't meet JD requirements.",
    checks
  };
};
var buildSearchability = (resume, resumeText, jd, eduScore) => {
  const subgroups = [
    buildContactInfoSubgroup(resume),
    buildSectionHeadingsSubgroup(resume),
    buildJobTitleSubgroup(resumeText, jd),
    buildDateFormattingSubgroup(resume),
    buildEducationMatchSubgroup(jd, eduScore)
  ];
  const checks = subgroups.flatMap((s) => s.checks);
  const { strengths, improvements } = deriveFeedback(checks);
  const active = checks.filter((c) => c.status !== "not-applicable");
  const passed = active.filter((c) => c.status === "passed").length;
  return {
    key: "searchability",
    title: "Searchability",
    score: scoreFromSubgroups(subgroups),
    weight: CATEGORY_WEIGHTS.searchability,
    summary: `${passed} of ${active.length} searchability checks passed.`,
    checks,
    subgroups,
    strengths,
    improvements
  };
};

// src/shared/scoring/skills.ts
var buildHardSkills = (resumeHardSkills, jd, hardSkillsMatch) => {
  let checks = [
    {
      label: "Technical skills present",
      status: resumeHardSkills.length > 0 ? "passed" : "failed",
      detail: `${resumeHardSkills.length} technical skill(s) identified.`,
      weight: 100
    }
  ];
  let summary = `${resumeHardSkills.length} technical skills identified.`;
  let score = 0;
  let matched = [];
  let missing = [];
  if (jd && hardSkillsMatch.items.length > 0) {
    matched = hardSkillsMatch.matched;
    missing = hardSkillsMatch.missing;
    score = hardSkillsMatch.score;
    const total = matched.length + missing.length;
    checks = [
      {
        label: "Required hard skills matched",
        status: missing.length === 0 ? "passed" : "failed",
        detail: `${matched.length} of ${total} required technical skills found.`,
        weight: 100
      },
      ...missing.length > 0 ? [
        {
          label: "Missing hard skills",
          status: "failed",
          detail: `Add: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "\u2026" : ""}.`,
          weight: 0
        }
      ] : []
    ];
    summary = `${matched.length} of ${total} required technical skills matched.`;
  } else if (jd) {
    score = 0;
    missing = jd.skills?.hardSkills;
    checks = [
      {
        label: "Required hard skills matched",
        status: "failed",
        detail: "No job-required technical skills detected.",
        weight: 100
      }
    ];
    summary = "No hard skills detected from your provided job description. Please add a perfect job description of your role before applying.";
  }
  const { strengths, improvements } = deriveFeedback(checks);
  return {
    key: "hardSkills",
    title: "Hard Skills",
    score,
    weight: CATEGORY_WEIGHTS.hardSkills,
    summary,
    checks,
    strengths,
    improvements,
    matched,
    missing
  };
};
var buildSoftSkills = (resume, jd, softSkillsMatch) => {
  const resumeSoft = (resume.skills?.softSkills || []).filter(Boolean);
  let checks = [
    {
      label: "Soft skills highlighted",
      status: resumeSoft.length > 0 ? "passed" : "failed",
      detail: resumeSoft.length > 0 ? `${resumeSoft.length} soft skill(s) highlighted.` : "No explicit soft skills section.",
      weight: 100
    }
  ];
  let summary = resumeSoft.length > 0 ? `${resumeSoft.length} soft skill(s) highlighted.` : "Soft skills not explicitly listed.";
  let score = 0;
  let matched = [];
  let missing = [];
  if (jd && softSkillsMatch.items.length > 0) {
    matched = softSkillsMatch.matched;
    missing = softSkillsMatch.missing;
    score = softSkillsMatch.score;
    const total = matched.length + missing.length;
    checks = [
      {
        label: "Soft skills matched",
        status: missing.length === 0 ? "passed" : "failed",
        detail: `${matched.length} of ${total} soft skills found.`,
        weight: 100
      }
    ];
    summary = `${matched.length} of ${total} expected soft skills found.`;
  } else if (jd) {
    score = 0;
    missing = jd.skills?.softSkills;
    checks = [
      {
        label: "Soft skills matched",
        status: "failed",
        detail: "No soft skills detected.",
        weight: 100
      }
    ];
    summary = "No soft skills detected from job description. Please add a perfect job description of your role before applying.";
  }
  const { strengths, improvements } = deriveFeedback(checks);
  return {
    key: "softSkills",
    title: "Soft Skills",
    score,
    weight: CATEGORY_WEIGHTS.softSkills,
    summary,
    checks,
    strengths,
    improvements,
    matched,
    missing
  };
};

// src/shared/scoring/recruiter-tips.ts
var buildSummarySubgroup = (resume) => {
  const summaryWords = (resume.summary || "").split(/\s+/).filter(Boolean).length;
  const score = summaryScore(summaryWords);
  const status = score >= 100 ? "passed" : "failed";
  const detail = summaryWords >= 30 && summaryWords <= 80 ? "We found a summary section on your resume. Good job! The summary provides a quick overview of the candidate's qualifications, helping recruiters and hiring managers promptly grasp the value the candidate can offer in the position." : summaryWords > 80 ? `Your summary is too long (${summaryWords} words). Keep it within 30-80 words so it stays scannable.` : summaryWords > 0 ? `We found a summary section on your resume, but it's not enough. Make sure to include 30-80 words in the summary to stand out.` : "We couldn't find a summary section on your resume. Make sure to include a summary section in your resume to stand out.";
  const checks = [{ label: "Summary section", status, detail, weight: 20 }];
  return {
    key: "summary",
    title: "Summary",
    score,
    weight: 20,
    summary: detail,
    checks
  };
};
var buildJobLevelSubgroup = (jd, resumeYears) => {
  let status;
  let detail;
  if (jd && jd.experienceYearsRequired > 0) {
    if (resumeYears >= jd.experienceYearsRequired) {
      status = "passed";
      detail = "Your years of experience align with the role's requirements. This is a positive start, but remember to carefully review all other job criteria to ensure you're a strong overall match before applying.";
    } else {
      status = "failed";
      detail = `Your years of experience (${resumeYears} yrs) do not align with the role's requirements (${jd.experienceYearsRequired} yrs). This is a negative start, but remember to carefully review all other job criteria to ensure you're a strong overall match before applying.`;
    }
  } else {
    status = "not-applicable";
    detail = "No years of experience requirement listed in the job description.";
  }
  const checks = [{ label: "Job level match", status, detail, weight: 20 }];
  return {
    key: "jobLevelMatch",
    title: "Job Level Match",
    score: scoreFromChecks(checks),
    weight: 20,
    summary: detail,
    checks
  };
};
var buildMeasurableSubgroup = (measurable) => {
  const score = measurableResultsScore(measurable.count);
  const status = measurable.count >= 5 ? "passed" : "failed";
  const detail = measurable.count >= 5 ? `We found ${measurable.count} measurable results (e.g. generated $100K in sales, managed 15 team members, increased efficiency by 25% etc) in experience section, which is great!` : measurable.count > 0 ? `We found ${measurable.count} measurable results in experience section but it could be better. Use at least 5 measurable results (e.g. generated $100K in sales, managed 15 team members, increased efficiency by 25% etc) to stand out.` : "We couldn't find any measurable results in experience section. Use at least 5 measurable results (e.g. generated $100K in sales, managed 15 team members, increased efficiency by 25% etc) in your resume's experience section to stand out.";
  const checks = [
    { label: "Measurable results (5+)", status, detail, weight: 20 }
  ];
  return {
    key: "measurableResults",
    title: "Measurable Results",
    score,
    weight: 20,
    summary: detail,
    checks
  };
};
var buildActionVerbsSubgroup = (actionVerbs) => {
  const score = actionVerbsScore(actionVerbs.count);
  const status = actionVerbs.count >= 5 ? "passed" : "failed";
  const detail = actionVerbs.count >= 5 ? `We found ${actionVerbs.count} action verbs (e.g. Developed, Implemented, Managed etc) in experience section, which is great!` : actionVerbs.count > 0 ? `We found ${actionVerbs.count} action verbs in experience section but it could be better. Use at least 5 action verbs (e.g. Developed, Implemented, Managed etc) to stand out.` : "We couldn't find any action verbs in experience section. Use at least 5 action verbs (e.g. Developed, Implemented, Managed etc) in your resume's experience section to stand out.";
  const checks = [{ label: "Action verbs (5+)", status, detail, weight: 20 }];
  return {
    key: "actionVerbs",
    title: "Action Verbs",
    score,
    weight: 20,
    summary: detail,
    checks
  };
};
var countResumeWords = (resume) => {
  if (resume.wordCount) return Number(resume.wordCount) || 0;
  return toResumeText(resume).split(/\s+/).filter(Boolean).length;
};
var buildWordCountSubgroup = (wordCount) => {
  let status;
  let detail;
  if (wordCount >= 100 && wordCount <= 1e3) {
    status = "passed";
    detail = `There is ${wordCount} words in your resume, which is under the suggested limit of 1000 words and over the minimum of 100 words.`;
  } else if (wordCount < 100) {
    status = "failed";
    detail = `Resume is too short (${wordCount} words). Aim for at least 100 words so recruiters get enough detail.`;
  } else {
    status = "failed";
    detail = `Resume is too long (${wordCount} words). Keep it under 1000 words so it stays scannable.`;
  }
  const checks = [{ label: "Word count", status, detail, weight: 20 }];
  return {
    key: "wordCount",
    title: "Word Count",
    score: scoreFromChecks(checks),
    weight: 20,
    summary: `${wordCount} words total.`,
    checks
  };
};
var buildRecruiterTips = (resume, jd, resumeYears, measurable, actionVerbs) => {
  const wordCount = countResumeWords(resume);
  const subgroups = [
    buildSummarySubgroup(resume),
    buildJobLevelSubgroup(jd, resumeYears),
    buildMeasurableSubgroup(measurable),
    buildActionVerbsSubgroup(actionVerbs),
    buildWordCountSubgroup(wordCount)
  ];
  const checks = subgroups.flatMap((s) => s.checks);
  const { strengths, improvements } = deriveFeedback(checks);
  const score = scoreFromSubgroups(subgroups);
  return {
    key: "recruiterTips",
    title: "Recruiter Tips",
    score,
    weight: CATEGORY_WEIGHTS.recruiterTips,
    summary: `Resume is ${score >= 80 ? "very compelling" : score >= 50 ? "decent but improvable" : "missing key hooks"}.`,
    checks,
    subgroups,
    strengths,
    improvements
  };
};

// src/shared/scoring/formatting.ts
var createCheckResult = (available, passed, passDetail, failDetail) => {
  if (!available) {
    return {
      status: "not-applicable",
      detail: "Requires original file analysis."
    };
  }
  return passed ? { status: "passed", detail: passDetail } : { status: "failed", detail: failDetail };
};
var buildLayoutSubgroup = (resume) => {
  const { layout } = resume;
  const checks = [
    {
      label: "Single Column",
      ...createCheckResult(
        !!layout,
        layout?.isSingleColumn === true,
        "Single column layout detected. This format is optimal for ATS parsing.",
        "Single column layout recommended for best ATS parsing compatibility."
      ),
      weight: 32
    },
    {
      label: "Multi-Column",
      ...createCheckResult(
        !!layout,
        layout?.hasMultiColumn !== true,
        "No multi-column layout detected. Content structure is ATS-friendly.",
        "Multi-column layouts should be avoided as ATS may misread content flow."
      ),
      weight: 18
    },
    {
      label: "Tables and Text Boxes",
      ...createCheckResult(
        !!layout,
        layout?.hasTables === false,
        "No tables or text boxes detected. Clean text extraction is possible.",
        "Tables and text boxes should be removed as they break ATS parsing algorithms."
      ),
      weight: 30
    },
    {
      label: "Images and Photos",
      ...createCheckResult(
        !!layout,
        layout?.hasImages === false,
        "No images or photos detected. Text-only content is fully ATS-parseable.",
        "Images and photos should be removed as they are ignored by ATS systems."
      ),
      weight: 10
    },
    {
      label: "Icons and Graphics",
      ...createCheckResult(
        !!layout,
        layout?.hasIcons === false,
        "No icons or graphics detected. Clean text-focused resume structure.",
        "Icons and graphics should be removed as they are not processed by ATS."
      ),
      weight: 10
    }
  ];
  const passedCount = checks.filter(
    (check) => check.status === "passed"
  ).length;
  const totalChecks = checks.length;
  return {
    key: "layout",
    title: "Layout",
    score: scoreFromChecks(checks),
    weight: 60,
    summary: passedCount === totalChecks ? "Excellent layout. Fully ATS-compatible single-column structure detected." : `${passedCount} of ${totalChecks} layout standards met. Improvements needed in some areas.`,
    checks
  };
};
var buildFontSubgroup = (resume) => {
  const { fontCheck } = resume;
  const checks = [
    {
      label: "ATS-Friendly Font",
      ...createCheckResult(
        !!fontCheck,
        fontCheck?.isStandardFont === true,
        fontCheck?.fontName ? `${fontCheck.fontName} detected. Standard ATS-compatible font in use.` : "Standard ATS-friendly font detected.",
        "Standard ATS-friendly font recommended (Arial, Calibri, Times New Roman, Verdana)."
      ),
      weight: 50
    },
    {
      label: "Font Name",
      ...createCheckResult(
        !!fontCheck,
        !!fontCheck?.fontName,
        fontCheck?.fontName ? `Font identified as ${fontCheck.fontName}.` : "Font name successfully identified from the document.",
        "Font name could not be identified from the resume document."
      ),
      weight: 20
    },
    {
      label: "Font Size",
      ...createCheckResult(
        !!fontCheck,
        fontCheck?.isReadableSize === true,
        "Readable font size detected. Body text appears to be 10-12pt with headings at 14-16pt.",
        "Readable font sizes recommended. Use 10-12pt for body text and 14-16pt for headings."
      ),
      weight: 30
    }
  ];
  const passedCount = checks.filter(
    (check) => check.status === "passed"
  ).length;
  const totalChecks = checks.length;
  return {
    key: "font",
    title: "Font",
    score: scoreFromChecks(checks),
    weight: 40,
    summary: passedCount === totalChecks ? "Excellent font choices. Fully ATS-compatible typography detected." : `${passedCount} of ${totalChecks} font standards met. Improvements needed in some areas.`,
    checks
  };
};
var buildFormatting = (resume, atsFriendliness) => {
  const subgroups = [buildLayoutSubgroup(resume), buildFontSubgroup(resume)];
  const allChecks = subgroups.flatMap((subgroup) => subgroup.checks);
  const { strengths, improvements } = deriveFeedback(allChecks);
  const getSummary = (score) => {
    if (score >= 80) {
      return "Excellent formatting. Document structure and typography are fully optimized for ATS parsing.";
    }
    if (score >= 60) {
      return "Acceptable formatting. Some improvements needed for optimal ATS compatibility.";
    }
    return "Weak formatting. Significant improvements needed in layout and typography.";
  };
  return {
    key: "formatting",
    title: "Formatting",
    score: scoreFromSubgroups(subgroups),
    weight: CATEGORY_WEIGHTS.formatting,
    summary: getSummary(atsFriendliness),
    checks: allChecks,
    subgroups,
    strengths,
    improvements
  };
};

// src/shared/scoring/index.ts
var calculateLocalMatchScore = (resume, structuredJD) => {
  console.log("resume", resume);
  const jd = structuredJD || null;
  const resumeText = toResumeText(resume);
  const resumeHardSkills = resume.skills.hardSkills?.length ? resume.skills.hardSkills : [];
  const resumeYears = getResumeYears(resume);
  const measurable = countMeasurableResults(resume);
  const actionVerbs = countActionVerbs(resume);
  const suggestions = [];
  let hardSkillsMatch = {
    score: 0,
    matched: [],
    missing: [],
    items: []
  };
  let softSkillsMatch = {
    score: 0,
    matched: [],
    missing: [],
    items: []
  };
  let matchBreakdown;
  if (jd) {
    const isSkillPresent = (text, item) => countVariantsInText(text, getSkillVariants(item)) > 0;
    hardSkillsMatch = buildMatchCategory(
      resumeText,
      jd.skills.hardSkills,
      isSkillPresent
    );
    softSkillsMatch = buildMatchCategory(
      resumeText,
      jd.skills.softSkills,
      isSkillPresent
    );
    matchBreakdown = {
      hardSkills: hardSkillsMatch,
      softSkills: softSkillsMatch
    };
    if (hardSkillsMatch.missing.length)
      suggestions.push(
        "Add missing required hard skills of your resume to better match this job description"
      );
    if (softSkillsMatch.missing.length)
      suggestions.push(
        "Add missing required soft skills of your resume to better match this job description"
      );
    if (jd.experienceYearsRequired > 0 && resumeYears < jd.experienceYearsRequired)
      suggestions.push(
        `Job requires ${jd.experienceYearsRequired}+ years, but your resume shows ${resumeYears} ${resumeYears === 1 ? "year" : "years"}.`
      );
  } else if (!resume.experience?.length) {
    suggestions.push("Add work experience with detailed descriptions.");
  }
  if ((resume.skills.hardSkills || []).length < 5)
    suggestions.push(
      "Add a dedicated skills section with at least 5 technical skills."
    );
  if (measurable.count < 5)
    suggestions.push(
      `Add at least ${5 - measurable.count} more measurable results.`
    );
  if (actionVerbs.count < 5)
    suggestions.push(
      "Use strong action verbs in your experience bullet points (e.g. built, launched, optimized)."
    );
  if (!resume.summary || resume.summary.split(/\s+/).length < 30)
    suggestions.push("Add a professional summary of at least 30 words.");
  const summaryWords = (resume.summary || "").split(/\s+/).filter(Boolean).length;
  const summaryScore2 = summaryScore(summaryWords);
  const experienceCount = resume.experience?.length || 0;
  const contact = resume.personalInfo?.contact || {};
  const hasContactInfo = !!(contact.email || contact.phone || contact.address);
  const hasEmail = !!contact.email;
  const hasPhone = !!contact.phone;
  const hasAddress = !!contact.address;
  let contactScore = 0;
  if (hasEmail) contactScore += 50;
  if (hasPhone) contactScore += 40;
  if (hasAddress) contactScore += 10;
  const structureFactors = [
    summaryWords >= 30,
    (resume.skills.hardSkills || []).length >= 5,
    experienceCount > 0,
    (resume.education || []).length > 0,
    hasContactInfo
  ];
  const atsFriendliness = Math.round(
    structureFactors.filter(Boolean).length * 20
  );
  const eduScore = educationScore(resume, jd?.education || null);
  const categories = {
    searchability: buildSearchability(resume, resumeText, jd, eduScore),
    hardSkills: buildHardSkills(resumeHardSkills, jd, hardSkillsMatch),
    softSkills: buildSoftSkills(resume, jd, softSkillsMatch),
    recruiterTips: buildRecruiterTips(
      resume,
      jd,
      resumeYears,
      measurable,
      actionVerbs
    ),
    formatting: buildFormatting(resume, atsFriendliness)
  };
  const overallScore = Math.round(
    (categories.searchability.score * CATEGORY_WEIGHTS.searchability + categories.hardSkills.score * CATEGORY_WEIGHTS.hardSkills + categories.softSkills.score * CATEGORY_WEIGHTS.softSkills + categories.recruiterTips.score * CATEGORY_WEIGHTS.recruiterTips + categories.formatting.score * CATEGORY_WEIGHTS.formatting) / 100
  );
  const searchChecks = categories.searchability.checks;
  ["Job title match", "Date formatting", "Education match"].forEach((label) => {
    const check = searchChecks.find((c) => c.label === label);
    if (check && check.status === "failed") suggestions.push(check.detail);
  });
  const experienceSectionScore = experienceCount >= 2 ? Math.max(70, categories.recruiterTips.score >= 80 ? 80 : 70) : experienceCount === 1 ? Math.max(55, categories.recruiterTips.score >= 80 ? 65 : 55) : 25;
  const skillSectionScore = jd ? Math.round(
    (categories.hardSkills.score + categories.softSkills.score) / 2
  ) : resumeHardSkills.length > 0 ? Math.min(100, 55 + resumeHardSkills.length * 3) : 20;
  return {
    overallScore,
    categories,
    sectionScores: {
      summary: {
        score: summaryScore2,
        feedback: summaryWords >= 30 ? `Summary present with ${summaryWords} words.` : summaryWords > 0 ? "Summary is too short." : "No professional summary found."
      },
      experience: {
        score: experienceSectionScore,
        feedback: experienceCount > 0 ? `${experienceCount} position(s), ${resumeYears} year(s) total.` : "No work experience listed."
      },
      skills: {
        score: skillSectionScore,
        feedback: jd ? `${jd.skills.hardSkills.length} required hard skills from JD matched.` : `${resumeHardSkills.length} hard skills identified.`
      },
      contactInfo: {
        score: contactScore,
        feedback: hasContactInfo ? "Contact information found." : "Contact information is missing.",
        hasContactInfo
      },
      measurableResults: {
        score: measurableResultsScore(measurable.count),
        count: measurable.count,
        found: measurable.found,
        feedback: measurable.count >= 5 ? `${measurable.count} measurable results found.` : measurable.count > 0 ? `${measurable.count} of 5 recommended measurable results found.` : "No measurable results found."
      },
      actionVerbs: {
        score: actionVerbsScore(actionVerbs.count),
        count: actionVerbs.count,
        found: actionVerbs.found,
        feedback: actionVerbs.count >= 5 ? `${actionVerbs.count} action verbs found in experience bullets.` : actionVerbs.count > 0 ? `${actionVerbs.count} of 5 recommended action verbs found.` : "No strong action verbs found in experience bullets."
      }
    },
    atsFriendliness,
    suggestions: [...new Set(suggestions)].slice(0, 8),
    ...matchBreakdown ? { matchBreakdown } : {}
  };
};

// src/modules/ats-score-check/services/scoring.service.ts
var calculateAtsScore = (resume, structuredJD) => {
  return calculateLocalMatchScore(resume, structuredJD);
};

// src/modules/ats-score-check/services/history.service.ts
var CATEGORY_TITLES = {
  searchability: "Searchability",
  hardSkills: "Hard Skills",
  softSkills: "Soft Skills",
  recruiterTips: "Recruiter Tips",
  formatting: "Formatting"
};
var normalizeCategories = (sectionScores) => {
  if (!sectionScores?.categories) return sectionScores;
  const categories = { ...sectionScores.categories };
  for (const key of Object.keys(categories)) {
    if (CATEGORY_TITLES[key] && categories[key]) {
      categories[key] = { ...categories[key], title: CATEGORY_TITLES[key] };
    }
  }
  return { ...sectionScores, categories };
};
var createAtsScoreHistory = async (userId, resumeName, resumeContent, structuredJD, aiResearch) => {
  const analysis = calculateAtsScore(resumeContent, structuredJD);
  const hasContactInfo = !!resumeContent.personalInfo?.contact?.email || !!resumeContent.personalInfo?.contact?.phone || !!resumeContent.personalInfo?.contact?.address;
  if (!analysis.sectionScores.contactInfo.hasContactInfo && hasContactInfo) {
    analysis.sectionScores.contactInfo.hasContactInfo = true;
  }
  const title = `${resumeName || "Untitled Resume"}`;
  return prisma.atsScoreHistory.create({
    data: {
      userId,
      title,
      resumeName,
      overallScore: analysis.overallScore,
      sectionScores: {
        ...analysis.sectionScores,
        ...analysis.matchBreakdown ? { matchBreakdown: analysis.matchBreakdown } : {},
        categories: analysis.categories
      },
      atsFriendliness: analysis.atsFriendliness,
      suggestions: analysis.suggestions,
      resumeContent,
      aiResearch
    }
  });
};
var getAtsScoreHistory = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [scores, total] = await Promise.all([
    prisma.atsScoreHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.atsScoreHistory.count({ where: { userId } })
  ]);
  return {
    scores: scores.map((s) => ({
      ...s,
      sectionScores: normalizeCategories(s.sectionScores)
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getAtsScoreHistoryById = async (userId, historyId) => {
  const score = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId }
  });
  if (!score) {
    throw new Error("ATS Score history not found");
  }
  return {
    ...score,
    sectionScores: normalizeCategories(score.sectionScores)
  };
};
var deleteAtsScoreHistory = async (userId, historyId) => {
  const existing = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId }
  });
  if (!existing) {
    throw new Error("ATS Score history not found");
  }
  await prisma.atsScoreHistory.delete({ where: { id: historyId } });
  return { success: true };
};
var deleteAllAtsScoreHistory = async (userId) => {
  await prisma.atsScoreHistory.deleteMany({ where: { userId } });
  return { success: true };
};
var renameAtsScoreHistory = async (userId, historyId, resumeName) => {
  const existing = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId }
  });
  if (!existing) {
    throw new Error("ATS Score history not found");
  }
  return prisma.atsScoreHistory.update({
    where: { id: historyId },
    data: { resumeName, title: resumeName }
  });
};
var rescanAtsScoreHistory = async (userId, historyId, resumeName, resumeContent, sectionScores, overallScore, atsFriendliness, suggestions, matchBreakdown) => {
  const existing = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId }
  });
  if (!existing) {
    throw new Error("ATS Score history not found");
  }
  return prisma.atsScoreHistory.update({
    where: { id: historyId },
    data: {
      resumeName,
      title: resumeName,
      overallScore,
      sectionScores: {
        ...sectionScores,
        ...matchBreakdown ? { matchBreakdown } : {},
        categories: sectionScores.categories
      },
      atsFriendliness,
      suggestions,
      resumeContent
    }
  });
};

// src/modules/ats-score-check/atsScoreCheck.controller.ts
var getBangladeshCreditDateKey2 = () => {
  const now = /* @__PURE__ */ new Date();
  const dhakaMs = now.getTime() + 6 * 60 * 60 * 1e3;
  const dhaka = new Date(dhakaMs);
  const hour = dhaka.getUTCHours();
  if (hour < 16) {
    dhaka.setUTCDate(dhaka.getUTCDate() - 1);
  }
  return dhaka.toISOString().slice(0, 10);
};
var parseAddress = (raw2) => {
  if (!raw2) return void 0;
  const parts = raw2.split(/[,•\-]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return void 0;
  if (parts.length === 1) return { city: parts[0] };
  return { city: parts[0], state: parts[1] };
};
var mapAIResearchToResumeContent = (ai) => {
  if (!ai) return null;
  return {
    personalInfo: {
      fullName: ai.personal_info?.fullName || "",
      jobTitle: ai.personal_info?.jobTitle || "",
      contact: {
        email: ai.personal_info?.contact?.email || "",
        phone: ai.personal_info?.contact?.phone || "",
        address: parseAddress(ai.personal_info?.contact?.address || "")
      }
    },
    summary: ai.summary || "",
    experience: (ai.experience || []).map((exp) => ({
      role: exp.role || "",
      company: exp.company || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      responsibilities: exp.responsibilities || []
    })),
    education: (ai.education || []).map((edu) => ({
      degree: edu.degree || "",
      field: edu.field || "",
      education_level: edu.education_level || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || ""
    })).filter((e) => e.degree || e.field || e.education_level),
    skills: {
      hardSkills: ai.skills?.hardSkills || [],
      softSkills: ai.skills?.softSkills || []
    },
    projects: (ai.projects || []).map((proj) => ({
      name: proj.name || "",
      description: proj.description || [],
      startDate: proj.startDate || "",
      endDate: proj.endDate || ""
    })),
    yearsOfExperience: ai.yearsOfExperience || "",
    measurableResults: ai.measurableResults || [],
    actionVerbs: ai.actionVerbs || [],
    wordCount: ai.wordCount || 0,
    educationSection: ai.educationSection || false,
    experienceSection: ai.experienceSection || false,
    workHistory: ai.workHistory || false,
    dateFormatting: ai.dateFormatting || false,
    layout: {
      isSingleColumn: ai.layout?.isSingleColumn || false,
      hasTables: ai.layout?.hasTables || false,
      hasImages: ai.layout?.hasImages || false,
      hasIcons: ai.layout?.hasIcons || false,
      hasMultiColumn: ai.layout?.hasMultiColumn || false
    },
    fontCheck: {
      isStandardFont: ai.fontCheck?.isStandardFont || false,
      fontName: ai.fontCheck?.fontName || "",
      isReadableSize: ai.fontCheck?.isReadableSize || false
    }
  };
};
var parseResume2 = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    try {
      const result = await parseResume(
        req.file.path,
        req.file.originalname,
        req.file.mimetype
      );
      return res.status(200).json({
        success: true,
        data: { ...result, originalPdf: req.file.filename }
      });
    } catch (parseError) {
      if (req.file && fs4.existsSync(req.file.path)) {
        fs4.unlinkSync(req.file.path);
      }
      throw parseError;
    }
  } catch (error) {
    console.error("Resume parse error:", error);
    if (error instanceof AiQuotaError) {
      return res.status(429).json({
        success: false,
        message: error.message,
        code: "AI_QUOTA_EXCEEDED"
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to parse resume"
    });
  }
};
var parseJobDescription2 = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Job description is too short. Please provide a detailed job description."
      });
    }
    const aiResult = await parseJobDescription(description);
    res.status(200).json({
      success: true,
      data: aiResult
    });
  } catch (error) {
    console.error("Job description parse error:", error);
    if (error instanceof AiQuotaError) {
      return res.status(429).json({
        success: false,
        message: error.message,
        code: "AI_QUOTA_EXCEEDED"
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to parse job description"
    });
  }
};
var analyzeAtsScore = async (req, res) => {
  try {
    const { resumeName, jobDescription, structuredJD, aiResearch, originalPdf } = req.body;
    if (!aiResearch) {
      return res.status(400).json({
        success: false,
        message: "Resume research data is required"
      });
    }
    const resumeContent = mapAIResearchToResumeContent(aiResearch) || {
      personalInfo: { fullName: "", jobTitle: "", contact: {} },
      summary: "",
      experience: [],
      education: [],
      skills: { hardSkills: [], softSkills: [] },
      projects: []
    };
    if (originalPdf) resumeContent.originalPdf = originalPdf;
    const finalStructuredJD = structuredJD?.skills ? mapAIToStructuredJD(structuredJD) : structuredJD;
    const isAdmin = req.user?.role === "admin";
    if (isAdmin) {
      const score2 = await createAtsScoreHistory(
        req.user.id,
        resumeName || "Untitled Resume",
        resumeContent,
        finalStructuredJD || null,
        aiResearch || null
      );
      return res.status(201).json({
        success: true,
        data: score2,
        message: "AI scan completed (admin unlimited)."
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscription: true }
    });
    const subscription = user?.subscription || {};
    const today = getBangladeshCreditDateKey2();
    const lastReset = subscription?.lastAiScanResetDate ?? "";
    const credits = subscription?.credits ?? 0;
    const effectiveCredits = lastReset !== today ? 3 : credits;
    if (effectiveCredits < 1) {
      return res.status(403).json({
        success: false,
        message: "Daily limit is 3. New quota at 4 PM BST (Asia/Dhaka, UTC+6).",
        code: "AI_SCAN_UNAVAILABLE"
      });
    }
    const score = await createAtsScoreHistory(
      req.user.id,
      resumeName || "Untitled Resume",
      resumeContent,
      finalStructuredJD || null,
      aiResearch || null
    );
    const remainingCredits = effectiveCredits - 1;
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscription: {
          ...subscription,
          credits: remainingCredits,
          lastAiScanResetDate: today
        }
      },
      select: { subscription: true }
    });
    res.status(201).json({
      success: true,
      data: score,
      credits: remainingCredits,
      aiScan: {
        available: remainingCredits >= 1,
        credits: remainingCredits,
        lastAiScanResetDate: today
      },
      message: "AI scan used. Remaining today: " + remainingCredits + "/3. New quota at 4 PM BST (Asia/Dhaka, UTC+6)."
    });
  } catch (error) {
    console.error("ATS Score analysis error:", error);
    const status = error.message.includes("Insufficient credits") ? 403 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to analyze ATS score"
    });
  }
};
var rescanAtsScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { resumeName, aiResearch, structuredJD, originalPdf } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "History ID is required" });
    }
    if (!aiResearch) {
      return res.status(400).json({ success: false, message: "Resume research data is required" });
    }
    const resumeContent = mapAIResearchToResumeContent(aiResearch) || {
      personalInfo: { fullName: "", jobTitle: "", contact: {} },
      summary: "",
      experience: [],
      education: [],
      skills: { hardSkills: [], softSkills: [] },
      projects: []
    };
    if (originalPdf) resumeContent.originalPdf = originalPdf;
    const finalStructuredJD = structuredJD?.skills ? mapAIToStructuredJD(structuredJD) : structuredJD;
    const isAdmin = req.user?.role === "admin";
    const analysis = calculateAtsScore(resumeContent, finalStructuredJD || null);
    const hasContactInfo = !!resumeContent.personalInfo?.contact?.email || !!resumeContent.personalInfo?.contact?.phone || !!resumeContent.personalInfo?.contact?.address;
    if (!analysis.sectionScores.contactInfo.hasContactInfo && hasContactInfo) {
      analysis.sectionScores.contactInfo.hasContactInfo = true;
    }
    if (isAdmin) {
      const updated2 = await rescanAtsScoreHistory(
        req.user.id,
        id,
        resumeName || "Untitled Resume",
        resumeContent,
        { ...analysis.sectionScores, categories: analysis.categories },
        analysis.overallScore,
        analysis.atsFriendliness,
        analysis.suggestions,
        analysis.matchBreakdown
      );
      return res.status(200).json({
        success: true,
        data: updated2,
        message: "AI rescan completed (admin unlimited)."
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscription: true }
    });
    const subscription = user?.subscription || {};
    const today = getBangladeshCreditDateKey2();
    const lastReset = subscription?.lastAiScanResetDate ?? "";
    const credits = subscription?.credits ?? 0;
    const effectiveCredits = lastReset !== today ? 3 : credits;
    if (effectiveCredits < 1) {
      return res.status(403).json({
        success: false,
        message: "Daily limit is 3. New quota at 4 PM BST (Asia/Dhaka, UTC+6).",
        code: "AI_SCAN_UNAVAILABLE"
      });
    }
    const updated = await rescanAtsScoreHistory(
      req.user.id,
      id,
      resumeName || "Untitled Resume",
      resumeContent,
      { ...analysis.sectionScores, categories: analysis.categories },
      analysis.overallScore,
      analysis.atsFriendliness,
      analysis.suggestions,
      analysis.matchBreakdown
    );
    const remainingCredits = effectiveCredits - 1;
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscription: {
          ...subscription,
          credits: remainingCredits,
          lastAiScanResetDate: today
        }
      },
      select: { subscription: true }
    });
    res.status(200).json({
      success: true,
      data: updated,
      credits: remainingCredits,
      aiScan: {
        available: remainingCredits >= 1,
        credits: remainingCredits,
        lastAiScanResetDate: today
      },
      message: "AI rescan used. Remaining today: " + remainingCredits + "/3. New quota at 4 PM BST (Asia/Dhaka, UTC+6)."
    });
  } catch (error) {
    console.error("ATS rescan error:", error);
    if (error instanceof AiQuotaError) {
      return res.status(429).json({ success: false, message: error.message, code: "AI_QUOTA_EXCEEDED" });
    }
    const status = error.message?.includes("not found") ? 404 : error.message?.includes("Insufficient credits") ? 403 : 500;
    res.status(status).json({ success: false, message: error.message || "Failed to rescan ATS score" });
  }
};
var getAtsScores = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const result = await getAtsScoreHistory(req.user.id, page, limit);
    res.json({
      success: true,
      data: result.scores,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Get ATS scores error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get ATS scores"
    });
  }
};
var getAtsScore = async (req, res) => {
  try {
    const { id } = req.params;
    const score = await getAtsScoreHistoryById(req.user.id, id);
    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    console.error("Get ATS score error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "ATS Score not found"
    });
  }
};
var deleteAtsScoreController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAtsScoreHistory(req.user.id, id);
    res.json({
      success: true,
      message: "ATS Score deleted successfully"
    });
  } catch (error) {
    console.error("Delete ATS score error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Failed to delete ATS Score"
    });
  }
};
var deleteAllAtsScoresController = async (req, res) => {
  try {
    await deleteAllAtsScoreHistory(req.user.id);
    res.json({
      success: true,
      message: "All ATS Scores deleted successfully"
    });
  } catch (error) {
    console.error("Delete all ATS scores error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete ATS Scores"
    });
  }
};
var renameAtsScoreController = async (req, res) => {
  try {
    const { id } = req.params;
    const { resumeName } = req.body;
    if (!resumeName || !resumeName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume name is required"
      });
    }
    await renameAtsScoreHistory(req.user.id, id, resumeName.trim());
    res.json({
      success: true,
      message: "Renamed successfully"
    });
  } catch (error) {
    console.error("Rename ATS score error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Failed to rename"
    });
  }
};

// src/modules/ats-score-check/atsScoreCheck.routes.ts
var router3 = Router3();
router3.use(authenticate);
router3.post("/parse-resume", upload.single("resume"), parseResume2);
router3.post("/parse-jd", parseJobDescription2);
router3.post("/analyze", analyzeAtsScore);
router3.post("/rescan/:id", rescanAtsScore);
router3.get("/history", getAtsScores);
router3.get("/history/:id", getAtsScore);
router3.delete("/history/:id", deleteAtsScoreController);
router3.put("/history/:id/rename", renameAtsScoreController);
router3.delete("/history", deleteAllAtsScoresController);
var atsScoreCheck_routes_default = router3;

// src/modules/resume-builder/resumeBuilder.routes.ts
import { Router as Router4 } from "express";

// src/modules/resume-builder/subservices/resumes.service.ts
var getAllResumesByUser = async (userId, options) => {
  const { page, limit, sourceType } = options;
  const skip = (page - 1) * limit;
  const where = { userId };
  if (sourceType) {
    where.sourceType = sourceType;
  }
  const [resumes, total] = await Promise.all([
    prisma.resume.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        sourceType: true,
        originalFormat: false,
        content: true,
        metadata: true,
        tags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userId: true
      }
    }),
    prisma.resume.count({ where })
  ]);
  return {
    resumes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};
var getResumeById = async (resumeId, userId) => {
  return prisma.resume.findFirst({
    where: { id: resumeId, userId },
    select: {
      id: true,
      sourceType: true,
      originalFormat: true,
      content: true,
      metadata: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userId: true
    }
  });
};
var createResumeFromUpload = async (userId, file) => {
  const { parseResumeFile: parseResumeFile2 } = await Promise.resolve().then(() => (init_resume_parser(), resume_parser_exports));
  const parsed = await parseResumeFile2(file.path, file.mimetype);
  const resume = await prisma.resume.create({
    data: {
      userId,
      sourceType: "uploaded",
      originalFormat: {
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      },
      content: { rawText: parsed.text },
      metadata: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype
      },
      isActive: true
    },
    select: {
      id: true,
      sourceType: true,
      originalFormat: true,
      content: true,
      metadata: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userId: true
    }
  });
  return resume;
};
var createResumeFromContent = async (userId, content) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const resume = await prisma.resume.create({
    data: {
      userId,
      sourceType: "builder",
      content,
      metadata: {
        filename: `resume_${Date.now()}.json`,
        originalName: content.personalInfo?.jobTitle || content.personalInfo?.fullName || "",
        size: JSON.stringify(content).length,
        type: "application/json"
      },
      isActive: true
    },
    select: {
      id: true,
      sourceType: true,
      originalFormat: true,
      content: true,
      metadata: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userId: true
    }
  });
  return { resume };
};
var updateResumeById = async (resumeId, userId, updateData) => {
  const existing = await prisma.resume.findFirst({
    where: { id: resumeId, userId }
  });
  if (!existing) {
    return null;
  }
  return prisma.resume.update({
    where: { id: resumeId },
    data: updateData,
    select: {
      id: true,
      sourceType: true,
      originalFormat: true,
      content: true,
      metadata: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userId: true
    }
  });
};
var duplicateResumeById = async (resumeId, userId) => {
  const existing = await prisma.resume.findFirst({
    where: { id: resumeId, userId }
  });
  if (!existing) {
    return null;
  }
  const sourceTitle = existing.metadata?.originalName || existing.content?.personalInfo?.jobTitle || existing.content?.personalInfo?.fullName || "Resume";
  const resume = await prisma.resume.create({
    data: {
      userId,
      sourceType: existing.sourceType,
      content: existing.content,
      metadata: {
        filename: `resume_${Date.now()}.json`,
        originalName: `${sourceTitle} (Copy)`,
        size: JSON.stringify(existing.content).length,
        type: "application/json"
      },
      tags: existing.tags,
      isActive: true
    },
    select: {
      id: true,
      sourceType: true,
      originalFormat: true,
      content: true,
      metadata: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userId: true
    }
  });
  return resume;
};
var deleteResumeById = async (resumeId, userId) => {
  const existing = await prisma.resume.findFirst({
    where: { id: resumeId, userId }
  });
  if (!existing) {
    return null;
  }
  await prisma.resume.delete({ where: { id: resumeId } });
  return existing;
};
var deleteAllResumesByUser = async (userId) => {
  const result = await prisma.resume.deleteMany({ where: { userId } });
  return { deletedCount: result.count };
};

// src/modules/resume-builder/resumeBuilder.controller.ts
import fs5 from "fs";

// src/shared/ai/gemini/resumeRewriter.ts
import crypto2 from "crypto";
var REWRITE_RESUME_PROMPT = `
You are an expert resume writer. Your task is to rewrite the provided resume based on the job description to make it ATS-optimized and tailored to the job.

INPUTS:
1. ORIGINAL RESUME TEXT: The text content of the user's resume
2. JOB DESCRIPTION: The target job description

INSTRUCTIONS:
- Rewrite the resume to better match the job description while keeping all information truthful
- Do NOT invent or hallucinate any experience, skills, or qualifications
- Only reword and reframe existing information to highlight relevance to the job description
- Use the exact same structure and sections as the original resume
- Output must be valid JSON matching the exact structure below
- Experience: 2-3 bullet points per role maximum
- Bullets: Start with strong action verbs + measurable impact (use numbers, dollar amounts, time saved, scale, rankings - NOT just percentages)
- Skills: Extract and prioritize relevant skills from the job description (max 10-12)
- Summary: 2-3 lines max, tailored to the job description requirements
- Never invent experience; only reword/reframe existing content
- Prioritize job description keywords for ATS optimization
- If information is missing in the original resume, leave the field blank or empty array
- Return ONLY valid JSON matching the structure below. No markdown, no extra text, no explanations.

JSON STRUCTURE:
{
  "personalInfo": {
    "fullName": "",
    "jobTitle": "",
    "contact": {
      "email": "",
      "phone": "",
      "linkedIn": "",
      "address": {
        "city": "",
        "state": ""
      },
      "socialLinks": {
        "github": "",
        "portfolio": "",
        "website": ""
      }
    }
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "title": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "highlights": [""],
      "measurableImpacts": [""]
    }
  ],
  "projects": [
    {
      "name": "",
      "highlights": [""],
      "startDate": "",
      "endDate": "",
      "current": false,
      "links": {
        "live": "",
        "caseStudy": ""
      },
      "technologies": [""]
    }
  ],
  "achievements": [
    {
      "title": "",
      "date": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "areaOfStudy": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": [""],
  "skillCategories": [
    {
      "name": "",
      "skills": [""]
    }
  ],
  "hardSkills": [""],
  "softSkills": [""],
  "keywords": [""],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": ""
    }
  ],
  "sectionTitles": {
    "summary": "",
    "experience": "",
    "skills": "",
    "education": "",
    "projects": "",
    "achievements": "",
    "certifications": ""
  },
  "sectionOrder": ["personalInfo", "summary", "experience", "skills", "education", "projects", "achievements", "certifications"],
  "layout": {
    "isSingleColumn": true,
    "hasTables": false,
    "hasImages": false,
    "hasIcons": false,
    "hasMultiColumn": false
  },
  "fontCheck": {
    "isStandardFont": true,
    "fontName": "",
    "isReadableSize": true,
    "hasMixedFonts": false
  }
}

STRICT RULES:
- NO field is required. If a piece of information is NOT present or applicable, set it to empty: "" for strings, [] for arrays, false for booleans.
- Do NOT invent or hallucinate information. Only extract and reword what is actually present in the resume.
- hardSkills must ONLY contain pure technical keyword names (programming languages, frameworks, etc.)
- softSkills must ONLY contain non-technical interpersonal skills
- CANONICALIZE hardSkills: for each distinct technology/framework/library/tool, return EXACTLY ONE canonical keyword. Merge spelling variants.
- Each hardSkills/softSkills entry must be a single skill name - never phrases.
- The output must be valid JSON and nothing else.
`;
var rewriteResumeWithAI = async (resumeText, jobDescription) => {
  const hash = crypto2.createHash("sha256").update(resumeText + "||" + jobDescription).digest("hex");
  const key = `rewrite_${hash}`;
  const cached = await getCache(key);
  if (cached) {
    console.log(`[cache] resume rewrite hit ${key}`);
    return cached;
  }
  const parts = [];
  const textPart = `${REWRITE_RESUME_PROMPT}

ORIGINAL RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Rewrite the resume based on the job description and return ONLY the valid JSON structure specified above.
`;
  parts.push({ text: textPart });
  try {
    const result = await generateContentWithFailover({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts }]
    });
    const text = result.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }
    const raw2 = JSON.parse(jsonMatch[0]);
    const normalized = normalizeRewrittenResume(raw2);
    await setCache(key, normalized);
    console.log(`[cache] resume rewrite set ${key}`);
    return normalized;
  } catch (error) {
    console.error("Resume rewrite error:", error);
    throwIfQuotaError(error);
    throw new Error("Failed to rewrite resume with AI");
  }
};
var normalizeRewrittenResume = (raw2) => {
  const str = (v, fallback = "") => {
    if (typeof v === "string") return v;
    if (v == null) return fallback;
    return String(v);
  };
  const bool = (v, fallback = false) => {
    if (typeof v === "boolean") return v;
    if (v == null) return fallback;
    return Boolean(v);
  };
  const arr = (v) => {
    if (Array.isArray(v)) return v;
    return [];
  };
  const safeObject = (v) => {
    return v && typeof v === "object" ? v : {};
  };
  return {
    personalInfo: {
      fullName: str(raw2?.personalInfo?.fullName),
      jobTitle: str(raw2?.personalInfo?.jobTitle),
      contact: safeObject(raw2?.personalInfo?.contact) ?? {
        email: str(raw2?.personalInfo?.contact?.email),
        phone: str(raw2?.personalInfo?.contact?.phone),
        linkedIn: str(raw2?.personalInfo?.contact?.linkedIn),
        address: safeObject(raw2?.personalInfo?.contact?.address) ?? {
          city: str(raw2?.personalInfo?.contact?.address?.city),
          state: str(raw2?.personalInfo?.contact?.address?.state)
        },
        socialLinks: safeObject(raw2?.personalInfo?.contact?.socialLinks) ?? {
          github: str(raw2?.personalInfo?.contact?.socialLinks?.github),
          portfolio: str(raw2?.personalInfo?.contact?.socialLinks?.portfolio),
          website: str(raw2?.personalInfo?.contact?.socialLinks?.website)
        }
      }
    },
    summary: str(raw2?.summary),
    experience: arr(raw2?.experience).map((exp) => ({
      company: str(exp?.company),
      title: str(exp?.title),
      location: str(exp?.location),
      startDate: str(exp?.startDate),
      endDate: str(exp?.endDate),
      current: bool(exp?.current),
      highlights: arr(exp?.highlights).map((v) => str(v)),
      measurableImpacts: arr(exp?.measurableImpacts).map((v) => str(v))
    })),
    projects: arr(raw2?.projects).map((proj) => ({
      name: str(proj?.name),
      highlights: arr(proj?.highlights).map((v) => str(v)),
      startDate: str(proj?.startDate),
      endDate: str(proj?.endDate),
      current: bool(proj?.current),
      links: safeObject(proj?.links) ?? {
        live: str(proj?.links?.live),
        caseStudy: str(proj?.links?.caseStudy)
      },
      technologies: arr(proj?.technologies).map((v) => str(v))
    })),
    achievements: arr(raw2?.achievements).map((ach) => ({
      title: str(ach?.title),
      date: str(ach?.date),
      description: str(ach?.description)
    })),
    education: arr(raw2?.education).map((edu) => ({
      institution: str(edu?.institution),
      degree: str(edu?.degree),
      areaOfStudy: str(edu?.areaOfStudy),
      startDate: str(edu?.startDate),
      endDate: str(edu?.endDate),
      gpa: str(edu?.gpa)
    })),
    skills: arr(raw2?.skills).map((v) => str(v)),
    skillCategories: arr(raw2?.skillCategories).map((cat) => ({
      name: str(cat?.name),
      skills: arr(cat?.skills).map((v) => str(v))
    })),
    hardSkills: arr(raw2?.hardSkills).map((v) => str(v)),
    softSkills: arr(raw2?.softSkills).map((v) => str(v)),
    keywords: arr(raw2?.keywords).map((v) => str(v)),
    certifications: arr(raw2?.certifications).map((cert) => ({
      name: str(cert?.name),
      issuer: str(cert?.issuer),
      date: str(cert?.date)
    })),
    sectionTitles: safeObject(raw2?.sectionTitles) ?? {
      summary: str(raw2?.sectionTitles?.summary),
      experience: str(raw2?.sectionTitles?.experience),
      skills: str(raw2?.sectionTitles?.skills),
      education: str(raw2?.sectionTitles?.education),
      projects: str(raw2?.sectionTitles?.projects),
      achievements: str(raw2?.sectionTitles?.achievements),
      certifications: str(raw2?.sectionTitles?.certifications)
    },
    sectionOrder: arr(raw2?.sectionOrder),
    layout: safeObject(raw2?.layout) ?? {
      isSingleColumn: bool(raw2?.layout?.isSingleColumn, true),
      hasTables: bool(raw2?.layout?.hasTables),
      hasImages: bool(raw2?.layout?.hasImages),
      hasIcons: bool(raw2?.layout?.hasIcons),
      hasMultiColumn: bool(raw2?.layout?.hasMultiColumn)
    },
    fontCheck: safeObject(raw2?.fontCheck) ?? {
      isStandardFont: bool(raw2?.fontCheck?.isStandardFont, true),
      fontName: str(raw2?.fontCheck?.fontName),
      isReadableSize: bool(raw2?.fontCheck?.isReadableSize, true),
      hasMixedFonts: bool(raw2?.fontCheck?.hasMixedFonts)
    }
  };
};

// src/modules/resume-builder/resumeBuilder.controller.ts
var getAllResumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sourceType = req.query.sourceType;
    const result = await getAllResumesByUser(req.user.id, {
      page,
      limit,
      sourceType
    });
    res.json({
      success: true,
      data: result.resumes,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching resumes"
    });
  }
};
var uploadResume = [
  upload.single("resume"),
  uploadErrorHandler,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      const resume = await createResumeFromUpload(req.user.id, req.file);
      res.status(201).json({
        success: true,
        data: resume
      });
    } catch (error) {
      if (req.file?.path && fs5.existsSync(req.file.path)) {
        fs5.unlinkSync(req.file.path);
      }
      res.status(500).json({
        success: false,
        message: error.message || "Error uploading resume"
      });
    }
  }
];
var createResumeFromContent2 = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }
    const result = await createResumeFromContent(req.user.id, content);
    res.status(201).json({
      success: true,
      data: result.resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating resume"
    });
  }
};
var getSingleResume = async (req, res) => {
  try {
    const resume = await getResumeById(req.params.id, req.user.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }
    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching resume"
    });
  }
};
var updateResume = async (req, res) => {
  try {
    const resume = await updateResumeById(
      req.params.id,
      req.user.id,
      req.body
    );
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }
    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating resume"
    });
  }
};
var deleteResume = async (req, res) => {
  try {
    const resume = await deleteResumeById(req.params.id, req.user.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }
    res.json({
      success: true,
      message: "Resume deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting resume"
    });
  }
};
var duplicateResume = async (req, res) => {
  try {
    const resume = await duplicateResumeById(req.params.id, req.user.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }
    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error duplicating resume"
    });
  }
};
var rewriteResumeWithAI2 = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume text and job description are required"
      });
    }
    const rewrittenContent = await rewriteResumeWithAI(resumeText, jobDescription);
    const result = await createResumeFromContent(req.user.id, rewrittenContent);
    res.status(201).json({
      success: true,
      data: {
        id: result.resume.id,
        // Optionally return the rewritten content for preview
        content: rewrittenContent
      }
    });
  } catch (error) {
    console.error("Error in rewriteResumeWithAI:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to rewrite resume with AI"
    });
  }
};
var deleteAllResumes = async (req, res) => {
  try {
    const result = await deleteAllResumesByUser(req.user.id);
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} resumes successfully`
    });
  } catch (error) {
    console.error("Error deleting all resumes:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting all resumes"
    });
  }
};
var parseResumePdf = [
  upload.single("resume"),
  uploadErrorHandler,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      const { parseResumeFile: parseResumeFile2 } = await Promise.resolve().then(() => (init_resume_parser(), resume_parser_exports));
      const parsed = await parseResumeFile2(req.file.path, req.file.mimetype);
      if (fs5.existsSync(req.file.path)) {
        fs5.unlinkSync(req.file.path);
      }
      if (!parsed.text || !parsed.text.trim()) {
        return res.status(400).json({
          success: false,
          message: "No extractable text found in PDF. Please upload a text-based PDF."
        });
      }
      return res.status(200).json({
        success: true,
        data: { text: parsed.text }
      });
    } catch (error) {
      if (req.file?.path && fs5.existsSync(req.file.path)) {
        fs5.unlinkSync(req.file.path);
      }
      console.error("Resume parse error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to extract text from PDF"
      });
    }
  }
];

// src/modules/resume-builder/resumeBuilder.routes.ts
var router4 = Router4();
router4.post("/content", authenticate, resumeLimiter, createResumeFromContent2);
router4.delete("/delete-all", authenticate, deleteAllResumes);
router4.post("/parse", authenticate, resumeLimiter, ...parseResumePdf);
router4.post("/:id/duplicate", authenticate, duplicateResume);
router4.get("/:id", authenticate, getSingleResume);
router4.put("/:id", authenticate, updateResume);
router4.delete("/:id", authenticate, deleteResume);
router4.get("/", authenticate, getAllResumes);
router4.post("/", authenticate, resumeLimiter, uploadResume);
router4.post("/ai-rewrite", authenticate, resumeLimiter, rewriteResumeWithAI2);
var resumeBuilder_routes_default = router4;

// src/modules/admin-dashboard/admin-dashboard.routes.ts
import { Router as Router5 } from "express";

// src/modules/admin-dashboard/admin-dashboard.service.ts
var getTotalUsers = async () => {
  return prisma.user.count();
};
var getTodayNewUsers = async () => {
  const startOfToday = /* @__PURE__ */ new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return prisma.user.count({
    where: {
      createdAt: {
        gte: startOfToday
      }
    }
  });
};
var TZ_OFFSET_MS = 6 * 60 * 60 * 1e3;
var toGmt6HourKey = (date) => new Date(date.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 13);
var toGmt6DayKey = (date) => new Date(date.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10);
var fromGmt6 = (year, month, day, hour = 0) => new Date(Date.UTC(year, month, day, hour) - TZ_OFFSET_MS);
var buildBuckets = (start, end, hourly) => {
  const keys2 = [];
  const labels = [];
  const cursor = new Date(start);
  while (cursor < end) {
    if (hourly) {
      const key = toGmt6HourKey(cursor);
      keys2.push(key);
      labels.push(`${key.slice(11)}:00`);
      cursor.setUTCHours(cursor.getUTCHours() + 1);
    } else {
      const key = toGmt6DayKey(cursor);
      keys2.push(key);
      labels.push(`${key.slice(8)}/${key.slice(5, 7)}`);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return { keys: keys2, labels };
};
var fetchSeries = async (model, dateField, start, end, hourly) => {
  const { keys: keys2, labels } = buildBuckets(start, end, hourly);
  const counts = {};
  keys2.forEach((k) => counts[k] = 0);
  const records = await prisma[model].findMany({
    where: {
      [dateField]: { gte: start, lt: end }
    },
    select: { [dateField]: true }
  });
  records.forEach((record) => {
    const t = new Date(record[dateField]);
    const key = hourly ? toGmt6HourKey(t) : toGmt6DayKey(t);
    if (counts[key] !== void 0) counts[key]++;
  });
  return { labels, values: keys2.map((k) => counts[k]) };
};
var sum = (values) => values.reduce((a, b) => a + b, 0);
var getWindow = (period) => {
  const now = /* @__PURE__ */ new Date();
  const shifted = new Date(now.getTime() + TZ_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  let start;
  let end;
  let hourly = false;
  if (period === "today") {
    start = fromGmt6(year, month, day);
    end = new Date(start.getTime() + 24 * 60 * 60 * 1e3);
    hourly = true;
  } else if (period === "yesterday") {
    start = fromGmt6(year, month, day - 1);
    end = new Date(start.getTime() + 24 * 60 * 60 * 1e3);
    hourly = true;
  } else if (period === "7d") {
    start = fromGmt6(year, month, day - 6);
    end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1e3);
  } else if (period === "14d") {
    start = fromGmt6(year, month, day - 13);
    end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1e3);
  } else {
    start = fromGmt6(year, month, day - 29);
    end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1e3);
  }
  const length = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - length);
  const prevEnd = new Date(start);
  return { start, end, prevStart, prevEnd, hourly };
};
var getGrowthData = async (period) => {
  const { start, end, prevStart, prevEnd, hourly } = getWindow(period);
  const [atsUse, resumeBuild, prevAtsUse, prevResumeBuild] = await Promise.all([
    fetchSeries("atsScoreHistory", "createdAt", start, end, hourly),
    fetchSeries("resume", "createdAt", start, end, hourly),
    fetchSeries("atsScoreHistory", "createdAt", prevStart, prevEnd, hourly),
    fetchSeries("resume", "createdAt", prevStart, prevEnd, hourly)
  ]);
  const activity = sum(atsUse.values) + sum(resumeBuild.values);
  const prevActivity = sum(prevAtsUse.values) + sum(prevResumeBuild.values);
  const change = prevActivity === 0 ? 0 : Math.round((activity - prevActivity) / prevActivity * 1e3) / 10;
  return {
    period,
    labels: atsUse.labels,
    series: {
      atsUse: atsUse.values,
      resumeBuild: resumeBuild.values
    },
    totals: {
      atsUse: sum(atsUse.values),
      resumeBuild: sum(resumeBuild.values),
      activity
    },
    change
  };
};
var getResumeBuilderUsersToday = async () => {
  const startOfToday = /* @__PURE__ */ new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return prisma.resume.count({
    where: {
      createdAt: {
        gte: startOfToday
      }
    }
  });
};
var getATSCheckUsersToday = async () => {
  const startOfToday = /* @__PURE__ */ new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return prisma.atsScoreHistory.count({
    where: {
      createdAt: {
        gte: startOfToday
      }
    }
  });
};
var getBestFeatureToday = async () => {
  const [resumeCount, atsCount] = await Promise.all([
    getResumeBuilderUsersToday(),
    getATSCheckUsersToday()
  ]);
  return resumeCount > atsCount ? "resume-builder" : "ats-check";
};
var getAdminDashboardMetrics = async () => {
  const [
    totalUsers,
    todayNewUsers,
    resumeBuilderUsersToday,
    atsCheckUsersToday,
    bestFeatureToday
  ] = await Promise.all([
    getTotalUsers(),
    getTodayNewUsers(),
    getResumeBuilderUsersToday(),
    getATSCheckUsersToday(),
    getBestFeatureToday()
  ]);
  return {
    totalUsers,
    todayNewUsers,
    resumeBuilderUsersToday,
    atsCheckUsersToday,
    bestFeatureToday
  };
};
var getUsersForAdmin = async () => {
  return prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
      role: true,
      isBanned: true,
      createdAt: true,
      lastLoginAt: true,
      subscription: true
    }
  });
};
var getTargetUser = async (userId) => {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true }
  });
  if (!target) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  return target;
};
var setUserBan = async (adminId, userId, isBanned) => {
  if (adminId === userId) {
    throw Object.assign(new Error("You cannot ban your own account"), {
      status: 400
    });
  }
  return prisma.user.update({
    where: { id: userId },
    data: { isBanned },
    select: { id: true, name: true, email: true, role: true, isBanned: true }
  });
};
var adminUpdateUser = async (adminId, userId, data) => {
  if (data.role && !["admin", "user"].includes(data.role)) {
    throw Object.assign(new Error("Invalid role"), { status: 400 });
  }
  const target = await getTargetUser(userId);
  if (data.role === "user" && adminId === userId) {
    throw Object.assign(new Error("You cannot remove your own admin role"), {
      status: 400
    });
  }
  const updateData = {};
  if (data.name !== void 0) updateData.name = data.name;
  if (data.role !== void 0) updateData.role = data.role;
  if (data.credits !== void 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true }
    });
    const sub = user?.subscription || {};
    updateData.subscription = { ...sub, credits: data.credits };
  }
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      picture: true,
      role: true,
      isBanned: true,
      createdAt: true,
      lastLoginAt: true,
      subscription: true
    }
  });
};
var adminDeleteUser = async (adminId, userId) => {
  if (adminId === userId) {
    throw Object.assign(new Error("You cannot delete your own account"), {
      status: 400
    });
  }
  await prisma.payment.deleteMany({ where: { userId } });
  await prisma.atsScoreHistory.deleteMany({ where: { userId } });
  await prisma.analysis.deleteMany({ where: { userId } });
  await prisma.atsScore.deleteMany({ where: { userId } });
  await prisma.resume.deleteMany({ where: { userId } });
  await prisma.jobDescription.deleteMany({ where: { userId } });
  return prisma.user.delete({ where: { id: userId } });
};
var getAllResumesForAdmin = async () => {
  return prisma.resume.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      sourceType: true,
      metadata: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};
var adminDeleteResume = async (resumeId) => {
  const existing = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!existing) {
    throw Object.assign(new Error("Resume not found"), { status: 404 });
  }
  await prisma.resume.delete({ where: { id: resumeId } });
  return { success: true };
};
var adminDeleteAllResumes = async () => {
  const result = await prisma.resume.deleteMany();
  return { deletedCount: result.count };
};
var getAllAtsScoresForAdmin = async () => {
  return prisma.atsScoreHistory.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      resumeName: true,
      overallScore: true,
      atsFriendliness: true,
      createdAt: true,
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};
var adminDeleteAtsScore = async (historyId) => {
  const existing = await prisma.atsScoreHistory.findUnique({ where: { id: historyId } });
  if (!existing) {
    throw Object.assign(new Error("ATS Score history not found"), { status: 404 });
  }
  await prisma.atsScoreHistory.delete({ where: { id: historyId } });
  return { success: true };
};
var adminDeleteAllAtsScores = async () => {
  const result = await prisma.atsScoreHistory.deleteMany();
  return { deletedCount: result.count };
};

// src/modules/support/support.service.ts
var createSupportTicket = async (userId, data) => {
  return prisma.supportTicket.create({
    data: {
      userId,
      type: data.type || "bug",
      title: data.title,
      message: data.message,
      attachment: data.attachment || null,
      status: "open"
    }
  });
};
var getMyTickets = async (userId) => {
  return prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
};
var getAllTickets = async () => {
  return prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, picture: true }
      }
    }
  });
};
var updateTicketStatus = async (id, status) => {
  if (!["open", "in-progress", "resolved"].includes(status)) {
    throw Object.assign(new Error("Invalid status"), { status: 400 });
  }
  return prisma.supportTicket.update({
    where: { id },
    data: { status }
  });
};
var deleteTicket = async (id) => {
  return prisma.supportTicket.delete({ where: { id } });
};

// src/modules/admin-dashboard/admin-dashboard.controller.ts
var ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin only."
    });
    return false;
  }
  return true;
};
var sendError = (res, error) => {
  const status = error?.status || 500;
  res.status(status).json({
    success: false,
    message: error?.message || "Internal server error"
  });
};
var getMetrics = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const metrics = await getAdminDashboardMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error("Error fetching admin dashboard metrics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getGrowth = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const period = req.query.period || "today";
    if (!["yesterday", "today", "7d", "14d", "30d"].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period"
      });
    }
    const data = await getGrowthData(period);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error fetching admin dashboard growth:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getUsers = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const users = await getUsersForAdmin();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error fetching admin user list:", error);
    sendError(res, error);
  }
};
var toggleBan = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const isBanned = !!req.body.isBanned;
    const user = await setUserBan(req.user.id, id, isBanned);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error toggling user ban:", error);
    sendError(res, error);
  }
};
var updateUser = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { name, role, credits } = req.body || {};
    const user = await adminUpdateUser(req.user.id, id, { name, role, credits });
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error updating user:", error);
    sendError(res, error);
  }
};
var deleteUser = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    await adminDeleteUser(req.user.id, id);
    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    sendError(res, error);
  }
};
var getSupportTickets = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const tickets = await getAllTickets();
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    sendError(res, error);
  }
};
var updateSupportTicket = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const ticket = await updateTicketStatus(id, status);
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error("Error updating support ticket:", error);
    sendError(res, error);
  }
};
var deleteSupportTicket = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    await deleteTicket(id);
    res.json({
      success: true,
      message: "Ticket deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting support ticket:", error);
    sendError(res, error);
  }
};
var getAllResumes2 = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const resumes = await getAllResumesForAdmin();
    res.json({ success: true, data: resumes });
  } catch (error) {
    console.error("Error fetching all resumes:", error);
    sendError(res, error);
  }
};
var deleteResume2 = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    await adminDeleteResume(req.params.id);
    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    sendError(res, error);
  }
};
var deleteAllResumes2 = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const result = await adminDeleteAllResumes();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting all resumes:", error);
    sendError(res, error);
  }
};
var getAllAtsScores = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const scores = await getAllAtsScoresForAdmin();
    res.json({ success: true, data: scores });
  } catch (error) {
    console.error("Error fetching all ATS scores:", error);
    sendError(res, error);
  }
};
var deleteAtsScore = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    await adminDeleteAtsScore(req.params.id);
    res.json({ success: true, message: "ATS score deleted successfully" });
  } catch (error) {
    console.error("Error deleting ATS score:", error);
    sendError(res, error);
  }
};
var deleteAllAtsScores = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const result = await adminDeleteAllAtsScores();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting all ATS scores:", error);
    sendError(res, error);
  }
};
var getReviews = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const reviews = await prisma.feedback.findMany({
      include: { user: { select: { id: true, name: true, email: true, picture: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    sendError(res, error);
  }
};
var deleteReview = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    await prisma.feedback.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    sendError(res, error);
  }
};
var deleteAllReviews = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const result = await prisma.feedback.deleteMany();
    res.json({ success: true, data: { count: result.count } });
  } catch (error) {
    console.error("Error deleting all reviews:", error);
    sendError(res, error);
  }
};
var toggleReviewHome = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const existing = await prisma.feedback.findUnique({
      where: { id: req.params.id },
      select: { showOnHome: true }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    const review = await prisma.feedback.update({
      where: { id: req.params.id },
      data: { showOnHome: !existing.showOnHome }
    });
    res.json({ success: true, data: review });
  } catch (error) {
    console.error("Error toggling review home:", error);
    sendError(res, error);
  }
};
var markSupportSeen = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastSeenSupportAt: /* @__PURE__ */ new Date() }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking support seen:", error);
    sendError(res, error);
  }
};
var markReviewsSeen = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastSeenReviewsAt: /* @__PURE__ */ new Date() }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking reviews seen:", error);
    sendError(res, error);
  }
};
var getUnreadCounts = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { lastSeenSupportAt: true, lastSeenReviewsAt: true }
    });
    const supportWhere = { status: "open" };
    if (user?.lastSeenSupportAt) {
      supportWhere.createdAt = { gt: user.lastSeenSupportAt };
    }
    const reviewsWhere = {};
    if (user?.lastSeenReviewsAt) {
      reviewsWhere.createdAt = { gt: user.lastSeenReviewsAt };
    }
    const [unreadSupport, unreadReviews] = await Promise.all([
      prisma.supportTicket.count({ where: supportWhere }),
      prisma.feedback.count({ where: reviewsWhere })
    ]);
    res.json({
      success: true,
      data: { unreadSupport, unreadReviews }
    });
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    sendError(res, error);
  }
};

// src/modules/admin-dashboard/admin-dashboard.routes.ts
var router5 = Router5();
router5.use(authenticate);
router5.get("/metrics", getMetrics);
router5.get("/growth", getGrowth);
router5.get("/users", getUsers);
router5.patch("/users/:id/ban", toggleBan);
router5.patch("/users/:id", updateUser);
router5.delete("/users/:id", deleteUser);
router5.get("/support", getSupportTickets);
router5.patch("/support/:id", updateSupportTicket);
router5.delete("/support/:id", deleteSupportTicket);
router5.get("/resumes", getAllResumes2);
router5.delete("/resumes/:id", deleteResume2);
router5.delete("/resumes", deleteAllResumes2);
router5.get("/ats-scores", getAllAtsScores);
router5.delete("/ats-scores/:id", deleteAtsScore);
router5.delete("/ats-scores", deleteAllAtsScores);
router5.get("/reviews", getReviews);
router5.delete("/reviews/:id", deleteReview);
router5.delete("/reviews", deleteAllReviews);
router5.patch("/reviews/:id/toggle-home", toggleReviewHome);
router5.get("/unread-counts", getUnreadCounts);
router5.patch("/last-seen/support", markSupportSeen);
router5.patch("/last-seen/reviews", markReviewsSeen);
var admin_dashboard_routes_default = router5;

// src/modules/support/support.routes.ts
import { Router as Router6 } from "express";
import multer2 from "multer";
import path5 from "path";
import { v4 as uuidv42 } from "uuid";

// src/modules/support/support.controller.ts
var createTicket = async (req, res) => {
  try {
    const { type, title, message } = req.body || {};
    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }
    const attachment = req.file ? `/uploads/${req.file.filename}` : void 0;
    const ticket = await createSupportTicket(req.user.id, {
      type: type || "bug",
      title: title.trim().slice(0, 255),
      message: message.trim(),
      attachment
    });
    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting report"
    });
  }
};
var getMyTicketsController = async (req, res) => {
  try {
    const tickets = await getMyTickets(req.user.id);
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error("Error fetching my tickets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports"
    });
  }
};

// src/modules/support/support.routes.ts
var storage2 = multer2.diskStorage({
  destination: (_req, _file, cb) => cb(null, getUploadsDir()),
  filename: (_req, file, cb) => cb(null, `${uuidv42()}${path5.extname(file.originalname)}`)
});
var uploadScreenshot = multer2({
  storage: storage2,
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "application/pdf"
    ];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: env.maxFileSize }
});
var router6 = Router6();
router6.use(authenticate);
router6.post("/", uploadScreenshot.single("attachment"), createTicket);
router6.get("/mine", getMyTicketsController);
var support_routes_default = router6;

// src/modules/visitor/visitor.routes.ts
import { Router as Router7 } from "express";

// src/modules/visitor/visitor.service.ts
var trackVisitor = async (fingerprint, ipAddress, userAgent) => {
  const existing = await prisma.visitor.findUnique({
    where: { fingerprint }
  });
  if (existing) {
    await prisma.visitor.update({
      where: { fingerprint },
      data: { lastVisitAt: /* @__PURE__ */ new Date(), ipAddress, userAgent }
    });
    return { isNew: false };
  }
  await prisma.visitor.create({
    data: { fingerprint, ipAddress, userAgent }
  });
  await prisma.siteStats.upsert({
    where: { id: "singleton" },
    update: { totalUniqueVisitors: { increment: 1 } },
    create: { id: "singleton", totalUniqueVisitors: 1 }
  });
  return { isNew: true };
};
var getTotalUniqueVisitors = async () => {
  const stats = await prisma.siteStats.findUnique({
    where: { id: "singleton" }
  });
  return stats?.totalUniqueVisitors ?? 0;
};

// src/modules/visitor/visitor.controller.ts
var track = async (req, res) => {
  try {
    const { fingerprint } = req.body;
    if (!fingerprint) {
      return res.status(400).json({ success: false, message: "Fingerprint required" });
    }
    const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "";
    const userAgent = req.headers["user-agent"] || "";
    await trackVisitor(fingerprint, ipAddress, userAgent);
    const totalVisitors = await getTotalUniqueVisitors();
    res.json({
      success: true,
      data: { totalVisitors }
    });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var getCount = async (_req, res) => {
  try {
    const totalVisitors = await getTotalUniqueVisitors();
    res.json({
      success: true,
      data: { totalVisitors }
    });
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// src/modules/visitor/visitor.routes.ts
var router7 = Router7();
router7.post("/track", track);
router7.get("/count", getCount);
var visitor_routes_default = router7;

// src/modules/feedback/feedback.routes.ts
import { Router as Router8 } from "express";

// src/modules/feedback/feedback.service.ts
var createFeedback = async (userId, rating, message) => {
  return prisma.feedback.create({
    data: { userId, rating, message },
    select: {
      id: true,
      rating: true,
      message: true,
      createdAt: true
    }
  });
};

// src/modules/feedback/feedback.controller.ts
var submitFeedback = async (req, res) => {
  try {
    const { rating, message } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }
    const feedback = await createFeedback(req.user.id, rating, message.trim());
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting feedback"
    });
  }
};
var getHomeReviews = async (req, res) => {
  try {
    const reviews = await prisma.feedback.findMany({
      where: { showOnHome: true },
      include: {
        user: { select: { id: true, name: true, picture: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    const mapped = reviews.map((r) => ({
      id: r.id,
      name: r.user.name || "Anonymous",
      role: "",
      content: r.message,
      rating: r.rating
    }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error("Error fetching home reviews:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching home reviews"
    });
  }
};

// src/modules/feedback/feedback.routes.ts
var router8 = Router8();
router8.post("/", authenticate, submitFeedback);
router8.get("/home", getHomeReviews);
var feedback_routes_default = router8;

// src/modules/index.ts
var moduleRoutes = [
  { path: "/api/auth", router: auth_routes_default },
  { path: "/api/users", router: users_routes_default },
  { path: "/api/ats-score", router: atsScoreCheck_routes_default },
  { path: "/api/resumes", router: resumeBuilder_routes_default },
  { path: "/api/admin-dashboard", router: admin_dashboard_routes_default },
  { path: "/api/support", router: support_routes_default },
  { path: "/api/visitor", router: visitor_routes_default },
  { path: "/api/feedback", router: feedback_routes_default }
];

// src/shared/middlewares/errorHandler.ts
var errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";
  console.error(`[Error] ${err.message}`, {
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack
  });
  res.status(statusCode).json({
    success: false,
    message,
    ...env.nodeEnv === "development" && { stack: err.stack }
  });
};

// src/app.ts
dotenv2.config();
var app = express2();
app.set("trust proxy", 1);
applyMiddleware(app);
app.get("/", (_req, res) => {
  res.send("CVScan - Welcome to the API");
});
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "CVScan is healthy"
  });
});
moduleRoutes.forEach(({ path: path6, router: router9 }) => {
  app.use(path6, router9);
});
app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});
app.use(errorHandler);
var app_default = app;

// src/db/connectDB.ts
var connectDB = async () => {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error("\u274C Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
};
var connectDB_default = connectDB;

// src/server.ts
var server_default = app_default;
var isVercel2 = process.env.VERCEL === "1";
if (!isVercel2) {
  const server = http.createServer(app_default);
  const startServer = async () => {
    try {
      await connectDB_default();
      server.listen(env.port);
      console.log(`\u{1F680} Server is running on http://localhost:${env.port}`);
    } catch (error) {
      console.error("\u274C Failed to connect to PostgreSQL:", error);
      process.exit(1);
    }
  };
  startServer();
}
export {
  server_default as default
};
