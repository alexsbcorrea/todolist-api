const db = require("../db/conexao");

const User = require("./User");

const Task = db.sequelize.define(
  "tasks",
  {
    id: {
      type: db.Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    description: {
      type: db.Sequelize.STRING,
    },
    local: {
      type: db.Sequelize.STRING,
    },
    date: {
      type: db.Sequelize.STRING,
    },
    time: {
      type: db.Sequelize.STRING,
    },
    categorie: {
      type: db.Sequelize.STRING,
    },
    isClosed: {
      type: db.Sequelize.BOOLEAN,
    },
    idUser: {
      type: db.Sequelize.INTEGER,
    },
  },
  {
    timestamps: true,
  }
);

Task.sync();

module.exports = Task;
