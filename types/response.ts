import type { User } from "~/types/models";

export interface RefreshTokenResponseData {
    accessToken: string;
}

export interface RegisterResponseData {
    accessToken: string;
    user: User;
}

export type LoginResponseData = RegisterResponseData

export interface FetchUserResponse {
    user: User
}

export type UpdateProfileResponseData = FetchUserResponse;
