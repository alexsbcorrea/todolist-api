const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const email = process.env.EMAIL;
const mailpass = process.env.MAILPASS;

class Email {
  constructor(to, title, name, subject, code) {
    this.to = to;
    this.title = title;
    this.name = name;
    this.subject = subject;
    this.code = code;
  }

  Send = function (to, title, name, subject, code) {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      SSL: true,
      auth: {
        user: email,
        pass: mailpass,
      },
    });

    const handlebarsOptions = {
      viewEngine: {
        extName: ".html",
        partialsDir: path.resolve("./mailservice/template"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./mailservice/template"),
      extName: ".handlebars",
    };

    transport.use("compile", hbs(handlebarsOptions));

    const mailOptions = {
      from: email,
      to: this.to,
      subject: this.subject,
      template: "email",
      context: {
        title: `${this.title}`,
        name: `${this.name}`,
        code: `${this.code}`,
      },
    };

    transport.sendMail(mailOptions, (erro, info) => {
      if (erro) {
        console.log("Falha ao enviar o e-mail", erro);
      } else {
        console.log("Email enviado com sucesso.");
      }
    });
  };
}

module.exports = Email;
