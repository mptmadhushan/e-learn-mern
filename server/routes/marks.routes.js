const express = require("express");
const router = express.Router();
const Mark = require("../models/marks.model");
const { isLoggedIn, isValidId } = require("../middleware/custom-middleware");

router.get("/getMarks/:id", isValidId, (req, res) => {
  Mark.find({ course: req.params.id })
    .populate("user")
    .sort({ createdAt: -1 })
    .then((response) => res.json(response))
    .catch((err) => res.status(500).json(err));
});

router.post("/newMark", isLoggedIn, (req, res) => {
  Mark.create(req.body)
    .then((response) => res.json(response))
    .catch((err) => res.status(500).json(err));
});

router.put("/editMark/:id", isLoggedIn, isValidId, (req, res) => {
  Mark.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((response) => res.json(response))
    .catch((err) => res.status(500).json(err));
});

router.delete("/deleteMark/:id", isLoggedIn, isValidId, (req, res) => {
  Mark.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "Mark Deleted" }))
    .catch((err) => res.status(500).json(err));
});

module.exports = router;
