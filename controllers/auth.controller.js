import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const register = async (req, res) => {
    try{
        const {username,email,password,bio}= req.body; 
        const pass= bcrypt.hash(password,10);

        const user= await User.create(req.body,{password:pass});
        if(user){
            res.status(200).json({message:`${username} account was created.`})
        }else{
            res.status(400).json({message:`${username} account not created`})
        }
    }catch(error){
        res.status(500).json({message:error.message})
    }
    

}

export const login = async(req,res)=>{
    try{
        const {email,password}= req.body;
        const user= await User.findOne(email);
        if(!user){
            return res.status(400).json({message:'no user found'})

        }
        const macthed= bcrypt.compare(password,user.password);
        if(!matched){
            return res.status(400).json({message:'wrong credentials'})
        }
        const token =jwt.sign(
            {id:user._id},
            process.env.JWT_SECRET
        )
        res.status(200).json({token:token})

    }catch(error){
        res.status(500).json({message:error.message})
    }
}



