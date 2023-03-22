const multer = require("multer");
const path = require("path");

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "";

    if (req.baseUrl.includes("users")) {
      folder = "users";
    } else if (req.baseUrl.includes("tasks")) {
      folder = "tasks";
    }

    cb(null, `public/img/${folder}`);
  },
  filename: function (req, file, cb) {
    const lastName = file.originalname.split(".")[0];

    cb(
      null,
      `${String(Math.random() * 10)}-${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error("Por favor, envie apenas .png ou .jpg!"));
    }
    cb(undefined, true);
  },
});

module.exports = imageUpload;
