const userLogin = {};

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
      res.render("register", { userLogin: userLogin });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postRegister(req, res) {
    try {
      res.redirect("/");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // ==================== LOGIN ====================
  static async showLogin(req, res) {
    try {
      res.render("login", { userLogin: userLogin });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postLogin(req, res) {
    try {
      res.redirect("/");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
}

module.exports = Controller;
