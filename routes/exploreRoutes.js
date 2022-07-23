const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const Post = require('../models/posts');
const {User, Counter} = require('../models/users');
const router = express.Router();

router.get('/', checkAuth, async (req, res)=>{
    let publicPosts = [];
    await Post.find({status: true})
    .then(posts=>{
        if(posts){
            posts.forEach(element => {
                let curPost = [];
                if(element.liked_by.includes(req.userData.user_id)){
                    curPost.push({'liked_by_You' : "liked by me"});
                }
                else curPost.push({'liked_by_You' : "Not liked by me"});
                curPost.push({post: element});
                if(!(element.user_id == req.userData.user_id))publicPosts.push(curPost);
            });
        }
        else{
            publicPosts.push("No Posts yet");
        }
    })
    .catch()

    res.json({success: true, message:"Fetched all public posts", publicPosts});
})

router.get('/liked', checkAuth, async (req, res)=>{
    let publicPosts = [];
    await Post.find()
    .then(posts=>{
        if(posts){
            posts.forEach(element => {
                if(element.liked_by.includes(req.userData.user_id)){
                    if(!(element.user_id == req.userData.user_id))publicPosts.push({post: element});
                }
            });
        }
        else{
            publicPosts.push("No Posts yet");
        }
    })
    .catch()

    res.json({success: true, message:"Fetched all private/public posts", publicPosts});
})

module.exports = router;