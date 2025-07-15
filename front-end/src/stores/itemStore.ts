import { addNewItem, deleteItem, updateItem, getMyCategory } from '@/services/api';
import { EditedItem, Item, newItem } from '@/types'
import { create } from 'zustand'
import { useCategory } from './categoryStore';

interface ItemState {
    addNewItem: (newItem: newItem) => Promise<boolean>;
    deleteItem: (itemId: string) => Promise<boolean>;
    editItem: (itemId: string, editedItem: Partial<EditedItem>) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
}

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;
// const { getMyCategory } = useCategory()

export const useItem = create<ItemState>((set) => ({
    isLoading: false,
    error: null,
    addNewItem: async (newItem: newItem) => {
        set({ isLoading: true, error: null });
        try {
            const response = await addNewItem(newItem);
            if (response.ok) {
                set({ isLoading: false });
                return response.ok;
            }
        } catch (error: any) {
            console.error("Failed to add new item:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },
    deleteItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await deleteItem(itemId);
            if (response.ok) {
                set({ isLoading: false });
                return response.ok;
            }
        } catch (error: any) {
            console.error("Failed to delete item:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },
    editItem: async (itemId: string, editedItem: Partial<EditedItem>) => {
        set({ isLoading: true, error: null });
        try {
            const response = await updateItem(itemId, editedItem);
            if (response.ok) {
                set({ isLoading: false });
                await useCategory.getState().getMyCategory() // Refresh categories after editing an item
                return response.ok;
            }
        } catch (error: any) {
            console.error("Failed to edit item:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    }
}));