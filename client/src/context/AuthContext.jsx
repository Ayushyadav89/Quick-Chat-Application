import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendURL;
axios.defaults.headers.common["token"] = localStorage.getItem("token");

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    //Check if User is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/api/auth/check');
            if(data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Login function to handle user authentication and socket connection
    const login = async (state, credentials) => {
        try {
            const {data} = await axios.post(`api/auth/${state}`, credentials);
            if(data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token)
                localStorage.setItem("token", data.token)
                toast.success("Logged In Successfully");
            }
            else{
                toast.error(error.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Logout function to handle user authentication and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged Out Successfully")
        if (socket) socket.disconnect();
    }

    // Update profile function to handle use profile updates
    const updateProfile = async (profileData) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", profileData, {
                headers: { token: localStorage.getItem("token") }
            });
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile Updated Successfully");
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //connect socket function to handle socket connection and online users update
    const connectSocket = (userData) => {
        if (!userData) return;

        if (socket) {
            socket.disconnect();
        }

        const newSocket = io(backendURL, {
            query: {
                userId: userData._id,
            }
        });

        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    }
 
    useEffect(() => {
        if(token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }
        // Don't call checkAuth if no token
    }, [token]);

    const value = {
        axios, authUser, onlineUsers, socket, login, logout, updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}