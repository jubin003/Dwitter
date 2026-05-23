import jwt from 'jsonwebtoken';

export const protect= async(req,res,next)=>{
    try{
        token = req.headers.authorization?.split(' ')[1];
        if(!token){
            res.status(400).json({message:'no token'});
        }
        const decoded = jwt.verify(token,JWT_SECRET)
        req.auth= decoded;

        next();


    }catch(error){
        res.status(401).json({message:'invalid token'});
    }
}