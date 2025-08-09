import jwt from "jsonwebtoken";

//Function to create a Token for a user

export const generateToken = (userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}