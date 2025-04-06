export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>; // If the backend sends field errors
}

export interface ApiError {
  response?: {
    data: {
      detail?: string;
      error?: string;
      message?: string;
      [key: string]: string[] | string | undefined;
    };
    status: number;
  };
  message?: string;
}

export interface HandleApiErrorResponse {
  error: Record<string, string[]> | string[] | string;
  toastMessage: string;
}
