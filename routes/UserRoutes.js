const express = require("express");
const router = express.Router();

const UserModel = require("../models/User");
const UserController = require("../controllers/UserController");
const imageUpload = require("../helpers/Upload");

const TokenValidation = require("../helpers/TokenValidation");

router.post("/register", UserController.Register);
router.post("/login", UserController.Login);
router.get("/profile", TokenValidation, UserController.Profile);
router.patch(
  "/edit/:id",
  TokenValidation,
  imageUpload.single("image"),
  UserController.SaveEdit
);
router.patch(
  "/changephoto/:id",
  TokenValidation,
  imageUpload.single("image"),
  UserController.ChangePhoto
);
router.delete(
  "/removeaccount/:id",
  TokenValidation,
  UserController.RemoveAccount
);

module.exports = router;
