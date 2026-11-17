import mongoose, { Schema } from "mongoose";

export interface IFollow {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model<IFollow>("Follow", FollowSchema);

export default Follow;
