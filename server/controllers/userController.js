import { generateToken } from "../lib/urils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"

// SignUp a new user
export const signup = async () => {
    const {fullName, email, password, bio} = req.body;

    try{
        if(!fullName || !email || !password || !bio) {
            return res.json({success: false, message: "Missing Details"});
        }

        const user = await User.findOne({email})

        if(user) {
            return res.json({success: false, message: "User is Already Exits"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id)

        return res.json({success: true, userData: newUser, token, message: "Account Created Successfully"});
    }
    catch(error) {
        console.log(error.message);

        return res.json({success: false, message: error.message});
    }
}

//Login a User
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect) {
            return res.json({success: false, message: "Invalid Password"});
        }

        const token = generateToken(userData._id)

        return res.json({success: true, userData, token, message: "Account Created Successfully"});
    }
    catch(error) {
        console.log(error.message);

        return res.json({success: false, message: error.message});
    }
}