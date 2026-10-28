require("dotenv").config();

const path = require("path");
const express = require("express");
const hameshRouter = require("./routes/hamaesh_route");
const pageRouter = require("./routes/page_route")

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", hameshRouter);
app.use("/Cafemadan", pageRouter);


const PORT = process.env.APP_PORT || 3000

app.listen(PORT,()=>{
    console.log(`Listen to ${PORT}`)
})

module.exports = app;