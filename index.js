const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const exploreRoutes = require('./routes/exploreRoutes');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 2000;

// middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));


// routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/explore', exploreRoutes);

mongoose.connect(process.env.DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(()=>{console.log("Database connected")})
.catch(()=> {console.log("Error connecting database")});

app.get('/', (req, res)=>{
    console.log(req.body);
    res.json({message: "server is up"});
})

app.listen(PORT, ()=>{
    console.log("Server started on port "+ PORT);
})