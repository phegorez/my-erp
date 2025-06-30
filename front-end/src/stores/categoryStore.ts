import { fetchAllCategories, fetchAllPics } from '@/services/api';
import { Category, Pic } from '@/types'
import { AxiosError } from 'axios';
import { create } from 'zustand'

interface UserState {
    categories: Category[];
    pics: Pic[];
    isLoading: boolean;
    error: string | null;
    lastFetched: null | number;
    fetchAllCategories: () => Promise<void>;
    fetchAllPics: () => Promise<void>
}

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

export const useCategory = create<UserState>((set) => ({
    categories: [],
    pics: [],
    isLoading: false,
    error: null,
    lastFetched: null,

    fetchAllCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetchAllCategories();
            set({ categories: response, isLoading: false });
        } catch (error: any) {
            console.error("Failed to fetch all users:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false, categories: [] });
        }
    },

    fetchAllPics: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetchAllPics();
            set({ pics: response, isLoading: false });
        } catch (error: any) {
            console.error("Failed to fetch all users:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false, pics: [] });
        }
    },
}));