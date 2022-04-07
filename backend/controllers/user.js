const res = require("express/lib/response");
const Post = require("../models/Post");
const User = require("../models/User");
//register
exports.register = async(req,res) => {
  try{

   const {name,email,password} = req.body;
   let user = await User.findOne({email});
   if(user){ 
        return res
    .status(400)
    .json({
        success:false,
        msg:"user already exists"
    });

    } 


    user = await User.create({name,email,password});

    res.status(201).json({success:true,user});

  }catch(error){

   res.status(500).json({
       success:false,
       message:error.message,
   })

  }


}

// for login code 

exports.login = async (req,res) => {
    try{
    const {email,password} = req.body;
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return res.status(400).json({
            success:false,
            message:"User does not exits"
        });
    }
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return res.status(400).json({
            success:false,
            message:"Incorrect password"
        })
    }
    const token = await user.generateToken();
    res.status(200).cookie("token",token,{expires:new Date(Date.now()+17*24*60*60*1000),
    httpOnly:true,
    
    })
    .json({
        success:true,
        user,
        token,

    })

    }catch(error){
      res.status(500).json({
          message:error.message,
      })
    }
}

//logout

exports.logout = async(req,res)=>{
  try{
      res
      .status(200)
      .cookie("token",null,{expires:new Date(Date.now()),httpOnly:true})
      .json({
        success:true,
        message:"logged out",
      });
  }catch(error){
    res.status(500).json({
        success:false,
        message:error.message,
    });
  }
};

//add friends
exports.friends = async (req,res) => {
    try {
       const userToFriend = await User.findById(req.params.id);
       const loggedInUser = await User.findById(req.user._id); 
       
       if(!userToFriend){
           return res.status(404).json({
               success:false,
               message:"User not found",
           })
       }
       if(loggedInUser.friendslist.includes(userToFriend._id)){

          const index = loggedInUser.friendslist.indexOf(userToFriend._id);
          loggedInUser.friendslist.splice(index,1);

          const index_1 = userToFriend.friends.indexOf(loggedInUser._id);
          userToFriend.friends.splice(index_1,1);

          await loggedInUser.save();
          await userToFriend.save();

          res.status(200).json({
            success:true,
            message:"User Unfriend",
        });


       }

       else{
        loggedInUser.friendslist.push(userToFriend._id);
        userToFriend.friends.push(loggedInUser._id);
 
        await loggedInUser.save();
        await userToFriend.save();
        res.status(200).json({
            success:true,
            message:"User added as friend",
        });
       }
      

    } catch (error) {
        res.status(500).json({
            message:error.message,
        });
    }
}


exports.updatePassword = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("+password");
  
      const { oldPassword, newPassword } = req.body;
  
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Please provide old and new password",
        });
      }
  
      const isMatch = await user.matchPassword(oldPassword);
  
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect Old password",
        });
      }
  
      user.password = newPassword;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password Updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  exports.updateProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const { name, email, avatar } = req.body;
  
      if (name) {
        user.name = name;
      }
      if (email) {
        user.email = email;
      }
  
    //for avatar
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Profile Updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  //incomplete logic 
exports.deleteMyProfile = async (req,res)=>{
  try {

    const user = await   User.findById(req.user._id);
    const posts = user.posts;
    // const friendslist = user.friendslist;
    // const userId = user._id;

    await user.remove();
    //logout user
    res.cookie("token",null,{expires:new Date(Date.now()),httpOnly:true});
    
    

    //delete all post of user
    for(let i=0;i<posts.length;i++){
      const post = await Post.findById(posts[i]);
      await post.remove();

    }

    
    // for(let i=0;i<friendslist.length;i++){
    //   const ff = await User.findById(friendslist[i]);
    //   const index = ff.friends.indexOf(userId);
    //   ff.friends.splice(index,1);
    //   await ff.save();
      

    // }
    res.status(200).json({
      success:true,
      message:"Profile Deleted",
    });

    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.myProfile = async (req,res)=>{
  try {

   const user = await User.findById(req.user._id).populate("posts");

   res.status(200).json({
     success:true,
     user,
   });


    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.getUserProfile = async (req,res)=>{
  try {

    const user = await User.findById(req.params.id).populate("posts");
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not Found",
      });
    }

    res.status(200).json({
      success:true,
      user,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.getAllUsers = async(req,res) =>{ 
  try{
    const users = await User.find({});
    res.status(200).json({
      success:true,
      users,
    });

  }catch(error){
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
}

/*exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetPasswordToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetPasswordToken}`;

    const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
*/

/*exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};*/

exports.getMyPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = [];

    for (let i = 0; i < user.posts.length; i++) {
      const post = await Post.findById(user.posts[i]).populate(
        "likes comments.user owner"
      );
      posts.push(post);
    }

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const posts = [];

    for (let i = 0; i < user.posts.length; i++) {
      const post = await Post.findById(user.posts[i]).populate(
        "likes comments.user owner"
      );
      posts.push(post);
    }

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};