const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  id: {
    type: Number,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  sendInfo: {
    type: Boolean,
    required: true,
  },
  chatId: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

// export default mongoose.model("User", User);
// module.exports = { UserModel: mongoose.model("User", User) };
module.exports = mongoose.model("User", User);
