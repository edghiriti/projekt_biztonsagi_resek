import React, { createContext, useContext, useState} from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {

    const token = localStorage.getItem('authToken');
    return !!token;
  });

  const login = (token, userName) => {
    console.log(userName);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userName', userName)
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
  };

  const getAuthToken = () => localStorage.getItem('authToken');

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};
