
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AttentionsSchema = new Schema(
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
    attention: {
      type: String,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Attention = mongoose.model("Attentions", AttentionsSchema);

module.exports = Attention;
