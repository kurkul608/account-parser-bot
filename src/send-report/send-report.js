const AccountModel = require("../models/account.model");
const UserModel = require("../models/user.model");
const moment = require("moment");

const sendReport = async ({
  bot,
  startText,
  siteName,
  limit,
  searchWords,
  mode,
}) => {
  const users = await UserModel.find();
  for (const user of users) {
    if (user.sendInfo) {
      let text = startText;

      const accounts = await AccountModel.find({
        siteName,
        mode: mode,
      })
        .sort({ date: "desc" })
        .limit(limit);

      if (accounts && accounts.length) {
        searchWords.forEach((word) => {
          const filteredSortedData = accounts
            .filter((result) => result.name === word)
            .sort((a, b) => moment(a.date).unix() - moment(b.date).unix());
          if (filteredSortedData.length) {
            text += `\nНа ${moment(filteredSortedData[0].date).format(
              "YYYY MM DD HH:mm"
            )}. ✅ \nНа площадке продается ${
              filteredSortedData[0].total
            } аккаунтов ${
              filteredSortedData[0].name
            }. 👤\nМинимальная цена на аккаунт типа ${
              filteredSortedData[0].name
            } составляет ${
              filteredSortedData[0].lowestPrice
            } US$D. 💲\nНикнейм демпера: ${
              filteredSortedData[0].lowestUser.username.split("\n").length > 1
                ? filteredSortedData[0].lowestUser.username.split("\n")[1]
                : filteredSortedData[0].lowestUser.username.split("\n")
            }. 👤\nНазвание лота:  ${filteredSortedData[0].lowestTitle}.  \n`;

            if (filteredSortedData[1]) {
              const daysDiff = moment(filteredSortedData[1].date).diff(
                moment(filteredSortedData[0].date),
                "days"
              );
              const hoursDiff = moment(filteredSortedData[1].date).diff(
                moment(filteredSortedData[0].date),
                "hours"
              );
              const minutesDiff = moment(filteredSortedData[1].date).diff(
                moment(filteredSortedData[0].date),
                "minutes"
              );
              const secondsDiff = moment(filteredSortedData[1].date).diff(
                moment(filteredSortedData[0].date),
                "seconds"
              );
              const difference =
                filteredSortedData[1].total - filteredSortedData[0].total;
              text += `От предыдщего замера количество аккаунтов - ${
                difference === 0
                  ? "не изменилось"
                  : difference > 0
                  ? `уменьшилось на ${Math.abs(difference)}`
                  : `увеличилось на ${Math.abs(difference)}`
              }.\nПредыдщий замер был: ${
                daysDiff > 30 ? daysDiff % 30 : daysDiff
              } дней, ${hoursDiff > 24 ? hoursDiff % 24 : hoursDiff}  часов, ${
                minutesDiff > 60 ? minutesDiff % 60 : minutesDiff
              }  минут, ${
                secondsDiff > 60 ? secondsDiff % 60 : secondsDiff
              }  секунд назад.\n`;
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

module.exports = { sendReport };
