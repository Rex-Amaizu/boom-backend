const bcryptjs = require("bcryptjs");
const UserService = require("../services/users.services");

module.exports = {
  createNewUser: async (req, res, next) => {
    try {
      const { password } = req.body;
      const salt = bcryptjs.genSaltSync(10);

      req.body.password = bcryptjs.hashSync(password, salt);

      const users = await UserService.register(req.body, res, next);
      if (users) {
        res
          .status(200)
          .json({ message: "Registration Successful!", data: users });
      }
    } catch (error) {
      console.log(error);
    }
  },

  loginUser: async (req, res, next) => {
    try {
      const user = await UserService.login(req.body, res, next);
      if (user) {
        res.json(user);
      }
    } catch (error) {
      console.log(error);
    }
  },

  getUserProfile: async (req, res, next) => {
    try {
      const user = await UserService.getUserProfile(req.query, res, next);

      if (user) {
        res.json({ status: 200, user });
      }
    } catch (error) {
      console.log(error);
    }
  },

  updateDeposit: async (req, res, next) => {
    try {
      const deposit = UserService.deposit(req.body, res, next);
    } catch (error) {
      console.log(error);
    }
  },

  updateWithdrawal: async (req, res, next) => {
    try {
      const withdraw = UserService.withdraw(req.body, res, next);
    } catch (error) {
      console.log(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const userUpdate = await UserService.updateUser(req.body, res, next);
      if (userUpdate) {
        res.json({ data: userUpdate });
      }
    } catch (error) {
      console.log(error);
    }
  },

  calculateRoi: async (req, res, next) => {
    try {
      const calc = await UserService.calculateRoi(req.body, res, next);
    } catch (error) {
      console.log(error);
    }
  },

  sendMail: async (req, res, next) => {
    try {
      const mail = await UserService.sendMail(req.body, res, next);
    } catch (error) {
      console.log(error);
    }
  },
};
