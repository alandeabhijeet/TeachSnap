const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom.js')
const {Register , FormSession} = require('../models/register');
const { v4: uuidv4 } = require('uuid');
let wrapAsync = require('../utils/wrapAsync.js')
let {isLoggedIn , isTeacher} = require("../middleware.js");
let {classroomValidationSchema} = require("../schema.js");

let validateClassroom = (req,res,next)=>{
  let {err} = classroomValidationSchema.validate(req.body);
  if(err){
      throw new MyError (403,err);
  }else{
      next();
  }
}

let {registerValidationSchema} = require("../schema.js");

let validateRegister = (req,res,next)=>{
  let {err} = registerValidationSchema.validate(req.body);
  if(err){
      throw new MyError (403,err);
  }else{
      next();
  }
}

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

router.post('/create',isLoggedIn,validateClassroom,wrapAsync( async (req,res)=>{
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

router.post('/enroll',isLoggedIn,validateClassroom,wrapAsync( async (req,res)=>{
    let {code , registrationNumber} = req.body;
    const currUserId = res.locals.currUsfinder._id;

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


router.post('/:classroomId/attendance', isLoggedIn, isTeacher, validateRegister, wrapAsync(async (req, res) => {
  const classroomId = req.params.classroomId;
  const date = new Date(req.body.date);
  const attendanceData = req.body.attendance;

  
  let absentRegistration = [];
  if (attendanceData !== undefined) {
      absentRegistration = Object.keys(attendanceData)
          .filter(key => attendanceData[key] === '0')
          .map(key => key.replace('reg-', ''));  // Remove 'reg-' prefix
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
  req.flash("success", "Attendance added!");
  res.redirect(`/classroom/${classroomId}`);
}));


router.get('/:classroomId/record',isLoggedIn ,  wrapAsync( async(req, res) => {
    let { classroomId } = req.params;
    let cls = await Classroom.findById(classroomId)
    let teacherId = cls.teacher;
   
    let records = await Register.find({ classroom: classroomId }).populate('attendance');
    res.render('./classroom/record.ejs',{records , classroomId , teacherId})
}));

async function findRegistrationNumber(classroomId, userId) {
    try {
        const classroom = await Classroom.findOne(
            { _id: classroomId, 'students.user': userId },
            { 'students.$': 1 } 
        ).exec();

        if (classroom && classroom.students.length > 0) {
            const registrationNumber = classroom.students[0].registrationNumber;
            return registrationNumber;
        } else {
            return null; 
        }
    } catch (error) {
        console.error('Error finding registration number:', error);
        throw error;
    }
}
router.post('/:classroomId/submit-attendance', wrapAsync( async(req, res) => {
    let {classroomId} = req.params
    const {  latitude, longitude } = req.body;
    const currUserId = res.locals.currUser._id;
    const registerNo = await findRegistrationNumber(classroomId,currUserId)

    const formSession = await FormSession.findOne({ classroom: classroomId });

    if (formSession.isOpen) {
        formSession.attendance.push({
            registerNo,
            status: true,
            latitude,
            longitude
        });
        await formSession.save();
        req.flash("success", "Attendance added!");
        res.redirect(`/classroom/${classroomId}`);
    } else {
        req.flash("error", "No open form session found");
        res.redirect(`/classroom/${classroomId}`);
    }
}));

router.get('/:classroomId/form',wrapAsync( async (req, res) => {
    const { classroomId } = req.params;

    const formSession = new FormSession({
        classroom: classroomId,
        date: Date.now(),  
        attendance: [],   
        isOpen: true      
    });

    let session = await formSession.save();
    res.render('./classroom/form.ejs',{sessionId : session._id , classroomId})
}))

//end form
router.get('/:classroomId/form/:sessionId', wrapAsync( async(req, res) => {
    const { sessionId , classroomId } = req.params;
    const formSession = await FormSession.findById(sessionId);
    if (formSession) {
        formSession.isOpen = false;  
        await formSession.save();
        res.render('./classroom/map.ejs' , { records: formSession.attendance, sessionId , classroomId}) // record those fillup form 
    } else {
        req.flash("error", "No open form session found");
        res.redirect(`/classroom/${classroomId}`);
    }
}));

async function getAllStudentsInClassroom(classroomId) {
    try {
        const classroom = await Classroom.findById(classroomId)
            .populate({
                path: 'students.user' 
            })
            .lean(); 
        
        if (!classroom) {
            return null;
        }

        return classroom.students;
    } catch (error) {
        console.error('Error fetching students:', error);
        return null;
    }
}

router.post('/:classroomId/form/:sessionId/finalize-attendance', wrapAsync( async (req, res) => {
    
        const { sessionId, proxy, records } = req.body;
        let {classroomId} = req.params;
        const proxyList = proxy.split(",").map(item => item.trim());
        const stringArray = records.split("},").map(item => item.trim());

        const parseObjects = (arr) => {
        return arr.map(str => {
          // Clean up the string
          const cleanedStr = str
            .replace(/(\r\n|\n|\r)/gm, "")  // Remove newlines
            .replace(/(\s+)/g, " ")         // Remove multiple spaces
            .replace(/'/g, '"')             // Replace single quotes with double quotes
            .replace(/(\w+):/g, '"$1":')    // Add double quotes around keys
            .replace(/,\s*}/g, '}')         // Remove trailing commas before closing braces
            .replace(/,\s*}/g, '}');        // Ensure no trailing comma before closing brace
      
          // Add missing closing brace if needed
          const validStr = cleanedStr.endsWith('}') ? cleanedStr : cleanedStr + '}';
      
          try {
            return JSON.parse(validStr);
          } catch (e) {
            console.error("Parsing error: ", e);
            return null;
          }
        }).filter(obj => obj !== null); 
      };
      
      const objectArray = parseObjects(stringArray);
      
        const updatedRecords = objectArray.map(record => {
            if (record.status && proxyList.includes(record.registerNo)) {
                return { ...record, status: 0 }; 
            }
            return record;
        });
        const allStudents = await getAllStudentsInClassroom(classroomId)
        const attendanceRecords = [...updatedRecords];
        allStudents.forEach(student => {
            const isStudentUpdated = updatedRecords.some(record => record.registerNo === student.registrationNumber);
            if (!isStudentUpdated) {
              attendanceRecords.push({
                registerNo: student.registrationNumber,
                status: false,
              });
            }
          });
        let register = await Register.findOne({
            classroom: req.params.classroomId,
            date: new Date() // today's date
        });

        if (!register) {
            register = new Register({
                classroom: req.params.classroomId,
                attendance: attendanceRecords
            });
        } else {
            register.attendance = attendanceRecords;
        }

        await register.save();
        await FormSession.findByIdAndDelete(sessionId);
        req.flash("success", "Attendance added!");
        res.redirect(`/classroom/${classroomId}`)
    
}));

module.exports = router;
