const express =require("express")
const cors =require("cors")
const mongoose =require("mongoose")

const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

//For Login and Register

mongoose.connect("mongodb://localhost:27017/myLoginRegisterDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("DB connected")
})

const userSchema = new mongoose.Schema({
    fname: {type:String,required:true},
    lname:{type:String},
    Designation:{type:String},
    MyWebsite:String,
    Gender:String,
    city:String,
    state:String,
    zipcode:{type:Number,maxlength:6},
    email: {type:String,required:true},
    dob:{type:Date},
    password:{type:String}
})

const User = new mongoose.model("User", userSchema)

//Routes
app.post("/login", (req, res)=> {
    const { email, password} = req.body
    User.findOne({ email: email},(err, user) => {
        if(user){
            if(password === user.password ) {
                res.send({message: "Login Successfull", user: user})
                
            } else {
                res.send({ message: "Password didn't match"})
            }
        } else {
            res.send({message: "User not registered"})
        }
    })
}) 

app.post("/register", (req, res)=> {
    const { name, email, password} = req.body
    User.findOne({email: email}, (err, user) => {
        if(user){
            res.send({message: "User already registerd"})
        } else {
            const user = new User({
                name,
                email,
                password
            })
            user.save(err => {
                if(err) {
                    res.send(err)
                } else {
                    res.send( { message: "Successfully Registered, Please login now." })
                }
            })
        }
    })
    
})

// For user profile






app.listen(9002,() => {
    console.log("BE started at port 9002")
})