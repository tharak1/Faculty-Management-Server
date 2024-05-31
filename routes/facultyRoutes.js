const express = require('express');
const { loginFaculty, createFaculty, getFacultyData, getFacultyTimeTable, makrAttendance, getFacultyByDepartment, updateFaculty, getAllFacultyTimeTable, updateFacultyTimeTable, resetAttendance, deleteFaculty } = require('../controllers/facultyConttroller');
const validateToken = require("../config/tokenValidator");
const { SearchForSubstitute, sendingSubstituteRequest, acceptOrRejectRequest, getSubstituteConfirm } = require('../controllers/assignSubstituteController');

const router = express.Router();

router.route("/login").post(loginFaculty);
router.route("/create").post(createFaculty);
router.route("/getFacultyDetails").get(validateToken,getFacultyData);
router.route("/getFacultyTimeTable").get(validateToken,getFacultyTimeTable);
router.route("/markAttendance").get(validateToken,makrAttendance);
router.route("/searchSubstitutes").post(SearchForSubstitute);
router.route("/getAllFaculty").get(getFacultyByDepartment);
router.route("/updateFaculty").post(updateFaculty);
router.route("/sendingSubstituteRequest").post(sendingSubstituteRequest);
router.route("/acceptOrRejectRequest").post(acceptOrRejectRequest);
router.route("/getSubstituteConfirm").get(getSubstituteConfirm);
router.route("/getAllFacultyTimeTable").get(getAllFacultyTimeTable);
router.route("/updateFacultyTimeTable").post(updateFacultyTimeTable);
router.route("/resetAttendance").get(resetAttendance);
router.route("/deleteFaculty").post(deleteFaculty);









module.exports = router;