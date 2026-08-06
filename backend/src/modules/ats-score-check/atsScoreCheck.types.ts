export interface GenerateAnalysisInput {
  resumeId: string;
  jobDescription: string;
}

export interface RunResumeAnalysisResult {
  analysis: any;
  credits: number;
}
