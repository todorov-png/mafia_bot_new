'use strict';
import dotenv from 'dotenv';
import Extra from 'telegraf/extra.js';
import fs from 'fs';
import path from 'path';
import * as dq from './database-queries.js';
import * as game from './game.js';
import * as app from './app.js';
import { readdirAsync, statAsync, unlinkAsync } from './helpers.js';
dotenv.config();

//Проверка разрешений бота в чате
export async function checkBotAdmin(ChatID) {
    let status = false;
    const data = await app.bot.telegram.getChatAdministrators(ChatID);
    for (const item of data) {
        if (item.user.id == process.env.BOT_ID && item.can_delete_messages) {
            status = true;
            break;
        }
    }
    return status;
}

//Проверка началась ли игра
export async function checkStartGame(ChatID) {
    let check = true;
    const data = await dq.getDataDeleteMessageRegistration(ChatID);
    if (data === null || data.messageID === 0) {
        check = false;
    }
    return check;
}

//Записываем пользователя на игру и сохраняем его в чате
export async function registrationUserInGame(ctx, chatID) {
    const users = await dq.getDataRegistrationUserInGame(chatID);
    if (users === null) {
        ctx.reply('Чат игры не найден, попробуйте еще', Extra.inReplyTo(ctx.message.message_id));
    } else {
        if (checkUserInBD(users.listOfUser, ctx.message.from.id)) {
            await dq.updateNameUser(
                chatID,
                ctx.message.from.id,
                fillingUserName(ctx.message.from),
                ctx.message.from.username
            );
        } else {
            await dq.updateDataAddUserInChatBD(
                chatID,
                ctx.message.from.id,
                fillingUserName(ctx.message.from),
                ctx.message.from.username
            );
        }
        if (users.dataGame.counterDays === 0) {
            if (users.players.length > 30) {
                ctx.reply('Вы опоздали на регистрацию, я уже набрал максимальное количество участников!');
            } else {
                if (checkUserInBD(users.players, ctx.message.from.id)) {
                    ctx.reply('Ты уже играешь в ' + users.title, Extra.inReplyTo(ctx.message.message_id));
                } else {
                    await dq.updateDataRegistrationUserInGame(
                        chatID,
                        ctx.message.from.id,
                        fillingUserName(ctx.message.from),
                        ctx.message.from.username
                    );
                    ctx.reply('Ты присоединился к игре в ' + users.title, Extra.inReplyTo(ctx.message.message_id));
                    await game.updateMessageRegistration(chatID);
                }
            }
        } else {
            ctx.reply('Вы опоздали на регистрацию, игра уже началась!');
        }
    }
}

//Проверка вступившего пользователя на наличие в БД и добавление его, если его там нет
export async function checkingLoggedUser(chatID, newChatMembers) {
    const users = await dq.getDataCheckingLoggedUser(chatID);
    if (users !== null) {
        for (const userChat of newChatMembers) {
            if (!userChat.is_bot) {
                let addTtriger = true;
                for (const user of users.listOfUser) {
                    if (user.userID === userChat.id) {
                        addTtriger = false;
                        break;
                    }
                }
                if (addTtriger) {
                    app.loggerGlobal.info(`В чате id=${chatID} добавился пользователь ${userChat.id}`);
                    await dq.updateDataAddUserInChatBD(
                        chatID,
                        userChat.id,
                        fillingUserName(userChat),
                        userChat.username
                    );
                    break;
                }
            }
        }
    }
}

//Удаляем юзера или чат из базы при выходе из чата
export async function leftUserOrChat(chatID, leftChatMember) {
    if (!leftChatMember.is_bot) {
        const users = await dq.getDataleftUserOrChat(chatID);
        if (users !== null) {
            for (const user of users.listOfUser) {
                if (user.userID === leftChatMember.id) {
                    app.loggerGlobal.info(`В чате id=${chatID} удалился пользователь ${user.userID}`);
                    await dq.updateDataLeftUserOrChat(chatID, leftChatMember.id);
                    break;
                }
            }
        }
    } else if (leftChatMember.id == process.env.BOT_ID) {
        app.loggerGlobal.info(`В чате id=${chatID} удалили бота`);
        await dq.deleteDataLeftUserOrChat(chatID);
    }
}

//Вызов участников для участия в игре
export async function callUsers(ctx) {
    if (checkTypeChat(ctx.message.chat.type)) {
        let usersName = '';
        const users = await dq.getDataCallUsers(ctx.message.chat.id);
        if (users !== null && users.listOfUser.length > 0) {
            users.listOfUser.forEach((item, i) => {
                usersName += `\n${i + 1}) <a href="tg://user?id=${item.userID}">${item.name}</a>`;
            });
            ctx.replyWithHTML('Призываю в игру: ' + usersName);
        } else {
            ctx.reply('Я пока никого из вас не знаю, поиграйте и тогда поговорим😉');
        }
    } else {
        ctx.reply('Эту команду необходимо отправлять в групповом чате!');
    }
}

//Проверка типа группы откуда пришла команда
export function checkTypeChat(chatType) {
    if (chatType === 'group' || chatType === 'supergroup') {
        return true;
    } else {
        return false;
    }
}

//Выход бота из чата
export function leaveChat(chatID) {
    app.bot.telegram.leaveChat(chatID);
}

//Делаем запись чата или обновление его данных
export async function updateOrAddChatInBD(chatID, title) {
    await dq.updateDataUpdateOrAddChatInBD(chatID, title);
}

//Обновляем заголовок чата
export async function autoUpdateTitleChat(chatID, title) {
    await dq.updateDataAutoUpdateTitleChat(chatID, title);
}

//Обновляем ID чата
export async function autoUpdateIDChat(chatID, newChatID) {
    await dq.updateDataAutoUpdateIDChat(chatID, newChatID);
}

//Статистика пользователя
export async function getInfoUser(chatID, userID) {
    const data = await dq.getDataUsers(chatID);
    if (data !== null) {
        for (const user of data.listOfUser) {
            if (user.userID === userID) {
                const textMessage =
                    `${user.name}, ваша статистика в чате ${data.title}:\n` +
                    `- сыграно игр: ${user.gameCounter};\n` +
                    `- побед: ${user.victories};\n` +
                    `- побед мирным жителем: ${user.worldVictories};\n` +
                    `- побед мафией: ${user.mafiaVictories};\n` +
                    `- побед триадой: ${user.triadaVictories};\n` +
                    `- баланс: ${user.money} монет.`;
                await app.bot.telegram.sendMessage(chatID, textMessage);
                break;
            }
        }
    } else {
        await app.bot.telegram.sendMessage(chatID, 'Я вас не знаю, поиграйте, потом и поговорим😉');
    }
}

//Статистика чата
export async function getInfoChat(chatID) {
    const data = await dq.getDataStatisticsGameInChat(chatID);
    if (data !== null) {
        const textMessage =
            `Статистика чата ${data.title}:\n` +
            `- проведено игр: ${data.statisticsGameInChat.gameCounter};\n` +
            `- побед мирных жителей: ${data.statisticsGameInChat.peacefulVictories};\n` +
            `- побед мафий: ${data.statisticsGameInChat.mafiaVictories};\n` +
            `- побед триады: ${data.statisticsGameInChat.triadaVictories};\n` +
            `- знаю ${data.statisticsGameInChat.knowUsers} участников в чате;`;
        await app.bot.telegram.sendMessage(chatID, textMessage);
    } else {
        await app.bot.telegram.sendMessage(chatID, 'Я не знаю ваш чат, поиграйте, потом и поговорим😉');
    }
}

//Топ победителей в чате
export async function topChat(chatID, text, field) {
    const data = await dq.getDataUsers(chatID);
    if (data !== null) {
        let textMessage = `Топ ${text} в чате ${data.title}`;
        let users = data.listOfUser.filter(user => user[field] > 0);
        users.sort(byField(field));
        if (users.length > 0) {
            textMessage += ':';
            users.forEach((user, i) => {
                textMessage += `\n${i + 1}) ${user.name} - ${user[field]};`;
            });
        } else {
            textMessage += ` не найден!`;
        }
        await app.bot.telegram.sendMessage(chatID, textMessage.substr(0, 3900));
    } else {
        await app.bot.telegram.sendMessage(chatID, 'Я не знаю ваш чат, поиграйте, потом и поговорим😉');
    }
}

//Сохраняем все медиа в базу
export async function writeMediaMongoBD() {
    if (fs.existsSync('./media')) {
        const fileNameArray = fs.readdirSync(`./media`);
        if (fileNameArray.length) {
            for (const item of fileNameArray) {
                const itemNameArray = item.split('.');
                itemNameArray.pop();
                const name = itemNameArray.join('.');
                const pathFile = path.resolve(`./media/${item}`);
                const buf = fs.readFileSync(pathFile);
                const dataMessage = await app.bot.telegram.sendAnimation(
                    process.env.CREATOR_ID,
                    { source: path.resolve(`./media/${item}`) },
                    { caption: `Сохраняю файл ${name} в бд` }
                );
                const fileId = dataMessage.animation.file_id;
                await dq.setMedia({ fileName: name, fileId: fileId, data: buf });
            }
        }
    } else {
        await app.bot.telegram.sendMessage(process.env.CREATOR_ID, `Папка media не была найдена!`);
    }
}

//Закрываем все активные игры
export async function completionOfActiveGames() {
    const chatIdArray = await dq.getChatIdActiveGame();
    if (chatIdArray.length) {
        for (const item of chatIdArray) {
            try {
                app.bot.telegram.deleteMessage(item.chatID, item.messageID);
            } finally {
                try {
                    app.bot.telegram.sendMessage(item.chatID, `Смотритель вернулся в город, приятной игры 😉`);
                } finally {
                    dq.updateDataClearDataGame(item.chatID);
                }
            }
        }
    }
}

//Получение логов игр
export async function getLogsGame() {
    try {
        fs.existsSync(`./logs`) || fs.mkdirSync(`./logs`);
        const chatIdArray = await dq.getChatIdCompletedGame();
        if (chatIdArray.length) {
            let checkFile = true;
            const files = await readdirAsync('./logs/');
            for (const file of files) {
                if (
                    file !== 'bot.log' &&
                    file !== 'error.log' &&
                    chatIdArray.some(item => item.chatID == file.replace(/\d*game|.log/g, ''))
                ) {
                    const pathFile = path.resolve(`./logs/${file}`);
                    const stats = await statAsync(pathFile);
                    if (stats.size) {
                        checkFile = false;
                        app.bot.telegram.sendDocument(process.env.CREATOR_ID, { source: pathFile });
                    }
                    //await unlinkAsync(pathFile);
                }
            }
            if (checkFile) {
                app.bot.telegram.sendMessage(process.env.CREATOR_ID, `Нет файлов логов!`);
            }
        } else {
            app.bot.telegram.sendMessage(process.env.CREATOR_ID, `Нет завершенных игр для отправки логов!`);
        }
    } catch (e) {
        app.loggerGlobal.error(e.stack);
        app.bot.telegram.sendMessage(process.env.CREATOR_ID, `Логи не удалось получить`);
    }
}

//Получение логов бота
export async function getLogsBot() {
    try {
        fs.existsSync(`./logs`) || fs.mkdirSync(`./logs`);
        const pathFiles = path.resolve(`./logs`);
        const statsBot = await statAsync(`${pathFiles}/bot.log`);
        const statsError = await statAsync(`${pathFiles}/error.log`);
        let checkLog = true;
        if (statsBot.size) {
            app.bot.telegram.sendDocument(process.env.CREATOR_ID, { source: `${pathFiles}/bot.log` });
            checkLog = false;
        }
        if (statsError.size) {
            app.bot.telegram.sendDocument(process.env.CREATOR_ID, { source: `${pathFiles}/error.log` });
            checkLog = false;
        }
        if (checkLog) {
            app.bot.telegram.sendMessage(process.env.CREATOR_ID, `Логов не найдено!`);
        }
    } catch (e) {
        app.loggerGlobal.error(e.stack);
        app.bot.telegram.sendMessage(process.env.CREATOR_ID, `Логи не удалось получить`);
    }
}

//Получение рандомного числа в диапазоне
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function byField(field) {
    return (a, b) => (a[field] < b[field] ? 1 : -1);
}

//Обьединяем имя и фамилию
function fillingUserName(from) {
    let nameUser = from.first_name;
    if (from.last_name !== undefined) {
        nameUser += ' ' + from.last_name;
    }
    return nameUser;
}

//Проверяем есть ли этот пользователь в массиве
function checkUserInBD(array, checkUserId) {
    let checkAddUser = false;
    for (const user of array) {
        if (user.userID === checkUserId) {
            checkAddUser = true;
            break;
        }
    }
    return checkAddUser;
}

//Перемешиваем массив с ролями
export function mixingMas(arr) {
    let tmp, randindex;
    const length = arr.length;
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < length; i++) {
            randindex = getRandomInt(0, length);
            tmp = arr[i];
            arr[i] = arr[randindex];
            arr[randindex] = tmp;
        }
    }
    return arr;
}
