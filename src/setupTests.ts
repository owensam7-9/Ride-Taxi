// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock react-media-hook
jest.mock('react-media-hook', () => ({
  useMedia: () => ({ matches: false }),
  useMediaPredicate: () => false,
}));

// Mock Firebase
jest.mock('./firebase', () => ({
  app: jest.fn(),
  auth: jest.fn(),
  db: jest.fn(),
  rtdb: jest.fn(),
  storage: jest.fn(),
}));
