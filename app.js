const express = require("express");
const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use("/", require("./routers"));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
