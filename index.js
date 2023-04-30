const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv/config");
const swaggerUi = require("swagger-ui-express");

const UserRoutes = require("./routes/UserRoutes");
const TaskRoutes = require("./routes/TaskRoutes");

const swaggerDoc = require("./swagger.json");

const app = express();
const port = process.env.PORT || 3001;

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({ credentials: true, origin: "*" }));

app.use(express.static("public"));

app.use("/users", UserRoutes);
app.use("/tasks", TaskRoutes);
app.use("/", (req, res) => {
  res.status(200).json({
    message: "Aplicação Rodando",
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;
