const express = require("express")
const hameshController = require("../controllers/hamaesh_controller")
const router = express.Router()
router.get("/admin",hameshController.getAll)
router.post("/register",hameshController.addInfo)
module.exports = router