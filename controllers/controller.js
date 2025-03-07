const { Op } = require("sequelize");
const { User, UserProfile, Symptom, Disease, SymptomDiseaseJunction, Diagnostic } = require("../models");
const bcrypt = require("bcrypt");
const PDFDocument = require("pdfkit");

class Controller {
  // ==================== HOME PAGE ====================
  static async showHomePage(req, res) {
    try {
      // console.log(req.session)
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

      // console.log(req.body);

      await User.create(req.body);
      // console.log(newUser.id);

      // await UserProfile.create({
      //   gender: null,
      //   dateOfBirth: null,
      //   UserId: newUser.id
      // });

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
        req.session.email = loginUser.email;
        req.session.role = loginUser.role;

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

  // ==================== USER PROFILE ====================
  static async showUserProfile(req, res) {
    try {
      const profile = await UserProfile.findOne({
        where: {
          UserId: +req.session.userId
        }
      });
      /*
        include: User
      */
      // console.log(profile);

      if(profile.dataValues.dateOfBirth !== null)
        profile.dataValues.dateOfBirth = UserProfile.convertDate(profile.dateOfBirth);

      res.render("userProfile", { session: req.session, profile: profile });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async showEditProfile(req, res) {
    try {
      const profile = await UserProfile.findOne({
        where: {
          UserId: +req.session.userId
        }
      });

      res.render("userProfileEdit", { session: req.session, profile: profile });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postEditProfile(req, res) {
    try {
      // console.log(req.body)
      req.body.gender = req.body.gender ? req.body.gender : null;

      req.body.dateOfBirth = new Date(req.body.dateOfBirth)
      if(isNaN(req.body.dateOfBirth.getTime())) 
        req.body.dateOfBirth = null;

      await UserProfile.update({
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth
      }, 
      { where: { UserId: req.session.userId }
      }
      );

      res.redirect(`/profile/${req.session.userId}`);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // ==================== Diagnositc ====================

  static async showDiagnostic(req, res) {
    try {
      let symptoms = await Symptom.findAll();
      res.render("selectSymptoms", { symptoms, session: req.session });
    } catch (error) {
      res.send(error);
    }
  }

  static async postDiagnostic(req, res) {
    try {
      req.session.selectedSymptoms = req.body.symptoms
      res.redirect(`/diagnostic/disease`)
    } catch (error) {
      console.log(error)
      res.send(error);
    }
  }

  static async getDisease(req, res) {
    try {
      if (!req.session.userId) throw "Invalid user login";

      const profile = await UserProfile.findOne({
        where: {
          UserId: +req.session.userId
        }
      });

      let selectedSymptoms = req.session.selectedSymptoms

      let diseases = await Disease.findAll({where: { id: selectedSymptoms }})

      console.log("Found Diseases:", diseases.map(d => d.name));

      res.render("confrimDisease", { diseases, profile, session: req.session })
    } catch (error) {
      console.log(error)
      res.send(error);
    }
  }

  static async postDisease(req, res) {
    try {
      if (!req.session.userId) throw "Invalid user login";

    const profile = await UserProfile.findOne({
      where: {
        UserId: +req.session.userId
      }
    });

      let { diseaseId } = req.body
      console.log(`selected id: `, diseaseId)

      await Diagnostic.create({
      UserId: profile.UserId,
      DiseaseId: diseaseId
      })
      res.redirect(`/diagnostic/user/${profile.UserId}`)
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  }

  static async getUserDiagnostics(req, res) {
    try {
      let { userId } = req.params
      let diagnostics = await Diagnostic.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Disease,
          required: true
        }
      ]
      })

      const manageAdmin = false;
      res.render("diagnostics", { diagnostics, userId, session: req.session, manageAdmin })
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  }

  static async getDiagnostics(req, res) {
    try {
      // let { userId } = req.params
      let diagnostics;

      if(req.query.search) 
        diagnostics = await Diagnostic.findAll({
          include: [
            {
              model: Disease,
              required: true
            },
            {
              model: User,
              where: {
                username: {
                  [Op.iLike]: `%${req.query.search}%`
                }
              }
            }
          ]
        });
      else
        diagnostics = await Diagnostic.findAll({
        include: [
          {
            model: Disease,
            required: true
          },
          User
        ]
        });
      
      const manageAdmin = true;
      res.render("diagnostics", { diagnostics, session: req.session, manageAdmin })
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  }

  static async getDiagnosticDetail(req, res) {
    try {
      let { userId, diagnosticId } = req.params;

      let diagnostic = await Diagnostic.findOne({
        where: { id: diagnosticId, UserId: userId },
        include: [{ model: Disease }]
      });
      console.log(diagnostic)
      res.render("diagnosticDetail", { diagnostic, session: req.session });
    } catch (error) {
      res.rend(error)
    }
  }
  static async sendDiagnosticEmail(req, res) {
    try {
      let { userId, diagnosticId } = req.params;

      // Ambil data diagnosa
      const diagnostic = await Diagnostic.findOne({
        where: { id: diagnosticId, UserId: userId },
        include: [{ model: Disease }, { model: User }]
      });

      if (!diagnostic) {
        return res.status(404).send("Diagnosis tidak ditemukan.");
      }

      // Konfigurasi transporter Nodemailer
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "your-email@gmail.com", // Ganti dengan email Anda
          pass: "your-email-password"  // Gunakan app password jika pakai Gmail
        }
      });

      // Isi email
      let mailOptions = {
        from: "your-email@gmail.com",
        to: diagnostic.User.email, // Kirim ke email user
        subject: "Hasil Diagnosis Anda",
        html: `
          <h3>Hasil Diagnosis</h3>
          <p><strong>Penyakit:</strong> ${diagnostic.Disease.name}</p>
          <p><strong>Analisis:</strong> Diagnosis berdasarkan gejala yang dipilih.</p>
          <p><strong>Rekomendasi:</strong> Silakan konsultasikan ke dokter untuk pemeriksaan lebih lanjut.</p>
          <p>Terima kasih.</p>
        `
      };

      // Kirim email
      await transporter.sendMail(mailOptions);

      // Redirect kembali dengan pesan sukses
      res.redirect(`/profile/${userId}/diagnostics?emailSent=success`);
    } catch (error) {
      console.log(error);
      res.status(500).send("Gagal mengirim email.");
    }
  }
  
  static async getDiagnosticPdf(req, res) {
    try {
      let { userId, diagnosticId } = req.params;

      let diagnostic = await Diagnostic.findOne({
        where: { id: diagnosticId, UserId: userId },
        include: [{ model: Disease }]
      });

      const doc = new PDFDocument();
      res.setHeader("Content-Disposition", `attachment; filename="diagnostic_${diagnosticId}.pdf"`);
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);

      doc.fontSize(20).text("Detail Diagnosis", { align: "center" });
      doc.moveDown();
      doc.fontSize(16).text(`Penyakit: ${diagnostic.Disease.name}`);
      doc.text(`Tanggal Diagnosis: ${diagnostic.createdAt.toDateString()}`);
      doc.moveDown();
      doc.text("Analisis: Diagnosis berdasarkan gejala yang dipilih.");
      doc.text("Rekomendasi: Konsultasikan dengan dokter untuk pemeriksaan lebih lanjut.");
      doc.end();
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  }
  // ================== MANAGE DISEASES ==================
  static async showManageDiseases(req, res) {
    try {
      const diseases = await Disease.findAll({
        order: [["id", "ASC"]]
      });
      // console.log(diseases)

      res.render("manageDiseases", {diseases: diseases, session: req.session})
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // ==================== MANAGE ADD DISEASE ====================
  static async showManageDiseaseAdd(req, res) {
    try {
      const symptoms = await Symptom.findAll();
      const errors = req.query.errors ? JSON.parse(req.query.errors) : {};
      // console.log(symptoms);

      res.render("manageDiseasesAdd", {
        session: req.session, 
        symptoms: symptoms,
        errors: errors
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postManageDiseaseAdd(req, res) {
    try {
      // console.log(req.body);

      req.body.symptoms = req.body.symptoms 
        ? req.body.symptoms.map((element) => Number(element))
        : [];
      // console.log(req.body);

      const symptoms = await Symptom.findAll({
        where: {
          id: req.body.symptoms
        }
      });
      // console.log(symptoms);

      const newDisease = await Disease.create({
        name: req.body.name,
        description: req.body.description,
        level: req.body.level
      });

      await newDisease.addSymptoms(symptoms, {selfGranted: false});
 
      res.redirect("/manage/diseases");
    } catch (error) {
      let errors = {};
      error.errors.forEach((element) => {
        errors[element.path] = element.message;
      });
      res.redirect(`/manage/diseases/add?errors=${JSON.stringify(errors)}`);
    }
  }

  // ==================== MANAGE DETAIL DISEASE ====================
  static async showManageDiseaseDetail (req, res) {
    try {
      const disease = await Disease.findOne({
        where: {
          id: req.params.diseaseId
        },
        include: Symptom
      });

      res.render("manageDiseasesById", {session: req.session, disease: disease});
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // ==================== MANAGE EDIT DISEASE ====================
  static async showManageDiseaseEdit(req, res) {
    try {
      const errors = req.query.errors ? JSON.parse(req.query.errors) : {};

      const symptoms = await Symptom.findAll();
      // console.log(symptoms);
      const disease = await Disease.findOne({
        where: {
          id: +req.params.diseaseId
        },
        include: Symptom
      });

      // console.log(symptoms, 'symptoms');
      // console.log(disease, 'disease');
      // console.log(disease.Symptoms, 'diseaseSymptoms');

      res.render("manageDiseasesEdit", {
        session: req.session, 
        symptoms: symptoms, 
        disease: disease,
        errors: errors
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postManageDiseaseEdit(req, res) {
    try {
      req.body.symptoms = req.body.symptoms 
        ? req.body.symptoms.map((element) => Number(element))
        : [];
      // console.log(req.body);

      const disease = await Disease.findOne({
        where: {
          id: +req.params.diseaseId
        }, 
        include: Symptom
      });

      const symptoms = await Symptom.findAll({
        where: {
          id: req.body.symptoms
        }
      });
      // console.log(symptoms);

      await Disease.update({
        name: req.body.name,
        description: req.body.description,
        level: req.body.level
      }, {
        where: {
        id: +req.params.diseaseId
        }
      });

      await disease.setSymptoms(symptoms, {selfGranted: false});
  
      res.redirect("/manage/diseases");
    } catch (error) {
      let errors = {};
      error.errors.forEach((element) => {
        errors[element.path] = element.message;
      });
      res.redirect(`/manage/diseases/${req.params.diseaseId}/edit?errors=${JSON.stringify(errors)}`);
    }
  }

  // ==================== MANAGE DELETE DISEASE ====================
  static async manageDiseaseDelete(req, res) {
    try {
      await SymptomDiseaseJunction.destroy({
        where: {
          DiseaseId: +req.params.diseaseId
        }
      });

      await Disease.destroy({
        where: {
          id: +req.params.diseaseId
        }
      });

      res.redirect("/manage/diseases");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // ==================== MANAGE SYMPTOMS ====================
  static async showManageSymptoms(req, res) {
    try {
      const symptoms = await Symptom.findAll();

      res.render("manageSymptoms", {session: req.session, symptoms: symptoms});
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // ==================== MANAGE ADD SYMPTOMS ====================
  static async showManageSymptomsAdd(req, res) {
    try {
      const errors = req.query.errors ? JSON.parse(req.query.errors) : {};

      res.render("manageSymptomsAdd", {
        session: req.session,
        errors: errors
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postManageSymptomsAdd(req, res) {
    try {
      await Symptom.create(req.body);

      res.redirect("/manage/symptoms");
    } catch (error) {
      let errors = {};
      error.errors.forEach((element) => {
        errors[element.path] = element.message;
      });
      res.redirect(`/manage/symptoms/add?errors=${JSON.stringify(errors)}`);
    }
  }

  // ==================== MANAGE DELETE SYMPTOMS ====================
  static async manageSymptomDelete(req, res) {
    try {
      await SymptomDiseaseJunction.destroy({
        where: {
          SymptomId: +req.params.symptomId
        }
      });

      await Symptom.destroy({
        where: {
          id: +req.params.symptomId
        }
      });

      res.redirect("/manage/symptoms");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
}

module.exports = Controller;
