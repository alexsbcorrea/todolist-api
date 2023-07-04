const jwt = require("jsonwebtoken");

const secret = process.env.SECRET || ToDoList;

function GenerateToken(user, req, res) {
  const token = jwt.sign({ id: user.id, user: user.email }, secret);
  return token;
}

function GetToken(req, res) {
  const authHeader = req.headers.authorization;

  try {
    const token = authHeader.split(" ")[1];
    return token;
  } catch (error) {
    return null;
  }
}

function VerifyToken(token, res) {
  if (!token) {
    return null;
  }

  try {
    const verified = jwt.verify(token, secret);
    return verified.id;
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Token inválido. Faça login para continuar." });
  }
}

async function GetUserByToken(token) {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret);
    return decoded.id;
  } catch (erro) {
    return null;
  }
}

module.exports = {
  GenerateToken,
  GetToken,
  VerifyToken,
  GetUserByToken,
};
