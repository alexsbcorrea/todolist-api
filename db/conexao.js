const { Sequelize } = require("sequelize");
const dotenv = require("dotenv/config");

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PWD;
const dbHost = process.env.DB_HOST;
const dBDial = process.env.DB_DIALECT;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dBDial,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Conexão com o Banco de Dados realizada com sucesso.");
  })
  .catch((erro) => {
    console.log("Falha ao conectar com o Banco de Dados", +erro);
  });

module.exports = {
  Sequelize: Sequelize,
  sequelize: sequelize,
};
