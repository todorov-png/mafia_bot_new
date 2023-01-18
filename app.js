'use strict';
import dotenv from 'dotenv';
import Telegraf from 'telegraf';
import rateLimit from 'telegraf-ratelimit';
import winston from 'winston';
import fs from 'fs';
import * as functions from './functions.js';
import * as game from './game.js';
dotenv.config();

//Устанавливаем лимит 75 запросов за 3 секунды
const limitConfig = {
    window: 3000,
    limit: 75,
    onLimitExceeded: (ctx, next) => ctx.reply('Превышен лимит запросов, подождите'),
};

//Создаем обьект бота
export const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
bot.use(rateLimit(limitConfig));
//bot.use(Telegraf.log()); //Выводит сообщение в консоль

//Обработка ошибок
bot.catch((err, ctx) => {
    console.log(`Ой, произошла ошибка для ${ctx.updateType}`, err);
    bot.telegram.sendMessage(process.env.CREATOR_ID, `Ой, произошла ошибка для ${ctx.updateType} ошибка: ${err}`);
    loggerGlobal.error(`Произошла ошибка для ${ctx.updateType}: ${err}`);
});

//Закрываем все активные игры
functions.completionOfActiveGames();

//Создаем папку для логов, если ее нет
fs.existsSync(`./logs`) || fs.mkdirSync(`./logs`);

//Создаем глобального логера
export const loggerGlobal = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.json(), winston.format.timestamp(), winston.format.prettyPrint()),
    transports: [
        new winston.transports.File({ filename: 'logs/bot.log', level: 'info' }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    ],
});

/*const API_TOKEN = process.env.TELEGRAM_TOKEN || '';
const PORT = process.env.PORT || 3000;
const URL_ADDRESS = process.env.URL || 'https://mafiabotjs.com';

export const bot = new Telegraf(API_TOKEN);
bot.telegram.setWebhook(`${URL_ADDRESS}/${process.env.SECRET}`);
//bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
//bot.startWebhook(`/${process.env.SECRET}`, null, PORT);
*/

//Приветствуем пользователя и записываем его на игру, если с командой пришел id чата
bot.start(ctx => {
    if (ctx.message.text.length == 6) {
        ctx.reply('Привет, для запуска игры отправь команду /game в групповом чате');
    } else {
        //Сохраняем в бд пользователя и записываем его на игру
        loggerGlobal.info(
            `В чате id=${ctx.message.text.slice(7)} записался на игру пользователь ${ctx.message.from.first_name}`
        );
        functions.registrationUserInGame(ctx, ctx.message.text.slice(7));
    }
});

//Выводим подсказку
bot.help(async ctx => {
    ctx.reply(
        `Привет!\nЯ бот, который позволяет играть в Мафию.\n\nДля запуска игры мне нужно выдать права 👨‍⚖ администратора:\n\n  - Удаление сообщений\n\nПосле выполнения всех действий, вы сможете запустить игру командой /game\n\nДля просмотра ролей /role`
    );
});

//Запускаем игру
bot.command('game', async ctx => {
    //Если пришло с группового чата, то запускаем регистрацию участников
    if (functions.checkTypeChat(ctx.message.chat.type)) {
        //Проверяем дали ли боту права админа
        if (await functions.checkBotAdmin(ctx.message.chat.id)) {
            if (await functions.checkStartGame(ctx.message.chat.id)) {
                ctx.reply('Игра уже запущена, не мешайте!');
            } else {
                await functions.updateOrAddChatInBD(ctx.message.chat.id, ctx.message.chat.title);
                loggerGlobal.info(`В чате id=${ctx.message.chat.id} запустили игру`);
                game.launch(ctx.message.chat.id);
                loggerGlobal.info(`В чате id=${ctx.message.chat.id} закончили игру`);
            }
        } else {
            ctx.reply('Сделайте бота администратором и дайте разрешение на удаление сообщений!');
        }
    } else {
        ctx.reply('Эту команду необходимо отправлять в групповом чате!');
    }
});

//Запускаем игру
bot.command('role', ctx => {
    ctx.reply(
        `В игре доступны следующие роли:
👨🏼 <b>Мирный житель</b> - обычный горожанин, главная цель которого вычислить мафию и линчевать её днем.
🤞 <b>Счастливчик</b> - при смерти может повезти и он не умрёт.
🤵🏻 <b>Дон</b> - глава мафии, ночью убивает игрока.
🤵🏼 <b>Крёстный отец</b> - помощник мафии, лишает игрока голоса днем, при смерти дона становится главой мафии.
👨🏼‍⚕️ <b>Доктор</b> - лечит жителей, но если полечит одного игрока 2 раза подряд, а в него не стреляли ни разу, то залечивает его до смерти.
🕵🏼️‍♂️ <b>Комиссар</b> - ищет мафию, может проверить или убить игрока.
👮🏻 <b>Лейтенант</b> - помощник комиссара, при смерти начальника получает повышение и становится комиссаром.
🤦🏼‍♂️ <b>Камикадзе</b> - смертник, его цель быть повешаным на дневном собрании.
👥 <b>Телохранитель</b> - прикрывает любого игрока, при ранее уходит с работы, но спасает игрока от смерти.
🔪 <b>Мститель</b> - единолично хочет разобраться с мафией, может убивать любого жителя.
💃🏻 <b>Красотка</b> - отвлекает игрока ночью и он лишается возможности действовать.
👳🏻‍♂️ <b>Триада</b> - глава 2 преступного клана в городе, цель которого убить мафию и мирных жителей.
🧘🏻 <b>Сенсей</b> - помощник триады, проверяет игрока на наличе роли комиссара или мафии, при смерти триады занимает его место.
<b>Вы и ваши союзники подсвечиваются</b> ☑️`,
        { parse_mode: 'HTML' }
    );
});

//Очищаем данные игры
bot.command('stopgame', ctx => {
    loggerGlobal.info(`В чате id=${ctx.message.chat.id} остановили игру`);
    game.clearDataGame(ctx.message.chat.id);
});

bot.command('testttt', ctx => {
    ctx.reply('Проверка изменений');
});

//Получаю файлы логов игр
bot.command('getlogsgame', ctx => {
    ctx.message.from.id == process.env.CREATOR_ID
        ? functions.getLogsGame()
        : ctx.reply('У вас нет прав на эту команду!');
});

//Получаю файлы логов бота
bot.command('getlogsbot', ctx => {
    ctx.message.from.id == process.env.CREATOR_ID
        ? functions.getLogsBot()
        : ctx.reply('У вас нет прав на эту команду!');
});

//Сохраняем медиа в базу данных
bot.command('writemedia', ctx => {
    ctx.message.from.id == process.env.CREATOR_ID
        ? functions.writeMediaMongoBD()
        : ctx.reply('У вас нет прав на эту команду!');
});

//Отмечаем всех участников которых знает бот
bot.command('call', ctx => {
    functions.callUsers(ctx);
});

//Отправляем статистику пользователя
bot.command('userinfo', ctx => {
    functions.getInfoUser(ctx.message.chat.id, ctx.message.from.id);
});

//Отправляем статистику чата
bot.command('chatinfo', ctx => {
    functions.getInfoChat(ctx.message.chat.id);
});

//Отправляем топ чата
bot.command('topvictories', ctx => {
    functions.topChat(ctx.message.chat.id, 'победителей', 'victories');
});

//Отправляем топ чата
bot.command('topworld', ctx => {
    functions.topChat(ctx.message.chat.id, 'победителей в мирной роли', 'worldVictories');
});

//Отправляем топ чата
bot.command('topmafia', ctx => {
    functions.topChat(ctx.message.chat.id, 'победителей в роли мафии', 'mafiaVictories');
});

//Отправляем топ чата
bot.command('toptriada', ctx => {
    functions.topChat(ctx.message.chat.id, 'победителей в роли триады', 'triadaVictories');
});

//При добавлении пользователя запоминаем его данные
bot.on('new_chat_members', ctx => {
    if (functions.checkTypeChat(ctx.message.chat.type)) {
        functions.checkingLoggedUser(ctx.message.chat.id, ctx.message.new_chat_members);
    } else {
        functions.leaveChat(ctx.message.chat.id);
    }
});

//При выходе участника удаляем его из бд
bot.on('left_chat_member', ctx => {
    functions.leftUserOrChat(ctx.message.chat.id, ctx.message.left_chat_member);
});

//Ловим изменение типа чата и его айди
bot.on('migrate_to_chat_id', ctx => {
    functions.autoUpdateIDChat(ctx.message.chat.id, ctx.message.migrate_to_chat_id);
});

//Ловим изменение имени чата
bot.on('new_chat_title', ctx => {
    functions.autoUpdateTitleChat(ctx.message.chat.id, ctx.message.chat.title);
});

//Ловим колбеки от кнопок
bot.on('callback_query', ctx => {
    game.callbackQuery(ctx);
});

//Удаляем сообщение, если ночь или убит
bot.on('message', ctx => {
    if (functions.checkTypeChat(ctx.message.chat.type)) {
        game.closeWriteChat(ctx);
    }
});

//Запускаем бесконечный цикл полинга
bot.launch();
//bot.startWebhook(`/${process.env.SECRET}`, null, PORT);
