import mongoose from "mongoose"

const connectDb = async()=>{
    try {
       const db= await mongoose.connect(process.env.MONGODB_URL);
       console.log(db.connection.host);
       console.log(db.connection.name);
        
    } catch (error) {
        console.log(error)
        
    }
}

export default connectDb;