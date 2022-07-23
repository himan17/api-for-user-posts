const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    media: {
        type: Array,
        required: true
    },
    liked_by: {
        type: Array
    },
})
Post = mongoose.model('Posts', postSchema);
module.exports = Post;