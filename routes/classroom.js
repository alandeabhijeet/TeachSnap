const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom.js')
const Register = require('../models/register');
router.get('/', async (req, res, next) => {
    classrooms = await Classroom.find({}).populate('teacher') 
    res.render('./classroom/index.ejs',classrooms)
});

router.get('/:id', async (req, res, next) => {
    let {id} = req.params;
    let classroom = await Classroom.findById(id).populate('teacher').populate('students') 
    res.render('./classroom/show.ejs',{classroom})
});

router.post('/classroom/:classroomId/attendance', async (req, res) => {
    try {
      const classroomId = req.params.classroomId;
      const date = new Date(req.body.date);
      const attendanceData = req.body.attendance; // Expecting an object like { S001: '0', S004: '0' }
      
      console.log('Attendance Data:', attendanceData);
      console.log('Date:', date);
  
      // Get the absent registrations from the request body
      const absentRegistration = Object.keys(attendanceData);
      console.log('Absent Registration:', absentRegistration);
  
      // Find the classroom to get all registrations
      const classroom = await Classroom.findById(classroomId).populate('students');
      if (!classroom) {
        return res.status(404).send('Classroom not found');
      }
  
      // Extract all registration numbers from the students
      const allRegistration = classroom.students.map(student => student.registrationNumber);
  
      // Determine attendance records
      const absentSet = new Set(absentRegistration);
      const attendanceRecords = allRegistration.map(registrationNo => ({
        registerNo: registrationNo,
        date: date,
        status: !absentSet.has(registrationNo) // Present if not in absentRegistration
      }));
  
      // Create and save the register document
      const register = new Register({
        classroom: classroomId,
        attendance: attendanceRecords
      });
  
      await register.save();
      res.status(201).send('Attendance records saved successfully');
    } catch (error) {
      console.error('Error saving attendance records:', error);
      res.status(500).send('Error saving attendance records');
    }
  });
  



module.exports = router;
