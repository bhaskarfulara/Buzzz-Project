const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({path:"backend/config/config.env"});
}


//using middleware

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

//importing routes

const post = require("./routes/post");

const user = require("./routes/user");

//using routes

app.use("/api",post);
app.use("/api",user);

//localhost:4000/api/post/upload

module.exports = app