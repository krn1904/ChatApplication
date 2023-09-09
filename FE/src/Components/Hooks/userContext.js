import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function useUserContext() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const setUserDetails = (userData) => {
    setUser(userData);
  };

  const removeUserDetails = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUserDetails, removeUserDetails }}>
      {children}
    </UserContext.Provider>
  );
}