const express = require("express");
const router = express.Router();
const multer = require("multer");

const UserModel = require("../models/User");
const UserController = require("../controllers/UserController");
const imageUpload = require("../helpers/Upload");

//Upload to Buffer
const memStorage = multer.memoryStorage({});
const uploadBuffer = multer({ storage: memStorage });
//Upload to Buffer

const TokenValidation = require("../helpers/TokenValidation");

router.post("/register", UserController.Register);
router.post("/login", UserController.Login);
router.get("/profile", TokenValidation, UserController.Profile);
router.patch("/edit/:id", TokenValidation, UserController.SaveEdit);
router.patch(
  "/changepassword/:id",
  TokenValidation,
  UserController.ChangePassword
);
router.patch(
  "/changephoto/:id",
  TokenValidation,
  uploadBuffer.single("image"),
  UserController.ChangePhoto
);
router.delete(
  "/removeaccount/:id",
  TokenValidation,
  UserController.RemoveAccount
);

module.exports = router;
