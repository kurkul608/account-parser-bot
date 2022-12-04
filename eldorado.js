const moment = require("moment");
const UserModel = require("./models/user.model");

const data = [];
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
      .then((json) => {
        const results = json.results;
        data.push({
          date: moment(),
          results,
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
      const eldoradoData = data.filter(
        (result) => result.siteName === "Eldorado"
      );
      if (eldoradoData.length) {
        requestsEldorado.forEach((req) => {
          const filteredSortedData = eldoradoData
            .filter((result) => result.name === req.name)
            .sort((a, b) => a.date.unix() - b.date.unix());
          if (filteredSortedData.length) {
            text += `\nНа ${filteredSortedData[0].date.format(
              "YYYY MM DD hh:mm"
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
              text += `За 3 часа количество аккаунтов ${
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

module.exports = { eldoradoFunction, requestsEldorado, data };
