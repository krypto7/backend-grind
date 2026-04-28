import mongoose, { Mongoose } from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
    refreshToken: {
      type: String,
      required: [true, "refreshToken is required"],
    },
    ip: {
      type: String,
      required: [true, "ip address is required"],
    },
    userAgent: {
      type: String,
      required: [true, "User is required"],
    },
    revoke: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Session = mongoose.model("session", sessionSchema);

export default Session;
