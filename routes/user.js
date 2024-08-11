const express = require('express');
const router = express.Router();

const User = require('../models/user')
let passport = require("passport");

router.get('/',(req,res)=>{
    res.render('./user/index.ejs')
})

router.get('/register',(req,res)=>{
    res.render('./user/create.ejs');
})

router.post('/login', 
    passport.authenticate('local', { 
      failureRedirect: '/login',
      failureFlash: true 
    }), 
    (req, res) => {
      res.redirect('/classroom');
    }
);

router.post('/signup',async (req,res)=>{
    try{
        let{username , email , password} = req.body;
        let newuser = new User({email , username});
        registerUser = await User.register(newuser , password);
        req.login(registerUser,(err)=>{
            if(err){
                return next(err);
            }
            res.redirect("/classroom");
        })
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
})

module.exports = router