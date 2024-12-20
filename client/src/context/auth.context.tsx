import { createContext, useState, useEffect, PropsWithChildren } from "react";
import authService from "../services/auth.service";
import { User } from "../types";

const AuthContext = createContext({} as context);

interface context {
  user: null | User
  authenticateUser: ()=> void
  logOutUser: ()=> void
}

function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<null | User>(null);

  async function authenticateUser() {
    const authToken = localStorage.getItem("authToken"); // Get the stored token from the localStorage

    if (authToken) {
      try {
        const response = await authService.verify();
        const payload = response.data;
        setUser(payload); // If the server verifies that JWT token is valid, set the user state to the payload
      } catch {
        setUser(null); // If the token is invalid, the server will return an error
        alert('Your session has expired. Please log in again.')
      }
    } else {
      setUser(null); // If there is no token in the localStorage
    }
  };

  function logOutUser() {
    localStorage.removeItem("authToken"); // remove the token from the localStorage
    setUser(null);
  };

  useEffect(() => {
    // This effect runs when the application and the AuthProvider component load for the first time.
    authenticateUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticateUser,
        logOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };
