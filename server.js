import Express from 'express';
import mongoose from 'mongoose';

const app = Express();


app.use(Express.json())
mongoose.connect("mongodb+srv://highfrag6081_db_user:jubin007@dwittercluster0.rlbutwv.mongodb.net/?appName=dwittercluster0").then(()=>{
    console.log('connected to DB');
    app.listen(3000,()=>{
        console.log('server running in port 3000.')
    })
}).catch(()=>{
    console.log('could not connect to DB')
})
