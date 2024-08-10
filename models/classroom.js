const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    className: String,
    teacher: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    students: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        registrationNumber: {
            type: String,
            required: true 
        }
    }
    ],
    code: { type: String, unique: true },
    date: { type: Date, default: Date.now },  
    photo: { type: String, default: '/images/logo' },  
    description: { type: String , required : true} 
});

module.exports = mongoose.model('Classroom', classroomSchema);