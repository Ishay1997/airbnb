import React, { createContext, useState, useEffect } from "react"; // Import useEffect from react
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect( () => {
    if (!user) {
      const {data} =  axios.get("/profile").then(({data})=>{
      setUser(data);
      });
    }
}, []);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;