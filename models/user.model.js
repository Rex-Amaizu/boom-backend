const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: "String",
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: "String",
    required: true,
  },
  referrer: { type: String },
  referralCode: { type: String },
  accountDetails: [
    {
      totalBalance: { type: String },
      capital: { type: String },
      roi: { type: String },
      referralEarnings: { type: String },
      walletAddress: { type: String },
      date: { type: String },
      amountWithdrawn: { type: String },
    },
  ],
  transactionDetails: [{}],
  date: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject._v;
    delete returnedObject.password;
  },
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model("user", userSchema);
module.exports = User;
