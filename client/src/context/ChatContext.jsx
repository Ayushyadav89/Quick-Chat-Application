import { useContext, useState, useEffect, createContext } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, authUser } = useContext(AuthContext);

    // Function to get all users for Sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get('/api/messages/users');
            if (data.success) {
                // Filter out the logged-in user
                const filteredUsers = data.users.filter(user => user._id !== authUser?._id);
                setUsers(filteredUsers);
                setUnseenMessages(data.unseenMessages || {});
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to get messages for selected User
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages.filter(Boolean));
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to send messages to selected User
    const sendMessages = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to subscribe to messages for selected user
    const subscribeMessages = () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
                        ? prevUnseenMessages[newMessage.senderId] + 1
                        : 1,
                }));
            }
        });
    };

    // Function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if (socket) {
            socket.off("newMessage");
        }
    };

    useEffect(() => {
        subscribeMessages();
        return () => unsubscribeFromMessages();
        // eslint-disable-next-line
    }, [socket, selectedUser]);

    useEffect(() => {
        // Only fetch users if authUser exists (i.e., after login/signup)
        if (authUser) {
            getUsers();
        }
    }, [authUser]);

    // Restore selectedUser from localStorage only after users are fetched
    useEffect(() => {
        if (users.length > 0) {
            const savedUser = localStorage.getItem("selectedUser");
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                // Check if the user still exists in the users list
                const stillExists = users.find(u => u._id === parsedUser._id);
                if (stillExists) {
                    setSelectedUser(parsedUser);
                } else {
                    setSelectedUser(null);
                    localStorage.removeItem("selectedUser");
                }
            }
        }
    }, [users]);

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser]);

    // Clear messages when no user is selected
    useEffect(() => {
        if (!selectedUser) setMessages([]);
    }, [selectedUser]);

    // When selecting a user
    const handleSetSelectedUser = (user) => {
        setSelectedUser(user);
        localStorage.setItem("selectedUser", JSON.stringify(user));
    };

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        setMessages,
        sendMessages,
        setSelectedUser: handleSetSelectedUser, // Export the new function
        unseenMessages,
        setUnseenMessages,
        getMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};