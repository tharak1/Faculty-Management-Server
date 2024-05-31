const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const TimeTable = require("../models/timeTableModel");
const asynchandler = require("express-async-handler");
const { log } = require("console");
const { convertTimeTable } = require("./TimeTableController1");
const domain = process.env.DOMAIN;

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
            cb(null, './upload/timetable');
     },
    filename: (req, file, cb) => {
            return cb(null, `${file.originalname}`);
    }
})

// return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);

const upload = multer({storage: storage,});

router.post("/upload", upload.single('timetablePdf'), asynchandler(async(req, res) => {
    const {timetablename,department,regulation,section}=req.body;


    const TimeTablea = await TimeTable.findOne({TimeTableTitle:timetablename,Department:department,Regulation:regulation,Section:section});
    if(TimeTablea){
        res.status(400).json({message:"already exists"});
    }
    else{
        const file1 = req.file;
        const TimeTableRes = await TimeTable.create({TimeTableTitle:timetablename,Department:department,Regulation:regulation,Section:section,TimeTableAddress:`upload/timetable/${file1.filename}`,TimeTableUrl:`${domain}/upload/timetable/${file1.filename}`});
        const hello = `upload/timetable/${file1.filename}`;
        console.log(hello);
        await convertTimeTable(req,res,hello);
        // res.status(200).json(TimeTableRes);
    }
}));

router.get("/getTimetable",asynchandler(async(req,res)=>{
    filter = {};
    if(req.query){
        const { regulation, department } = req.query;
        filter = { Regulation: regulation, Department: department };
    }
    const response = await TimeTable.find(filter);

    res.status(200).json(response);
}))



module.exports = router;