const mongoose = require("mongoose");

const TimeTableSchema = mongoose.Schema({
    TimeTableTitle:{
        type:String,
        required:true,
    },
    Department:{
        type:String,
        required:true,
    },
    Regulation:{
        type:String,
        required:true,
    },
    Section:{
        type:String,
        required:true,
    },
    TimeTableAddress:{
        type:String,
        required:true,
    },
    TimeTableUrl:{
        type:String,
        required:true,
    }
});

TimeTableSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

TimeTableSchema.set('toJSON',{
    virtuals : true,
});

module.exports = mongoose.model("TimeTable",TimeTableSchema);