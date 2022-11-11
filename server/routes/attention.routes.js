const express = require("express");
const router = express.Router();
const Attention = require("../models/attention.model");
const { isLoggedIn, isValidId } = require("../middleware/custom-middleware");

router.get("/getAttention/:id", isValidId, (req, res) => {
  Attention.find({ course: req.params.id })
    .populate("user")
    .sort({ createdAt: -1 })
    .then((response) => res.json(response))
    .catch((err) => res.status(500).json(err));
});

router.post("/newAttention", isLoggedIn, (req, res) => {
  Attention.create(req.body)
    .then((response) => res.json(response))
    .catch((err) => res.status(500).json(err));
});

router.put("/editMark/:id", isLoggedIn, isValidId, (req, res) => {
  Attention.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((response) => res.json(response))
    .catch((err) => res.status(500).json(err));
});

router.delete("/deleteMark/:id", isLoggedIn, isValidId, (req, res) => {
  Attention.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "Attention Deleted" }))
    .catch((err) => res.status(500).json(err));
});

module.exports = router;
