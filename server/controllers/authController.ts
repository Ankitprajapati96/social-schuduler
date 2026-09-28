import { Request, Response } from "express";
import { User } from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const generateToken = (id: string) => {
    return jwt.sign({id}, process.env.JWT_SECRET || "fallback_secret", {expiresIn: '30d'} );
}
// Register
// Post /api/auth/register


export const registerUser = async (req:Request, res: Response): Promise<void> => {
    try {
        const {email, name, password} = req.body;
        const userExist = await User.findOne({email})
        if(userExist){
            res.status(400).json({message: "User already Exists"})
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({name, email, password: hashedPassword})

        if(user){
            res.status(201).json({id: user._id, name: user.name, email: user.email, token: generateToken(user._id.toString())})
        }else{
            res.status(400).json({message: "Invalid user Data "})
        }

    } catch (error: any) {
        res.status(500).json({message: error?.message ||  "server Error"})
    }
}

// Login
// Post /api/auth/login


export const loginUser = async (req:Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email})

        if(user && (await bcrypt.compare(password, user.password))){
           res.status(201).json({id: user._id, name: user.name, email: user.email, token: generateToken(user._id.toString())})
        }else{
            res.status(400).json({message: "Invalid user Data "})
        }

    } catch (error: any) {
        res.status(500).json({message: error?.message ||  "server Error"})
    }
}
