export type UserRole = 'FAN' | 'CREATOR' | 'ADMIN';

export type PostType = 'PUBLIC' | 'SUBSCRIBER' | 'PAID';

export interface User {
    id: number;
    email: string;
    name?: string;
    role: UserRole;
    isVerified: boolean;
    createdAt: string;
}

export interface Creator {
    id: number;
    userId: number;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    subscriptionPrice: number;
    isKycVerified: boolean;
    createdAt: string;
}

export interface Post {
    id: number;
    creatorId: number;
    content?: string;
    type: PostType;
    price?: number;
    createdAt: string;
    media: Media[];
}

export interface Media {
    id: number;
    url: string;
    type: 'image' | 'video';
    blurHash?: string;
}
