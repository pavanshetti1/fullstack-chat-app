import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) =>{
    const {fullname, email, password} = req.body;

    try {
        if(!fullname || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6 ){
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }

        const user = await User.findOne({email});
        
        if(user){
            return res.status(400).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword
        })

        if(newUser){
            const token = generateToken(newUser._id, res);
            await newUser.save();
            return res.status(201).json({message: "User created successfully", token});
        } else{
           return res.status(400).json({message: "Invalid user data"});
        }

    } catch (error) {
        res.status(500).json({message: "Internal server error"});
        console.log("in the signup controller ",error.message);
    }
}

export const login = async (req, res) =>{
    const {email, password} = req.body;

    try {
        
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await User.findOne({email});   
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }       

        const token = generateToken(user._id, res);
        return res.status(200).json({message: "User logged in successfully", token});

    } catch (error) {
        console.log("in the login controller ",error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const logout = (req, res) =>{
    res.clearCookie("token");
    res.status(200).json({message: "User logged out successfully"});
}

export const updateProfile = async (req, res) =>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message: "Profile picture is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updateduser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new : true});

        res.status(200).json({message: "Profile picture updated successfully", updateduser});   

    } catch (error) {
        console.log("in the updateProfile controller ",error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in the check auth ", error.message);
        return res.status(500).json({message : "Internal Server Error"});
    }
}