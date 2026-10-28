const express = require("express")
const pageController = require("../controllers/page_controller")
const router = express.Router()
router.get("/:name",pageController.getPage)
module.exports = router