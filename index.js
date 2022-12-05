const { Telegraf, Markup } = require("telegraf");
const { message } = require("telegraf/filters");
const CronJob = require("cron").CronJob;
const { eldoradoFunction } = require("./src/parsers/eldorado");
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./src/models/user.model");
const { funPayParser } = require("./src/parsers/funpay");

const botButtons = Markup.keyboard([
  [
    {
      text: "Получить актуальные данные прямо сейчас ✌",
      callback_data: "get_actual_data",
    },
  ],
]);
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
  ctx.reply("Welcome", botButtons);
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
bot.on(message("text"), async (ctx) => {
  if (ctx.message.text === "Получить актуальные данные прямо сейчас ✌") {
    await ctx.reply("Делаю запрос!", botButtons);
    await ctx.reply("⚠️⚠️Начинаю анализ по Eldorado⚠️⚠️", botButtons);
    await eldoradoFunction(bot, "silent");
    await ctx.reply("⚠️⚠️Начинаю анализ по FunPay⚠️⚠️", botButtons);
    await funPayParser(bot, "silent");
  } else {
    ctx.reply("👍", botButtons);
  }
});
bot.launch();

const bootstrap = async () => {
  const jobThreeHours = new CronJob("0 0 */3 * * *", async () => {
    await eldoradoFunction(bot, "main");
    await funPayParser(bot, "main");
  });
  jobThreeHours.start();
  // const jobMin = new CronJob("0 */1 * * * *", async () => {
  //   await eldoradoFunction(bot, "main");
  //   await funPayParser(bot, "main");
  // });
  // jobMin.start();
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
