const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom.js')

router.get('/', async (req, res, next) => {
    classrooms = await Classroom.find({}).populate('teacher') 
    res.render('./classroom/index.ejs',classrooms)
});

router.get('/:id', async (req, res, next) => {
    let {id} = req.params;
    let classroom = await Classroom.findById(id).populate('teacher').populate('students') 
    res.render('./classroom/show.ejs',{classroom})
});

module.exports = router;
