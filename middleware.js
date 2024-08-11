const Classroom = require("./models/classroom");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must Logged In !");
        return res.redirect("/register");
    }
    next();
}

module.exports.saveUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectedUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isTeacher= async(req,res,next)=>{
    let {classroomId} = req.params;
    let cls = await Classroom.findById(classroomId);
    if (!cls) {
        req.flash("error", "Classroom not found!");
        return res.redirect(`/classroom`);
    }
    if(!cls.teacher.equals(res.locals.currUser._id)){
        req.flash("error","Permission denied !");
        return res.redirect(`/classroom`);
    }
    next()
}