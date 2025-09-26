import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './Store';
import App from './App';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock Map component
jest.mock('./Component/map', () => () => <div data-testid="map-mock" />);


// Mock driversLocation
jest.mock('./Component/map/driversLocation', () => ({
  getDrivers: jest.fn().mockResolvedValue({ results: [] }),
}));

describe('App Component', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    window.localStorage.clear();
  });

  const renderApp = () => {
    return render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  };

  test('renders loading indicator initially', () => {
    renderApp();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('renders Auth page when user is not logged in', async () => {
    renderApp();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Welcome to Ride Cosy/i)).toBeInTheDocument();
  });

  test('renders Home page when user is logged in', async () => {
    window.localStorage.setItem('userName', 'Test User');
    renderApp();
    act(() => {
        jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Where can we pick you up?/i)).toBeInTheDocument();
    expect(screen.getByTestId('map-mock')).toBeInTheDocument();
  });

});
