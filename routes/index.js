const express = require("express");
const router = express.Router();
const {
  userExists,
  client,
  darDeAltaAlumno,
  darDeBajaAlumno,
} = require("../db/mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

const getUserType = (req) => {
  // DEFINIR EL TIPO DE USUARIO
  const letter = req.user.email[0];

  return {
    student: letter === "a",
    teacher: letter === "f",
    coordinator: letter === "c",
  };
};

//PASSPORT
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (username, password, done) {
      const obj = await userExists(username);

      if (!obj.status) return done(null, false);

      const match = await bcrypt.compare(password, obj.res.password);

      if (match) return done(null, obj.res);

      return done(null, false);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.email);
});

passport.deserializeUser(async function (id, done) {
  const obj = await userExists(id);

  done(null, obj.res);
});

// UTILITY
const isAuth = async (req, res, next) => {
  await client.close();

  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/iniciar-sesion");
  }
};

// RUTAS GET
router.get("/", isAuth, function (req, res, next) {
  const type = getUserType(req);

  res.render("index", {
    title: "Dashboard",
    type,
  });
});

router.get("/iniciar-sesion", function (req, res, next) {
  res.render("login", { title: "Iniciar Sesión" });
});

router.get("/semestre/:id", function (req, res, next) {
  const type = getUserType(req);

  res.render("semestre", { title: `Semestre ${req.params.id}`, type });
});

router.get("/periodo/:id", function (req, res, next) {
  const type = getUserType(req);

  res.render("periodo", { title: `Periodo ${req.params.id}`, type });
});

router.get("/perfiles/:id", function (req, res, next) {
  const type = getUserType(req);

  res.render("perfiles", { title: `Perfil de maestro`, type });
});

router.get("/alta-alumno", function (req, res, next) {
  const type = getUserType(req);

  res.render("altaAlumno", { title: `Dar de alta alumno`, type });
});

router.get("/alta-maestro", function (req, res, next) {
  const type = getUserType(req);

  res.render("altaMaestro", { title: `Dar de alta maestro`, type });
});

router.get("/baja-alumno", function (req, res, next) {
  const type = getUserType(req);

  res.render("bajaAlumno", { title: `Dar de baja alumno`, type });
});

router.get("/baja-maestro", function (req, res, next) {
  const type = getUserType(req);

  res.render("bajaMaestro", { title: `Dar de baja maestro`, type });
});

router.get("/asignar-aula", function (req, res, next) {
  const type = getUserType(req);

  res.render("asignarAula", { title: `Asignar aula`, type });
});

router.get("/cerrar-sesion", async function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/iniciar-sesion");
  });
});

// RUTAS POST
router.post(
  "/iniciar-sesion",
  passport.authenticate("local", { failureRedirect: "/iniciar-sesion" }),
  function (req, res) {
    res.redirect(`/`);
  }
);

router.post("/alta-alumno", async function (req, res, next) {
  await darDeAltaAlumno(req.body);

  client.close();

  res.redirect("/");
});

router.post("/alta-maestro", async function (req, res, next) {
  await darDeAltaAlumno(req.body);

  client.close();

  res.redirect("/");
});

router.post("/baja-alumno", async function (req, res, next) {
  await darDeBajaAlumno(req.body);

  client.close();

  res.redirect("/");
});

router.post("/baja-maestro", async function (req, res, next) {
  await darDeBajaAlumno(req.body);

  client.close();

  res.redirect("/");
});

router.post("/asignar-aula", async function (req, res, next) {
  console.log(req.body);

  res.redirect("/");
});

module.exports = router;
