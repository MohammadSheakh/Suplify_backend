export interface PaginateOptions {
  limit?: number;
  page?: number;
  sortBy?: string;
  populate?: any; 
}

export interface PaginateOptionsForConversations extends PaginateOptions {
  search?: string;
}

export interface PaginateResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}
