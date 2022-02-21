export interface ErrnoException extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}

export interface ISortingOptions {
  sort?: string;
  sortColumn?: string;
  sortBy?: string;
  page?: string;
  perPage?: string;
}
