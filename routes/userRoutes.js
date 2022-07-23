const express = require('express');
const router = express.Router();
const {registerValidator, loginValidator} = require('../validators/authValidators');
const {User, Counter} = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth');
const { use } = require('./postRoutes');
require('dotenv').config();

let incdCnt;
async function incdUser_id(){
        await Counter.findOneAndUpdate({_id: 'incID'}, { $inc : {cnt: 1} })
        .then(async (obj)=>{
            if(obj){
                console.log(obj.cnt);
                incdCnt = obj.cnt+1;
            }
            else{
                await Counter.create({_id: 'incID', cnt: 1})
                .then()
                .catch(er=>{
                    console.log(er);
                });
                incdCnt = 1
            }
            console.log(obj);
        })
        .catch((er)=>{
            console.log(er);
        });
        console.log("Inside inc cnt", incdCnt);
}
const decdUser_id = async()=>{
        await Counter.findOneAndUpdate({_id: 'incID', cnt: {$gte: 1}}, { $inc : {cnt: -1} })
        .then(()=>{
        })
        .catch((er)=>{
            console.log(er);
        });
}
function createToken(id, id2){
    let token = jwt.sign({_id: id, user_id: id2}, process.env.APP_SECRET, {expiresIn: 3*24*60*60});
    return token;
}

router.post('/register', async (req, res)=>{
    console.log(req.body);
    const user = req.body;
    const {isValid, errors} = await registerValidator(req.body);
    console.log(isValid, errors);
    if(isValid){
        await incdUser_id();
        const salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(user.password, salt);
        const newUser = {
            name: user.name,
            user_id: incdCnt,
            password: hashedPassword,
            email: user.email,
            user_name: user.user_name,
            gender: user.gender,
            mobile: user.mobile,
            profile: user.profile
        }
        console.log(newUser);
        User.create(newUser)
        .then((curUser)=>{
            let token = createToken(curUser._id, curUser.user_id);
            res.json({success: true, message: "User registered successfully", token: token});
        })
        .catch(async (er)=>{
            await decdUser_id();
            res.json({success: false, type: "Mongoose error", er})
        });
    }
    else{
        res.json({success: false, type: "Invalid Input", errors});
    }
});

router.post('/login', (req, res)=>{
    const {isValid, errors} = loginValidator(req.body);
    if(isValid){
        User.findOne({email: req.body.email})
        .then(user=>{
            if(user){
                if(bcrypt.compareSync(req.body.password, user.password)){
                    let token = createToken(user._id, user.user_id);
                    res.json({success: true, message: "Logged in successfully", token: token});
                }
                else{
                    res.json({success: false, errors: "Password doesn't match, try again"});
                }
            }
            else{
                res.json({success: false, errors: "User not registered"});
            }
        })
        .catch()
    }
    else{
        res.json({success: false, type: "Invalid Input", errors});
    }
});

router.post('/follow-user', checkAuth, async (req, res)=>{
    if(!req.body.user_id)
        return res.json({error: "Invalid post request, must have 'user_id' -user to be followed in req body"})
    let userFollowers = [];
    let yourFollowing = [];
    let userErrors = {success: true};
    await User.findOneAndUpdate({user_id: req.body.user_id}, {$addToSet : {followers: req.userData.user_id} }, {new: 'true'})
    .then(async (user)=>{
        if(user){
            userFollowers = user.followers;
            await User.findOneAndUpdate({user_id: req.userData.user_id}, {$addToSet : {following: req.body.user_id}}, {new: 'true'})
            .then(user=>{
                if(user){
                    yourFollowing = user.following;
                }
            })
            .catch();
        }
        else{
            userErrors = {success: false, message: "User doesnot exists"};
        }
    })
    .catch();
    if(!userErrors.success){
        return res.json({userErrors});
    }
    console.log(req.userData.user_id, req.body.user_id);
    res.json({success: true, your_following: yourFollowing, his_followers: userFollowers});
})

router.post('/unfollow-user', checkAuth, async (req, res)=>{
    if(!req.body.user_id)
    return res.json({error: "Invalid post request, must have 'user_id' -user to be followed in req body"})
    let userFollowers = [];
    let yourFollowing = [];
    let userErrors = {success: true};
    await User.findOneAndUpdate({user_id: req.body.user_id}, {$pull : {followers: req.userData.user_id} }, {new: 'true'})
    .then(async (user)=>{
        if(user){
            userFollowers = user.followers;
            await User.findOneAndUpdate({user_id: req.userData.user_id}, {$pull : {following: req.body.user_id}}, {new: 'true'})
            .then(user=>{
                if(user){
                    yourFollowing = user.following;
                }
            })
            .catch();
        }
        else{
            userErrors = {success: false, message: "User doesnot exists"};
        }
    })
    .catch();
    if(!userErrors.success){
        return res.json({userErrors});
    }
    console.log(req.userData.user_id, req.body.user_id);
    res.json({success: true, your_following: yourFollowing, his_followers: userFollowers});    
});

router.post('/like-post', checkAuth, async(req, res)=>{
    if(!req.body._id)
        return res.json({error: "Invalid post request, must have '_id' - id of post to be liked"});
        let postStatus;
        let postErrors = {success: true};
        await Post.findOneAndUpdate({_id: req.body._id}, {$addToSet : {liked_by: req.userData.user_id} }, {new: 'true'})
        .then((post)=>{
            if(post){
                postStatus = post;
            }
            else{
                postErrors = {success: false, message: "Post does not exists"};
            }
        })
        .catch(er=>{
            postErrors = {success: false, message: "not a valid _id type", Mongoose_error: er};
        });
        if(!postErrors.success){
            return res.json({postErrors});
        }
        res.json({success: true, postBy: postStatus.user_id, likedBy: postStatus.liked_by, content: postStatus.content, media: postStatus.media});
    
});

router.post('/delete-post', checkAuth, async(req, res)=>{
    if(!req.body._id)
    return res.json({error: "Invalid post request, must have '_id' - id of post to be deleted"});
    let postErrors = {success: true};
    console.log(req.userData);
    await Post.findById({_id: req.body._id})
    .then(async post=>{
        if(post){
            console.log(post);
            if(post.user_id === req.userData.user_id){
                await Post.findByIdAndDelete({_id: post._id}).then(x=>{
                    return res.json({success: true, message: "post deleted"})
                }).catch();
            }
            else{
                return res.json({success: false, message: "Cant delete someone else's post"});
            }
        }
        else{
            postErrors = {success: false, message: "Couldn't find such post"}
        }
    })
    .catch(er=>{
        postErrors = {success: false, message: "not a valid _id type", Mongoose_error: er};
    });
    if(!postErrors.success){
        return res.json({postErrors});
    }
});

router.post('/edit-profile', checkAuth, async (req, res)=>{
    if(req.body.user_id || req.body.email || req.body.user_name){
        return res.json({success: false, message: "cannot edit email, user_id, user_name"});
    }
    let updatedUser;
    if(req.body.password){
        const salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hashedPassword;
    }
    await User.findOneAndUpdate({user_id: req.userData.user_id}, req.body,{new: true})
    .then(user=>{updatedUser = user})
    .catch()
    res.json({success: true, updated_user: updatedUser});
    
})

module.exports = router;