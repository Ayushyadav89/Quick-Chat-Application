import express from "express"
import "dotenv/config"
import cors from "cors"
import http from "http"
import { log } from "console"
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/userRoute.js"
import messageRouter from "./routes/messageRoute.js"
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const app = express()
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors: { origin: "*" }
});
app.set('io', io); // Attach io to the app

// Store online Users
const userSocketMap = {};
app.set('userSocketMap', userSocketMap);

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        if (userId) delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

app.use(express.json({limit: "4mb"}))
app.use(cors({ origin: "*" }))

// Route setup
app.use("/api/status", (req, res) => res.send("Server is Live"))
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

await connectDB();

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log("Server is running on PORT :" + PORT))