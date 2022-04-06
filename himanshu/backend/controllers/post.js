const res = require("express/lib/response");
const Post= require("../models/Post");
const User = require("../models/User");
exports.createPost = async (req,res) => {
    try{
        const newPostData = {
            caption:req.body.caption,
            image:{
                public_id:"req.body.public_id",
                url:"req.body.url",
            },
            owner:req.user._id,
           
        };
        const newPost = await Post.create(newPostData);

        const user = await User.findById(req.user._id);

        user.posts.push(newPost._id);

        
        
        await user.save();

        

        res.status(201).json({
            success:true,
            post:newPost,
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }

};
exports.deletePost = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
  
      if (post.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
  
      //await cloudinary.v2.uploader.destroy(post.image.public_id);
  
      await post.remove();
  
      const user = await User.findById(req.user._id);
  
      const index = user.posts.indexOf(req.params.id);
      user.posts.splice(index, 1);
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Post deleted",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  

exports.likeAndUnlikePost = async(req,res) =>{
    try{
      const post = await Post.findById(req.params.id);

      if(!post){
          return res.status(404).json({
              success:false,
              message:"post not found",
          });
      }
      if(post.likes.includes(req.user._id)){
          const index = post.likes.indexOf(req.user._id);
          post.likes.splice(index,1);
          await post.save();
          return res.status(200).json({
              success:true,
              message:"post unlinked",
          });
      }
      else{
        post.likes.push(req.user._id);
        await  post.save();
        return res.status(200).json({
            success:true,
            message:"post liked",
        });
      }
     
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};