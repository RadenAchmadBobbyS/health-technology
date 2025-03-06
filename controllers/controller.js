const userLogin = {};

const { User } = require("../models");
const bcrypt = require("bcrypt");

class Controller {
  // ==================== HOME PAGE ====================
  static async showHomePage(req, res) {
    try {
      res.render("index", { session: req.session });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // ==================== REGISTER ====================
  static async showRegister(req, res) {
    try {
      // console.log(req.path);
      if (req.session.userId) res.redirect("/");

      const errors = req.query.errors ? JSON.parse(req.query.errors) : {};

      const admin = req.path === "/manage/register" ? true : false;
      res.render("register", {
        session: req.session,
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
      if (req.session.userId) res.redirect("/");

      const errors = req.query.errors ? JSON.parse(req.query.errors) : {};

      res.render("login", { session: req.session, errors: errors });
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

      req.session.regenerate(function (err) {
        if (err) next(err);

        // store user information in session, typically a user id
        req.session.userId = loginUser.id;
        req.session.username = loginUser.username;

        // save the session before redirection to ensure page
        // load does not happen before session is saved
        req.session.save(function (err) {
          if (err) return next(err);
          res.redirect("/");
        });
      });
    } catch (error) {
      res.redirect(`/login?errors=${JSON.stringify(error)}`);
    }
  }

  // ==================== LOGOUT ====================
  static async logout(req, res, next) {
    try {
      // logout logic

      // clear the user from the session object and save.
      // this will ensure that re-using the old session id
      // does not have a logged in user
      req.session.userId = null;
      req.session.username = null;
      req.session.save(function (err) {
        if (err) next(err);

        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate(function (err) {
          if (err) next(err);
          res.redirect("/");
        });
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
}

module.exports = Controller;
