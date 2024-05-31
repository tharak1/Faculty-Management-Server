const mongoose = require("mongoose");

const TimeTableSchema = mongoose.Schema({
    Regulation: { type: String, required: true },
    Department:{ type: String, required: true },
    Section: { type: String, required: true },
      TimeTable: [
        {
          Day: { type: String, required: true },
          Periods: [
            {
              StartTime: { type: String, required: true },
              EndTime: { type: String, required: true },
              ClassType:{ type: String, required: true},
              ClassName:{ type: String, required: true},
              SubjectName:{ type: String, required: true},
              Subjectcode:{ type: String, required: true},
              LecturerName : { type: String, required: true },
              LecturerId : {type: String, required: true},
              LecturerNumber : {type: String, required: true},
              Substitute : {type: Boolean,default:false, required: true}, 
              SubstituteId : {type: String},
              SubstituteName:{type: String},
              ClassDuration:{type:Number}
            }
          ]
        }
      ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  });
 
module.exports = mongoose.model("TTM",TimeTableSchema);


