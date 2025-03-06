const express = require("express");
const app = express();
const port = 3000;
const session = require("express-session");

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
  })
);

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use("/", require("./routers"));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
