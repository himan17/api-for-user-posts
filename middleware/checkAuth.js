const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=>{
    console.log(req.headers);
    if(req.headers['authorization']){
        let token = req.headers['authorization'];
        try{
            const payload = jwt.verify(token, process.env.APP_SECRET);
            req.userData = payload;
            console.log(payload);
        }
        catch{
            return res.status(401).json({message: "Not authorised"});
        }
    }
    else{
        return res.status(401).json({"error": "Authorization token missing in Header",message: "Must have {Authorization: jwt-token} in header"});
    }
    next();
}