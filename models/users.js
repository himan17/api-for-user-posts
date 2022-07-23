const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user_id:{
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    user_name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    profile: {
        type: Boolean,
        default: 1,
        required: true
    },
    following: {
        type: Array
    },
    followers: {
        type: Array
    },
})

const idCounterSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'incID'
    },
    cnt: {
        type: Number,
        default: 0
    }
})
User = mongoose.model('Users', userSchema);
Counter = mongoose.model('idCounter', idCounterSchema);
module.exports = {User, Counter};