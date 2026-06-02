import { v2 as cloudinary } from "cloudinary";

export const oldImageRemove = async (public_id) => {
  return cloudinary.uploader.destroy(public_id);
};
