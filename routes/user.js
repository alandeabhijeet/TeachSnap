const express = require('express');
const router = express.Router();

const User = require('../models/user')
let passport = require("passport");
let wrapAsync = require('../utils/wrapAsync.js')
let { saveUrl } = require("../middleware");

router.get('/',(req,res)=>{
    res.render('./user/index.ejs')
})

router.get('/register',(req,res)=>{
    if (res.locals.currUser) {
        return res.redirect('/classroom');
    }
    res.render('./user/create.ejs');
})

router.post('/login', saveUrl ,
    passport.authenticate('local', { 
      failureRedirect: '/login',
      failureFlash: true 
    }), 
    (req, res) => {
      res.redirect('/classroom');
    }
);

router.post('/signup',wrapAsync ( async(req,res)=>{
    let{username , email , password} = req.body;
    let newuser = new User({email , username});
    registerUser = await User.register(newuser , password);
    req.login(registerUser,(err)=>{
        if(err){
            return next(err);
        }
        res.redirect("/classroom");
    })
}));

router.get("/logout", (req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logout successfully!");
        res.redirect("/");
    })
});

module.exports = router;