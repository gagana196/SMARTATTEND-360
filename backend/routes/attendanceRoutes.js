const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");

// GET all attendance records
router.get("/", async (req, res) => {
    try {
        const attendance = await Attendance.find();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching attendance",
            error: error.message
        });
    }
});

// GET attendance for one student
router.get("/student/:studentId", async (req, res) => {
    try {
        const attendance = await Attendance.find({
            studentId: req.params.studentId
        });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching student attendance",
            error: error.message
        });
    }
});

// MARK attendance
router.post("/", async (req, res) => {
    try {
        const attendance = new Attendance(req.body);

        const savedAttendance = await attendance.save();

        res.status(201).json(savedAttendance);
    } catch (error) {
        res.status(400).json({
            message: "Error marking attendance",
            error: error.message
        });
    }
});

// UPDATE attendance
router.put("/:id", async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!attendance) {
            return res.status(404).json({
                message: "Attendance record not found"
            });
        }

        res.json(attendance);
    } catch (error) {
        res.status(400).json({
            message: "Error updating attendance",
            error: error.message
        });
    }
});

// DELETE attendance
router.delete("/:id", async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(
            req.params.id
        );

        if (!attendance) {
            return res.status(404).json({
                message: "Attendance record not found"
            });
        }

        res.json({
            message: "Attendance deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting attendance",
            error: error.message
        });
    }
});

module.exports = router;