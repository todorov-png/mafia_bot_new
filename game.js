'use strict';
import path from 'path';
import fs from 'fs';
import winston from 'winston';
import * as keyboards from './keyboards.js';
import * as app from './app.js';
import * as dq from './database-queries.js';
import * as functions from './functions.js';
import * as processing from './processing.js';
import { mediaVar } from './variables.js';

//Запуск регистрации и игры
export async function launch(ChatID) {
    fs.existsSync(`./logs`) || fs.mkdirSync(`./logs`); //Создаем папку для логов, если ее нет
    await dq.updateDataClearDataGame(ChatID);
    await registration(ChatID); //Зарегистрировали игроков
    await dq.updateDataStartGame(ChatID, Date.now()); //Закрыли регистрацию и записали время начала игры
    const data = await dq.getDataGame(ChatID); //Получаем записавшихся человек
    const statistics = await dq.getDataStatisticsGameInChat(ChatID); //Получаю статистику игр в чате
    const loggerGame = winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.json(), winston.format.ms(), winston.format.prettyPrint()),
        transports: [
            new winston.transports.File({
                filename: `logs/${statistics.statisticsGameInChat.gameCounter}game${ChatID}.log`,
                level: 'info',
            }),
        ],
    });
    if (data.dataGame.counterPlayers > 3) {
        loggerGame.info(`Игра начинается!`);
        await app.bot.telegram.sendMessage(ChatID, 'Игра начинается!');
        const masRoles = await creatingRoles(ChatID, data.dataGame.counterPlayers, loggerGame); //Получаем массив ролей
        await distributionOfRoles(ChatID, masRoles, data.players, loggerGame); //Раздаю роли игрокам
        await sendRoleMessage(ChatID, loggerGame); //Отправляем сообщение с ролью и описанием
        let continueGame = true;
        while (continueGame) {
            const data = await dq.getDataGame(ChatID);
            loggerGame.info(`Происходит смена суток`);
            loggerGame.info(data);
            console.log(`Происходит смена суток`, data.dataGame.statysDay, continueGame);
            if (data.dataGame.statysDay) {
                await day(ChatID, data, loggerGame); //Наступает день
            } else {
                await night(ChatID, data, loggerGame); //Наступает ночь
            }
            continueGame = await checkingContinueGame(ChatID); //Проверяем нужно ли продолжить игру
        }
    } else {
        //Отправляем сообщение что недостаточно игроков и очищаем данные
        loggerGame.info(`Недостаточно игроков, игра отменена!`);
        const dataMessageID = await dq.getDataDeleteMessageRegistration(ChatID);
        if (dataMessageID.messageID != 0) {
            await app.bot.telegram.sendMessage(ChatID, 'Недостаточно игроков, игра отменена!');
        }
    }
    loggerGame.info(`Очищаем данные игры`);
    await dq.updateDataClearDataGame(ChatID);
}

//Редактируем сообщение регистрации
export async function updateMessageRegistration(chatID) {
    const data = await dq.getDataUpdateMessageRegistration(chatID);
    let textMessage =
        `Игра начнётся через ${data.registrationTimeLeft} секунд! \nСписок участников:` +
        (await getLifeUsersText(chatID));
    try {
        app.bot.telegram.editMessageText(chatID, data.messageID, null, textMessage, {
            parse_mode: 'HTML',
            reply_markup: keyboards.userRegistrationBtn(process.env.URL_BOT, chatID),
        });
    } catch (e) {
        console.log('Редактируем сообщение регистрации', e);
    }
}

//Очищаем данные игры и останавливаем игру
export async function clearDataGame(chatID) {
    const dataMessageID = await dq.getDataDeleteMessageRegistration(chatID);
    try {
        if (dataMessageID.messageID != 0) {
            await app.bot.telegram.deleteMessage(chatID, dataMessageID.messageID);
        }
    } finally {
        await dq.updateDataClearDataGame(chatID);
        try {
            await app.bot.telegram.sendMessage(chatID, 'Игра остановлена!');
        } finally {
        }
    }
}

//Закрытие чата для всех кто не живой
export async function closeWriteChat(ctx) {
    const data = await dq.getDataCloseWriteChat(ctx.message.chat.id);
    if (data !== null && data.dataGame.counterDays !== 0) {
        if (ctx.message.document === undefined || ctx.message.photo === undefined) {
            if (data.dataGame.statysDay) {
                let DeleteMessage = true;
                for (const item of data.players) {
                    if (item.userID === ctx.message.from.id && (item.lifeStatus || item.dyingMessage)) {
                        DeleteMessage = false;
                        if (item.dyingMessage) {
                            await dq.updateDyingMessage(ctx.message.chat.id, ctx.message.from.id);
                        }
                        break;
                    }
                }
                if (DeleteMessage) {
                    try {
                        ctx.deleteMessage();
                    } finally {
                    }
                }
            } else {
                try {
                    ctx.deleteMessage();
                } finally {
                }
            }
        } else {
            try {
                ctx.deleteMessage();
            } finally {
            }
        }
    }
}

//Создаем массив с ролями и записываем в бд сколько у нас из какого клана
async function creatingRoles(chatID, counter, loggerGame) {
    loggerGame.info(`Создаем массив с ролями и записываем в бд сколько у нас из какого клана`);
    let masRoles,
        counterWorld = 0,
        counterMafia = 2,
        counterTriada = 0;
    if (counter < 5) {
        masRoles = ['Дон', 'Доктор', 'Счастливчик']; //2
        counterWorld = 2;
        counterMafia = 1;
    } else if (counter < 7) {
        masRoles = ['Дон', 'Доктор', 'Комиссар', 'Счастливчик']; //2
        counterWorld = 3;
    } else if (counter < 9) {
        masRoles = ['Дон', 'Крёстный отец', 'Доктор', 'Комиссар', 'Счастливчик', 'Камикадзе']; //3
        counterWorld = 4;
    } else if (counter < 10) {
        masRoles = [
            'Дон',
            'Крёстный отец',
            'Доктор',
            'Комиссар',
            'Счастливчик',
            'Камикадзе',
            'Телохранитель',
            'Мститель',
        ]; //2
        counterWorld = 6;
    } else if (counter < 11) {
        masRoles = [
            'Дон',
            'Крёстный отец',
            'Доктор',
            'Комиссар',
            'Счастливчик',
            'Камикадзе',
            'Телохранитель',
            'Мститель',
            'Красотка',
        ]; //2
        counterWorld = 7;
    } else if (counter < 13) {
        masRoles = [
            'Дон',
            'Крёстный отец',
            'Доктор',
            'Комиссар',
            'Лейтенант',
            'Счастливчик',
            'Камикадзе',
            'Телохранитель',
            'Мститель',
            'Красотка',
        ]; //3
        counterWorld = 8;
    } else if (counter < 15) {
        masRoles = [
            'Дон',
            'Крёстный отец',
            'Доктор',
            'Комиссар',
            'Лейтенант',
            'Счастливчик',
            'Камикадзе',
            'Телохранитель',
            'Мститель',
            'Красотка',
            'Триада',
        ]; //4
        counterWorld = 8;
        counterTriada = 1;
    } else {
        masRoles = [
            'Дон',
            'Крёстный отец',
            'Доктор',
            'Комиссар',
            'Лейтенант',
            'Счастливчик',
            'Камикадзе',
            'Телохранитель',
            'Мститель',
            'Красотка',
            'Триада',
            'Сенсей',
        ]; //7
        counterWorld = 8;
        counterTriada = 2;
    }
    const WorldPlayer = counter - masRoles.length;
    if (WorldPlayer != 0) {
        for (let i = 0; i < WorldPlayer; i++) {
            masRoles.push('Мирный житель');
            counterWorld += 1;
        }
    }
    loggerGame.info(masRoles);
    await dq.updateCounterRolesGame(chatID, counterWorld, counterMafia, counterTriada);
    return functions.mixingMas(masRoles);
}

//Присваиваем роли игрокам
async function distributionOfRoles(ChatID, masRoles, masPlayers, loggerGame) {
    loggerGame.info(`Присваиваем роли игрокам`);
    for (let i = 0; i < masPlayers.length; i++) {
        let allies = 0;
        if (masRoles[i] == 'Комиссар' || masRoles[i] == 'Лейтенант') {
            allies = 1;
        } else if (masRoles[i] == 'Дон' || masRoles[i] == 'Крёстный отец') {
            allies = 2;
        } else if (masRoles[i] == 'Триада' || masRoles[i] == 'Сенсей') {
            allies = 3;
        }
        await dq.addRolePlayer(ChatID, masPlayers[i].userID, masRoles[i], allies);
    }
}

//Наступление ночи
async function night(ChatID, data, loggerGame) {
    loggerGame.info(`Наступление ночи`);
    loggerGame.info(data);
    await dq.clearCounterActiveRoles(ChatID); //Очищаем счетчик активных ролей
    await sendNightMessage(ChatID, loggerGame); //Отправили гифку с наступлением ночи
    await sendNightMessageLivePlayers(ChatID, loggerGame); //Отправляем сообщение с живыми игроками
    await sendNightMessageActionsLivePlayers(ChatID, data, loggerGame); //Отправляем сообщение с кнопками для действий
    for (let i = 0; i < 12; i++) {
        //Ждем минуту или пока все активные роли не проголосуют
        await delay(5000);
        const data = await dq.getDataCounterActiveRoles(ChatID);
        if (data.dataGame.counterActiveRoles === 0) {
            break;
        }
    }
    const newData = await dq.getDataGame(ChatID);
    //Обрабатываем результаты ночи и перезаписываем данные
    const { cloneData, trigerAction, messageActions } = await processing.processingResultsNight(newData, ChatID);
    if (trigerAction === 0) {
        await dq.updateDataInactivePlay(ChatID); //не было действий
    } else {
        for (const message of messageActions) {
            await app.bot.telegram.sendMessage(message.userID, message.text);
        }
        await dq.updateDataGame(ChatID, cloneData.dataGame, cloneData.players); //Перезаписываем данные игры
    }
    await dq.updateStatusDay(ChatID, true);
}

//Наступление дня
async function day(ChatID, data, loggerGame) {
    loggerGame.info(`Наступление дня`);
    loggerGame.info(data);
    const i = data.dataGame.counterDays / 2;
    await deleteMessageAct(data.players, ChatID, loggerGame); //Удаляем сообщения на которые пользователь не нажимал ночью
    await sendSunMessage(ChatID, i, loggerGame); //Отправили гифку с наступлением дня
    await sendDayMessageLivePlayers(ChatID, data, loggerGame); //Отправляем сообщение с живыми игроками
    await delay(45000); //Ждем 45 секунд
    await sendMessageVote(ChatID, data.players, loggerGame); //Отправляем голосовалку
    await delay(45000); // Ждем 45 секунд
    await ProcessingResultsDay(ChatID, loggerGame);
    await dq.updateStatusDay(ChatID, false);
}

//Отправляем сообщение с дневным голосованием
async function sendMessageVote(ChatID, players, loggerGame) {
    loggerGame.info(`Отправляем сообщение с дневным голосованием`);
    loggerGame.info(players);
    await app.bot.telegram.sendMessage(ChatID, `Пришло время искать виноватых!`, {
        parse_mode: 'HTML',
        reply_markup: keyboards.voteDay(process.env.URL_BOT),
    });
    for (const player of players) {
        if (player.lifeStatus && player.votes) {
            const messageData = await app.bot.telegram.sendMessage(player.userID, 'Кого ты хочешь линчевать?', {
                parse_mode: 'HTML',
                reply_markup: keyboards.buttonActionsDay(ChatID, players, player.userID),
            });
            await dq.updateMessageIDPlayer(ChatID, messageData.message_id, player.userID);
        }
    }
}

//Удаляем сообщения если пользователь не выбрал действие
async function deleteMessageAct(players, ChatID, loggerGame) {
    loggerGame.info(`Удаляем сообщения если пользователи не выбрал действие`);
    loggerGame.info(players);
    for (const player of players) {
        try {
            if (player.messageID != 0) {
                await app.bot.telegram.deleteMessage(player.userID, player.messageID);
            }
        } finally {
            await dq.clearMessageIDPlayers(ChatID, player.userID);
        }
    }
}

//Отправляем сообщение в чат о том что игрок сделал ход
async function sendMessageAboutProgressRole(ChatID, userID, actUserID) {
    const user = await dq.getInfoPlayer(ChatID, userID),
        userAct = await dq.getInfoPlayer(ChatID, actUserID);
    let textMessage = '',
        textMessageUser = '';
    switch (user.players[0].role) {
        case 'Дон':
            textMessage = '🤵🏻 <b>Мафия</b> выбрала жертву...';
            textMessageUser = `Ты ушёл стрелять в <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            break;
        case 'Крёстный отец':
            textMessage = '🤵🏼 <b>Крёстный отец</b> похитил игрока...';
            textMessageUser = `Ты похитил и заставил молчать <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            break;
        case 'Доктор':
            textMessage = '👨🏼‍⚕️ <b>Доктор</b> вышел на ночное дежурство...';
            textMessageUser = `Ты ушёл лечить <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            break;
        case 'Комиссар':
            if (user.players[0].copCheck) {
                textMessage = '🕵🏼️‍♂️ <b>Комиссар</b> ушёл искать злодеев...';
                textMessageUser = `Ты ушёл проверять <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            } else {
                textMessage = '🕵🏼️‍♂️ <b>Комиссар</b> зарядил свой пистолет и готов сделать выстрел...';
                textMessageUser = `Ты ушёл мочить <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            }
            break;
        case 'Телохранитель':
            textMessage = '👥 <b>Телохранитель</b> ушёл рисковать жизнью...';
            textMessageUser = `Ты ушёл защищать <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            break;
        case 'Мститель':
            textMessage = '🔪 <b>Мститель</b> ушёл в подворотни...';
            textMessageUser = `Ты ушёл стрелять в <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            break;
        case 'Красотка':
            textMessage = '💃🏻 <b>Красотка</b> подарила незабываемую ночь...';
            textMessageUser = `Ты ушла радовать <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            break;
        case 'Триада':
            textMessage = '👳🏻‍♂️ <b>Триада</b> сделала свой выстрел...';
            textMessageUser = `Ты ушёл стрелять в <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            break;
        case 'Сенсей':
            textMessage = '🧘🏻 <b>Сенсей</b> ушёл проверять...';
            textMessageUser = `Ты ушёл проверять <a href="tg://user?id=${userAct.players[0].userID}">${userAct.players[0].name}</a>`;
            break;
    }
    if (textMessage !== '') {
        app.bot.telegram.sendMessage(ChatID, textMessage, { parse_mode: 'HTML' });
        app.bot.telegram.sendMessage(userID, textMessageUser, { parse_mode: 'HTML' });
    }
}

//Отправляем сообщение кто за кого голосовал
async function sendMessageVoiceUserInChat(ChatID, userID, userIDAct) {
    const user = await dq.getInfoPlayer(ChatID, userID),
        userAct = await dq.getInfoPlayer(ChatID, userIDAct);
    app.bot.telegram.sendMessage(
        ChatID,
        `<a href="tg://user?id=${userID}">${user.players[0].name}</a> ` +
            `проголосовал за <a href="tg://user?id=${userIDAct}">${userAct.players[0].name}</a>`,
        { parse_mode: 'HTML' }
    );
}

//Проверяем нужно ли продолжить игру
async function checkingContinueGame(ChatID) {
    let data = await dq.getDataGame(ChatID);
    let { continueGame, win } = processing.checkingTheEndOfTheGame(data.dataGame);
    if (!continueGame) {
        sendMessageGameEnd(ChatID, win, data.players, data.dataGame.timeStart);
    }
    return continueGame;
}

async function sendMessageGameEnd(ChatID, win, players, timeStart) {
    let textMessage = `<b>Игра окончена!</b>\nПобедил`;
    let textEndMessage = ``;
    switch (win) {
        case 1:
            textMessage += `и: Мирные жители\n\nПобедители:`;
            for (const player of players) {
                if (player.lifeStatus || player.suicide) {
                    textMessage += `\n  <a href="tg://user?id=${player.userID}">${player.name}</a> - <b>${player.initialRole}</b>`;
                    await dq.addWorldVictoryPlayer(ChatID, player.userID);
                } else if (player.suicide) {
                    textMessage += `\n  <a href="tg://user?id=${player.userID}">${player.name}</a> - <b>${player.initialRole}</b>`;
                    await dq.addWorldVictoryPlayer(ChatID, player.userID);
                } else {
                    textEndMessage += `\n  <a href="tg://user?id=${player.userID}">${player.name}</a> - <b>${player.initialRole}</b>`;
                    await dq.addCounterGamePlayer(ChatID, player.userID);
                }
            }
            await dq.addWorldVictoryChat(ChatID);
            textMessage +=
                `\n\nОстальные участники:` + textEndMessage + `\n\nИгра длилась: ` + convertTimeToText(timeStart);
            break;
        case 2:
            textMessage += `а: Мафия\n\nПобедители:`;
            for (const player of players) {
                if (player.lifeStatus && (player.initialRole == 'Дон' || player.initialRole == 'Крёстный отец')) {
                    textMessage += `\n  <a href="tg://user?id=${player.userID}">${player.name}</a> - <b>${player.initialRole}</b>`;
                    await dq.addMafiaVictoryPlayer(ChatID, player.userID);
                } else if (player.suicide) {
                    textMessage += `\n  <a href="tg://user?id=${player.userID}">${player.name}</a> - <b>${player.initialRole}</b>`;
                    await dq.addWorldVictoryPlayer(ChatID, player.userID);
                } else {
                    textEndMessage += `\n  <a href="tg://user?id=${player.userID}">${player.name}</a> - <b>${player.initialRole}</b>`;
                    await dq.addCounterGamePlayer(ChatID, player.userID);
                }
            }
            await dq.addMafiaVictoryChat(ChatID);
            textMessage +=
                `\n\nОстальные участники:` + textEndMessage + `\n\nИгра длилась: ` + convertTimeToText(timeStart);
            break;
        case 3:
            textMessage += `а: Триада\n\nПобедители:`;
            for (const player of players) {
                if (player.lifeStatus && (player.initialRole == 'Триада' || player.initialRole == 'Сенсей')) {
                    textMessage += `\n  <a href="tg://user?id=${player.userID}">${player.name}</a> - <b>${player.initialRole}</b>`;
                    await dq.addTriadaVictoryPlayer(ChatID, player.userID);
                } else if (player.suicide) {
                    textMessage += `\n  <a href="tg://user?id=${player.userID}">${player.name}</a> - <b>${player.initialRole}</b>`;
                    await dq.addWorldVictoryPlayer(ChatID, player.userID);
                } else {
                    textEndMessage += `\n  <a href="tg://user?id=${player.userID}">${player.name}</a> - <b>${player.initialRole}</b>`;
                    await dq.addCounterGamePlayer(ChatID, player.userID);
                }
            }
            await dq.addTriadaVictoryChat(ChatID);
            textMessage +=
                `\n\nОстальные участники:` + textEndMessage + `\n\nИгра длилась: ` + convertTimeToText(timeStart);
            break;
        case 4:
            textMessage = 'Все игроки умерли - победителя нет!';
            break;
        case 5:
            textMessage = 'Давно не было активности, игра завершена!';
            break;
    }
    if (win) {
        await app.bot.telegram.sendMessage(ChatID, textMessage, {
            parse_mode: 'HTML',
            reply_markup: keyboards.newGame(),
        });
    }
}

//Отправляем гифку сначалом ночи
async function sendNightMessage(ChatID, loggerGame) {
    loggerGame.info('Отправляем гифку сначалом ночи');
    try {
        await app.bot.telegram.sendAnimation(ChatID, mediaVar.sunset, {
            parse_mode: 'HTML',
            caption:
                '🌃 <b>Наступает ночь</b>\nНа улицы города выходят лишь самые отважные и бесстрашные. Утром попробуем сосчитать их головы...',
            reply_markup: keyboards.goToBot(process.env.URL_BOT),
        });
    } catch (e) {
        app.loggerGlobal.error(e.stack);
        if (!fs.existsSync(`./media/sunset.mp4`)) {
            fs.existsSync(`./media`) || fs.mkdirSync(`./media`);
            const media = await dq.getIdMedia('sunset');
            fs.writeFileSync('media/sunset.mp4', media.data);
        }
        const dataMessage = await app.bot.telegram.sendAnimation(
            process.env.CREATOR_ID,
            { source: path.resolve(`./media/sunset.mp4`) },
            { caption: `Перезаписываю id для sunset` }
        );
        mediaVar.sunset = dataMessage.animation.file_id;
        await dq.setMedia('sunset', mediaVar.sunset);
        await app.bot.telegram.sendAnimation(ChatID, mediaVar.sunset, {
            parse_mode: 'HTML',
            caption:
                '🌃 <b>Наступает ночь</b>\nНа улицы города выходят лишь самые отважные и бесстрашные. Утром попробуем сосчитать их головы...',
            reply_markup: keyboards.goToBot(process.env.URL_BOT),
        });
    }
}

//Отправляем список живых игроков для ночи
async function sendNightMessageLivePlayers(ChatID, loggerGame) {
    loggerGame.info('Отправляем список живых игроков для ночи');
    await app.bot.telegram.sendMessage(
        ChatID,
        `<b>Живые игроки:</b>` + (await getLifeUsersText(ChatID)) + `\n\nСпать осталось <b>1 мин.</b>`,
        { parse_mode: 'HTML' }
    );
}

//Отправляем сообщения с ролями игроков
async function sendRoleMessage(ChatID, loggerGame) {
    loggerGame.info('Отправляем сообщения с ролями игроков');
    const data = await dq.getDataGame(ChatID);
    loggerGame.info(data);
    for (let player of data.players) {
        const textMessage = createTextMessageRoles(player.role, loggerGame);
        await app.bot.telegram.sendMessage(player.userID, textMessage, { parse_mode: 'HTML' });
    }
}

//Формируем текст сообщения с описанием роли
function createTextMessageRoles(role, loggerGame) {
    loggerGame.info('Формируем текст сообщения с описанием роли');
    loggerGame.info(role);
    let textMessage = 'error';
    switch (role) {
        case 'Мирный житель':
            textMessage =
                'Ты - 👨🏼 <b>Мирный житель</b>.\nТвоя задача вычислить Мафию с Триадой и на городском собрании линчевать засранцев';
            break;
        case 'Дон':
            textMessage = 'Ты - 🤵🏻 <b>Дон (глава мафии)!</b>.\nТебе решать кто не проснётся этой ночью...';
            break;
        case 'Крёстный отец':
            textMessage =
                'Ты - 🤵🏼 <b>Крёстный отец</b>.\nТебе решать кто лишится права голоса следующим днём...\nОднажды ты сможешь стать Доном.';
            break;
        case 'Доктор':
            textMessage = 'Ты - 👨🏼‍⚕️ <b>Доктор</b>.\nТебе решать кого спасти этой ночью...';
            break;
        case 'Комиссар':
            textMessage = 'Ты - 🕵🏼️‍♂️ <b>Комиссар</b>.\nГлавный городской защитник и гроза мафии...';
            break;
        case 'Лейтенант':
            textMessage =
                'Ты - 👮🏻 <b>Лейтенант</b>.\nТвоя задача помогать Комиссару вычислить Мафию и Триаду. Однажы ты сможешь стать Комиссаром';
            break;
        case 'Счастливчик':
            textMessage =
                'Ты - 🤞 <b>Счастливчик</b>.\nТвоя задача вычислить мафию и на городском собрании линчевать засранцев. Если повезёт, при покушении ты останешься жив.';
            break;
        case 'Камикадзе':
            textMessage = 'Ты - 🤦🏼‍♂️ <b>Камикадзе</b>.\nТвоя цель - умереть на городском собрании! :)';
            break;
        case 'Телохранитель':
            textMessage = 'Ты - 👥 <b>Телохранитель</b>.\nТебе решать кого спасать от пули...';
            break;
        case 'Мститель':
            textMessage = 'Ты - 🔪 <b>Мститель</b>.\nТебе решать кто этой ночью умрёт...';
            break;
        case 'Красотка':
            textMessage =
                'Ты - 💃🏻 <b>Красотка</b>.\nТебе решать кто этой ночью забудет о своей работе и будет с тобой...';
            break;
        case 'Триада':
            textMessage = 'Ты - 👳🏻‍♂️ <b>Триада</b>.\nТебе решать кто этой ночью лишится жизни...';
            break;
        case 'Сенсей':
            textMessage =
                'Ты - 🧘🏻 <b>Сенсей</b>.\nТебе решать кого проверить на притчастность к Мафии или Комиссару...';
            break;
    }
    loggerGame.info(textMessage);
    return textMessage;
}

//Формируем текст сообщения с действием
async function createTextMessageAction(role, userID, ChatID, loggerGame) {
    loggerGame.info('Формируем текст сообщения с действием');
    loggerGame.info(role);
    let textMessage = '';
    switch (role) {
        case 'Дон':
        case 'Мститель':
        case 'Триада':
            textMessage = 'Кого будем убивать этой ночью?';
            break;
        case 'Крёстный отец':
            textMessage = 'Кого будем лишать права голоса днем?';
            break;
        case 'Доктор':
            textMessage = 'Кого будем лечить?';
            break;
        case 'Комиссар':
            const messageData = await app.bot.telegram.sendMessage(userID, 'Что будем делать?', {
                reply_markup: keyboards.checkOrKill(ChatID),
            });
            await dq.updateMessageIDPlayer(ChatID, messageData.message_id, userID);
            break;
        case 'Телохранитель':
            textMessage = 'Кого будем защищать этой ночью?';
            break;
        case 'Красотка':
            textMessage = 'Кого будем радовать этой ночью?';
            break;
        case 'Сенсей':
            textMessage = 'Кого будем проверять?';
            break;
    }
    loggerGame.info(textMessage);
    return textMessage;
}

//Отправляем сообщение с действиями для активных ролей
async function sendNightMessageActionsLivePlayers(ChatID, data, loggerGame) {
    loggerGame.info('Отправляем сообщение с действиями для активных ролей');
    loggerGame.info(data);

    for (let player of data.players) {
        if (player.lifeStatus) {
            let textMessage = await createTextMessageAction(player.role, player.userID, ChatID, loggerGame);
            if (textMessage !== '') {
                await dq.updateDataCounterActiveRoles(ChatID, true);
                const messageData = await app.bot.telegram.sendMessage(player.userID, textMessage, {
                    reply_markup: keyboards.buttonActionsNight(ChatID, data.players, player.userID, player.allies),
                });
                // await app.bot.telegram.sendMessage(542144603, textMessage + 'test', {
                //     reply_markup: keyboards.buttonActionsNight(ChatID, data.players, player.userID, player.allies),
                // });
                await dq.updateMessageIDPlayer(ChatID, messageData.message_id, player.userID);
            }
        }
    }
}

//Обрабатываем результаты дня
async function ProcessingResultsDay(ChatID, loggerGame) {
    let data = await dq.getDataPlayers(ChatID); //Получаю данные голосования
    await deleteMessageAct(data.players, ChatID, loggerGame); //Удаляем сообщения на которые пользователь не нажимал
    const { counter, userNumber } = processing.daytimeVotingProcessing(data.players); // Определяем за кого проголосовали игроки
    await dq.clearAllVoticeDay(ChatID); // Очищаем базу от результатов голосования

    if (counter === 1 && userNumber) {
        const message = await app.bot.telegram.sendMessage(
            ChatID,
            `Вы действительно хотите линчевать <a href="tg://user?id=${data.players[userNumber].userID}">${data.players[userNumber].name}</a>?`,
            {
                parse_mode: 'HTML',
                reply_markup: keyboards.voteYesNoDay(data.players[userNumber].userID, 0, 0),
            }
        );
        await delay(30000);
        try {
            await app.bot.telegram.deleteMessage(ChatID, message.message_id);
        } finally {
            //Отправляем сообщение с кнопками для повешанья в чат и записываем его айди, после таймера удалим его, в базу заносить не нужно
            const newData = await dq.getDataPlayers(ChatID);
            if (newData.players[userNumber].votesAgainst > newData.players[userNumber].votesFor) {
                await dq.suspendPlayer(ChatID, newData.players[userNumber].userID); //Вешаем игрока
                switch (newData.players[userNumber].initialRole) {
                    case 'Триада':
                    case 'Сенсей':
                        await dq.decrementCounterTriada(ChatID);
                        break;
                    case 'Дон':
                    case 'Крёстный отец':
                        await dq.decrementCounterMafia(ChatID);
                        break;
                    default:
                        await dq.decrementCounterWorld(ChatID);
                }
                await app.bot.telegram.sendMessage(
                    ChatID,
                    `Сегодня был повешан <a href="tg://user?id=${newData.players[userNumber].userID}">` +
                        `${newData.players[userNumber].name}</a> - ${newData.players[userNumber].role}`,
                    { parse_mode: 'HTML' }
                );
            } else {
                await app.bot.telegram.sendMessage(ChatID, `Мнения жителей разошлись, этой ночью никого не вешаем...`);
            }
            await dq.clearAllVoticeDay(ChatID); // Очищаем базу от результатов голосования
        }
    } else {
        await app.bot.telegram.sendMessage(ChatID, `Мнения жителей разошлись, этой ночью никого не вешаем...`);
    }
}

//Отправляем гифку сначалом дня
async function sendSunMessage(ChatID, i, loggerGame) {
    loggerGame.info('Отправляем гифку сначалом дня');
    try {
        await app.bot.telegram.sendAnimation(ChatID, mediaVar.sunrise, {
            parse_mode: 'HTML',
            caption: `🏙 <b>День ${i}</b>\nСолнце всходит, подсушивая на тротуарах пролитую ночью кровь...`,
            reply_markup: keyboards.goToBot(process.env.URL_BOT),
        });
    } catch (e) {
        app.loggerGlobal.error(e.stack);
        if (!fs.existsSync(`./media/sunrise.mp4`)) {
            fs.existsSync(`./media`) || fs.mkdirSync(`./media`);
            const media = await dq.getIdMedia('sunrise');
            fs.writeFileSync('media/sunrise.mp4', media.data);
        }
        const dataMessage = await app.bot.telegram.sendAnimation(
            process.env.CREATOR_ID,
            { source: path.resolve(`./media/sunrise.mp4`) },
            { caption: `Перезаписываю id для sunrise` }
        );
        mediaVar.sunrise = dataMessage.animation.file_id;
        await dq.setMedia('sunrise', mediaVar.sunrise);
        await app.bot.telegram.sendAnimation(ChatID, mediaVar.sunrise, {
            parse_mode: 'HTML',
            caption: `🏙 <b>День ${i}</b>\nСолнце всходит, подсушивая на тротуарах пролитую ночью кровь...`,
            reply_markup: keyboards.goToBot(process.env.URL_BOT),
        });
    }
}

//Отправляем список живых игроков для дня
async function sendDayMessageLivePlayers(ChatID, data, loggerGame) {
    loggerGame.info('Отправляем список живых игроков для дня');
    loggerGame.info(data);
    let listUsers = '';
    let listRoles = '';
    let caunter = 0;
    let masRole = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    data.players.forEach(player => {
        if (player.lifeStatus) {
            caunter++;
            listUsers += `\n${caunter}) <a href="tg://user?id=${player.userID}">${player.name}</a>`;
            switch (player.role) {
                case 'Мирный житель':
                    masRole[0] += 1;
                    break;
                case 'Дон':
                    masRole[1] = 1;
                    break;
                case 'Крёстный отец':
                    masRole[2] = 1;
                    break;
                case 'Доктор':
                    masRole[3] = 1;
                    break;
                case 'Комиссар':
                    masRole[4] = 1;
                    break;
                case 'Лейтенант':
                    masRole[5] = 1;
                    break;
                case 'Счастливчик':
                    masRole[6] = 1;
                    break;
                case 'Камикадзе':
                    masRole[7] = 1;
                    break;
                case 'Телохранитель':
                    masRole[8] = 1;
                    break;
                case 'Мститель':
                    masRole[9] = 1;
                    break;
                case 'Красотка':
                    masRole[10] = 1;
                    break;
                case 'Триада':
                    masRole[11] = 1;
                    break;
                case 'Сенсей':
                    masRole[12] = 1;
                    break;
            }
        }
    });
    if (masRole[0] > 1) {
        listRoles += `👨🏼 Мирный житель - ${masRole[0]}, `;
    } else if (masRole[0] == 1) {
        listRoles += `👨🏼 Мирный житель, `;
    }
    if (masRole[1] == 1) {
        listRoles += `🤵🏻 Дон, `;
    }
    if (masRole[2] == 1) {
        listRoles += `🤵🏼 Крёстный отец, `;
    }
    if (masRole[3] == 1) {
        listRoles += `👨🏼‍⚕️ Доктор, `;
    }
    if (masRole[4] == 1) {
        listRoles += `🕵🏼️‍♂️ Комиссар, `;
    }
    if (masRole[5] == 1) {
        listRoles += `👮🏻 Лейтенант, `;
    }
    if (masRole[6] == 1) {
        listRoles += `🤞 Счастливчик, `;
    }
    if (masRole[7] == 1) {
        listRoles += `🤦🏼‍♂️ Камикадзе, `;
    }
    if (masRole[8] == 1) {
        listRoles += `👥 Телохранитель, `;
    }
    if (masRole[9] == 1) {
        listRoles += `🔪 Мститель, `;
    }
    if (masRole[10] == 1) {
        listRoles += `💃🏻 Красотка, `;
    }
    if (masRole[11] == 1) {
        listRoles += `👳🏻‍♂️ Триада, `;
    }
    if (masRole[12] == 1) {
        listRoles += `🧘🏻 Сенсей, `;
    }
    await app.bot.telegram.sendMessage(
        ChatID,
        `<b>Живые игроки:</b>` +
            listUsers +
            `\n\n<b>Кто-то из них:</b>` +
            listRoles.slice(0, -2) +
            `\nВсего: ${caunter} чел.\n\nСейчас самое время обсудить результаты ночи, разобраться в причинах и следствиях...`,
        { parse_mode: 'HTML' }
    );
}

//Пауза
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Проверяем жив ли игрок с определенной ролью
function roleLifeCheck(players, role) {
    return players.some(player => {
        return player.role == role && player.lifeStatus;
    });
}

//Конвертируем время в текст
function convertTimeToText(time) {
    let text = '';
    const timeGame = Date.now() - time,
        hours = Math.floor(timeGame / (1000 * 60 * 60)),
        minutes = Math.floor(timeGame / (1000 * 60)) - hours * 60,
        seconds = Math.floor(timeGame / 1000) - minutes * 60 - hours * 60 * 60;
    if (hours != 0) {
        text += `${hours} ч. `;
    }
    if (minutes != 0) {
        text += `${minutes} мин. `;
    }
    if (seconds != 0) {
        text += `${seconds} сек. `;
    }
    return text;
}

//Запуск регистрации
async function registration(ChatID) {
    for (let time = 90; time > 0; time -= 30) {
        await sendMessageRegistration(ChatID, time);
        await delay(30000);
        const data = await dq.getDataDeleteMessageRegistration(ChatID);
        if (data.messageID == 0) {
            break;
        }
    }
    await deleteMessageRegistration(ChatID);
}

//Отправка сообщения регистрации
async function sendMessageRegistration(ChatID, time) {
    if (time != 90) {
        deleteMessageRegistration(ChatID);
    }
    const messageRegistration = await app.bot.telegram.sendMessage(
        ChatID,
        `Игра начнётся через ${time} секунд! \nСписок участников:` + (await getLifeUsersText(ChatID)),
        {
            parse_mode: 'HTML',
            reply_markup: keyboards.userRegistrationBtn(process.env.URL_BOT, ChatID),
        }
    );
    await dq.updateDataSendMessageRegistration(ChatID, messageRegistration.message_id, time);
}

//Удаление сообщения регистрации
async function deleteMessageRegistration(chatID) {
    const data = await dq.getDataDeleteMessageRegistration(chatID);
    if (data.messageID != 0) {
        try {
            await app.bot.telegram.deleteMessage(chatID, data.messageID);
        } finally {
        }
    }
}

//Получаем список живых игроков
async function getLifeUsersText(chatID) {
    let listUsers = '',
        caunter = 0;
    const data = await dq.getDataPlayers(chatID);
    data.players.forEach(player => {
        if (player.lifeStatus) {
            caunter++;
            listUsers += `\n${caunter}) <a href="tg://user?id=${player.userID}">${player.name}</a>`;
        }
    });
    return listUsers;
}

//Дневное голосование
async function lastVote(ChatID, result, userID, userIDAct, messageID, callbackQueryID) {
    const user = await dq.getInfoPlayer(ChatID, userID),
        userAct = await dq.getInfoPlayer(ChatID, userIDAct);
    if (userID != userIDAct) {
        if (user.players[0].lifeStatus && user.players[0].votes && !user.players[0].whetherVoted) {
            if (result) {
                //За
                await dq.updateCallbackDataVotesAgainstPlayer(ChatID, userIDAct, 1);
                app.bot.telegram.editMessageReplyMarkup(
                    ChatID,
                    messageID,
                    null,
                    keyboards.voteYesNoDay(
                        userAct.players[0].userID,
                        userAct.players[0].votesAgainst + 1,
                        userAct.players[0].votesFor
                    )
                );
                app.bot.telegram.answerCbQuery(callbackQueryID, 'Вы проголосовали 👍');
            } else {
                //Против
                await dq.updateCallbackDataVotesForPlayer(ChatID, userIDAct, 1);
                app.bot.telegram.editMessageReplyMarkup(
                    ChatID,
                    messageID,
                    null,
                    keyboards.voteYesNoDay(
                        userAct.players[0].userID,
                        userAct.players[0].votesAgainst,
                        userAct.players[0].votesFor + 1
                    )
                );
                app.bot.telegram.answerCbQuery(callbackQueryID, 'Вы проголосовали 👎');
            }
            await dq.updateCallbackDataVotesPlayer(ChatID, userID, true, result);
        } else if (user.players[0].lifeStatus && user.players[0].votes && user.players[0].whetherVoted) {
            //Пользователь уже голосовал
            if (user.players[0].votingResult != result) {
                await dq.updateCallbackDataVotesPlayer(ChatID, userID, true, result);
                if (result) {
                    await dq.updateCallbackDataVotesAgainstPlayer(ChatID, userIDAct, 1);
                    await dq.updateCallbackDataVotesForPlayer(ChatID, userIDAct, -1);
                    app.bot.telegram.editMessageReplyMarkup(
                        ChatID,
                        messageID,
                        null,
                        keyboards.voteYesNoDay(
                            userAct.players[0].userID,
                            userAct.players[0].votesAgainst + 1,
                            userAct.players[0].votesFor - 1
                        )
                    );
                    app.bot.telegram.answerCbQuery(callbackQueryID, 'Вы сменили голос на 👍');
                } else {
                    await dq.updateCallbackDataVotesAgainstPlayer(ChatID, userIDAct, -1);
                    await dq.updateCallbackDataVotesForPlayer(ChatID, userIDAct, 1);
                    app.bot.telegram.editMessageReplyMarkup(
                        ChatID,
                        messageID,
                        null,
                        keyboards.voteYesNoDay(
                            userAct.players[0].userID,
                            userAct.players[0].votesAgainst - 1,
                            userAct.players[0].votesFor + 1
                        )
                    );
                    app.bot.telegram.answerCbQuery(callbackQueryID, 'Вы сменили голос на 👎');
                }
            }
        } else {
            app.bot.telegram.answerCbQuery(callbackQueryID, 'Вы не можете голосовать!');
        }
    } else {
        app.bot.telegram.answerCbQuery(callbackQueryID, 'Вы не можете голосовать за себя!');
    }
}

//Обрабатываем колбеки
export async function callbackQuery(ctx) {
    const callbackQuery = JSON.parse(JSON.stringify(ctx.callbackQuery));
    if (callbackQuery.data.slice(0, 3) === 'act') {
        try {
            await ctx.deleteMessage();
        } finally {
            const messageData = callbackQuery.data.split(' ');
            await dq.updateDataCounterActiveRoles(messageData[1], false);
            await dq.updateMessageIDPlayer(messageData[1], 0, callbackQuery.from.id);
            sendMessageAboutProgressRole(messageData[1], callbackQuery.from.id, messageData[2]);
            await dq.updateCallbackDataPlayer(messageData[1], messageData[2], callbackQuery.from.id);
        }
    } else if (callbackQuery.data.slice(0, 2) === 'vs') {
        try {
            await ctx.deleteMessage();
        } finally {
            const messageData = callbackQuery.data.split(' ');
            await dq.updateMessageIDPlayer(messageData[1], 0, callbackQuery.from.id);
            sendMessageVoiceUserInChat(messageData[1], callbackQuery.from.id, messageData[2]);
            await dq.updateCallbackDataVotesAgainstPlayer(messageData[1], messageData[2], 1);
        }
    } else if (callbackQuery.data.slice(0, 8) === 'copcheck') {
        try {
            await ctx.deleteMessage();
        } finally {
            await dq.updateDataCounterActiveRoles(callbackQuery.data.slice(8), true);
        }
        const dataPlayers = await dq.getDataPlayers(callbackQuery.data.slice(8));
        const message = await app.bot.telegram.sendMessage(callbackQuery.from.id, 'Кого будем проверять?', {
            reply_markup: keyboards.buttonActionsNight(
                callbackQuery.data.slice(8),
                dataPlayers.players,
                callbackQuery.from.id,
                1
            ),
        });
        await dq.updateCallbackDataCop(callbackQuery.data.slice(8), true, callbackQuery.from.id, message.message_id);
    } else if (callbackQuery.data.slice(0, 7) === 'copkill') {
        try {
            await ctx.deleteMessage();
        } finally {
            await dq.updateDataCounterActiveRoles(callbackQuery.data.slice(7), true);
        }
        const dataPlayers = await dq.getDataPlayers(callbackQuery.data.slice(7));
        const message = await app.bot.telegram.sendMessage(callbackQuery.from.id, 'Кого будем убивать?', {
            reply_markup: keyboards.buttonActionsNight(
                callbackQuery.data.slice(7),
                dataPlayers.players,
                callbackQuery.from.id,
                1
            ),
        });
        await dq.updateCallbackDataCop(callbackQuery.data.slice(7), false, callbackQuery.from.id, message.message_id);
    } else if (callbackQuery.data === 'newgame') {
        try {
            await ctx.deleteMessage();
        } finally {
            if (functions.checkBotAdmin(callbackQuery.message.chat.id)) {
                functions.updateOrAddChatInBD(callbackQuery.message.chat.id, callbackQuery.message.chat.title);
                launch(callbackQuery.message.chat.id);
            }
        }
    } else if (callbackQuery.data.slice(0, 3) === 'yes') {
        await lastVote(
            callbackQuery.message.chat.id, //ChatID
            true, //Голос за
            callbackQuery.from.id, //Айди того кто нажал на кнопку
            callbackQuery.data.slice(3), //Айди того кому нужно добавить голос
            callbackQuery.message.message_id, //Айди сообщения которое нужно изменить
            callbackQuery.id
        );
    } else if (callbackQuery.data.slice(0, 2) === 'no') {
        await lastVote(
            callbackQuery.message.chat.id, //ChatID
            false, //Голос за
            callbackQuery.from.id, //Айди того кто нажал на кнопку
            callbackQuery.data.slice(2), //Айди того кому нужно добавить голос
            callbackQuery.message.message_id, //Айди сообщения которое нужно изменить
            callbackQuery.id
        );
    }
}
