const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();
const auth = require("../middlewares/auth.js");
const User = require("../models/user.model");
const {
  createNewUser,
  checkUser,
  checkUserPhone,
  getUserProfile,
  getUserByEmail,
  updateDeposit,
  updateTransaction,
  updateReferralBonus,
  updateWithdrawal,
  profileUpdate,
  updateRoi,
} = require("../repository/users");

class UserService {
  static async login(payload, res) {
    const user = await checkUser(payload.email);
    if (!user) return res.status(400).send("Invalid Email/Password!");

    var datetime = new Date();
    const currentDate = datetime.toISOString().slice(0, 10);
    const investmentDate = user.accountDetails[0].date;
    const capital = user.accountDetails[0].capital;
    const amountWithdrawn = user.accountDetails[0].amountWithdrawn;
    const accountArrayId = user.accountDetails[0]._id.toString();
    const userId = user._id.toString();

    const diffDays = Math.floor(
      (Date.parse(currentDate) - Date.parse(investmentDate)) / 86400000
    );

    const totalMonthlyRate = 68;

    const dailyRate = totalMonthlyRate / 30.45;

    const multiplicationVal = dailyRate / 100;

    const dailyRoi = capital * multiplicationVal;

    const daysPassed = diffDays;

    const calcRoi = dailyRoi * diffDays;

    const totalRoi = calcRoi - amountWithdrawn;

    const totalRoiRound = Math.round((totalRoi + Number.EPSILON) * 100) / 100;

    const roiUpdate = await updateRoi(userId, totalRoiRound, accountArrayId);

    if (roiUpdate) {
      if (bcrypt.compareSync(payload.password, user.password)) {
        const token = auth.generateAccessToken(payload.email);
        return { status: 200, message: "Login Successful", user, token };
      } else {
        return res.send({
          status: 400,
          message: "Invalid Username/Password",
        });
      }
    }
  }

  static async register(payload, res) {
    async function doRegister(
      payload,
      res,
      accountDetails,
      transactionDetails,
      referralCode,
      referrer
    ) {
      try {
        if (payload.firstName === undefined)
          return res.send({ message: "First Name is Required" });
        if (payload.lastName === undefined)
          return res.send({ message: "Last Name is Required" });
        if (payload.email === undefined)
          return res.send({ message: "Email is Required" });
        if (payload.phoneNumber === undefined)
          return res.send({ message: "Phone Number is Required" });
        if (payload.password === undefined)
          return res.send({ message: "Password is Required" });

        const userEmail = await checkUser(payload.email);
        if (userEmail) return res.status(400).send("Email Already In Use!");

        const userPhone = await checkUserPhone(payload.phoneNumber);
        if (userPhone)
          return res.status(400).send("Phone Number Already In Use!");

        const allUserData = {
          ...payload,
          accountDetails,
          transactionDetails,
          referralCode,
          referrer,
        };

        return await createNewUser(allUserData);
      } catch (error) {
        return res.send(error);
      }
    }

    async function addRefCode(payload, res, refCode) {
      let referrer = "";
      var datetime = new Date();
      const registrationDate = datetime.toISOString().slice(0, 10);

      if (
        payload.referral !== "" ||
        payload.referral !== undefined ||
        payload.referral !== null
      ) {
        referrer = payload.referral;
      }

      const accountDetails = {
        totalBalance: 0,
        capital: 0,
        roi: 0,
        referralEarnings: 0,
        walletAddress: "Your USDT wallet address",
        date: registrationDate,
        amountWithdrawn: 0,
      };

      const referralCode = refCode;

      const transactionDetails = [{}];

      return doRegister(
        payload,
        res,
        accountDetails,
        transactionDetails,
        referralCode,
        referrer
      );
    }

    async function generateRefCod(payload, res) {
      const refCode = Math.floor(100000 + Math.random() * 900000);

      const codeDey = await User.findOne({ refCode });

      // const allActDet = await allUser.filter((obj) => {
      //   return obj.accountDetails.referralCode == refCode;
      // })[0];

      if (codeDey) return generateRefCod(payload, res);

      return addRefCode(payload, res, refCode);
    }

    return generateRefCod(payload, res);
  }

  static async getUserProfile(payload, res) {
    try {
      const user = await getUserProfile(payload.userId);
      if (!user)
        return res.json({ status: 400, message: "User does not exists!" });
      return res.json({ status: 200, data: user });
    } catch (error) {
      console.log(error);
    }
  }

  static async deposit(payload, res) {
    try {
      const user = await getUserByEmail(payload.email);

      if (!user)
        return res.json({ status: 400, message: "User does not exists!" });

      const amount = payload.amount;
      const statusType = "Deposit";
      const capital = user.accountDetails[0].capital;
      const referrer = user.referrer;
      const accountArrayId = user.accountDetails[0]._id.toString();
      const userId = user._id.toString();

      if (referrer === undefined) {
        const transactionId = Math.floor(100000 + Math.random() * 90000000);
        var datetime = new Date();
        const transactionDate = datetime.toISOString().slice(0, 10);

        const totalCapital = parseInt(amount) + parseInt(capital);

        const transactionData = {
          transactionId: transactionId,
          status: statusType,
          amount: amount,
          date: transactionDate,
        };

        await updateDeposit(
          userId,
          totalCapital,
          accountArrayId,
          transactionDate
        );

        await updateDepositTransaction(userId, transactionData);

        return res.json({
          status: 200,
          message: "Deposit Completed Successfully!",
        });
      } else {
        const referralBonus = amount * 0.05;

        //getting referrer details
        const userReferrer = await User.findOne({ referralCode: referrer });
        const referrerId = userReferrer._id.toString();
        const referrerArrayId = userReferrer.accountDetails[0]._id.toString();
        const currentRefEarnings =
          userReferrer.accountDetails[0].referralEarnings;

        const totalRefEarnings =
          parseInt(currentRefEarnings) + parseInt(referralBonus);

        const transactionId = Math.floor(100000 + Math.random() * 90000000);
        var datetime = new Date();
        const transactionDate = datetime.toISOString().slice(0, 10);

        const totalCapital = parseInt(amount) + parseInt(capital);

        const transactionData = {
          transactionId: transactionId,
          status: statusType,
          amount: amount,
          date: transactionDate,
        };

        await updateDeposit(
          userId,
          totalCapital,
          accountArrayId,
          transactionDate
        );

        await updateReferralBonus(
          referrerId,
          totalRefEarnings,
          referrerArrayId
        );

        await updateTransaction(userId, transactionData);

        return res.json({
          status: 200,
          message: "Deposit Completed Successfully!",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async withdraw(payload, res) {
    try {
      const user = await getUserByEmail(payload.email);

      if (!user)
        return res.json({ status: 400, message: "User does not exists!" });

      const amount = payload.amount;
      const statusType = "Withdrawal";
      const roi = user.accountDetails[0].roi;
      const amountWithdrawn = user.accountDetails[0].amountWithdrawn;
      const accountArrayId = user.accountDetails[0]._id.toString();
      const userId = user._id.toString();

      const transactionId = Math.floor(100000 + Math.random() * 90000000);
      var datetime = new Date();
      const transactionDate = datetime.toISOString().slice(0, 10);

      if (parseInt(amount) > parseInt(roi))
        return res.send(
          "You cannot withdraw an amount higher than the roi. Try again!"
        );

      const totalRoi = parseInt(roi) - parseInt(amount);
      const totalWithdrawn = parseInt(amountWithdrawn) + parseInt(amount);

      const transactionData = {
        transactionId: transactionId,
        status: statusType,
        amount: amount,
        date: transactionDate,
      };

      await updateWithdrawal(userId, totalRoi, accountArrayId, totalWithdrawn);

      await updateTransaction(userId, transactionData);

      return res.json({
        status: 200,
        message: "Withdrawal Completed Successfully!",
      });
    } catch (error) {
      console.log(error);
    }
  }

  static async updateUser(payload, res) {
    try {
      const checkUserId = await getUserProfile(payload.userId);

      if (!checkUserId)
        return res.status(400).send("This user does not exist!");

      const objectId = checkUserId.accountDetails[0]._id.toString();

      const userUpdate = await profileUpdate(payload, objectId);
      if (userUpdate) {
        const updated = await getUserProfile(payload.userId);
        res.status(200).send({
          message: "User Profile Updated Successfully!",
          data: updated,
        });
      } else {
        res.send("Internal server error");
      }
    } catch (error) {}
  }

  static async sendMail(payload, res) {
    try {
      const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        ignoreTLS: true,
      });

      const sent = await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: payload.receiver,
        subject: payload.subject,
        message: payload.message,
      });

      if (sent) {
        res.send({ status: 200, message: "Mail sent successfully" });
      } else {
        res.send({ status: 500, message: "Mail sending failed" });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = UserService;
