const jwt = require("jsonwebtoken");

const secret = process.env.SECRET;

function TokenValidation(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  const token = authHeader.split(" ")[1];
  console.log(authHeader);

  jwt.verify(token, secret, (erro, decoded) => {
    if (erro) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }
    req.userId = decoded.id;
    next();
  });
}

module.exports = TokenValidation;
