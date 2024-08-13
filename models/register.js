const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceRecordSchema = new Schema({
    registerNo : {type :String , required: true},
    status: { type: Boolean, required: true, default: false }, 
    latitude: { type: Number },
    longitude: { type: Number }
}, { _id: false }); 

const registerSchema = new Schema({
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    attendance: [attendanceRecordSchema] ,
    date: { type: Date, default: Date.now },
});

const formSessionSchema = new Schema({
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    date: { type: Date, required: true },
    attendance: [attendanceRecordSchema],
    isOpen: { type: Boolean}  
});

module.exports.FormSession = mongoose.model('FormSession', formSessionSchema);

module.exports.Register = mongoose.model('Register', registerSchema);
