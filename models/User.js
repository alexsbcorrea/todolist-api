const db = require("../db/conexao");

const Task = require("./Task");

const Usuario = db.sequelize.define(
  "users",
  {
    id: {
      type: db.Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    firstname: {
      type: db.Sequelize.STRING,
    },
    lastname: {
      type: db.Sequelize.STRING,
    },
    email: {
      type: db.Sequelize.STRING,
    },
    password: {
      type: db.Sequelize.STRING,
    },
    code: {
      type: db.Sequelize.STRING,
    },
    acceptterms: {
      type: db.Sequelize.BOOLEAN,
    },
    image: {
      type: db.Sequelize.STRING,
    },
    imageId: {
      type: db.Sequelize.STRING,
    },
  },
  {
    timestamps: true,
  }
);

Usuario.hasMany(Task, {
  constraint: true,
  foreignKey: "idUser",
});

Task.belongsTo(Usuario, {
  foreignKey: "idUser",
});

Usuario.sync();

module.exports = Usuario;
