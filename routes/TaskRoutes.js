const express = require("express");
const router = express.Router();

const UserModel = require("../models/User");
const TaskModel = require("../models/Task");

const TaskController = require("../controllers/TaskController");

const TokenValidation = require("../helpers/TokenValidation");

router.post("/create", TokenValidation, TaskController.createTask);
router.get("/view/:id", TokenValidation, TaskController.viewTask);
router.patch("/update", TokenValidation, TaskController.updateTask);
router.patch("/close/:id", TokenValidation, TaskController.setClosed);
router.patch("/open/:id", TokenValidation, TaskController.setOpen);
router.delete("/remove/:id", TokenValidation, TaskController.removeTask);
router.get("/all", TokenValidation, TaskController.getAllTasks);
router.get("/pendings", TokenValidation, TaskController.getPendings);
router.get("/closeds", TokenValidation, TaskController.getCloseds);

module.exports = router;
