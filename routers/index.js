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

router.get("/manage/register", Controller.showRegister);

router.get("/login", Controller.showLogin);
router.post("/login", Controller.postLogin);

router.use(function(req, res, next) {
  if(!req.session.userId)
    res.redirect(`/?errors="notLoggedIn"`);
  else next();
});

router.get("/logout", Controller.logout);

router.get("/profile/:userId", Controller.showUserProfile);

router.get("/profile/:userId/edit", Controller.showEditProfile);
router.post("/profile/:userId/edit", Controller.postEditProfile);

router.get("/profile/:userId/diagnostics");
router.get("/profile/:userId/diagnostics/:diagnosticId");

router.get("/diagnostic", Controller.showDiagnostic);
router.post("/diagnostic", Controller.postDiagnostic)
router.get("/diagnostic/disease");
router.post("/diagnostic/disease");

router.use(function(req, res, next) {
  if(req.session.role !== 'admin')
    res.redirect(`/?errors="userNotAdmin"`);
  else next();
});

router.get("/manage/diagnostics");

router.get("/manage/diseases", Controller.showManageDiseases);

router.get("/manage/diseases/add", Controller.showManageDiseaseAdd);
router.post("/manage/diseases/add", Controller.postManageDiseaseAdd);

router.get("/manage/diseases/:diseaseId", Controller.showManageDiseaseDetail);
router.get("/manage/diseases/:diseaseId/edit", Controller.showManageDiseaseEdit);
router.post("/manage/diseases/:diseaseId/edit", Controller.postManageDiseaseEdit);
router.get("/manage/diseases/:diseaseId/delete", Controller.manageDiseaseDelete);

router.get("/manage/symptoms", Controller.showManageSymptoms);

router.get("/manage/symptoms/add", Controller.showManageSymptomsAdd);
router.post("/manage/symptoms/add", Controller.postManageSymptomsAdd);

router.get("/manage/symptoms/:symptomId/delete", Controller.manageSymptomDelete);

module.exports = router;
