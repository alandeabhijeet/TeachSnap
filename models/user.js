const { required } = require('joi');
const mongoose = require('mongoose');
const { type } = require('os');
const passportLocalMongoose = require('passport-local-mongoose');

let User = mongoose.Schema({
    email : {
        type : String,
        required : true
    }
})

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User' , User)