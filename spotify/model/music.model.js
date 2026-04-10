const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema(
  {
    music: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true },
);
const Music = mongoose.model("music", musicSchema);

module.exports = Music;
