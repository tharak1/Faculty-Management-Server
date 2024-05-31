const asyncHandler = require("express-async-handler");
const Faculty = require("../models/facultyModel");
const jwt=require("jsonwebtoken");
const timeTablesModel = require("../models/TTM");
const facultyTimeTableModel = require("../models/facultyTimeTableModel");



const createFaculty = asyncHandler(async(req,res)=>{
    const user = await Faculty.create(req.body);

    const timeTable = await facultyTimeTableModel.create({
        FacultyId: req.body.FacultyId,
        FacultyName: req.body.FacultyName,
        FacultyDepartment: req.body.FacultyDepartment,
        TeachingSubject: req.body.TeachingSubject,
        FacultyPhnNo: req.body.FacultyPhnNo,
        TimeTable: [
            {
                "Day": "Monday",
                "Periods": []
            },
            {
                "Day": "Tuesday",
                "Periods": []
            },
            {
                "Day": "Wednesday",
                "Periods": []
            },
            {
                "Day": "Thursday",
                "Periods": []
            },
            {
                "Day": "Friday",
                "Periods": []
            },
            {
                "Day": "Saturday",
                "Periods": []
            }
        ],
    })

    res.status(200).json(user);
});


const loginFaculty = asyncHandler(async (req,res) =>{
    const {UserName,Password} = req.body;
    if(!UserName || !Password){
        res.status(400).json({error:"all fields are manditory"});
    }
    const user = await Faculty.findOne({UserName});    
    if(user && (user.Password===Password)){
            const accessToken = jwt.sign(
                {
                    user : {
                        id : user.FacultyId,
                    }
                },
                process.env.ACCESS_TOKEN_SECERT,
            );
            res.json({token:accessToken});
    }else{
        res.status(400).json({error:"user not found or roolno or password dont match"});
    }
    
});

const getFacultyData = asyncHandler(async(req,res)=>{
    const currentUser = await Faculty.findOne({ FacultyId: req.user.id} );
    res.json(currentUser);
});

const getFacultyByDepartment = asyncHandler(async(req,res)=>{

    const faculties = await Faculty.find();
    res.json(faculties);
});


const resetAttendance = asyncHandler(async (req, res) => {
    try {
        const users = await Faculty.find();

        for (const obj of users) {
            obj.TodaysAttendance = 0;
            await obj.save();
        }

        res.status(200).json({ message: "Attendance reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting attendance", error });
    }
});

const getFacultyByDepartmentShort = asyncHandler(async(req,res)=>{
    let filter = {};
    if(req.query){ 
        filter = {FacultyDepartment:req.query.facultyDepartment};
    }
    const faculties = await Faculty.find(filter,{FacultyId:1,FacultyName:1,FacultyDepartment:1,_id:0});
    res.json(faculties);
})


const getFacultyById = asyncHandler(async(req,res)=>{
    let filter = {};
    if(req.query){ 
        filter = {FacultyId:req.body.Id};
    }
    const faculty = await Faculty.findOne(filter);
    res.status(200).json(faculty);
});

const updateFaculty = asyncHandler(async (req, res) => {
    const facultyData = req.body;
    const updatedFaculty = await Faculty.findOneAndUpdate({ FacultyId: req.body.FacultyId }, facultyData, { new: true });
    if (!updatedFaculty) {
        return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json(updatedFaculty);
});

const updateFacultyTimeTable = asyncHandler(async(req,res)=>{
    const facultyTimeTable = req.body;
    const updatedTimeTable = await facultyTimeTableModel.findOneAndUpdate({ FacultyId: req.body.FacultyId }, facultyTimeTable, { new: true });
    if (!updatedTimeTable) {
        return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json(updatedTimeTable);
})

const deleteFaculty = asyncHandler(async (req, res) => {
    const { FacultyId } = req.body;

    if (!FacultyId) {
        res.status(400).json({ message: 'FacultyId is required' });
        return;
    }

    try {
        const result = await Faculty.deleteOne({ FacultyId });

        if (result.deletedCount === 0) {
            res.status(404).json({ message: 'Faculty not found' });
        } else {
            res.status(200).json({ message: 'Faculty deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});




const getFacultyTimeTable = asyncHandler(async(req,res)=>{
    const currentUser = await facultyTimeTableModel.findOne({ FacultyId: req.user.id} );
    res.json(currentUser);
});

const getAllFacultyTimeTable = asyncHandler(async(req,res)=>{
    const currentUser = await facultyTimeTableModel.find();
    res.status(200).json(currentUser);
});

const makrAttendance = asyncHandler(async(req,res)=>{
    const user = await Faculty.findOne({ FacultyId: req.user.id});
    if(user.TodaysAttendance === 0){
        user.TodaysAttendance = 1;
        await user.save();
        res.status(200).json({message:"success"});
    }
    else{
        res.status(228).json({message:"already marked"});
    }
})


async function assignTimeTableToFaculty(req, res) {
    try {
        const AllFaculty = await Faculty.find();
        let updatedFaculties = 0;
        let createdFaculties = 0;

        for(const faculty of AllFaculty){
            for(const classes of faculty.Classes){
                const CurrentClassTimeTable = await timeTablesModel.findOne({
                    Department: classes.Department,
                    Regulation: classes.Regulation,
                    Section: classes.Section
                });

                if(CurrentClassTimeTable){
                    const transformedTimetable = CurrentClassTimeTable.TimeTable.map((week) => {
                        return {
                            Day: week.Day,
                            Periods: week.Periods.filter(period => {
                                const lecturers = period.LecturerId.split(",");
                                return lecturers.includes(faculty.FacultyId);
                            }).map(period => ({
                                StartTime: period.StartTime,
                                EndTime: period.EndTime,
                                ClassType: period.ClassType,
                                Section: classes.Section,
                                Department: classes.Department,
                                Year: classes.Year,
                                Regulation: classes.Regulation,
                                SubjectName: period.SubjectName,
                                Subjectcode: period.Subjectcode,
                            }))
                        };
                    });

                    const existingFacultyTimeTable = await facultyTimeTableModel.findOne({
                        FacultyId: faculty.FacultyId,
                    });

                    if (existingFacultyTimeTable) {
                        const existingPeriods = existingFacultyTimeTable.TimeTable.reduce((existing, week) => {
                            existing[week.Day] = existing[week.Day] || [];
                            existing[week.Day].push(...week.Periods);
                            return existing;
                        }, {});

                        const newPeriods = transformedTimetable.reduce((newPeriods, week) => {
                            newPeriods[week.Day] = newPeriods[week.Day] || [];
                            newPeriods[week.Day].push(...week.Periods);
                            return newPeriods;
                        }, {});

                        const updatedTimetable = Object.entries(existingPeriods).map(([day, periods]) => {
                            const combinedPeriods = [...periods, ...newPeriods[day] || []];
                            const uniquePeriods = combinedPeriods.filter((period, index, self) =>
                                index === self.findIndex((p) => (
                                    p.StartTime === period.StartTime && p.EndTime === period.EndTime
                                ))
                            );
                            return { Day: day, Periods: uniquePeriods };
                        });

                        existingFacultyTimeTable.TimeTable = updatedTimetable;
                        await existingFacultyTimeTable.save();
                        updatedFaculties++;
                        console.log(`Updated timetable for Faculty ${existingFacultyTimeTable._id}`);
                    } else {
                        const FacultyTimeTable = await facultyTimeTableModel.create({
                            FacultyId: faculty.FacultyId,
                            FacultyName: faculty.FacultyName,
                            FacultyDepartment: faculty.FacultyDepartment,
                            TimeTable: transformedTimetable,
                        });
                        createdFaculties++;
                        console.log(`Created new timetable for Faculty ${FacultyTimeTable._id}`);
                    }
                }
            }
        }

        res.json({
            message: 'Timetables assignment completed successfully',
            updatedFaculties,
            createdFaculties
        });

    } catch (error) {
        console.error('Error in assignDataToFaculty:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// assignDataToFaculty();


module.exports = {deleteFaculty,resetAttendance,updateFacultyTimeTable,assignTimeTableToFaculty,createFaculty,loginFaculty,getFacultyData,getFacultyByDepartment,getFacultyTimeTable,getFacultyByDepartmentShort,getFacultyById,updateFaculty,makrAttendance,getAllFacultyTimeTable};