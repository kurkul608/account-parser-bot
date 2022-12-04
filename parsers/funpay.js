const jsdom = require("jsdom");
const AccountModel = require("../models/account.model");
const moment = require("moment/moment");
const UserModel = require("../models/user.model");
const { JSDOM } = jsdom;

const searchWords = [
  "bronze",
  "silver",
  "gold",
  "diamond",
  "master",
  "grandmaster",
  "top 500",
];
const funPayParser = async (bot) => {
  await fetch("https://funpay.com/lots/139/")
    .then((response) => response.text())
    .then(async (response) => {
      const dom = new JSDOM(response);
      let rows = dom.window.document
        .querySelector(".tc")
        .querySelectorAll(".tc-item");
      const data = searchWords.map((word) => {
        const data = [];
        const total = {};
        rows.forEach(async (row) => {
          if (
            row
              .querySelector(".tc-desc-text")
              .innerHTML.toLowerCase()
              .includes(word.toLowerCase())
          ) {
            const price = row.querySelector(".tc-price");
            if (price) {
              if (!total[word.toLowerCase()]) {
                total[word.toLowerCase()] = 1;
              } else {
                total[word.toLowerCase()] += 1;
              }
              const onlyPrice = (price.innerText || price.textContent)
                .toString()
                .replace(/[^\d.]/gi, "");
              data.push({
                key: word.toLowerCase(),
                title: row.querySelector(".tc-desc-text").innerHTML.toString(),
                price: +onlyPrice,
                userName: row
                  .querySelector(".media-user-name")
                  .innerHTML.toString()
                  .replace(/ /g, ""),
              });
            }
          }
        });
        return data.length
          ? data
              .map((el) => ({ ...el, total: total[word.toLowerCase()] }))
              .reduce((acc, el) => (el.price < acc ? el : acc), Infinity)
          : {
              key: word.toLowerCase(),
              title: "Таких аккаунтов в наличии нет",
              price: 0,
              total: 0,
              userName: "Не найден",
            };
      });
      for (const acc of data) {
        const account = await new AccountModel({
          date: moment().format(),
          siteName: "FunPay",
          name: acc.key,
          total: acc.total,
          lowestPrice: acc.price,
          lowestDescription: acc.title,
          lowestTitle: acc.title,
          lowestUser: {
            username: acc.userName,
          },
        });
        await account.save();
      }
    });
  const users = await UserModel.find();
  console.log(users);
  for (const user of users) {
    if (user.sendInfo) {
      await bot.telegram.sendMessage(
        user.chatId,
        "Анализ по FunPay был успешно произведен"
      );

      let text = "❗Данные по FunPay❗\n";

      const accounts = await AccountModel.find({
        siteName: "FunPay",
      })
        .sort({ date: "desc" })
        .limit(searchWords.length * 2);

      if (accounts && accounts.length) {
        searchWords.forEach((word) => {
          const filteredSortedData = accounts
            .filter((result) => result.name === word)
            .sort((a, b) => moment(a.date).unix() - moment(b.date).unix());
          if (filteredSortedData.length) {
            text += `\nНа ${moment(filteredSortedData[0].date).format(
              "YYYY MM DD HH:mm"
            )}. ✅ \n На площадке продается ${
              filteredSortedData[0].total
            } аккаунтов ${
              filteredSortedData[0].name
            }. 👤\n Минимальная цена на аккаунт типа ${
              filteredSortedData[0].name
            } составляет ${filteredSortedData[0].lowestPrice}US$D 💲\n`;

            if (filteredSortedData[1]) {
              const difference =
                filteredSortedData[1].total - filteredSortedData[0].total;
              text += `За прошедшие 3 часа количество аккаунтов ${
                difference === 0
                  ? "не изменилось"
                  : difference > 0
                  ? `уменьшилось на ${difference}`
                  : `увеличилось на ${difference}`
              }`;
            }
          }
        });
      } else {
        text += "⚠️Не удалось получить данные⚠️";
      }
      await bot.telegram.sendMessage(user.chatId, text);
    }
  }
};
module.exports = { funPayParser };
