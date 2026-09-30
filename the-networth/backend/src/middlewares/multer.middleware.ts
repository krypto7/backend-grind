import multer from "multer";
import crypto from "crypto";
import { mkdir } from "node:fs";
import os from "node:os";
import path from "node:path";

const uploadDirectory = path.join(os.tmpdir(), "my-uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    mkdir(uploadDirectory, { recursive: true }, (error) => {
      cb(error, uploadDirectory);
    });
  },
  filename: function (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err, "");
      cb(null, file.fieldname + "-" + raw.toString("hex"));
    });
  },
});

export const upload = multer({ storage: storage });
