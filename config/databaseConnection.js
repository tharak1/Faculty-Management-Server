const mongoose = require("mongoose");

const connectDB = async()=>{
        const connection = mongoose.connect(process.env.MONGO_KEY)
        .then(() => console.log("database connected"))
        .catch((err)=>console.log(err));
}

module.exports = connectDB;

