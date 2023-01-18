import {
    daytimeVotingProcessing,
    checkingTheEndOfTheGame,
    beautyMove,
    shootingAndCheckingPlayers,
    medicMove,
    bodyguardMove,
} from './processing.js';

describe('Проверка обработки результатов дня', () => {
    const dataTest = [
        {
            nameTest: 'Никто не проголосвал',
            result: {
                counter: 4,
                userNumber: 5,
            },
            players: [
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Евгений',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: false,
                    name: 'Влад',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Даша',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: false,
                    name: 'Максим',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Коля',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Валера',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: false,
                    name: 'Наташа',
                },
            ],
        },
        {
            nameTest: 'Одинаково проголосовали за двух человек',
            result: {
                counter: 2,
                userNumber: 4,
            },
            players: [
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Евгений',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: false,
                    name: 'Влад',
                },
                {
                    votesAgainst: 2,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Даша',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: false,
                    name: 'Максим',
                },
                {
                    votesAgainst: 2,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Коля',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Валера',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: false,
                    name: 'Наташа',
                },
            ],
        },
        {
            nameTest: 'Выбрали кого повесить',
            result: {
                counter: 1,
                userNumber: 0,
            },
            players: [
                {
                    votesAgainst: 3,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Евгений',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: false,
                    name: 'Влад',
                },
                {
                    votesAgainst: 1,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Даша',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: false,
                    name: 'Максим',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Коля',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: true,
                    name: 'Валера',
                },
                {
                    votesAgainst: 0,
                    votesFor: 0,
                    whetherVoted: false,
                    lifeStatus: false,
                    name: 'Наташа',
                },
            ],
        },
    ];
    dataTest.forEach(item => {
        it(item.nameTest, () => {
            expect(daytimeVotingProcessing(item.players)).toEqual(item.result);
        });
    });
});

describe('Проверка на наличие победителей', () => {
    const dataTest = [
        {
            nameTest: 'Победили мирные днем',
            result: {
                continueGame: false,
                win: 1,
            },
            dataGame: {
                counterTriada: 0,
                counterMafia: 0,
                counterWorld: 1,
                statysDay: false,
                timeStart: 12354,
                inactivePlay: 5,
            },
        },
        {
            nameTest: 'Победили мирные ночью',
            result: {
                continueGame: false,
                win: 1,
            },
            dataGame: {
                counterTriada: 0,
                counterMafia: 0,
                counterWorld: 1,
                statysDay: true,
                timeStart: 12354,
                inactivePlay: 5,
            },
        },
        {
            nameTest: 'Победила мафия днем, все остальные умерли',
            result: {
                continueGame: false,
                win: 2,
            },
            dataGame: {
                counterTriada: 0,
                counterMafia: 1,
                counterWorld: 0,
                statysDay: false,
                timeStart: 12354,
                inactivePlay: 1,
            },
        },
        {
            nameTest: 'Победила мафия ночью, все остальные умерли',
            result: {
                continueGame: false,
                win: 2,
            },
            dataGame: {
                counterTriada: 0,
                counterMafia: 1,
                counterWorld: 0,
                statysDay: true,
                timeStart: 12354,
                inactivePlay: 1,
            },
        },
        {
            nameTest: 'Победила мафия ночью, ибо днем она останется 1 на 1 с мирным',
            result: {
                continueGame: false,
                win: 2,
            },
            dataGame: {
                counterTriada: 0,
                counterMafia: 1,
                counterWorld: 1,
                statysDay: true,
                timeStart: 12354,
                inactivePlay: 1,
            },
        },
        {
            nameTest: 'Победила триада днем, все остальные умерли',
            result: {
                continueGame: false,
                win: 3,
            },
            dataGame: {
                counterTriada: 1,
                counterMafia: 0,
                counterWorld: 0,
                statysDay: false,
                timeStart: 12354,
                inactivePlay: 1,
            },
        },
        {
            nameTest: 'Победила триада ночью, все остальные умерли',
            result: {
                continueGame: false,
                win: 3,
            },
            dataGame: {
                counterTriada: 1,
                counterMafia: 0,
                counterWorld: 0,
                statysDay: true,
                timeStart: 12354,
                inactivePlay: 1,
            },
        },
        {
            nameTest: 'Победила триада ночью, ибо днем она останется 1 на 1 с мирным',
            result: {
                continueGame: false,
                win: 3,
            },
            dataGame: {
                counterTriada: 1,
                counterMafia: 0,
                counterWorld: 1,
                statysDay: true,
                timeStart: 12354,
                inactivePlay: 1,
            },
        },
        {
            nameTest: 'Все игроки умерли - победителя нет!',
            result: {
                continueGame: false,
                win: 4,
            },
            dataGame: {
                counterTriada: 0,
                counterMafia: 0,
                counterWorld: 0,
                statysDay: false,
                timeStart: 12354,
                inactivePlay: 2,
            },
        },
        {
            nameTest: 'Давно не было активности, игра завершена!',
            result: {
                continueGame: false,
                win: 5,
            },
            dataGame: {
                counterTriada: 0,
                counterMafia: 1,
                counterWorld: 2,
                statysDay: false,
                timeStart: 12354,
                inactivePlay: 0,
            },
        },
        {
            nameTest: 'Продолжаем игру днем',
            result: {
                continueGame: true,
                win: 0,
            },
            dataGame: {
                counterTriada: 1,
                counterMafia: 1,
                counterWorld: 1,
                statysDay: false,
                timeStart: 12354,
                inactivePlay: 5,
            },
        },
        {
            nameTest: 'Продолжаем игру ночью',
            result: {
                continueGame: true,
                win: 0,
            },
            dataGame: {
                counterTriada: 1,
                counterMafia: 1,
                counterWorld: 1,
                statysDay: true,
                timeStart: 12354,
                inactivePlay: 5,
            },
        },
        {
            nameTest: 'Продолжаем игру ночью без мирных',
            result: {
                continueGame: true,
                win: 0,
            },
            dataGame: {
                counterTriada: 1,
                counterMafia: 1,
                counterWorld: 0,
                statysDay: true,
                timeStart: 0,
                inactivePlay: 5,
            },
        },
        {
            nameTest: 'Продолжаем игру днем без мирных',
            result: {
                continueGame: true,
                win: 0,
            },
            dataGame: {
                counterTriada: 1,
                counterMafia: 1,
                counterWorld: 0,
                statysDay: false,
                timeStart: 12354,
                inactivePlay: 5,
            },
        },
    ];
    dataTest.forEach(item => {
        it(item.nameTest, () => {
            expect(checkingTheEndOfTheGame(item.dataGame)).toEqual(item.result);
        });
    });
});

describe('Проверка обработки хода красотки', () => {
    const dataTest = [
        {
            nameTest: 'Порадовала игрока и лишила его хода',
            result: {
                data: {
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 10,
                        },
                        {
                            lifeStatus: false,
                            role: 'Доктор',
                            actID: 13,
                            userID: 11,
                        },
                        {
                            lifeStatus: true,
                            role: 'Дон',
                            actID: 0,
                            userID: 12,
                        },
                        {
                            lifeStatus: true,
                            role: 'Красотка',
                            actID: 0,
                            userID: 13,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            actID: 0,
                            userID: 14,
                        },
                    ],
                },
                trigerAction: 1,
                messageActions: [
                    {
                        chatID: 12,
                        text: 'Поздравляю, вы провели незабываемую ночь с девушкой своей мечты...',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: false,
                        role: 'Доктор',
                        actID: 13,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 10,
                        userID: 12,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        actID: 12,
                        userID: 13,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
        },
        {
            nameTest: 'Красотка ни к кому не ходила',
            result: {
                data: {
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 10,
                        },
                        {
                            lifeStatus: false,
                            role: 'Доктор',
                            actID: 13,
                            userID: 11,
                        },
                        {
                            lifeStatus: true,
                            role: 'Дон',
                            actID: 10,
                            userID: 12,
                        },
                        {
                            lifeStatus: true,
                            role: 'Красотка',
                            actID: 0,
                            userID: 13,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            actID: 0,
                            userID: 14,
                        },
                    ],
                },
                trigerAction: 0,
                messageActions: [],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: false,
                        role: 'Доктор',
                        actID: 13,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 10,
                        userID: 12,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
        },
        {
            nameTest: 'Никто не ходил',
            result: {
                data: {
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 10,
                        },
                        {
                            lifeStatus: false,
                            role: 'Доктор',
                            actID: 13,
                            userID: 11,
                        },
                        {
                            lifeStatus: true,
                            role: 'Дон',
                            actID: 0,
                            userID: 12,
                        },
                        {
                            lifeStatus: true,
                            role: 'Красотка',
                            actID: 0,
                            userID: 13,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            actID: 0,
                            userID: 14,
                        },
                    ],
                },
                trigerAction: 0,
                messageActions: [],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: false,
                        role: 'Доктор',
                        actID: 13,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
        },
    ];
    dataTest.forEach(item => {
        it(item.nameTest, () => {
            expect(beautyMove(item.data, item.trigerAction, item.messageActions)).toEqual(item.result);
        });
    });
});

describe('Проверка обработки убийств и проверок игроков', () => {
    const dataTest = [
        {
            nameTest: 'Дон выстрелил в лейтенанта',
            result: {
                cloneData: {
                    dataGame: {
                        counterPlayers: 4,
                        counterTriada: 0,
                        counterMafia: 1,
                        counterWorld: 3,
                    },
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 10,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            role: 'Доктор',
                            actID: 13,
                            userID: 11,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            role: 'Дон',
                            actID: 0,
                            userID: 12,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            role: 'Красотка',
                            actID: 12,
                            userID: 13,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            actID: 0,
                            userID: 14,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            role: 'Лейтенант',
                            actID: 14,
                            userID: 15,
                            
                            therapyDay: 0,
                            votes: true,
                        },
                    ],
                },
                trigerAction: 1,
                messageActions: [
                    {
                        chatID: 15,
                        text: 'На вас было совершено покушение...',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                dataGame: {
                    counterPlayers: 5,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 4,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: false,
                        role: 'Доктор',
                        actID: 13,
                        userID: 11,
                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 15,
                        userID: 12,
                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        actID: 12,
                        userID: 13,
                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Лейтенант',
                        actID: 14,
                        userID: 15,
                        therapyDay: 0,
                        votes: true,
                    },
                ],
            },
            cloneData: {
                dataGame: {
                    counterPlayers: 5,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 4,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: false,
                        role: 'Доктор',
                        actID: 13,
                        userID: 11,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 15,
                        userID: 12,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        actID: 12,
                        userID: 13,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Лейтенант',
                        actID: 14,
                        userID: 15,

                        therapyDay: 0,
                        votes: true,
                    },
                ],
            },
        },
        {
            nameTest: 'Комиссар выстрелил в дона, а дон выстрелил в красотку',
            result: {
                cloneData: {
                    dataGame: {
                        counterPlayers: 3,
                        counterTriada: 0,
                        counterMafia: 0,
                        counterWorld: 3,
                    },
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            initialRole: 'Мирный житель',
                            actID: 0,
                            userID: 10,
                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            role: 'Доктор',
                            initialRole: 'Доктор',
                            actID: 13,
                            userID: 11,
                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            role: 'Дон',
                            initialRole: 'Дон',
                            actID: 0,
                            userID: 12,
                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            role: 'Красотка',
                            initialRole: 'Красотка',
                            actID: 10,
                            userID: 13,
                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            initialRole: 'Счастливчик',
                            actID: 0,
                            userID: 14,
                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            role: 'Комиссар',
                            initialRole: 'Комиссар',
                            copCheck: false,
                            actID: 0,
                            userID: 15,
                            therapyDay: 0,
                            votes: true,
                        },
                    ],
                },
                trigerAction: 2,
                messageActions: [
                    {
                        chatID: 13,
                        text: 'На вас было совершено покушение...',
                    },
                    {
                        chatID: 12,
                        text: 'На вас было совершено покушение...',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                dataGame: {
                    counterPlayers: 5,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 4,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        initialRole: 'Мирный житель',
                        actID: 0,
                        userID: 10,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: false,
                        role: 'Доктор',
                        initialRole: 'Доктор',
                        actID: 13,
                        userID: 11,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        initialRole: 'Дон',
                        actID: 13,
                        userID: 12,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        initialRole: 'Красотка',
                        actID: 10,
                        userID: 13,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        initialRole: 'Счастливчик',
                        actID: 0,
                        userID: 14,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Комиссар',
                        initialRole: 'Комиссар',
                        copCheck: false,
                        actID: 12,
                        userID: 15,

                        therapyDay: 0,
                        votes: true,
                    },
                ],
            },
            cloneData: {
                dataGame: {
                    counterPlayers: 5,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 4,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        initialRole: 'Мирный житель',
                        actID: 0,
                        userID: 10,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: false,
                        role: 'Доктор',
                        initialRole: 'Доктор',
                        actID: 13,
                        userID: 11,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        initialRole: 'Дон',
                        actID: 13,
                        userID: 12,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        initialRole: 'Красотка',
                        actID: 10,
                        userID: 13,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        initialRole: 'Счастливчик',
                        actID: 0,
                        userID: 14,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Комиссар',
                        initialRole: 'Комиссар',
                        copCheck: false,
                        actID: 12,
                        userID: 15,

                        therapyDay: 0,
                        votes: true,
                    },
                ],
            },
        },
        {
            nameTest:
                'Мститель выстрелил в дона, триада выстрелил в красотку, дон выстрелил в мстителя, а комиссар проверил дона',
            result: {
                cloneData: {
                    dataGame: {
                        counterPlayers: 4,
                        counterTriada: 1,
                        counterMafia: 0,
                        counterWorld: 3,
                    },
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            initialRole: 'Мирный житель',
                            actID: 0,
                            userID: 10,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            role: 'Доктор',
                            initialRole: 'Доктор',
                            actID: 0,
                            userID: 11,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            role: 'Мститель',
                            initialRole: 'Мститель',
                            actID: 0,
                            userID: 12,
                            
                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            role: 'Триада',
                            initialRole: 'Триада',
                            actID: 0,
                            userID: 13,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            name: 'Даша',
                            role: 'Дон',
                            initialRole: 'Дон',
                            actID: 0,
                            userID: 14,
                            
                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            role: 'Красотка',
                            initialRole: 'Красотка',
                            actID: 0,
                            userID: 15,
                            
                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            initialRole: 'Счастливчик',
                            actID: 0,
                            userID: 16,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            role: 'Комиссар',
                            initialRole: 'Комиссар',
                            copCheck: true,
                            actID: 0,
                            userID: 17,

                            therapyDay: 0,
                            votes: true,
                        },
                    ],
                },
                trigerAction: 4,
                messageActions: [
                    {
                        chatID: 14,
                        text: 'На вас было совершено покушение...',
                    },
                    {
                        chatID: 15,
                        text: 'На вас было совершено покушение...',
                    },
                    {
                        chatID: 12,
                        text: 'На вас было совершено покушение...',
                    },
                    {
                        chatID: 14,
                        text: 'Кто-то сильно заинтересовался твоей ролью...',
                    },
                    {
                        chatID: 17,
                        text: 'Даша - Дон',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                dataGame: {
                    counterPlayers: 7,
                    counterTriada: 1,
                    counterMafia: 1,
                    counterWorld: 5,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        initialRole: 'Мирный житель',
                        actID: 0,
                        userID: 10,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: false,
                        role: 'Доктор',
                        initialRole: 'Доктор',
                        actID: 0,
                        userID: 11,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Мститель',
                        initialRole: 'Мститель',
                        actID: 14,
                        userID: 12,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Триада',
                        initialRole: 'Триада',
                        actID: 15,
                        userID: 13,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Даша',
                        role: 'Дон',
                        initialRole: 'Дон',
                        actID: 12,
                        userID: 14,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        initialRole: 'Красотка',
                        actID: 0,
                        userID: 15,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        initialRole: 'Счастливчик',
                        actID: 0,
                        userID: 16,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Комиссар',
                        initialRole: 'Комиссар',
                        copCheck: true,
                        actID: 14,
                        userID: 17,

                        therapyDay: 0,
                        votes: true,
                    },
                ],
            },
            cloneData: {
                dataGame: {
                    counterPlayers: 7,
                    counterTriada: 1,
                    counterMafia: 1,
                    counterWorld: 5,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        initialRole: 'Мирный житель',
                        actID: 0,
                        userID: 10,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: false,
                        role: 'Доктор',
                        initialRole: 'Доктор',
                        actID: 0,
                        userID: 11,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Мститель',
                        initialRole: 'Мститель',
                        actID: 14,
                        userID: 12,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Триада',
                        initialRole: 'Триада',
                        actID: 15,
                        userID: 13,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Даша',
                        role: 'Дон',
                        initialRole: 'Дон',
                        actID: 12,
                        userID: 14,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        initialRole: 'Красотка',
                        actID: 0,
                        userID: 15,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        initialRole: 'Счастливчик',
                        actID: 0,
                        userID: 16,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        role: 'Комиссар',
                        initialRole: 'Комиссар',
                        copCheck: true,
                        actID: 14,
                        userID: 17,

                        therapyDay: 0,
                        votes: true,
                    },
                ],
            },
        },
        {
            nameTest:
                'Мститель выстрелил в дона, триада выстрелил в дона, крёстный отец лишил голоса комиссара, а сенсей проверил комиссара, дон выстрелил в сенсея',
            result: {
                cloneData: {
                    dataGame: {
                        counterPlayers: 7,
                        counterTriada: 1,
                        counterMafia: 1,
                        counterWorld: 5,
                    },
                    players: [
                        {
                            lifeStatus: true,
                            name: 'Синий',
                            role: 'Мирный житель',
                            initialRole: 'Мирный житель',
                            actID: 0,
                            userID: 10,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            name: 'Тибиляев',
                            role: 'Доктор',
                            initialRole: 'Доктор',
                            actID: 0,
                            userID: 11,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            name: 'Коля',
                            role: 'Мститель',
                            initialRole: 'Мститель',
                            actID: 0,
                            userID: 12,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            name: 'Андрей',
                            role: 'Триада',
                            initialRole: 'Триада',
                            actID: 0,
                            userID: 13,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            name: 'Даша',
                            role: 'Дон',
                            initialRole: 'Дон',
                            actID: 0,
                            userID: 14,
                            
                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            name: 'Дидык',
                            role: 'Красотка',
                            initialRole: 'Красотка',
                            actID: 0,
                            userID: 15,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            name: 'Вика',
                            role: 'Счастливчик',
                            initialRole: 'Счастливчик',
                            actID: 0,
                            userID: 16,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: true,
                            name: 'Евгений',
                            role: 'Комиссар',
                            initialRole: 'Комиссар',
                            copCheck: true,
                            actID: 0,
                            userID: 17,

                            therapyDay: 0,
                            votes: false,
                        },
                        {
                            lifeStatus: true,
                            name: 'Саша',
                            role: 'Крёстный отец',
                            initialRole: 'Крёстный отец',
                            actID: 0,
                            userID: 18,

                            therapyDay: 0,
                            votes: true,
                        },
                        {
                            lifeStatus: false,
                            name: 'Юля',
                            role: 'Сенсей',
                            initialRole: 'Сенсей',
                            actID: 0,
                            userID: 19,
                            
                            therapyDay: 0,
                            votes: true,
                        },
                    ],
                },
                trigerAction: 4,
                messageActions: [
                    {
                        chatID: 14,
                        text: 'На вас было совершено покушение...',
                    },
                    {
                        chatID: 19,
                        text: 'На вас было совершено покушение...',
                    },
                    {
                        chatID: 17,
                        text: 'Вы уехали из города и не можете посетить дневное собрание...',
                    },
                    {
                        chatID: 17,
                        text: 'Кто-то сильно заинтересовался твоей ролью...',
                    },
                    {
                        chatID: 19,
                        text: 'Евгений - полицейский',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                dataGame: {
                    counterPlayers: 9,
                    counterTriada: 2,
                    counterMafia: 2,
                    counterWorld: 5,
                },
                players: [
                    {
                        lifeStatus: true,
                        name: 'Синий',
                        role: 'Мирный житель',
                        initialRole: 'Мирный житель',
                        actID: 0,
                        userID: 10,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: false,
                        name: 'Тибиляев',
                        role: 'Доктор',
                        initialRole: 'Доктор',
                        actID: 0,
                        userID: 11,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Коля',
                        role: 'Мститель',
                        initialRole: 'Мститель',
                        actID: 14,
                        userID: 12,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Андрей',
                        role: 'Триада',
                        initialRole: 'Триада',
                        actID: 14,
                        userID: 13,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Даша',
                        role: 'Дон',
                        initialRole: 'Дон',
                        actID: 19,
                        userID: 14,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Дидык',
                        role: 'Красотка',
                        initialRole: 'Красотка',
                        actID: 0,
                        userID: 15,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Вика',
                        role: 'Счастливчик',
                        initialRole: 'Счастливчик',
                        actID: 0,
                        userID: 16,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Евгений',
                        role: 'Комиссар',
                        initialRole: 'Комиссар',
                        copCheck: true,
                        actID: 0,
                        userID: 17,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Саша',
                        role: 'Крёстный отец',
                        initialRole: 'Крёстный отец',
                        actID: 17,
                        userID: 18,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Юля',
                        role: 'Сенсей',
                        initialRole: 'Сенсей',
                        actID: 17,
                        userID: 19,

                        therapyDay: 0,
                        votes: true,
                    },
                ],
            },
            cloneData: {
                dataGame: {
                    counterPlayers: 9,
                    counterTriada: 2,
                    counterMafia: 2,
                    counterWorld: 5,
                },
                players: [
                    {
                        lifeStatus: true,
                        name: 'Синий',
                        role: 'Мирный житель',
                        initialRole: 'Мирный житель',
                        actID: 0,
                        userID: 10,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: false,
                        name: 'Тибиляев',
                        role: 'Доктор',
                        initialRole: 'Доктор',
                        actID: 0,
                        userID: 11,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Коля',
                        role: 'Мститель',
                        initialRole: 'Мститель',
                        actID: 14,
                        userID: 12,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Андрей',
                        role: 'Триада',
                        initialRole: 'Триада',
                        actID: 14,
                        userID: 13,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Даша',
                        role: 'Дон',
                        initialRole: 'Дон',
                        actID: 19,
                        userID: 14,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Дидык',
                        role: 'Красотка',
                        initialRole: 'Красотка',
                        actID: 0,
                        userID: 15,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Вика',
                        role: 'Счастливчик',
                        initialRole: 'Счастливчик',
                        actID: 0,
                        userID: 16,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Евгений',
                        role: 'Комиссар',
                        initialRole: 'Комиссар',
                        copCheck: true,
                        actID: 0,
                        userID: 17,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Саша',
                        role: 'Крёстный отец',
                        initialRole: 'Крёстный отец',
                        actID: 17,
                        userID: 18,

                        therapyDay: 0,
                        votes: true,
                    },
                    {
                        lifeStatus: true,
                        name: 'Юля',
                        role: 'Сенсей',
                        initialRole: 'Сенсей',
                        actID: 17,
                        userID: 19,

                        therapyDay: 0,
                        votes: true,
                    },
                ],
            },
        },
    ];
    dataTest.forEach(item => {
        it(item.nameTest, () => {
            expect(
                shootingAndCheckingPlayers(item.data, item.cloneData, item.trigerAction, item.messageActions)
            ).toEqual(item.result);
        });
    });
});

describe('Проверка обработки хода медика', () => {
    const dataTest = [
        {
            nameTest: 'Вылечил убитого',
            result: {
                cloneData: {
                    dataGame: {
                        counterPlayers: 5,
                        counterTriada: 0,
                        counterMafia: 1,
                        counterWorld: 4,
                        counterDays: 2,
                    },
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 10,
                        },
                        {
                            lifeStatus: true,
                            role: 'Доктор',
                            actID: 0,
                            userID: 11,
                        },
                        {
                            lifeStatus: true,
                            role: 'Дон',
                            actID: 0,
                            userID: 12,
                        },
                        {
                            lifeStatus: true,
                            role: 'Красотка',
                            actID: 0,
                            userID: 13,

                            therapyDay: 0,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            actID: 0,
                            userID: 14,
                        },
                    ],
                },
                trigerAction: 1,
                messageActions: [
                    {
                        chatID: 13,
                        text: 'Но доктор успел вас спасти...',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                dataGame: {
                    counterPlayers: 4,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 3,
                    counterDays: 2,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: true,
                        role: 'Доктор',
                        actID: 13,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: false,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                        
                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
            cloneData: {
                dataGame: {
                    counterPlayers: 4,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 3,
                    counterDays: 2,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: true,
                        role: 'Доктор',
                        actID: 13,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: false,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                        
                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
        },
        {
            nameTest: 'Вылечил здорового первый раз',
            result: {
                cloneData: {
                    dataGame: {
                        counterPlayers: 4,
                        counterTriada: 0,
                        counterMafia: 1,
                        counterWorld: 3,
                        counterDays: 2,
                    },
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 10,
                            therapyDay: 2,
                        },
                        {
                            lifeStatus: true,
                            role: 'Доктор',
                            actID: 0,
                            userID: 11,
                        },
                        {
                            lifeStatus: true,
                            role: 'Дон',
                            actID: 0,
                            userID: 12,
                        },
                        {
                            lifeStatus: false,
                            role: 'Красотка',
                            actID: 0,
                            userID: 13,
                            
                            therapyDay: 0,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            actID: 0,
                            userID: 14,
                        },
                    ],
                },
                trigerAction: 1,
                messageActions: [
                    {
                        chatID: 10,
                        text: 'У вас болела голова и доктор дал вам таблетку...',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                dataGame: {
                    counterPlayers: 4,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 3,
                    counterDays: 2,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: true,
                        role: 'Доктор',
                        actID: 10,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: false,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                        
                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
            cloneData: {
                dataGame: {
                    counterPlayers: 4,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 3,
                    counterDays: 2,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: true,
                        role: 'Доктор',
                        actID: 10,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: false,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                        
                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
        },
        {
            nameTest: 'Врач убил пациента ибо лечил 2 раза подряд',
            result: {
                cloneData: {
                    dataGame: {
                        counterPlayers: 3,
                        counterTriada: 0,
                        counterMafia: 1,
                        counterWorld: 2,
                        counterDays: 4,
                    },
                    players: [
                        {
                            lifeStatus: false,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 10,
                            therapyDay: 4,
                            
                        },
                        {
                            lifeStatus: true,
                            role: 'Доктор',
                            actID: 0,
                            userID: 11,
                        },
                        {
                            lifeStatus: true,
                            role: 'Дон',
                            actID: 0,
                            userID: 12,
                        },
                        {
                            lifeStatus: false,
                            role: 'Красотка',
                            actID: 0,
                            userID: 13,
                            
                            therapyDay: 0,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            actID: 0,
                            userID: 14,
                        },
                    ],
                },
                trigerAction: 1,
                messageActions: [
                    {
                        chatID: 10,
                        text: 'Доктор принёс еще таблетки и у вас случилась передозировка... Можете сказать "спасибо" доктору в чате с игрой',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                dataGame: {
                    counterPlayers: 4,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 3,
                    counterDays: 4,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,

                        therapyDay: 2,
                    },
                    {
                        lifeStatus: true,
                        role: 'Доктор',
                        actID: 10,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: false,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                        
                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
            cloneData: {
                dataGame: {
                    counterPlayers: 4,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 3,
                    counterDays: 4,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,

                        therapyDay: 2,
                    },
                    {
                        lifeStatus: true,
                        role: 'Доктор',
                        actID: 10,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: false,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                        
                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
        },
    ];
    dataTest.forEach(item => {
        it(item.nameTest, () => {
            expect(medicMove(item.data, item.cloneData, item.trigerAction, item.messageActions)).toEqual(item.result);
        });
    });
});

describe('Проверка обработки хода телохранителя', () => {
    const dataTest = [
        {
            nameTest: 'Спас убитого',
            result: {
                cloneData: {
                    dataGame: {
                        counterPlayers: 5,
                        counterTriada: 0,
                        counterMafia: 1,
                        counterWorld: 4,
                        counterDays: 2,
                    },
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 10,
                        },
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 11,
                        },
                        {
                            lifeStatus: true,
                            role: 'Дон',
                            actID: 0,
                            userID: 12,
                        },
                        {
                            lifeStatus: true,
                            role: 'Красотка',
                            actID: 0,
                            userID: 13,

                            therapyDay: 0,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            actID: 0,
                            userID: 14,
                        },
                    ],
                },
                trigerAction: 1,
                messageActions: [
                    {
                        chatID: 13,
                        text: 'Но телохранитель вас спас и получил ранение...',
                    },
                    {
                        chatID: 11,
                        text: 'Вы спасли жителя, но получили ранение и больше не можете работать телохранителем...',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                dataGame: {
                    counterPlayers: 4,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 3,
                    counterDays: 2,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: true,
                        role: 'Телохранитель',
                        actID: 13,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: false,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                        
                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
            cloneData: {
                dataGame: {
                    counterPlayers: 4,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 3,
                    counterDays: 2,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: true,
                        role: 'Телохранитель',
                        actID: 13,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: false,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,
                        
                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
        },
        {
            nameTest: 'Поработал охранником, но нападения не было',
            result: {
                cloneData: {
                    dataGame: {
                        counterPlayers: 5,
                        counterTriada: 0,
                        counterMafia: 1,
                        counterWorld: 4,
                        counterDays: 2,
                    },
                    players: [
                        {
                            lifeStatus: true,
                            role: 'Мирный житель',
                            actID: 0,
                            userID: 10,
                        },
                        {
                            lifeStatus: true,
                            role: 'Телохранитель',
                            actID: 0,
                            userID: 11,
                        },
                        {
                            lifeStatus: true,
                            role: 'Дон',
                            actID: 0,
                            userID: 12,
                        },
                        {
                            lifeStatus: true,
                            role: 'Красотка',
                            actID: 0,
                            userID: 13,

                            therapyDay: 0,
                        },
                        {
                            lifeStatus: true,
                            role: 'Счастливчик',
                            actID: 0,
                            userID: 14,
                        },
                    ],
                },
                trigerAction: 1,
                messageActions: [
                    {
                        chatID: 13,
                        text: 'Телохранитель защищал вас всю ночь, но нападения не произошло...',
                    },
                ],
            },
            trigerAction: 0,
            messageActions: [],
            data: {
                dataGame: {
                    counterPlayers: 5,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 4,
                    counterDays: 2,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: true,
                        role: 'Телохранитель',
                        actID: 13,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,

                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
            cloneData: {
                dataGame: {
                    counterPlayers: 5,
                    counterTriada: 0,
                    counterMafia: 1,
                    counterWorld: 4,
                    counterDays: 2,
                },
                players: [
                    {
                        lifeStatus: true,
                        role: 'Мирный житель',
                        actID: 0,
                        userID: 10,
                    },
                    {
                        lifeStatus: true,
                        role: 'Телохранитель',
                        actID: 13,
                        userID: 11,
                    },
                    {
                        lifeStatus: true,
                        role: 'Дон',
                        actID: 0,
                        userID: 12,
                    },
                    {
                        lifeStatus: true,
                        role: 'Красотка',
                        actID: 0,
                        userID: 13,

                        therapyDay: 0,
                    },
                    {
                        lifeStatus: true,
                        role: 'Счастливчик',
                        actID: 0,
                        userID: 14,
                    },
                ],
            },
        },
    ];
    dataTest.forEach(item => {
        it(item.nameTest, () => {
            expect(bodyguardMove(item.data, item.cloneData, item.trigerAction, item.messageActions)).toEqual(
                item.result
            );
        });
    });
});
