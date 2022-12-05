const moment = require("moment");
const AccountModel = require("../models/account.model");
const { sendReport } = require("../send-report/send-report");

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

const eldoradoFunction = async (bot, mode) => {
  for (const requestData of requestsEldorado) {
    await fetch(requestData.url)
      .then((response) => response.json())
      .then(async (json) => {
        const results = json.results;
        const account = await new AccountModel({
          date: moment().format(),
          siteName: "Eldorado-overwatch-accounts",
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
          lowestDescription:
            (
              results[0] || {
                offer: {
                  description: "Не найдено ни одного аккаунта",
                },
              }
            ).offer.description || "no description",
          lowestTitle:
            (
              results[0] || {
                offer: {
                  offerTitle: "Не найдено ни одного аккаунта",
                },
              }
            ).offer.offerTitle || "no title",
          lowestUser: (results[0] || { user: undefined }).user,
          mode,
        });
        await account.save();
      });
  }
  await sendReport({
    bot,
    startText: "❗Данные по Eldorado❗\n",
    siteName: "Eldorado-overwatch-accounts",
    limit: requestsEldorado.length * 2,
    searchWords: requestsEldorado.map((req) => req.name),
    mode,
  });
};

module.exports = { eldoradoFunction, requestsEldorado };
