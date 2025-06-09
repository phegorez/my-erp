import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // For more realistic user interactions
import LoginPage from '../page'; // Adjust path to your LoginPage component
import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // To wrap the component
import * as api from '@/services/api'; // To mock apiLoginUser

// Mock the specific API function used by the login page
jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'), // Import and retain default exports
  loginUser: jest.fn(), // Mock only loginUser
}));

// Mock useAuth hook - this is crucial
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'), // Import and retain default exports like AuthProvider
  useAuth: jest.fn(), // Mock useAuth
}));


// useRouter is already mocked globally in jest.setup.js
// const mockPush = jest.fn();
// jest.mock('next/navigation', () => ({
//   ...jest.requireActual('next/navigation'),
//   useRouter: () => ({
//     push: mockPush,
//     query: {}, // Mock router.query if your page uses it for redirect
//   }),
// }));

describe('Login Page Integration Flow', () => {
  const mockContextLogin = jest.fn();
  let mockRouterPush;

  beforeEach(() => {
    mockContextLogin.mockClear();
    (api.loginUser as jest.Mock).mockClear();

    // Setup default mock for useAuth for each test
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: mockContextLogin, // Provide the mock function here
      logout: jest.fn(),
      hasRole: jest.fn().mockReturnValue(false),
    });

    // Access the globally mocked router's push function for assertions
    // This assumes jest.setup.js correctly mocks useRouter and returns an object with a jest.fn() for push
    const { useRouter } = require('next/navigation');
    mockRouterPush = useRouter().push; // Get the mocked push function
    mockRouterPush.mockClear(); // Clear it for each test run
  });

  test('successful login redirects to dashboard and calls auth context login', async () => {
    const mockApiToken = 'mock-jwt-token';
    (api.loginUser as jest.Mock).mockResolvedValue({ access_token: mockApiToken });

    render(
      <AuthProvider> {/* Ensure LoginPage is wrapped if it relies on AuthProvider internally, though useAuth is mocked */}
        <LoginPage />
      </AuthProvider>
    );

    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockContextLogin).toHaveBeenCalledWith(mockApiToken);
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays error message on failed API login', async () => {
    const errorMessage = 'Invalid credentials';
    (api.loginUser as jest.Mock).mockRejectedValue({ detail: errorMessage }); // Simulate API error with detail

    render(<AuthProvider><LoginPage /></AuthProvider>);

    await userEvent.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(mockContextLogin).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  test('displays validation error for empty fields', async () => {
    render(<AuthProvider><LoginPage /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/both email and password are required/i)).toBeInTheDocument();
    expect(api.loginUser).not.toHaveBeenCalled();
  });

  test('displays validation error for invalid email format', async () => {
    render(<AuthProvider><LoginPage /></AuthProvider>);
    await userEvent.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(api.loginUser).not.toHaveBeenCalled();
  });

  test('redirects to dashboard if already authenticated', async () => {
     // Override default useAuth mock for this specific test
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com', roles: ['user'] },
      login: mockContextLogin,
      logout: jest.fn(),
      hasRole: jest.fn().mockReturnValue(true),
    });

    render(<AuthProvider><LoginPage /></AuthProvider>);

    // The redirect logic is in a useEffect within LoginPage
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
