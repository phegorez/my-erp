import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar'; // Adjust path if necessary
import { useAuth } from '@/contexts/AuthContext'; // Will be mocked

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext');

// Mock next/navigation that is used by Navbar's NavLink/Link and for router.push on logout
// This was already in jest.setup.js, but explicit mock here can also work if specific return values are needed for a test suite.
// jest.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//   }),
//   // Link: ({ href, children }) => <a href={href}>{children}</a>, // Basic mock for Link
// }));


describe('Navbar Component', () => {
  const mockLogout = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockLogout.mockClear();
    mockPush.mockClear();
    // Default useRouter mock from jest.setup.js should provide push, but if specific tests need to track it:
    require('next/navigation').useRouter.mockImplementation(() => ({ push: mockPush }));
  });

  test('renders Login and Register links when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      logout: mockLogout,
      hasRole: () => false, // No roles when not authenticated
    });

    render(<Navbar />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  test('renders Dashboard, role-based links, user info, and Logout button when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', roles: ['admin', 'pic'], first_name: 'Test' },
      isLoading: false,
      logout: mockLogout,
      hasRole: (roles: string | string[]) => {
        if (typeof roles === 'string') return ['admin', 'pic'].includes(roles);
        return roles.some(role => ['admin', 'pic'].includes(role));
      },
    });

    render(<Navbar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument(); // admin or pic
    expect(screen.getByText('Categories')).toBeInTheDocument(); // admin
    expect(screen.getByText('Approvals')).toBeInTheDocument(); // admin or pic or manager
    expect(screen.getByText('Test')).toBeInTheDocument(); // User's first name
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  test('calls logout and redirects to login when Logout button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', roles: ['user'], first_name: 'Test' },
      isLoading: false,
      logout: mockLogout,
      hasRole: () => true, // For simplicity, assume user role for this test
    });

    render(<Navbar />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  test('renders loading state when useAuth isLoading is true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      logout: mockLogout,
      hasRole: () => false,
    });

    render(<Navbar />);
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument();
    // Also ensure no functional links are rendered during loading
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

   test('does not render PIC/Admin specific links for a basic user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'user@example.com', roles: ['user'], first_name: 'Basic' },
      isLoading: false,
      logout: mockLogout,
      hasRole: (roleOrRoles: string | string[]) => {
        const userRoles = ['user'];
        if (typeof roleOrRoles === 'string') return userRoles.includes(roleOrRoles);
        return roleOrRoles.some(role => userRoles.includes(role));
      },
    });

    render(<Navbar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Requests')).toBeInTheDocument();
    expect(screen.getByText('Basic')).toBeInTheDocument(); // User's name
    expect(screen.getByText('Logout')).toBeInTheDocument();

    expect(screen.queryByText('Items')).not.toBeInTheDocument();
    expect(screen.queryByText('Categories')).not.toBeInTheDocument();
    expect(screen.queryByText('Approvals')).not.toBeInTheDocument();
  });
});
