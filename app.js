const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
// app.use(require("/"));
app.use(require("./routes/arena"))

app.listen("3000", () => {
	console.log("Listening on port 3000");
});