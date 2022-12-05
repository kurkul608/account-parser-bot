const jsdom = require("jsdom");
const AccountModel = require("../models/account.model");
const moment = require("moment/moment");
const { sendReport } = require("../send-report/send-report");
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
          siteName: "FunPay-overwatch-accounts",
          name: acc.key,
          total: acc.total,
          lowestPrice: acc.price,
          lowestDescription: acc.title || "",
          lowestTitle: acc.title || "",
          lowestUser: {
            username: acc.userName || "",
          },
        });
        await account.save();
      }
    });
  await sendReport({
    bot,
    startText: "❗Данные по FunPay❗\n",
    siteName: "FunPay-overwatch-accounts",
    limit: searchWords.length * 2,
    searchWords: searchWords,
  });
};
module.exports = { funPayParser };
