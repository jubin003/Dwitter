import jwt from 'jsonwebtoken';

export const protect= async(req,res,next)=>{
    try{
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            return res.status(401).json({message:'no token'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.auth= decoded;

        next();
    }catch(error){
        return res.status(401).json({message:'invalid token'});
    }
}