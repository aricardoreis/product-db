export interface PaginationOptions {
  limit: number;
  page: number;
}

export interface PaginationAndFilterOptions extends PaginationOptions {
  keyword?: string;
}
