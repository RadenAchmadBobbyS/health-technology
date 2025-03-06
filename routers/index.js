const express = require("express");
const Controller = require("../controllers/controller");
const router = express.Router();

router.use(function (req, res, next) {
  // console.log(req.session);
  next();
});

router.get("/", Controller.showHomePage);

router.get("/register", Controller.showRegister);
router.post("/register", Controller.postRegister);

router.get("/login", Controller.showLogin);
router.post("/login", Controller.postLogin);

router.get("/logout", Controller.logout);

router.get("/profile/:userId", Controller.showUserProfile);

router.get("/profile/:userId/edit", Controller.showEditProfile);
router.post("/profile/:userId/edit");

router.post("/profile/:userId/diagnostics");
router.post("/profile/:userId/diagnostics/:diagnosticId");

router.get("/diagnostic");
// router.post("/diagnostic");
router.get("/diagnostic/disease");
router.post("/diagnostic/disease");

router.get("/manage/register", Controller.showRegister);

router.get("/manage/diseases");

router.get("/manage/diseases/add");
router.post("/manage/diseases/add");

router.get("/manage/diseases/:diseaseId");
router.post("/manage/diseases/:diseaseId/edit");
router.get("/manage/diseases/:diseaseId/delete");

router.get("/manage/symptoms");

router.get("/manage/symptoms/add");
router.post("/manage/symptoms/add");

router.get("/manage/symptoms/:symptomId");
router.post("/manage/symptoms/:symptomId/edit");
router.get("/manage/symptoms/:symptomId/delete");

router.get("/manage/diagnostics");

module.exports = router;
