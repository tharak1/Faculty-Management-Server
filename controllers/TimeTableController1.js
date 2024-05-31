const express = require("express")
const asynchandler = require("express-async-handler")
const timeTablesModel = require("../models/TTM")
// const excelToJson = require('excel-to-json');
const ExcelJS = require("exceljs");
const path = require("path");
var XLSX = require("xlsx");
const TimeTableModel = require("../models/TTM"); 
const individualClassSubjectsModel = require("../models/individualClassSubjectsModel");
const UserDetails = require("../models/userDetailsModel");
const individualClassAttendance = require("../models/individualClassAttendance");
const userDetailsModel = require("../models/userDetailsModel");
const MidMarks = require("../models/midMarksModel");



const setTimeTable = asynchandler(async(req,res)=>{
    const Data = await timeTablesModel.create(req.body);
    res.json(Data); 
});

const getTimeTable = asynchandler(async(req,res)=>{
    let filter = {};
    if(req.query){
      filter = {Regulation:req.query.regulation,Department:req.query.department,Section:req.query.section};
    }

    const creatingTimeTable = await TimeTableModel.findOne(filter);
    res.status(200).json(creatingTimeTable.TimeTable);
})

const convertTimeTable = asynchandler(async(req,res,f)=>{

    const {timetablename,department,regulation,section}=req.body;
    let days = [];
    let tttt = [];
    var workbook = XLSX.readFile(f);
    let worksheet = workbook.Sheets[workbook. SheetNames [0]];


    for (let col = 1; col < 10; col++) {
        const cell = worksheet[XLSX.utils.encode_col(col) + 8];
        const acell = worksheet[XLSX.utils.encode_col(col) + 9];

        if (cell) {
            if (cell.t === 's' && cell.v.match(/^[IVX]+$/)) {
                tttt.push(acell.v);
        } else {
            console.log("Cell is undefined or empty.");
        }
        }
    }


    let periodswhole = [];
    for(let i=10;i<=15;i++){
        let periods = [];
        const c = worksheet[XLSX.utils.encode_col(0) + i];
        days.push(c.v);
        for(let col=1 ; col<=10 ; col++){
            const cell = worksheet[XLSX.utils.encode_col(col) + i];
                if (cell && (cell.v !== "BREAK") && (cell.v !== "LUNCH" )) {
                    let period = cell.v;
                    console.log(cell.v);
                    let intermediate = cell.v.split(" ");

                    if(intermediate.includes("LAB")){
                        col += 3;
                        periods.push(cell.v)
                    }else{
                        periods.push(cell.v)
                    }
                }
        }
        periodswhole.push(periods);
    }



    let startandendarr = [];
    for (let row = 0; row < periodswhole.length; row++) {
        let temp = [];
        let ss=0;
        for (let col = 0; col < periodswhole[row].length; col++) {
            let intermediate = periodswhole[row][col].split(" ");
            if(intermediate.includes("LAB")){
                let t1 = tttt[ss].split("-")[0];
                let t2 = tttt[ss+2].split("-")[1];
                let combinedStr = t1+"-"+t2;
                temp.push(combinedStr);
                ss +=2;
            }
            else{
                temp.push(tttt[ss]);
                ss +=1;
            }
        }
        startandendarr.push(temp);
    }




    const workbook1 = new ExcelJS.Workbook();
    await workbook1.xlsx.readFile(f);
    const worksheet1 = workbook1.getWorksheet(1); // Assuming the first worksheet

    let foundCell;

    worksheet1.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            if (cell.value === "Total") {
                foundCell = cell;
                return false; // break out of the loop
            }
        });
        if (foundCell) return false; // break out of the loop
    });


    let total = 0;
    if (foundCell) {
        let a = parseInt(foundCell.address.substring(1,3));
        total = worksheet[XLSX.utils.encode_col(4) + a].v;
    } else {
        console.log("String not found in the worksheet.");
    }


    // console.log(total);

    let facultyDetails = [];
    let subjectDetails = [];
    let countTotal = 0;
    let currrow = 18;
    while(countTotal < total){

            let sirmadam ={
                ClassName : worksheet[XLSX.utils.encode_col(3) + currrow]?.v ?? "Blank",
                SubjectName:worksheet[XLSX.utils.encode_col(1) + currrow]?.v ?? "Blank",
                Subjectcode:worksheet[XLSX.utils.encode_col(0) + currrow]?.v ?? "Blank",
                LecturerName:worksheet[XLSX.utils.encode_col(5) + currrow]?.v ?? "Blank",
                LecturerId:worksheet[XLSX.utils.encode_col(9) + currrow]?.v ?? "Blank", 
                LecturerNumber:worksheet[XLSX.utils.encode_col(8) + currrow]?.v ?? "Blank"
            }
            let ss = {
                LecturerName:worksheet[XLSX.utils.encode_col(5) + currrow]?.v ?? "Blank",
                LecturerId:worksheet[XLSX.utils.encode_col(9) + currrow]?.v ?? "Blank",
                SubjectName:worksheet[XLSX.utils.encode_col(1) + currrow]?.v ?? "Blank",
                SubjectCode:worksheet[XLSX.utils.encode_col(0) + currrow]?.v ?? "Blank",
            }
        currrow +=1;
        countTotal += worksheet[XLSX.utils.encode_col(4) + currrow].v;
            facultyDetails.push(sirmadam);
            subjectDetails.push(ss);
    }


    const temp = await individualClassSubjectsModel.create({Regulation:regulation,Department:department,Section:section,Subjects:subjectDetails});
    // console.log(temp);
    // as the time table is uploaded we create a subjects timeTable to get the lecturers ID ,Name 

    // console.log(facultyDetails);

    // const temp = await individualClassSubjectsModel.findOne({Regulation:regulation,Department:department,Section:section,Subjects:subjectDetails});
    const students = await userDetailsModel.find({Regulation:regulation,Department:department,Section:section});
    const arr = temp.Subjects.filter(ss=>ss.SubjectCode!="Blank");

    // console.log(students);
    for(let i=0;i<2;i++){
        arr.forEach(async(sub)=>{
            let midmarks = [];
            students.forEach(stu=>{
                midmarks.push({
                    RollNo:stu.RollNo,
                    Marks:0
                })
            });
            const hello = await MidMarks.create({Regulation:regulation,Department:department,Section:section,SubjectName:sub.SubjectName,SubjectCode:sub.SubjectCode,LecturerId:sub.LecturerId,LecturerName:sub.LecturerName,Mid:`mid${i+1}`,Students:midmarks});
        });
    }






    let TimeTable = [];
    for(let i=0;i<days.length;i++){
        let sai={
            Day:days[i],
            Periods : []
        }
        for(let j=0;j<startandendarr[i].length;j++){
            console.log(periodswhole[i][j]);
            intermediate = periodswhole[i][j].split(" ");

            if(intermediate.includes("LAB")){
                let searchKey = periodswhole[i][j].split("/")[0]+" LAB";
                console.log(searchKey);
                let ansobj = facultyDetails.find(entry => entry.ClassName === searchKey);
                console.log(ansobj);
                sai.Periods.push({
                StartTime : startandendarr[i][j].split("-")[0],
                EndTime : startandendarr[i][j].split("-")[1],
                ClassName : searchKey,
                ClassType : "Lab",
                SubjectName : ansobj.SubjectName,
                Subjectcode : ansobj.Subjectcode,
                LecturerName : ansobj.LecturerName,
                LecturerId : ansobj.LecturerId,
                LecturerNumber : ansobj.LecturerNumber,
                ClassDuration:3
                });
            }
            else{
                let ansobj = facultyDetails.find(entry => entry.ClassName === (periodswhole[i][j]).split("_")[0]);
                sai.Periods.push({
                StartTime : startandendarr[i][j].split("-")[0],
                EndTime : startandendarr[i][j].split("-")[1],
                ClassName : periodswhole[i][j],
                ClassType : "Lecture",
                SubjectName : ansobj.SubjectName,
                Subjectcode : ansobj.Subjectcode,
                LecturerName : ansobj.LecturerName,
                LecturerId : ansobj.LecturerId,
                LecturerNumber : ansobj.LecturerNumber,
                ClassDuration:1
                });
            }
        }
        TimeTable.push(sai);
        // console.log(sai);
    }
    




    setIndividualAttendance(req,res,temp);
    const creatingTimeTable = await TimeTableModel.create({Regulation:regulation,Department:department,Section:section,TimeTable : TimeTable});
    res.json(creatingTimeTable.TimeTable);
    
    // console.log("Rojer reporting from big code its workingggggg !!!!! Fuck it");
});




const setIndividualAttendance = asynchandler(async(req,res,temp)=>{
    const {timetablename,department,regulation,section}=req.body;
    const AllRollNo = await UserDetails.find({Regulation:regulation,Department:department,Section:section},{RollNo:1,_id:0});


    let Students1 =[];

    for(rno of AllRollNo){
        let sub = []
        temp.Subjects.forEach(subject => {
            sub.push({
                    SubjectName: subject.SubjectName,
                    SubjectCode: subject.SubjectCode,
                    Attendance: 0 // You can set initial attendance to 0
            });
        });
        Students1.push({
            RollNo:rno.RollNo,
            Subjects:sub,
        });
    }
    

    const convertedData = await individualClassAttendance.create({
        Regulation: regulation,
        Department: department,
        Section: section,
        Students: Students1,
    });

    // console.log(convertedData);






});




const test = asynchandler(async(req,res)=>{
    const temp = await individualClassSubjectsModel.findOne({Regulation:"MR21",Department:"CSE",Section:"D"});
    const students = await userDetailsModel.find({Regulation:"MR21",Department:"CSE",Section:"D"});
    const arr = temp.Subjects.filter(ss=>ss.SubjectCode!="Blank");

    // console.log(students);
    for(let i=0;i<2;i++){
        arr.forEach(async(sub)=>{
            let midmarks = [];
            students.forEach(stu=>{
                midmarks.push({
                    RollNo:stu.RollNo,
                    Marks:0
                })
            });
            const hello = await MidMarks.create({Regulation:"MR21",Department:"CSE",Section:"D",SubjectName:sub.SubjectName,SubjectCode:sub.SubjectCode,LecturerId:sub.LecturerId,LecturerName:sub.LecturerName,Mid:`mid${i+1}`,Students:midmarks});
        });
    }
});

// test();

// convertTimeTable();


module.exports = {setTimeTable,convertTimeTable,getTimeTable};