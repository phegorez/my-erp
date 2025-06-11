import { AddNewUser, User } from '@/types';
import axios from 'axios';
import { ca } from 'date-fns/locale';
import { use } from 'react';

// Define the base URL for the API. This could be moved to an environment variable.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string; // Assuming backend runs on port 8000

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This allows cookies to be sent with requests
});

// --- Authentication Endpoints ---

export const loginUser = async (credentials: any) => {
  try {
    // console.log(credentials)
    const response = await apiClient.post('/auth/signin', {
      email_address: credentials.email,
      password: credentials.password,
    });

    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/auth/signout');
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
}

// --- User Endpoints ---



// --- Profile Management Endpoints ---

// get all users
export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/users')
    const result = response.data;
    if (!result.ok) {
      throw new Error('Failed to fetch users');
    }
    return result.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
}

export const fetchMyProfile = async () => {
  try {
    const response = await apiClient.get('/my-profile');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

// add a new user
export const addUser = async (userData: AddNewUser) => {
  try {
    const response = await apiClient.post('/users', userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const removeUser = async (userId: string) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
}

// get all departments
export const fetchAllDepartments = async () => {
  try {
    const response = await apiClient.get('/departments');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
}

/**
 * Updates the user's personal information.
 * @param personalData - The personal data to update.
 * @returns The response from the API.
 */
export const updateMyPersonalProfile = async (personalData: any) => {
  try {
    // Example: Get token from localStorage
    const token = localStorage.getItem('authToken');
    const response = await apiClient.patch('/my-profile/personal/edit', personalData, { // Using PATCH as it's often used for partial updates
      headers: {
        // Authorization: `Bearer ${token}`, // Uncomment if backend expects Bearer token
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

// --- Request Management Endpoints ---

/**
 * Creates a new item request.
 * @param requestData - The data for the new request.
 */
export const createRequest = async (requestData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post('/requests', requestData, {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Fetches all requests initiated by the logged-in user.
 */
export const findUserRequests = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/requests/my-requests', {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Fetches a single request by its ID.
 * @param requestId - The ID of the request to fetch.
 */
export const findRequestById = async (requestId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get(`/requests/${requestId}`, {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Marks items in a request as returned.
 * @param requestId - The ID of the request.
 * @param returnData - Optional data related to the return (e.g., notes, condition).
 */
export const returnItems = async (requestId: string, returnData?: any) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post(`/requests/${requestId}/return`, returnData || {}, {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};


// --- Approval Management Endpoints ---

/**
 * Fetches all requests awaiting approval by the logged-in manager.
 */
export const findAllManagerApprovals = async () => {
  try {
    const token = localStorage.getItem('authToken');
    // Assuming the backend distinguishes manager approvals, e.g., by a specific endpoint or query param
    const response = await apiClient.get('/approvals/manager', { // Or just /approvals if backend filters by user role
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Processes a request approval (approve, reject, revise) by a manager.
 * @param approvalId - The ID of the approval record or request ID if that's how it's identified.
 * @param approvalData - Data including status (APPROVED, REJECTED, REVISION_REQUESTED) and comments.
 */
export const processManagerApproval = async (approvalId: string, approvalData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    // The endpoint might be /approvals/:id/process or /requests/:id/approve etc.
    // Using a general /approvals/:id/process-approval for now.
    const response = await apiClient.patch(`/approvals/manager/${approvalId}/process`, approvalData, {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Fetches all requests awaiting approval by the logged-in PIC.
 */
export const findAllPicApprovals = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/approvals/pic', {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Processes a request approval by a PIC.
 * @param approvalId - The ID of the approval/request.
 * @param approvalData - Data including status and comments.
 */
export const processPicApproval = async (approvalId: string, approvalData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.patch(`/approvals/pic/${approvalId}/process`, approvalData, {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Fetches users by role, e.g., for populating a list of managers.
 * This function might already exist or be similar to fetchAllPics.
 * @param role - The role to filter users by (e.g., 'manager', 'pic').
 */
export const fetchUsersByRole = async (role: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get(`/users?role=${role}`, { // Assuming /users endpoint with role filter
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};


// You can add other API functions here as needed, for example:
// export const updateUserPassword = async (passwordData: any) => { ... }


// --- Item Management Endpoints ---

/**
 * Fetches all items.
 * @returns A list of all items.
 */
export const fetchAllItems = async () => {
  try {
    const token = localStorage.getItem('authToken'); // Example token retrieval
    const response = await apiClient.get('/items', {
      headers: {
        // Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Fetches a single item by its ID.
 * @param itemId - The ID of the item to fetch.
 * @returns The item data.
 */
export const fetchItemById = async (itemId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get(`/items/${itemId}`, {
      headers: {
        // Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Creates a new item.
 * @param itemData - The data for the new item.
 * @returns The created item data.
 */
export const createItem = async (itemData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post('/items', itemData, {
      headers: {
        // Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Updates an existing item.
 * @param itemId - The ID of the item to update.
 * @param itemData - The new data for the item.
 * @returns The updated item data.
 */
export const updateItem = async (itemId: string, itemData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.put(`/items/${itemId}`, itemData, { // Or PATCH if partial updates are allowed
      headers: {
        // Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Deletes an item by its ID.
 * @param itemId - The ID of the item to delete.
 * @returns The response from the API.
 */
export const deleteItem = async (itemId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.delete(`/items/${itemId}`, {
      headers: {
        // Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

// --- Category Management Endpoints ---

/**
 * Fetches all categories.
 */
export const fetchAllCategories = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/categories', {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Fetches a single category by its ID.
 * @param categoryId - The ID of the category to fetch.
 */
export const fetchCategoryById = async (categoryId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get(`/categories/${categoryId}`, {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Creates a new category.
 * @param categoryData - The data for the new category (e.g., { name: string, pic_user_id?: string }).
 */
export const createCategory = async (categoryData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post('/categories', categoryData, {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Updates an existing category.
 * @param categoryId - The ID of the category to update.
 * @param categoryData - The new data for the category (e.g., { name: string }).
 */
export const updateCategory = async (categoryId: string, categoryData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.put(`/categories/${categoryId}`, categoryData, {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Deletes a category by its ID.
 * @param categoryId - The ID of the category to delete.
 */
export const deleteCategory = async (categoryId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.delete(`/categories/${categoryId}`, {
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Assigns a PIC to a category.
 * @param categoryId - The ID of the category.
 * @param picUserId - The user ID of the PIC.
 */
export const assignPicToCategory = async (categoryId: string, picUserId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post(`/categories/assign-pic/${categoryId}`, { pic_user_id: picUserId }, { // Assuming endpoint structure
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

/**
 * Fetches all users who are eligible to be PICs.
 * (This might be all users, or users with a specific role).
 */
export const fetchAllPics = async () => {
  try {
    const token = localStorage.getItem('authToken');
    // Adjust endpoint if it's different, e.g., /users?role=pic or a dedicated /pics endpoint
    const response = await apiClient.get('/users?role=pic', { // Assuming backend supports filtering users by role
      headers: { /* Authorization: `Bearer ${token}` */ },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};


export default apiClient;
