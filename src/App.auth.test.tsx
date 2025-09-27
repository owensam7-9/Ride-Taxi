import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Store";
import App from "./App";
import { User, onAuthStateChanged } from "firebase/auth";
import * as driverService from "./services/driverService";

// Mock firestore
jest.mock('firebase/firestore', () => {
    const originalModule = jest.requireActual('firebase/firestore');
    return {
        ...originalModule,
        collection: jest.fn(),
        query: jest.fn(),
        where: jest.fn(),
        onSnapshot: jest.fn((query, callback) => {
            // Immediately invoke callback with an empty snapshot
            callback({ docs: [] });
            // Return a mock unsubscribe function
            return jest.fn();
        }),
    };
});

jest.mock("firebase/auth");

// Mock Map component
jest.mock("./Component/map", () => () => <div data-testid="map-mock" />);

// Mock driversLocation
jest.mock("./Component/map/driversLocation", () => ({
  getDrivers: jest.fn().mockResolvedValue({ results: [] }),
}));

// Mock driverService
jest.mock("./services/driverService");

describe("App Authentication", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders Auth page when user is not logged in", async () => {
    localStorage.clear();
    (onAuthStateChanged as jest.Mock).mockImplementation(
      (auth, callback: (user: User | null) => void) => {
        callback(null);
        return () => {};
      }
    );

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Welcome to Ride Cosy")).toBeInTheDocument();
  });

  it("renders Home page when user is logged in", async () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    };
    localStorage.setItem("userName", mockUser.displayName);
    localStorage.setItem("userType", "rider");
    (onAuthStateChanged as jest.Mock).mockImplementation(
      (auth, callback: (user: User | null) => void) => {
        callback(mockUser as User);
        return () => {};
      }
    );

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Where can we pick you up?")).toBeInTheDocument();
    expect(screen.getByTestId("map-mock")).toBeInTheDocument();
  });

  it("renders driver dashboard when driver is logged in", async () => {
    const mockDriver = {
      uid: "456",
      email: "driver@example.com",
      displayName: "Test Driver",
    };
    localStorage.setItem("userName", mockDriver.displayName);
    localStorage.setItem("userType", "driver");
    localStorage.setItem("userId", mockDriver.uid);

    (onAuthStateChanged as jest.Mock).mockImplementation(
      (auth, callback: (user: User | null) => void) => {
        callback(mockDriver as unknown as User);
        return () => {};
      }
    );

    (driverService.getDriverProfile as jest.Mock).mockResolvedValue({
      fullName: "Test Driver",
      vehicleType: "Sedan",
      vehicleModel: "Toyota Camry",
      licensePlate: "123-ABC",
      isVerified: true,
      isAvailable: false,
      rating: 4.8,
      totalRides: 120,
      id: "456",
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/driver/dashboard"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Driver Dashboard")).toBeInTheDocument();
  });
});
