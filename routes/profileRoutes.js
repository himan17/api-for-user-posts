const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const Post = require('../models/posts');
const {User, Counter} = require('../models/users');
const router = express.Router();

router.get('/:user_id',checkAuth, async (req, res)=>{
    let user_id = req.params.user_id;
    console.log(typeof user_id, typeof req.userData.user_id);
    if(user_id != req.userData.user_id){
        return res.json({success: false, message: "Can't see secure profile details of another user"})
    }
    let curUser;
    await User.find({user_id: user_id})
    .then(user=>{
        curUser = user;
    }).catch();
    let myPosts;
    await Post.find({user_id: user_id})
    .then(posts=>{
        myPosts= posts;
    })
    .catch();
    res.json({success: true, curUser, myPosts});
});
module.exports = router;