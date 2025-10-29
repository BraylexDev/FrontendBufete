export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: string[];
    timestamp: string;
    path?: string;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}