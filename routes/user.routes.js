const userController = require("../controllers/users.controller");

const express = require("express");
const router = express.Router();

router.post("/register", userController.createNewUser);
router.post("/login", userController.loginUser);
router.get("/user-profile", userController.getUserProfile);
router.post("/deposit", userController.updateDeposit);
router.post("/withdraw", userController.updateWithdrawal);
router.post("/user-settings", userController.updateProfile);
router.post("/calc-roi", userController.calculateRoi);
router.post("/send-mail", userController.sendMail);

module.exports = router;
