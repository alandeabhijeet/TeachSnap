const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom.js')
const Register = require('../models/register');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res, next) => {
    console.log(res.locals.currUser)
    const currUserId = res.locals.currUser._id;
    const classrooms = await Classroom.find({
        $or: [
          { teacher: currUserId },
          { 'students.user': currUserId }]
    }).populate('teacher');
    res.render('./classroom/index.ejs',{classrooms})
});

router.get('/create',(req,res)=>{
    res.render('./classroom/create.ejs')
})
router.post('/create',async(req,res)=>{
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
    res.redirect('/classroom');
})

router.get('/enroll',(req,res)=>{
  res.render('./classroom/enroll.ejs')
})
router.post('/enroll', async(req,res)=>{
    let {code , registrationNumber} = req.body;
    const currUserId = res.locals.currUser._id;

    let cls = await Classroom.findOne({code : code});
    console.log(cls);

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
    res.redirect('/classroom'); 
})

router.get('/:id', async (req, res, next) => {
    let {id} = req.params;
    let classroom = await Classroom.findById(id).populate('teacher').populate('students') 
    res.render('./classroom/show.ejs',{classroom})
});


router.post('/:classroomId/attendance', async (req, res) => {
    try {
      const classroomId = req.params.classroomId;
      const date = new Date(req.body.date);
      const attendanceData = req.body.attendance; 
      
      console.log('Attendance Data:', attendanceData);
      console.log('Date:', date);
      let absentRegistration=[];
      if((attendanceData != undefined)){
        absentRegistration = Object.keys(attendanceData).filter(key => attendanceData[key] === '0');
        console.log('Absent Registration:', absentRegistration);
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
      res.redirect('/classroom'); 
    } catch (error) {
      console.error('Error saving attendance records:', error);
      res.status(500).send('Error saving attendance records');
    }
  });

router.get('/:classroomId/record', async (req, res) => {
    try {
        let { classroomId } = req.params;
        let records = await Register.find({ classroom: classroomId }).populate('attendance');
        
        res.render('./classroom/record.ejs',{records})
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
