import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Check if token is expired
        const decodedToken = jwtDecode(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();
        
        if (isExpired) {
          localStorage.removeItem('token');
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        // Get user data
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCurrentUser(response.data.data);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, []);

  // Handle Google login
  const handleGoogleLogin = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5000/api/auth/google', { token });
      
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.data);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Refresh user data
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        handleGoogleLogin,
        logout,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 