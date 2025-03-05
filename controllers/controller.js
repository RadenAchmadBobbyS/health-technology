const userLogin = {};

const { User } = require("../models");
const bcrypt = require("bcrypt");

class Controller {
  // ==================== HOME PAGE ====================
  static async showHomePage(req, res) {
    try {
      res.render("index", { userLogin: userLogin });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // ==================== REGISTER ====================
  static async showRegister(req, res) {
    try {
      // console.log(req.path);
      const errors = req.query.errors ? JSON.parse(req.query.errors) : {};

      const admin = req.path === "/manage/register" ? true : false;
      res.render("register", {
        userLogin: userLogin,
        admin: admin,
        errors: errors
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postRegister(req, res) {
    try {
      req.body.role = req.body.role ? req.body.role : "user";

      console.log(req.body);

      await User.create(req.body);

      res.redirect("/");
    } catch (error) {
      let errors = {};
      error.errors.forEach((element) => {
        errors[element.path] = element.message;
      });
      res.redirect(`/register?errors=${JSON.stringify(errors)}`);
    }
  }

  // ==================== LOGIN ====================
  static async showLogin(req, res) {
    try {
      const errors = req.query.errors ? JSON.parse(req.query.errors) : {};

      res.render("login", { userLogin: userLogin, errors: errors });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postLogin(req, res) {
    try {
      // console.log(req.body);
      let validation = {};

      const loginUser = await User.findOne({
        where: {
          username: req.body.username
        }
      });

      if (!loginUser)
        validation.username =
          req.body.username.length === 0
            ? "Please insert username!"
            : "User not found!";

      const validPassword = loginUser
        ? await bcrypt.compare(req.body.password, loginUser.password)
        : null;
      if (!validPassword) {
        if (req.body.password.length === 0)
          validation.password = "Please insert password!";
        else if (req.body.username.length === 0)
          validation.password = "Please insert username first!";
        else validation.password = "Invalid password for this username!";
      }

      if (Object.keys(validation).length > 0) throw validation;

      res.redirect("/");
    } catch (error) {
      res.redirect(`/login?errors=${JSON.stringify(error)}`);
    }
  }
}

module.exports = Controller;
