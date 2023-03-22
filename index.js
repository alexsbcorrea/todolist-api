const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv/config");

const UserRoutes = require("./routes/UserRoutes");
const TaskRoutes = require("./routes/TaskRoutes");

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

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
