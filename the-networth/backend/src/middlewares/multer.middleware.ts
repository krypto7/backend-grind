import multer from "multer";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/my-uploads");
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
