const validator = require('validator');
const isEmpty = require('is-empty');
const {User} = require('../models/users');


async function registerValidator(x){
    if(!x.name || !x.password || !x.gender || !x.mobile || !x.user_name || !x.profile || !x.email){
        return{
            isValid: 0,
            errors: "Request must have these parameters: 'name', 'email', 'password', 'user_name', 'gender', 'mobile', 'profile' " 
        }
    }
    let name = x.name, password = x.password, email = x.email, userName = x.user_name, gender = x.gender, mobile = x.mobile, profile = x.profile;
    let errors = {
        message: []
    };

    if(isEmpty(name)){
        errors.message.push("Name can't be empty");
    }

    if(isEmpty(password)){
        errors.message.push("Password can't be empty");
    }else{
        let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
        if(!strongPassword.test(password)){
            errors.message.push("Invalid Password, Correct : minimum 8 character, first char capital, alphanumeric, use of special char");
        }
    }

    if(isEmpty(email)){
        errors.message.push("Email can't be empty");
    }else{
        validator.isEmail(email)? ( 
        await User.findOne({email : email})
            .then((user)=>{
                if(user){
                    errors.message.push("The email already exists, try logging in if you are registered already")
                    console.log("user found", errors, user);
                }
            })
            .catch()) : errors.message.push("Email is not valid");
    }

    if(isEmpty(userName)){
        errors.message.push("Username can't be empty");
    }else{
        await User.findOne({user_name : userName})
            .then((user)=>{if(user)errors.message.push("The username already exists, try logging in if you are registered already")})
            .catch();
    }

    if(isEmpty(gender))errors.message.push("Gender can't be empty");
    else{
        gender = gender.toLowerCase();
        console.log(gender);
        if(!(gender=== "male" || gender === "female" || gender==="other")){
            errors.message.push("Specify gender as male/female/other only");
        }
    }

    if(isEmpty(mobile))errors.message.push("Mobile can't be empty");
    else{
                        // new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')
        const regex = /[+][0-9]{1,3}[ ]{0,1}[0-9]{4}[ ]{0,1}[0-9]{6}/;
        if(!regex.test(mobile))errors.message.push("Wrong Input, Enter Mobile in this format: +[country code] [first four] [last six]");
    }
    
    if(profile==="true" || profile === "false" || profile === "0" || profile === "1");
    else{
        errors.message.push("Invalid Entry, Add 'true' for public and 'false' for private");
    }

    return {
        isValid: isEmpty(errors.message),
        errors
    }
}

const loginValidator = (x) => {
    if(!x.email || !x.password){
        return {
            isValid: 0,
            errors: "request must have these parameters in body for login: 'email' and 'password'"
        }
    }
    let email = x.email, password = x.password;
    let errors = {
        message: []
    };
    if(isEmpty(password)){
        errors.message.push("Password can't be empty");
    }
    if(isEmpty(email)){
        errors.message.push("Email can't be empty");
    }else{
        validator.isEmail(email)? null : errors.message.push("Email is not valid");
    }

    return {
        isValid: isEmpty(errors.message),
        errors
    }
}

module.exports = {registerValidator, loginValidator};