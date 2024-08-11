const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom.js')
const Register = require('../models/register');
const { v4: uuidv4 } = require('uuid');
let wrapAsync = require('../utils/wrapAsync.js')
let {isLoggedIn , isTeacher} = require("../middleware.js");

router.get('/',isLoggedIn, wrapAsync( async (req, res, next) => {
    const currUserId = res.locals.currUser._id;
    const classrooms = await Classroom.find({
        $or: [
          { teacher: currUserId },
          { 'students.user': currUserId }]
    }).populate('teacher');
    if(!classrooms){
      req.flash("error" , "Requested Classrooms not exits!");
      res.redirect("/listings");
  }
    res.render('./classroom/index.ejs',{classrooms})
}));

router.get('/create',isLoggedIn , wrapAsync( async(req,res)=>{
    res.render('./classroom/create.ejs')
}))

router.post('/create',isLoggedIn,wrapAsync( async (req,res)=>{
    let {className , description} = req.body;
    const currUserId = res.locals.currUser._id;
    const code = uuidv4().replace(/-/g, '').slice(0, 6);
    const newClassroom = new Classroom({
        className,
        teacher: currUserId,
        description,
        code
    });
    await newClassroom.save();
    req.flash("success" , "Classroom Created!");
    res.redirect('/classroom');
}))

router.get('/enroll',isLoggedIn, wrapAsync( async(req,res)=>{
  res.render('./classroom/enroll.ejs')
}))

router.post('/enroll',isLoggedIn,wrapAsync( async (req,res)=>{
    let {code , registrationNumber} = req.body;
    const currUserId = res.locals.currUser._id;

    let cls = await Classroom.findOne({code : code});

    let newStudent = {
        user: currUserId,
        registrationNumber
    };
    cls.students.push(newStudent);
    cls.students.sort((a, b) => {
      const regA = a.registrationNumber.toUpperCase();
      const regB = b.registrationNumber.toUpperCase();
      return regA.localeCompare(regB);
  });

    await cls.save();
    req.flash("success" , "Enroll Successfully !");
    res.redirect('/classroom'); 
}))

router.get('/:id',isLoggedIn, wrapAsync( async (req, res, next) => {
    let {id} = req.params;
    let classroom = await Classroom.findById(id).populate('teacher').populate('students')
    if (!classroom.teacher.equals(req.user._id)) {
      return res.redirect(`/classroom/${id}/record`);
    }
    res.render('./classroom/show.ejs',{classroom})
}));


router.post('/:classroomId/attendance',isLoggedIn ,isTeacher , wrapAsync( async (req, res) => {
      const classroomId = req.params.classroomId;
      const date = new Date(req.body.date);
      const attendanceData = req.body.attendance; 
      
      let absentRegistration=[];
      if((attendanceData != undefined)){
        absentRegistration = Object.keys(attendanceData).filter(key => attendanceData[key] === '0');
        
      }
      const classroom = await Classroom.findById(classroomId).populate('students');
      if (!classroom) {
        return res.status(404).send('Classroom not found');
      }
      const allRegistration = classroom.students.map(student => student.registrationNumber);
  
      const absentSet = new Set(absentRegistration);
      const attendanceRecords = allRegistration.map(registrationNo => ({
        registerNo: registrationNo,
        status: !absentSet.has(registrationNo) 
      }));
  
      const register = new Register({
        classroom: classroomId,
        attendance: attendanceRecords,
        date: date
      });
  
      await register.save();
      req.flash("success" , "Attendance added !");
      res.redirect(`/classroom/${classroomId}`); 
}));

router.get('/:classroomId/record',isLoggedIn ,  wrapAsync( async(req, res) => {
    let { classroomId } = req.params;
    let records = await Register.find({ classroom: classroomId }).populate('attendance');
    res.render('./classroom/record.ejs',{records})
}));

module.exports = router;
