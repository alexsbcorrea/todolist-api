const bcrypt = require("bcryptjs");
const fs = require("fs");
const UserModel = require("../models/User");
const { GenerateToken } = require("../helpers/Token");

module.exports = class UserController {
  static async Register(req, res) {
    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      acceptterms,
    } = req.body;

    const checkUser = await UserModel.findOne({ where: { email: email } });

    if (checkUser.email) {
      res.status(422).json({
        message: "E-mail inválido, insira outro e-mail para continuar.",
      });
      return;
    }

    if (!firstname) {
      res.status(422).json({
        message: "O Nome é obrigatório.",
      });
      return;
    }

    if (!lastname) {
      res.status(422).json({
        message: "O Sobrenome é obrigatório.",
      });
      return;
    }

    if (!acceptterms) {
      res.status(422).json({
        message: "Leia e concorde com os Termos e Condições.",
      });
      return;
    }

    if (password != confirmPassword) {
      res.status(422).json({
        message: "Senhas não correspondem.",
      });
      return;
    }

    try {
      const Register = await UserModel.create({
        firstname,
        lastname,
        email,
        password,
        acceptterms,
      });
      const token = GenerateToken(Register, req, res);
      res.status(200).json({
        message: "Registro e Login realizado com sucesso.",
        user: Register.firstname,
        email: Register.email,
        image: Register.image,
        token: token,
      });
      return;
    } catch (error) {
      res.status(500).json({
        message:
          "Não foi possível concluir o cadastro, tente novamente mais tarde.",
      });
    }
  }
  static async Login(req, res) {
    const { email, password } = req.body;

    const CheckUser = await UserModel.findOne({ where: { email: email } });

    if (!CheckUser) {
      res.status(404).json({ message: "Usuário não encontrado." });
      return;
    }

    if (CheckUser.email == email && CheckUser.password == password) {
      const token = GenerateToken(CheckUser, req, res);
      res.status(200).json({
        message: "Login realizado com sucesso.",
        user: CheckUser.firstname,
        email: CheckUser.email,
        image: CheckUser.image,
        token: token,
      });
      return;
    } else {
      res.status(422).json({ message: "Usuário ou senha incorretos." });
      return;
    }
  }
  static async Profile(req, res) {
    const id = req.userId;

    const user = await UserModel.findByPk(id);

    if (user) {
      return res.status(200).json({
        message: "Usuário Encontrado.",
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        image: user.image,
      });
    }
  }
  static async SaveEdit(req, res) {
    const id = req.userId;

    const idEdit = req.params.id;

    if (id != idEdit) {
      res.status(401).json({
        message:
          "Acesso negado. Não é possível alterar informações de outro usuário.",
      });
      return;
    }

    const User = UserModel.findByPk(id);

    const { firstname, lastname, email } = req.body;
    let { password, confirmPassword } = req.body;

    if (!firstname) {
      res.status(422).json({
        message: "O Nome é obrigatório.",
      });
      return;
    }

    if (!lastname) {
      res.status(422).json({
        message: "O Sobrenome é obrigatório.",
      });
      return;
    }

    let image = "";
    if (req.file) {
      image = `${req.file.filename}`;
    }

    if (password != confirmPassword) {
      res.status(422).json({
        message: "Senhas não correspondem.",
      });
      return;
    }

    if (!password && !confirmPassword) {
      password = User.password;
    }

    try {
      const Update = UserModel.update(
        {
          firstname,
          lastname,
          password,
        },
        { where: { id: id } }
      );

      const UpdateUser = await UserModel.findByPk(id);

      UpdateUser.password = undefined;

      res.status(200).json({
        message: "Registro atualizado com sucesso.",
        update: UpdateUser,
      });
      return;
    } catch (error) {
      fs.unlink(`../public/img/users/${image}`, (erro) => {
        if (erro) {
          console.log("Falha ao excluir o arquivo");
        } else {
          console.log("Arquivo excluído com sucesso");
        }
      });
      res.status(500).json({
        message: "Falha ao atualizar cadastro. Tente novamente mais tarde.",
        error,
      });
      return;
    }
  }
  static async ChangePhoto(req, res) {
    const id = req.userId;

    const idEdit = req.params.id;

    if (id != idEdit) {
      res.status(401).json({
        message:
          "Acesso negado. Não é possível alterar informações de outro usuário.",
      });
      return;
    }

    const User = await UserModel.findByPk(id);

    let image = "";
    if (req.file) {
      image = `${req.file.filename}`;
    }

    try {
      await UserModel.update(
        {
          image,
        },
        { where: { id: id } }
      );

      fs.unlink(`../img/users/${User.image}`, (erro) => {
        if (erro) {
          console.log("Falha ao excluir o arquivo");
        } else {
          console.log("Arquivo excluído com sucesso");
        }
      });

      const UserPhoto = await UserModel.findByPk(id);

      res.status(200).json({
        message: "Foto atualizada com sucesso.",
        image: UserPhoto.image,
      });
      return;
    } catch (error) {
      fs.unlink(`../public/img/users/${image}`, (erro) => {
        if (erro) {
          console.log("Falha ao excluir o arquivo");
        } else {
          console.log("Arquivo excluído com sucesso");
        }
      });
      res.status(500).json({
        message: "Falha ao alterar foto de perfil. Tente novamente mais tarde.",
        error,
      });
      return;
    }
  }
};
