const UserModel = require("../models/User");
const TaskModel = require("../models/Task");
const {
  GenerateToken,
  GetToken,
  VerifyToken,
  GetUserByToken,
} = require("../helpers/Token");
const Task = require("../models/Task");

module.exports = class TaskController {
  static async createTask(req, res) {
    const id = req.userId;

    const { description, local, date, time, categorie } = req.body;
    const isClosed = false;
    const idUser = id;

    if (!description) {
      res.status(422).json({
        message: "A Descrição é obrigatória.",
      });
      return;
    }

    if (!local) {
      res.status(422).json({
        message: "O Local é obrigatória.",
      });
      return;
    }

    if (!date) {
      res.status(422).json({
        message: "A Data é obrigatória.",
      });
      return;
    }

    if (!time) {
      res.status(422).json({
        message: "A Hora é obrigatória.",
      });
      return;
    }

    if (!categorie) {
      res.status(422).json({
        message: "A Categoria é obrigatória.",
      });
      return;
    }

    try {
      const task = await TaskModel.create({
        description,
        local,
        date,
        time,
        categorie,
        isClosed,
        idUser,
      });

      res.status(201).json({ message: "Tarefa criada com sucesso." });
    } catch (error) {
      res.status(500).json({
        message: "Falha ao criar Tarefa. Tente novamente mais tarde.",
      });
    }
  }
  static async viewTask(req, res) {
    const id = req.userId;
    const taskId = req.params.id;

    if (!taskId) {
      res.status(422).json({ message: "O ID da tarefa é obrigatório." });
      return;
    }

    const task = await TaskModel.findByPk(taskId);

    if (!task) {
      res.status(404).json({ message: "Task não encontrada." });
      return;
    }

    if (task.idUser != id) {
      res
        .status(401)
        .json({ message: "Acesso negado. Task criada por outro usuário." });
      return;
    }

    res.status(200).json({ task });
  }
  static async updateTask(req, res) {
    const userId = req.userId;

    const { id, description, local, date, time, categorie, isClosed } =
      req.body;

    if (!description) {
      res.status(422).json({
        message: "A Descrição é obrigatória.",
      });
      return;
    }

    if (!local) {
      res.status(422).json({
        message: "O Local é obrigatória.",
      });
      return;
    }

    if (!date) {
      res.status(422).json({
        message: "A Data é obrigatória.",
      });
      return;
    }

    if (!time) {
      res.status(422).json({
        message: "A Hora é obrigatória.",
      });
      return;
    }

    if (!categorie) {
      res.status(422).json({
        message: "A Categoria é obrigatória.",
      });
      return;
    }

    const task = await TaskModel.findByPk(id);

    if (!task) {
      res.status(404).json({ message: "Task não encontrada." });
      return;
    }

    if (task.idUser != userId) {
      res
        .status(401)
        .json({ message: "Acesso negado. Task criada por outro usuário." });
      return;
    }

    try {
      const task = await TaskModel.update(
        {
          description,
          local,
          date,
          time,
          categorie,
          isClosed,
        },
        { where: { id: id } }
      );

      res.status(200).json({ message: "Tarefa atualizada com sucesso." });
    } catch (error) {
      res.status(500).json({
        message: "Falha ao atualizar Tarefa. Tente novamente mais tarde.",
      });
    }
  }
  static async setClosed(req, res) {
    const userId = req.userId;
    const taskId = req.params.id;

    if (!taskId) {
      res.status(422).json({ message: "O ID é obrigatório." });
      return;
    }

    const task = await TaskModel.findByPk(taskId);

    if (!task) {
      res.status(404).json({ message: "Task não encontrada." });
      return;
    }

    if (task.idUser != userId) {
      res
        .status(401)
        .json({ message: "Acesso negado. Task criada por outro usuário." });
      return;
    }

    try {
      await TaskModel.update({ isClosed: true }, { where: { id: taskId } });
      res.status(200).json({ message: "Tarefa Concluída" });
    } catch (error) {
      res.status(500).json({
        message:
          "Não foi possível encerrar a Tarefa, tente novamente mais tarde.",
      });
    }
  }
  static async setOpen(req, res) {
    const userId = req.userId;
    const taskId = req.params.id;

    if (!taskId) {
      res.status(422).json({ message: "O ID é obrigatório." });
      return;
    }

    const task = await TaskModel.findByPk(taskId);

    if (!task) {
      res.status(404).json({ message: "Task não encontrada." });
      return;
    }

    if (task.idUser != userId) {
      res
        .status(401)
        .json({ message: "Acesso negado. Task criada por outro usuário." });
      return;
    }

    try {
      await TaskModel.update({ isClosed: false }, { where: { id: taskId } });
      res.status(200).json({ message: "Tarefa Reaberta" });
    } catch (error) {
      res.status(500).json({
        message:
          "Não foi possível reabrir a Tarefa, tente novamente mais tarde.",
      });
    }
  }
  static async removeTask(req, res) {
    const userId = req.userId;
    const taskId = req.params.id;

    if (!taskId) {
      res.status(422).json({ message: "O ID é obrigatório." });
      return;
    }

    const task = await TaskModel.findByPk(taskId);

    if (!task) {
      res.status(404).json({ message: "Task não encontrada." });
      return;
    }

    if (task.idUser != userId) {
      res
        .status(401)
        .json({ message: "Acesso negado. Task criada por outro usuário." });
      return;
    }

    try {
      await TaskModel.destroy({ where: { id: taskId } });
      res.status(200).json({ message: "Tarefa Excluída." });
    } catch (error) {
      res.status(500).json({
        message: "Falha ao excluir Tarefa. Tente novamente mais tarde.",
      });
    }
  }
  static async getAllTasks(req, res) {
    const id = req.userId;

    let order = "ASC";

    const tasks = await TaskModel.findAll({
      where: { idUser: id },
      order: [
        ["date", order],
        ["time", order],
      ],
    });

    res.status(200).json({ tasks });
  }
  static async getPendings(req, res) {
    const id = req.userId;

    let order = "ASC";

    if (id) {
      const tasks = await TaskModel.findAll({
        where: { idUser: id, isClosed: false },
        order: [
          ["date", order],
          ["time", order],
        ],
      });

      res.status(200).json({ tasks });
      return;
    }
  }
  static async getCloseds(req, res) {
    const id = req.userId;

    let order = "ASC";

    if (id) {
      const tasks = await TaskModel.findAll({
        where: { idUser: id, isClosed: true },
        order: [
          ["date", order],
          ["time", order],
        ],
      });

      res.status(200).json({ tasks });
      return;
    }
  }
};
