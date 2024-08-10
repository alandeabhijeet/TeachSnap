const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    className: String,
    teacher: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    students: [
        { type: mongoose.Schema.Types.ObjectId,
          ref: 'User' 
        }
    ],
    code: { type: String, unique: true },
    date: { type: Date, default: Date.now },  
    photo: { type: String, default: '/images/logo' },  
    description: { type: String , required : true} 
});

module.exports = mongoose.model('Classroom', classroomSchema);