const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceRecordSchema = new Schema({
    registerNo : {type :String , required: true},
    date: { type: Date, required: true },
    status: { type: Boolean, required: true } 
}, { _id: false }); 

const registerSchema = new Schema({
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    attendance: [attendanceRecordSchema] 
});

const Register = mongoose.model('Register', registerSchema);
module.exports = Register;
