import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"; // Ensure your Flask backend serves under /api

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication Service
export const authService = {
  register: async (userData: any) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    // Potentially call a backend logout endpoint if it exists
  },
  getCurrentUser: () => {
    // This would typically involve decoding the token or a /me endpoint
    // For now, just check if token exists
    return localStorage.getItem("token"); 
  }
};

// Flight Service (for Tenants/Suppliers)
export const flightService = {
  getFlights: async () => {
    const response = await apiClient.get("/tenant/flights");
    return response.data;
  },
  getFlightById: async (flightId: string) => {
    const response = await apiClient.get(`/tenant/flights/${flightId}`);
    return response.data;
  },
  createFlight: async (flightData: any) => {
    const response = await apiClient.post("/tenant/flights", flightData);
    return response.data;
  },
  updateFlight: async (flightId: string, flightData: any) => {
    const response = await apiClient.put(`/tenant/flights/${flightId}`, flightData);
    return response.data;
  },
  deleteFlight: async (flightId: string) => {
    const response = await apiClient.delete(`/tenant/flights/${flightId}`);
    return response.data;
  },
  uploadFlightsCSV: async (formData: FormData) => {
    const response = await apiClient.post("/tenant/flights/upload_csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Tenant Dashboard/Bookings Service
export const tenantDashboardService = {
  getDashboardStats: async () => {
    // Replace with actual endpoint if available, e.g., /tenant/dashboard/stats
    // Mocking for now as it wasn't explicitly defined in backend MVP
    // const response = await apiClient.get("/tenant/dashboard/stats"); 
    // return response.data;
    return Promise.resolve({
        totalFlights: 0, // Placeholder
        totalBookings: 0, // Placeholder
        totalRevenue: 0, // Placeholder
    });
  },
  getBookings: async () => {
    const response = await apiClient.get("/tenant/dashboard/bookings"); // Assuming this endpoint exists from backend MVP
    return response.data;
  },
};

// Tenant Profile Service
export const tenantProfileService = {
    getProfile: async () => {
        // const response = await apiClient.get("/tenant/profile");
        // return response.data;
        // Mocking as /tenant/profile wasn't explicitly in backend MVP, but user profile was
        return Promise.resolve({ name: "Mock Tenant", email: "tenant@example.com" });
    },
    updateProfile: async (profileData: any) => {
        // const response = await apiClient.put("/tenant/profile", profileData);
        // return response.data;
        console.log("Updating tenant profile (mock):", profileData);
        return Promise.resolve({ message: "Profile updated successfully (mock)" });
    }
};

// Generic error handler (optional, can be expanded)
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || new Error("An API error occurred");
  } else {
    console.error("Unexpected Error:", error);
    throw new Error("An unexpected error occurred");
  }
};

// You can re-export services or combine them
export const api = {
    auth: authService,
    flights: flightService,
    dashboard: tenantDashboardService,
    profile: tenantProfileService,
    // ... other services for User Portal will go here or in a separate file
};

export default apiClient;

