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
});

module.exports = mongoose.model('Classroom', classroomSchema);