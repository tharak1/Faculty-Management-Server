const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/databaseConnection");
const cors = require("cors")

const PORT = process.env.PORT || 3124

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/faculty',require("./routes/facultyRoutes"));

app.listen(PORT,"0.0.0.0",()=>{
    console.log("Server is running at port : ",PORT);
    window.print("jjjjjj");
})