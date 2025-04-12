import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; 

export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: async () => {},
  signup: async () => {}, 
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
  });

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Failed to fetch session:", error);
        return;
      }

      if (session?.user) {
        const role = session.user.user_metadata?.role || "citizen";
        setAuthState({
          isLoggedIn: true,
          user: { ...session.user, role },
        });
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const role = session.user.user_metadata?.role || "citizen";
        setAuthState({
          isLoggedIn: true,
          user: { ...session.user, role },
        });
      } else {
        setAuthState({
          isLoggedIn: false,
          user: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const role = data.user.user_metadata?.role || "citizen";
    setAuthState({
      isLoggedIn: true,
      user: { ...data.user, role },
    });
  };

  const signup = async (email, password, role = "citizen") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }, 
      },
    });

    if (error) throw error;

    if (data?.user) {
      setAuthState({
        isLoggedIn: true,
        user: { ...data.user, role },
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthState({
      isLoggedIn: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: authState.isLoggedIn,
        user: authState.user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
