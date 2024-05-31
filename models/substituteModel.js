const mongoose = require("mongoose");

const substituteSchema = mongoose.Schema({
    Date:{type:String,required:true,},
    Day:{type:String,required:true,},
    StartTime:{type:String,required:true,},
    EndTime:{type:String,required:true},
    Department : {type:String,required:true},
    Section : {type:String,required:true},
    Regulation : {type:String,required:true},
    Year : {type:String,required:true},
    OriginalLecturer : {type:String,required:true},
    AcceptedLecturer : {type:String,required:true},
    Subject:{type:String,required:true},
    ContactNo:{type:String,required:true},
    SentOn:{type:String,required:true}
});

module.exports = mongoose.model("substituteConfirmation",substituteSchema);