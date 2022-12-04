const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Account = new Schema({
  date: {
    type: String,
    required: true,
  },
  siteName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  lowestPrice: {
    type: Number,
    required: true,
  },
  lowestDescription: {
    type: String,
    required: true,
  },
  lowestTitle: {
    type: String,
    required: true,
  },
  lowestUser: {
    required: false,
    id: {
      type: String,
    },
    username: {
      type: String,
      required: false,
    },
    picture: {
      smallPicture: String,
      mediumPicture: String,
      largePicture: String,
    },
    description: String,
    isVerified: Boolean,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Account", Account);
