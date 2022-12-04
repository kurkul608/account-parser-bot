const moment = require("moment");
const UserModel = require("./models/user.model");
const AccountModel = require("./models/account.model");

// const data = [];
const requestsEldorado = [
  {
    name: "bronze",
    url: "https://www.eldorado.gg/api/flexibleOffers/?pageSize=24&pageIndex=1&itemTreeId=112-1-0&offerType=Account&searchQuery=bronze&offerSortingCriterion=Price&isAscending=true",
  },
  {
    name: "silver",
    url: "https://www.eldorado.gg/api/flexibleOffers/?pageSize=24&pageIndex=1&itemTreeId=112-1-0&offerType=Account&searchQuery=silver&offerSortingCriterion=Price&isAscending=true",
  },
  {
    name: "gold",
    url: "https://www.eldorado.gg/api/flexibleOffers/?pageSize=24&pageIndex=1&itemTreeId=112-1-0&offerType=Account&searchQuery=gold&offerSortingCriterion=Price&isAscending=true",
  },
  {
    name: "diamond",
    url: "https://www.eldorado.gg/api/flexibleOffers/?pageSize=24&pageIndex=1&itemTreeId=112-1-0&offerType=Account&searchQuery=diamond&offerSortingCriterion=Price&isAscending=true",
  },
  {
    name: "master",
    url: "https://www.eldorado.gg/api/flexibleOffers/?pageSize=24&pageIndex=1&itemTreeId=112-1-0&offerType=Account&searchQuery=master&offerSortingCriterion=Price&isAscending=true",
  },
  {
    name: "grandmaster",
    url: "https://www.eldorado.gg/api/flexibleOffers/?pageSize=24&pageIndex=1&itemTreeId=112-1-0&offerType=Account&searchQuery=grandmaster&offerSortingCriterion=Price&isAscending=true",
  },
  {
    name: "top 500",
    url: "https://www.eldorado.gg/api/flexibleOffers/?pageSize=24&pageIndex=1&itemTreeId=112-1-0&offerType=Account&searchQuery=top%20500&offerSortingCriterion=Price&isAscending=true",
  },
];

const eldoradoFunction = async (bot) => {
  for (const requestData of requestsEldorado) {
    await fetch(requestData.url)
      .then((response) => response.json())
      .then(async (json) => {
        const results = json.results;
        const account = await new AccountModel({
          date: moment().format(),
          siteName: "Eldorado",
          name: requestData.name,
          total: json.recordCount,
          lowestPrice: (
            results[0] || {
              offer: {
                pricePerUnit: {
                  amount: 0,
                },
              },
            }
          ).offer.pricePerUnit.amount,
          lowestDescription: (
            results[0] || {
              offer: {
                description: "Не найдено ни одного аккаунта",
              },
            }
          ).offer.description,
          lowestTitle: (
            results[0] || {
              offer: {
                offerTitle: "Не найдено ни одного аккаунта",
              },
            }
          ).offer.offerTitle,
          lowestUser: (results[0] || { user: undefined }).user,
        });
        await account.save();
      });
  }
  const users = await UserModel.find();
  for (const user of users) {
    if (user.sendInfo) {
      await bot.telegram.sendMessage(
        user.chatId,
        "Анализ был успешно произведен"
      );

      let text = "❗Данные по Eldorado❗\n";

      const eldoradoData = await AccountModel.find({
        siteName: "Eldorado",
      })
        .sort({ date: "desc" })
        .limit(requestsEldorado.length * 2);

      if (eldoradoData && eldoradoData.length) {
        requestsEldorado.forEach((req) => {
          const filteredSortedData = eldoradoData
            .filter((result) => result.name === req.name)
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

module.exports = { eldoradoFunction, requestsEldorado };
