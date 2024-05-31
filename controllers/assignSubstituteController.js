const asyncHandler = require("express-async-handler");
const facultyTimeTableModel = require("../models/facultyTimeTableModel");
const Faculty = require("../models/facultyModel");
const substitute = require("../models/substituteModel");

const formatDate = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const day = date.getDate();
  const daySuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const weekday = days[date.getDay()];

  return `${day}${daySuffix(day)} ${month}, ${year}; ${weekday}`;
};




const SearchForSubstitute = asyncHandler(async(req,res)=>{
  let filter = {};
  if(req.query){ 
      filter = {FacultyDepartment:req.query.facultyDepartment,Day:req.query.day};
  }
  const {StartTime,EndTime} = req.body;
  console.log(StartTime,EndTime);

  const facultyTimetables = await facultyTimeTableModel.find({FacultyDepartment:filter.FacultyDepartment});
  const kaliFellows = [];

  for(const timetable of facultyTimetables){
      const dayTimetables = timetable.TimeTable.find(day => day.Day === filter.Day);
      if(dayTimetables){
          const foundElement = dayTimetables.Periods.find(p => p.StartTime === StartTime && p.EndTime === EndTime);
          if (!foundElement) {
              kaliFellows.push({
                  FacultyId: timetable.FacultyId,
                  FacultyName: timetable.FacultyName,
                  Subject:timetable.TeachingSubject,
                  ContactNo:timetable.FacultyPhnNo,
              });
          }
      }
  }

  if(kaliFellows.length === 0){
      res.status(201).json({message: "No faculty available"});
  } else {
      res.status(200).json(kaliFellows);
  }
});




const sendingSubstituteRequest = asyncHandler(async(req,res)=>{
    const {facultyphno,facultyName,selectefacultyId,selectedfacultyName,startTime,endTime,date,day,department,section,regulation,year,subjectName} = req.body;
    console.log();
    const faculty = await Faculty.findOne({FacultyId:selectefacultyId,FacultyName:selectedfacultyName});
    const ff = {
      StartTime:startTime,
      EndTime:endTime,
      Date:date,
      Day:day,
      Department:department,
      Section:section,
      Regulation:regulation,
      Year:year,
      OriginalLecturer : facultyName,
      Subject:subjectName,
      ContactNo:facultyphno,
      SentOn:formatDate(new Date())
    }

    // console.log(res.body);
    let dummy = faculty.InQueueSubstituteInfo;
    dummy.push(ff);

    faculty.InQueueSubstituteInfo = dummy;
    // console.log(faculty);
    await faculty.save();


    res.status(200).json(faculty);
});



const acceptOrRejectRequest = asyncHandler(async(req,res)=>{
  filter = {}
  if(req.query){
    filter = {accept:req.query.accepted};
  }
  console.log("called !!");

  const {facultyId,facultyName,index} = req.body;
  const faculty = await Faculty.findOne({FacultyId:facultyId,FacultyName:facultyName});

  if(filter.accept === "true"){

    dummy = faculty.InQueueSubstituteInfo[index];
    faculty.AcceptedSubstitueInfo.push(dummy);

    faculty.InQueueSubstituteInfo.splice(index, 1);

    await faculty.save();
    console.log(dummy);

    const x = await substitute.create({
        Date: dummy.Date,
        Day: dummy.Day,
        StartTime: dummy.StartTime,
        EndTime: dummy.EndTime,
        Department: dummy.Department,
        Section: dummy.Section,
        Regulation: dummy.Regulation,
        Year: dummy.Year,
        OriginalLecturer: dummy.OriginalLecturer,
        Subject: dummy.Subject,
        ContactNo: dummy.ContactNo,
        SentOn: dummy.SentOn,
        AcceptedLecturer:facultyName});

  }
  else{
    faculty.InQueueSubstituteInfo.splice(index, 1);
    await faculty.save();
  }
res.status(200).json(faculty)
})

const getSubstituteConfirm = asyncHandler(async(req,res)=>{
  const dd = await substitute.find();
  res.status(200).json(dd);
})

module.exports = {SearchForSubstitute,sendingSubstituteRequest,acceptOrRejectRequest,getSubstituteConfirm};