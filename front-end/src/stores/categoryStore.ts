import { createCategory, deleteCategory, fetchAllCategories, fetchAllPics, getMyCategory, unAssignPic, updateCategory } from '@/services/api';
import { AddNewCategory, Category, MyCategory, Pic } from '@/types'
import { AxiosError } from 'axios';
import { create } from 'zustand'

interface CategoryState {
    categories: Category[];
    myCategories: MyCategory[];
    pics: Pic[];
    isLoading: boolean;
    error: string | null;
    lastFetched: null | number;
    addNewCategory: (newCategory: AddNewCategory) => Promise<boolean>;
    fetchAllCategories: () => Promise<void>;
    updateCategory: (categoryId: string, categoryName: string) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    fetchAllPics: () => Promise<void>
    getMyCategory: () => Promise<void>;
    unAssignPic: (picId: string) => Promise<void>;
    refreshMyCategories: () => Promise<void>
}

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

export const useCategory = create<CategoryState>((set) => ({
    categories: [],
    myCategories: [],
    pics: [],
    isLoading: false,
    error: null,
    lastFetched: null,

    addNewCategory: async (newCategory: AddNewCategory) => {
        set({ isLoading: true, error: null });
        try {
            const response = await createCategory(newCategory);
            if (response.ok) {
                set({ isLoading: false });
                return response.ok
            }
        } catch (error: any) {
            console.error("Failed to add new user:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
        }
    },

    updateCategory: async (categoryId: string, categoryName: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await updateCategory(categoryId, categoryName);
            if (response.ok) {
                set({ isLoading: false });
                return response.ok;
            } else {
                throw new Error("Failed to update category");
            }
        } catch (error: any) {
            console.error("Failed to update category:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
        }
    },

    deleteCategory: async (categoryId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await deleteCategory(categoryId);
            if (response.ok) {
                set({ isLoading: false });
                return response.message;
            } else {
                throw new Error("Failed to delete category");
            }
        } catch (error: any) {
            console.error("Failed to delete category:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
        }
    },

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

    getMyCategory: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await getMyCategory();
            // console.log('response', response.data)
            set({ myCategories: response.data, isLoading: false });
        } catch (error: any) {
            console.error("Failed to fetch my categories:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false, myCategories: [] });
        }
    },

    unAssignPic: async (user_id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await unAssignPic(user_id);
            if (response.ok) {
                set({ isLoading: false });
                return response.message;
            } else {
                throw new Error("Failed to unassign PIC");
            }
        } catch (error: any) {
            console.error("Failed to unassign PIC:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
        }
    },
    refreshMyCategories: async () => {
        // Re-fetch ข้อมูลใหม่
        const current = useCategory.getState();
        await current.getMyCategory();
    },
}));