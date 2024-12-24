import axios, { AxiosInstance } from "axios";

class AuthService {
  api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3000',
    });

    // Automatically set JWT token on the request headers for every request
    this.api.interceptors.request.use((config) => {
      // Retrieve the JWT token from the local storage
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        config.headers.set('Authorization', `Bearer ${storedToken}`);
      }

      return config;
    });
  }

  // Send a POST request to the server to log in the user
  async login(requestBody: object) { 
    return this.api.post("/login", requestBody);
  };

  // Send a GET request to the server to verify the user's JWT token
  async verify() { 
    return this.api.get("/verify");
  };
}

const authService = new AuthService();

export default authService;