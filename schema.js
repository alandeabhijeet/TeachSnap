const Joi = require('joi');

const classroomValidationSchema = Joi.object({
    className: Joi.string().required(),
    teacher: Joi.string().length(24).hex().required(),
    students: Joi.array().items(
        Joi.object({
            user: Joi.string().length(24).hex().required(),
            registrationNumber: Joi.string().required()
        })
    ).required(),
    code: Joi.string().required(),
    date: Joi.date().default(Date.now),
    photo: Joi.string().default('/images/logo'),
    description: Joi.string().required()
});

const attendanceRecordValidationSchema = Joi.object({
    registerNo: Joi.string().required(),
    status: Joi.boolean().required()
});

const registerValidationSchema = Joi.object({
    classroom: Joi.string().length(24).hex().required(),
    attendance: Joi.array().items(attendanceRecordValidationSchema).required(),
    date: Joi.date().required()
});

module.exports = { 
    classroomValidationSchema, 
    registerValidationSchema 
};
