const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom.js')

router.get('/', async (req, res, next) => {
    classrooms = await Classroom.find({}).populate('teacher') 
    res.render('./classroom/index.ejs',classrooms)
});

module.exports = router;
