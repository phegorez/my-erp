// jest.setup.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock localStorage for AuthContext and other tests that might use it
const localStorageMock = (() => {
  let store = {};
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    // Add other router methods if your components use them
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
  }),
  useParams: () => ({
    // Provide mock params if any component under test uses it directly
    // e.g., id: 'mockId'
  }),
  useSearchParams: () => ({
    get: jest.fn((key) => {
        // provide mock search params if needed
        if (key === 'redirect') return '/mock-redirect-path';
        return null;
    }),
    // Add other useSearchParams methods if used
  }),
  // Mock Link component if it causes issues, though usually it's fine
  // Link: ({ href, children }) => <a href={href}>{children}</a>,
}));

// You can add other global mocks or setup here
// For example, if you use a logging library, you might want to suppress its output during tests:
// jest.mock('@/lib/logger', () => ({
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// }));

// Polyfill for TextEncoder and TextDecoder if not available in JSDOM (sometimes needed for JWT libraries)
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}
