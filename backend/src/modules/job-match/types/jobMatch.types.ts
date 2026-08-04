export interface JobInput {
  title: string;
  company?: string;
  description: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}
