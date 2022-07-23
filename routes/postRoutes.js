const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const path = require('path');
const router = express.Router();
const {postUpload, parser} = require('../config/multer');
const {cloudinary} = require('../config/cloudinary');
const Post = require('../models/posts');

router.post('/create-post',checkAuth, function (req, res) {
        postUpload(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ message: err.message, Desired_format: "multipart form with 'post_text' for text content, 'post_media' for all post files and 'status' - boolean for public(true) & private(false) posts"});
            }
            if(!req.body.post_text || !req.body.status){
                return res.status(400).send({ message: "Invalid post request", Desired_format: "multipart form with 'post_text' for text content, 'post_media' for all post files and 'status' - boolean for public(true) & private(false) posts"});
            }
            // Everything went fine.
            const media_urls = [];
            console.log(req.files);
            for(let i = 0; i < req.files.length; i++){
                curFile = req.files[i];
                const extname = path.extname(curFile.originalname).toString();
                const base64 = parser.format(extname, curFile.buffer);
                const image = await cloudinary.uploader.upload(base64.content);
                media_urls.push(image.url);  
            }
            const post = {
                user_id: req.userData.user_id,
                content: req.body.post_text,
                status: req.body.status,
                media: media_urls, 
            }
            Post.create(post).then(post=>{
                res.json({success: true, message: "Post created successfully", post : post})
            })
            .catch(er=>{
                res.json({error: "Upload error", er});
            })
        });
    }
)

router.post('/edit-post', checkAuth, async (req, res)=>{
    if(req.body.post_media){
        return res.json({success: false, message: "cannot edit media of the post"});
    }
    if(!req.body._id){
        return res.json({success: false, message: "must have valid post id"});
    }
    let updatedPost;
    await Post.findByIdAndUpdate({_id: req.body._id}, {content: req.body.content, status: req.body.status},{new: true})
    .then(post=>{updatedPost = post})
    .catch()
    res.json({success: true, updated_Post: updatedPost});
    
})

module.exports = router;