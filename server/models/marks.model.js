const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MarksSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
    marks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Mark = mongoose.model("Marks", MarksSchema);

module.exports = Mark;
