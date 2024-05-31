const mongoose = require("mongoose");

const FacultyTimeTableSchema = mongoose.Schema({
    FacultyId:{
        type:String,
        required:true,
    },
    FacultyName:{
        type:String,
        required:true,
    },
    FacultyDepartment:{
        type:String,
        required:true,
    },
    TeachingSubject:{
        type:String,
    },
    FacultyPhnNo:{
        type:String,
        required:true,
    },
    TimeTable: [
    {
        Day: { type: String, required: true },
        Periods: [
        {
            StartTime: { type: String, required: true },
            EndTime: { type: String, required: true },
            ClassType:{ type: String, required: true},
            Section:{ type: String, required: true},
            Department:{type: String, required: true},
            Year:{type: String, required: true},
            Regulation:{type: String,required: true},
            SubjectName:{ type: String, required: true},
            Subjectcode:{ type: String, required: true},
        }
        ]
    }
    ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
    },);
 
module.exports = mongoose.model("FacultyTTM",FacultyTimeTableSchema);


