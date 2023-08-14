const { updateOne } = require("../models/user.model");
const User = require("../models/user.model");

const createNewUser = async (payload) => {
  try {
    const user = new User(payload);
    return await user.save();
  } catch (error) {
    return console.log(error);
  }
};

const checkUser = async (email) => {
  try {
    return User.findOne({ email }).collation({ locale: "en", strength: 2 });
  } catch (error) {
    return console.log(error);
  }
};

const checkUserPhone = async (phoneNumber) => {
  try {
    return User.findOne({ phoneNumber });
  } catch (error) {
    return callback(error);
  }
};

const getUserProfile = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    console.log(error);
  }
};

const getUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.log(error);
  }
};

const updateDeposit = async (
  userId,
  totalCapital,
  accountArrayId,
  transactionDate
) => {
  try {
    return await User.updateOne(
      { _id: userId },
      {
        $set: {
          "accountDetails.$[elemA].capital": totalCapital,
          "accountDetails.$[elemA].date": transactionDate,
        },
      },
      {
        arrayFilters: [{ "elemA._id": accountArrayId }],
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const updateTransaction = async (userId, transactionData) => {
  try {
    return await User.updateOne(
      { _id: userId },
      { $addToSet: { transactionDetails: transactionData } }
    );
  } catch (error) {
    console.log(error);
  }
};

const updateReferralBonus = async (
  referrerId,
  totalRefEarnings,
  referrerArrayId
) => {
  try {
    return await User.updateOne(
      { _id: referrerId },
      {
        $set: {
          "accountDetails.$[elemA].referralEarnings": totalRefEarnings,
        },
      },
      {
        arrayFilters: [{ "elemA._id": referrerArrayId }],
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const updateWithdrawal = async (
  userId,
  totalRoi,
  accountArrayId,
  totalWithdrawn
) => {
  try {
    return await User.updateOne(
      { _id: userId },
      {
        $set: {
          "accountDetails.$[elemA].roi": totalRoi,
          "accountDetails.$[elemA].amountWithdrawn": totalWithdrawn,
        },
      },
      {
        arrayFilters: [{ "elemA._id": accountArrayId }],
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const profileUpdate = async (payload, objectId) => {
  try {
    return await User.findOneAndUpdate(
      { _id: payload.userId },
      {
        $set: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phoneNumber: payload.phoneNumber,

          "accountDetails.$[elemA].walletAddress": payload.wallet,
        },
      },
      {
        arrayFilters: [{ "elemA._id": objectId }],
      },
      { returnOriginal: false }
    );
  } catch (error) {
    console.log(error);
  }
};

const updateRoi = async (userId, totalRoiRound, accountArrayId) => {
  try {
    return await User.updateOne(
      { _id: userId },
      {
        $set: {
          "accountDetails.$[elemA].roi": totalRoiRound,
        },
      },
      {
        arrayFilters: [{ "elemA._id": accountArrayId }],
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
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
};
