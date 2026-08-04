export interface UpdateProfileData {
  name?: string;
  preferences?: {
    theme?: "light" | "dark" | "system";
    defaultTemplate?: string;
    notifications?: boolean;
  };
}
