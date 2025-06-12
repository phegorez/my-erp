import { addUser, editUser, fetchAllDepartments, fetchAllUsers, removeUser } from '@/services/api';
import { AddNewUser, Department, EditedUserData, User } from '@/types'
import { AxiosError } from 'axios';
import { th } from 'date-fns/locale';
import { create } from 'zustand'

interface UserState {
    users: User[];
    departments: Department[];
    isLoading: boolean;
    error: string | null;
    lastFetched: null | number;
    addNewUser: (userData: AddNewUser) => Promise<boolean>;
    editeUser: (userId: string, editedUserData: EditedUserData) => Promise<boolean | undefined>;
    fetchAllUsers: () => Promise<void>;
    deleteUser: (userId: string) => void;
    getDepartments: () => Promise<void>;
}

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

export const useUserStore = create<UserState>((set) => ({
    users: [],
    departments: [],
    isLoading: false,
    error: null,
    lastFetched: null,

    addNewUser: async (userData: AddNewUser) => {
        set({ isLoading: true, error: null });
        try {
            const response = await addUser(userData);
            if (response.ok) {
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

    editeUser: async (userId: string, editedUserData: EditedUserData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await editUser(userId, editedUserData);
            if (response.ok) {
                // fetch the updated list of users after editing
                const updatedUsers = await fetchAllUsers();
                set({ users: updatedUsers, isLoading: false, error: null });
                return true;
            }
        } catch (error: any) {
            console.error("Failed to edit user:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
        }
    },

    fetchAllUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetchAllUsers();
            set({ users: response, isLoading: false });
        } catch (error: any) {
            console.error("Failed to fetch all users:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false, users: [] });
        }
    },

    deleteUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await removeUser(userId);
            if (response.ok) {
                // fetch the updated list of users after deletion
                const updatedUsers = await fetchAllUsers();
                set({ users: updatedUsers, isLoading: false, error: null });
            }
        } catch (error: any) {
            console.error("Failed to delete user:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
        }
    },

    getDepartments: async () => {
        set({ isLoading: true, error: null });
        const cachedData = localStorage.getItem('departmentCache');
        if (cachedData) {
            try {
                const { data, timestamp } = JSON.parse(cachedData);
                if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
                    set({ departments: data, isLoading: false, lastFetched: timestamp });
                    return;
                }
            } catch (error) {
                localStorage.removeItem('departmentCache')
                throw new Error("Failed to parse cached data");
            }
        }
        try {
            const response = await fetchAllDepartments()
            if (response.ok) {
                // fetch the updated list of users after deletion
                set({ departments: response.allDepartments, isLoading: false, lastFetched: Date.now(), error: null });
                localStorage.setItem('departmentCache', JSON.stringify({ data: response.allDepartments, timestamp: Date.now() }));
            }
        } catch (error: any) {
            console.error("Failed to delete user:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data.message || error.response.data.detail || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
        }
    }
}));