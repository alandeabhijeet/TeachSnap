const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceRecordSchema = new Schema({
    registerNo : {type :String , required: true},
    status: { type: Boolean, required: true } 
}, { _id: false }); 

const registerSchema = new Schema({
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    attendance: [attendanceRecordSchema] ,
    date: { type: Date, required: true },
});

const Register = mongoose.model('Register', registerSchema);
module.exports = Register;
