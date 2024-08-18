import multer from "multer";

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "./filestorage");
  },
  filename: (req, file, cb) => {
    return cb(null, Date.now() + file.originalname);
  },
});
const uploadStorage = multer({ storage: fileStorage });

export default uploadStorage;
