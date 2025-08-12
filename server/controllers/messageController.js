import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

// Get all user except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// Get all messages for selected User
export const getMessages = async (req, res) => {
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId:selectedUserId},
                {senderId: selectedUserId, receiverId:myId},
            ]
        })

        await Message.updateMany({senderId:selectedUserId, receiverId:myId}, {seen: true});

        res.json({success: true, messages});
        
    } catch (error) {
        console.log(error.messages);
        res.json({success: false, message: error.message});
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true});

        res.json({success: true})
    } catch (error) {
        console.log(error.messages);
        res.json({success: false, message: error.message});
    }
}

//send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.id;

        // Save message to DB
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image,
        });

        // Emit to recipient if online
        const io = req.app.get('io');
        const userSocketMap = req.app.get('userSocketMap');
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        // Also emit to sender for instant feedback (optional, but safe)
        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, newMessage });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};