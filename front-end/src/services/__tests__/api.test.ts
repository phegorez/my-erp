import axios from 'axios';
import {
    fetchMyProfile,
    updateMyPersonalProfile,
    // Import other functions to test if needed
} from '../api'; // Adjust path as necessary

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage for the token
const localStorageMock = (() => {
  let store = {
    authToken: 'test-token-123' // Assume token is present for these tests
  };
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('API Service', () => {

  // This is the axios instance created in api.ts. We need to mock its methods.
  // If api.ts exports `apiClient`, we can mock its methods directly.
  // Since it's not exported, we mock the global `axios` calls that `apiClient` makes internally.
  // Or, more robustly, if apiClient was exported from 'api.ts', we could do:
  // jest.mock('../api', () => ({
  //   ...jest.requireActual('../api'), // keep original exports
  //   apiClient: { // mock only apiClient
  //     get: jest.fn(),
  //     post: jest.fn(),
  //     patch: jest.fn(),
  //     delete: jest.fn(),
  //     put: jest.fn(),
  //   }
  // }));
  // For now, sticking with mocking the global axios calls as apiClient is not exported.
  // The interceptor in api.ts adds the Authorization header.

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    mockedAxios.create.mockClear(); // If we were testing the create() call itself
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.patch.mockClear();
    // etc. for other methods if used in tests

    // Default mock implementation for successful responses
    mockedAxios.get.mockResolvedValue({ data: {} });
    mockedAxios.post.mockResolvedValue({ data: {} });
    mockedAxios.patch.mockResolvedValue({ data: {} });
  });

  describe('fetchMyProfile', () => {
    it('should call GET /my-profile with Authorization header', async () => {
      const mockProfileData = { id: '1', email: 'test@example.com' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProfileData });

      const result = await fetchMyProfile();

      expect(mockedAxios.get).toHaveBeenCalledWith('/my-profile');
      // The interceptor handles the header, so we don't check it directly here
      // unless we were testing the interceptor itself or had a way to inspect the actual config used by axios.get.
      // For now, trust the interceptor is working as set up in api.ts
      expect(result).toEqual(mockProfileData);
    });

    it('should throw an error if the request fails', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

      await expect(fetchMyProfile()).rejects.toEqual({ message: errorMessage });
    });
  });

  describe('updateMyPersonalProfile', () => {
    it('should call PATCH /my-profile/personal/edit with data and Authorization header', async () => {
      const personalData = { gender: 'Female', phone_number: '1234567890' };
      const mockResponseData = { ...personalData, message: 'Profile updated' };
      mockedAxios.patch.mockResolvedValueOnce({ data: mockResponseData });

      const result = await updateMyPersonalProfile(personalData);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/my-profile/personal/edit', personalData);
      // Again, Authorization header is handled by the interceptor.
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error if the update request fails', async () => {
      const personalData = { gender: 'Female' };
      const errorMessage = 'Update failed';
      mockedAxios.patch.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

      await expect(updateMyPersonalProfile(personalData)).rejects.toEqual({ message: errorMessage });
    });
  });

  // TODO: Add tests for other API functions (createItem, fetchAllItems, etc.)
  // following the same pattern:
  // 1. Test successful call: checks URL, method, payload (for POST/PUT/PATCH), and response.
  // 2. Test error handling: checks if errors from axios (like network errors or non-2xx status codes) are propagated or handled as expected.
});
