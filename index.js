const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const CronJob = require("cron").CronJob;
const { eldoradoFunction } = require("./eldorado");
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/user.model");

// const users = [
//   {
//     chatId: 473462820,
//     sendInfo: true,
//   },
// ];

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
  ctx.reply("Welcome");
  const from = ctx.update.message.from;
  const chat = ctx.update.message.chat;
  const searchedUser = await UserModel.findOne({ id: from.id });
  if (!searchedUser) {
    const user = await new UserModel({
      id: from.id,
      userName: from.username,
      sendInfo: true,
      chatId: chat.id,
    });
    await user.save();
  }
});
bot.on(message("text"), (ctx) => ctx.reply("👍"));
bot.launch();

const bootstrap = async () => {
  // const jobThreeHours = new CronJob("0 0 */3 * * *", () => {
  //   eldoradoFunction(bot);
  // });
  // jobThreeHours.start();
  const jobMin = new CronJob("0 */1 * * * *", () => {
    eldoradoFunction(bot);
  });
  jobMin.start();
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
    } else {
      return new Error("No mongo uri");
    }
  } catch (e) {
    console.log("Server error", e.message);
    process.exit(1);
  }
};

bootstrap();
