// // import React, { createContext, useState } from "react";
// // const [authState, setAuthState] = useState(null);

// // export const AuthContext = createContext({
// //   isLoggedIn: false,
// //   user: null, // Add user object
// //   login: () => {},
// //   logout: () => {},
// // });
// // export function AuthProvider({ children }) {
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);

// //   // Simulated login/logout functions
// //   const login = () => {
// //     // After successful login
// //     setAuthState({
// //       isLoggedIn: true,
// //       user: {
// //         id: 1,
// //         name: "Authority User",
// //         role: "authority", // or "public"
// //       },
// //     });
// //   };
// //   const logout = () => setIsLoggedIn(false);

// //   return (
// //     <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// import React, { createContext, useState } from "react";

// export const AuthContext = createContext({
//   isLoggedIn: false,
//   user: null,
//   login: () => {},
//   logout: () => {},
// });

// export function AuthProvider({ children }) {
//   const [authState, setAuthState] = useState({
//     isLoggedIn: false,
//     user: null,
//   });

//   const login = () => {
//     setAuthState({
//       isLoggedIn: true,
//       user: {
//         id: 1,
//         name: "Authority User",
//         role: "authority", // or "public"
//       },
//     });
//   };

//   const logout = () => {
//     setAuthState({
//       isLoggedIn: false,
//       user: null,
//     });
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isLoggedIn: authState.isLoggedIn,
//         user: authState.user,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // // AuthContext.jsx
// // // import { createContext, useState } from "react";

// // // export const AuthContext = createContext({
// // //   user: null,
// // //   login: () => {},
// // //   logout: () => {},
// // // });

// // // export function AuthProvider({ children }) {
// // //   const [authState, setAuthState] = useState({
// // //     user: null,
// // //   });

// // //   // Simulated login functions
// // //   const login = (role) => {
// // //     setAuthState({
// // //       user: {
// // //         id: 1,
// // //         name: role === "authority" ? "Police Admin" : "Citizen User",
// // //         role: role,
// // //       },
// // //     });
// // //   };

// // //   const logout = () => {
// // //     setAuthState({ user: null });
// // //   };

// // //   return (
// // //     <AuthContext.Provider
// // //       value={{
// // //         user: authState.user,
// // //         login,
// // //         logout,
// // //       }}
// // //     >
// // //       {children}
// // //     </AuthContext.Provider>
// // //   );
// // // // }
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../lib/supabase"; // adjust this path if needed

// export const AuthContext = createContext({
//   isLoggedIn: false,
//   user: null,
//   login: async () => {},
//   logout: async () => {},
// });

// export function AuthProvider({ children }) {
//   const [authState, setAuthState] = useState({
//     isLoggedIn: false,
//     user: null,
//   });

//   useEffect(() => {
//     const getSession = async () => {
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       if (error) {
//         console.error("Failed to fetch session:", error);
//         return;
//       }

//       if (session?.user) {
//         const role = session.user.user_metadata?.role || "citizen";
//         setAuthState({
//           isLoggedIn: true,
//           user: { ...session.user, role },
//         });
//       }
//     };

//     getSession();

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         if (session?.user) {
//           const role = session.user.user_metadata?.role || "citizen";
//           setAuthState({
//             isLoggedIn: true,
//             user: { ...session.user, role },
//           });
//         } else {
//           setAuthState({
//             isLoggedIn: false,
//             user: null,
//           });
//         }
//       }
//     );

//     return () => subscription.unsubscribe();
//   }, []);

//   const login = async (email, password) => {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) throw error;

//     const role = data.user.user_metadata?.role || "citizen";
//     setAuthState({
//       isLoggedIn: true,
//       user: { ...data.user, role },
//     });
//   };

//   const logout = async () => {
//     await supabase.auth.signOut();
//     setAuthState({
//       isLoggedIn: false,
//       user: null,
//     });
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isLoggedIn: authState.isLoggedIn,
//         user: authState.user,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);


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
