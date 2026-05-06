import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    revoke: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Session = mongoose.model("session", sessionSchema);

export default Session;
