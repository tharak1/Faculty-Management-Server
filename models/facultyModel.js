const mongoose = require("mongoose");

const facultySchema = mongoose.Schema({
    FacultyId:{
        type:String,
        required:true,
    },
    FacultyName:{
        type:String,
        required:true,
    },
    FacultyDesignation:{
        type:String,
        required:true,
    },
    FacultyPhnNo:{
        type:String,
        required:true,
    },
    FacultyEmail:{
        type:String,
        required:true,
    },
    FacultyDepartment:{
        type:String,required:true,
    },
    FacultyDOB:{
        type:String,
        required:true,
    },
    FacultyAddress:{
        type:String,
        required:true,
    },
    TeachingSubject:{
        type:String,
    },
    Classes:[{
        Department : {type:String},
        Section : {type:String},
        Regulation : {type:String},
        Year : {type:String},
        subject:{type:String},
    }],
    AcceptedSubstitueInfo:[{
        Date:{type:String},
        Day:{type:String},
        StartTime:{type:String},
        EndTime:{type:String},
        Department : {type:String},
        Section : {type:String},
        Regulation : {type:String},
        Year : {type:String},
        OriginalLecturer : {type:String},
        Subject:{type:String},
        ContactNo:{type:String},
        SentOn:{type:String}
    }],
    InQueueSubstituteInfo:[{
        Date:{type:String},
        Day:{type:String},
        StartTime:{type:String},
        EndTime:{type:String},
        Department : {type:String},
        Section : {type:String},
        Regulation : {type:String},
        Year : {type:String},
        OriginalLecturer : {type:String},
        Subject:{type:String},
        ContactNo:{type:String},
        SentOn:{type:String}
    }],
    IsAdmin:{
        type:Boolean,
        required:true,
    },
    UserName:{
        type:String,
        required:true,
    },
    Password:{
        type:String,
        required:true,
    },
    TodaysAttendance:{
        type:Number,
        required:true,
        default:false
    }
});

module.exports = mongoose.model("Faculty",facultySchema);