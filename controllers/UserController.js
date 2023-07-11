const bcrypt = require("bcryptjs");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const stream = require("stream");
const UserModel = require("../models/User");
const TaskModel = require("../models/Task");
const { GenerateToken } = require("../helpers/Token");

const GDriveUploadFile = require("../google-drive").GDriveUploadFile;
const GDriveRemoveFile = require("../google-drive").GDriveRemoveFile;

const Email = require("../mailservice");

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

    if (!email) {
      res.status(422).json({
        message: "O E-mail é obrigatório",
      });
      return;
    }

    const checkUser = await UserModel.findOne({ where: { email: email } });

    if (checkUser) {
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
      res.status(201).json({
        message: "Registro e Login realizado com sucesso.",
        user: Register.firstname,
        email: Register.email,
        image: Register.image,
        imageId: Register.imageId,
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

    if (!email) {
      res.status(422).json({ message: "O E-mail é obrigatório." });
      return;
    }

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
        imageId: CheckUser.imageId,
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
        imageId: user.imageId,
      });
    }
  }
  static async SaveEdit(req, res) {
    const id = req.userId;

    const idEdit = req.params.id;

    if (!idEdit) {
      res.status(422).json({
        message: "O ID é obrigatório.",
      });
      return;
    }

    if (id != idEdit) {
      res.status(401).json({
        message:
          "Acesso negado. Não é possível alterar informações de outro usuário.",
      });
      return;
    }

    const { firstname, lastname, email } = req.body;

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

    try {
      const Update = UserModel.update(
        {
          firstname,
          lastname,
        },
        { where: { id: id } }
      );

      const UpdateUser = await UserModel.findByPk(id);

      UpdateUser.password = undefined;

      res.status(200).json({
        message: "Registro atualizado com sucesso.",
        update: UpdateUser,
      });
    } catch (error) {
      res.status(500).json({
        message: "Falha ao atualizar cadastro. Tente novamente mais tarde.",
        error,
      });
    }
  }
  static async ChangePassword(req, res) {
    const id = req.userId;

    const idEdit = req.params.id;

    if (!idEdit) {
      res.status(422).json({
        message: "O ID é obrigatório.",
      });
      return;
    }

    if (id != idEdit) {
      res.status(401).json({
        message:
          "Acesso negado. Não é possível alterar informações de outro usuário.",
      });
      return;
    }

    const User = await UserModel.findByPk(id);

    const { currentPassword, newPassword, confirmPassword } = req.body;

    let password = "";

    if (!currentPassword) {
      res.status(422).json({
        message: "A Senha Atual é obrigatória.",
      });
      return;
    }

    if (!newPassword) {
      res.status(422).json({
        message: "A Nova Senha é obrigatória.",
      });
      return;
    }

    if (!confirmPassword) {
      res.status(422).json({
        message: "A Confirmação de Senha é obrigatória.",
      });
      return;
    }

    if (currentPassword != User.password) {
      res.status(422).json({
        message: "A Senha (Atual) fornecida está incorreta.",
      });
      return;
    }

    if (newPassword != confirmPassword) {
      res.status(422).json({
        message: "A Nova Senha e a Confirmação não correspondem.",
      });
      return;
    }

    if (currentPassword == User.password && newPassword == confirmPassword) {
      password = newPassword;
    } else {
      password = User.password;
    }

    try {
      const UserUpdate = await UserModel.update(
        { password },
        {
          where: {
            id: id,
          },
        }
      );
      res.status(200).json({ message: "Senha alterada com sucesso." });
    } catch (error) {
      res.status(500).json({
        message:
          "Não foi possível alterar a senha devido erro interno. Tente novamnente mais tarde.",
      });
    }
  }
  static async GetRecoverPassword(req, res) {
    const { email } = req.body;

    const checkUser = await UserModel.findOne({ where: { email } });

    if (!checkUser) {
      res.status(404).json({ message: "Usuário não encontrado." });
      return;
    }

    const code = `${checkUser.firstname.slice(0, 1)}${checkUser.lastname.slice(
      0,
      1
    )}${Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)}`;
    console.log(code);

    try {
      const setCode = await UserModel.update(
        { code: code },
        { where: { email } }
      );

      const getCode = await UserModel.findOne({ where: { email } });

      const to = getCode.email;
      const title = "Recuperação de Senha";
      const name = getCode.firstname;
      const subject = "Suporte ToDoList - Esqueceu a Senha";
      const codeUser = getCode.code;

      const SendMail = new Email(to, title, name, subject, codeUser);

      SendMail.Send();
      setTimeout(() => {
        res.status(200).json({ message: "Email enviado" });
      }, 4000);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Erro interno, tente novamente mais tarde." });
    }
  }
  static async SetNewPassword(req, res) {
    const { code, newPassword, confirmPassword } = req.body;

    if (!code) {
      res.status(422).json({
        message: "O Código é obrigatório.",
      });
      return;
    }
    if (!newPassword) {
      res.status(422).json({
        message: "A Nova Senha é obrigatória.",
      });
      return;
    }

    if (!confirmPassword) {
      res.status(422).json({
        message: "A Confirmação de Senha é obrigatória.",
      });
      return;
    }

    const checkUser = await UserModel.findOne({ where: { code } });

    if (!checkUser) {
      res.status(404).json({
        message: "Código inválido.",
      });
      return;
    }

    if (newPassword != confirmPassword) {
      res.status(422).json({
        message: "A Nova Senha e Confirmação não correspondem.",
      });
      return;
    } else {
      const updateUser = await UserModel.update(
        {
          password: newPassword,
          code: "nocode",
        },
        { where: { id: checkUser.id } }
      );
      res.status(200).json({
        message: "Senha alterada com sucesso.",
      });
      return;
    }
  }
  static async ChangePhoto(req, res) {
    const id = req.userId;

    const idEdit = req.params.id;

    if (!idEdit) {
      res.status(422).json({
        message: "O ID é obrigatório.",
      });
      return;
    }

    if (id != idEdit) {
      res.status(401).json({
        message:
          "Acesso negado. Não é possível alterar informações de outro usuário.",
      });
      return;
    }

    const typeFile = "image";
    const sizeFile = req.file.size;
    const fileSizeLimit = 1 * 1024 * 1024;

    if (req.file.mimetype.split("/")[0] != typeFile) {
      res.status(422).json({
        message:
          "O arquivo enviado não é uma imagem. Somente arquivos de imagem são permitidos.",
      });
      return;
    }

    if (req.file.size > fileSizeLimit) {
      res.status(422).json({
        message:
          "O arquivo enviado excedeu o limite permitido de 1 MB. Envie outro arquivo que atenda os requisitos.",
      });
      return;
    }

    const UserInfo = await UserModel.findByPk(id);

    let pathFile = req.file;
    let bufferStream = new stream.PassThrough();

    bufferStream.end(pathFile.buffer);
    const newFileName = `${uuidv4()}-${req.file.originalname}`;
    const mimetype = req.file.mimetype;

    GDriveUploadFile(bufferStream, newFileName, mimetype)
      .then((data) => {
        GDriveRemoveFile(UserInfo.imageId)
          .then(() => console.log("Imagem Excluída"))
          .catch((error) => console.log("Não foi possível excluir a imagem"));
        const image = newFileName;
        const imageId = data;
        console.log(data);
        UserModel.update({ image, imageId }, { where: { id: id } }).then(() => {
          res.status(200).json({
            message: "Foto de Perfil atualizada com sucesso.",
            image: image,
            imageId: imageId,
          });
        });
      })
      .catch(() => {
        res.status(500).json({
          message:
            "Falha ao atualizar foto de Perfil. Tente novamente mais tarde.",
        });
      });
  }
  static async RemoveAccount(req, res) {
    const id = req.userId;

    const idEdit = req.params.id;

    if (!idEdit) {
      res.status(422).json({
        message: "O ID é obrigatório.",
      });
      return;
    }

    if (id != idEdit) {
      res.status(401).json({
        message:
          "Acesso negado. Não é possível remover a conta de outro usuário.",
      });
      return;
    }

    const TasksToRemove = await TaskModel.findAll({ where: { idUser: id } });

    if (TasksToRemove) {
      await TaskModel.destroy({ where: { idUser: id } });
      console.log("Tarefas removidas com sucesso.");
      await UserModel.destroy({ where: { id: id } });
    } else {
      console.log("Nâo há Tarefas para remover.");
      await UserModel.destroy({ where: { id: id } });
    }

    const UserInfo = await UserModel.findOne({ where: { id: id } });

    if (!UserInfo) {
      res.status(200).json({
        message: "Conta excluída com sucesso.",
      });
      return;
    } else {
      res.status(500).json({
        message:
          "Falha ao excluir Conta de Usuário. Tente novamente mais tarde.",
      });
      return;
    }
  }
};
