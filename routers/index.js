const express = require("express");
const Controller = require("../controllers/controller");
const router = express.Router();

router.get("/", Controller.showHomePage);

router.get("/register", Controller.showRegister);
router.post("/register", Controller.postRegister);

router.get("/login", Controller.showLogin);
router.post("/login", Controller.postLogin);

module.exports = router;
