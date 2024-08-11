if (process.env.NODE_ENV != 'production') require('dotenv').config();

const express = require('express')
const app = express()

const mongoose = require('mongoose')
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const dburl = process.env.ATLAS_URL;

const classroomRoute = require('./routes/classroom.js');
const userRoute = require('./routes/user.js');

app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.set("view engine", "ejs");
app.engine('ejs', ejsMate);

const storeOptions = MongoStore.create({
    mongoUrl : dburl,
    crypto: {
        secret: 'secretKey'
    },
    touchAfter : 24 * 3600,
});
const sessionOptions = {
    store : storeOptions,
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

async function main() {
  await mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

main().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Connection error", err);
});

// Global Middleware
app.use((req, res, next) => {
    res.locals.currUser = req.user;
    next();
});

app.use('/',userRoute);
app.use('/classroom',classroomRoute)

const port = 8080 ;
app.listen(port , ()=>{
    console.log('App started ')
})