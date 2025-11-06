import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthWrapper = (props) => {
    const [user, setUser] = useState(null);
    const [isAppLoading, setAppLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                console.error("Token không hợp lệ:", err);
                localStorage.removeItem("access_token");
            }
        }
        setAppLoading(false);
    }, []);

    // console.log("Token:", user);

    return (
        <AuthContext.Provider value={{
            user, setUser, isAppLoading, setAppLoading, cartCount, setCartCount
        }}>
            {props.children}
        </AuthContext.Provider>
    )
};
