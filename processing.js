// Определяем за кого проголосовали игроки
export function daytimeVotingProcessing(players) {
    let maxVoice = 0,
        counter = 0,
        index = 0,
        userNumber = null;
    //Находим наибольшее колличество голосов
    for (const player of players) {
        if (player.lifeStatus && player.votesAgainst > maxVoice) {
            maxVoice = player.votesAgainst;
        }
    }
    //Считаем у скольких игроков максимальное колличество голосов
    for (const player of players) {
        if (player.lifeStatus && player.votesAgainst === maxVoice) {
            counter += 1;
            userNumber = index;
        }
        index++;
    }
    return { counter, userNumber };
}

//Проверка на наличие победителей
export function checkingTheEndOfTheGame(dataGame) {
    let continueGame = true;
    let win = 0;
    if (dataGame.inactivePlay !== 0) {
        if (dataGame.counterWorld === 0 && dataGame.counterMafia === 0 && dataGame.counterTriada === 0) {
            win = 4;
        } else if (!dataGame.statysDay) {
            // конец дня
            if (dataGame.counterMafia === 0 && dataGame.counterTriada === 0) {
                win = 1;
            } else if (dataGame.counterWorld === 0 && dataGame.counterTriada === 0) {
                win = 2;
            } else if (dataGame.counterMafia === 0 && dataGame.counterWorld === 0) {
                win = 3;
            }
        } else {
            //Конец ночи
            if (dataGame.counterMafia === 0 && dataGame.counterTriada === 0) {
                win = 1;
            } else if (dataGame.counterWorld <= 1 && dataGame.counterMafia > 0 && dataGame.counterTriada === 0) {
                win = 2;
            } else if (dataGame.counterWorld <= 1 && dataGame.counterTriada > 0 && dataGame.counterMafia === 0) {
                win = 3;
            }
        }
    } else {
        win = 5;
    }
    if (win) {
        continueGame = false;
    }
    return { continueGame, win };
}

//Ход красотки
export function beautyMove(data, trigerAction, messageActions) {
    let i = 0;
    for (const player of data.players) {
        if (player.lifeStatus && player.role === 'Красотка' && player.actID !== 0) {
            const actID = player.actID;
            data.players[i].actID = 0;
            let j = 0;
            for (const playerAct of data.players) {
                if (playerAct.userID === actID) {
                    data.players[j].actID = 0;
                    trigerAction += 1;
                    messageActions.push({
                        chatID: actID,
                        text: 'Поздравляю, вы провели незабываемую ночь с девушкой своей мечты...',
                    });
                    break;
                }
                j++;
            }
            break;
        }
        i++;
    }
    return { data, trigerAction, messageActions };
}

//Стреляем по игрокам и проверяем их
export function shootingAndCheckingPlayers(data, cloneData, trigerAction, messageActions) {
    let i = 0;
    for (const player of data.players) {
        if (player.lifeStatus && player.actID !== 0) {
            if (
                player.role === 'Дон' ||
                (player.role === 'Комиссар' && !player.copCheck) ||
                player.role === 'Мститель' ||
                player.role === 'Триада'
            ) {
                let j = 0;
                const actID = player.actID;
                cloneData.players[i].actID = 0;
                for (const playerAct of cloneData.players) {
                    if (playerAct.lifeStatus && playerAct.userID === actID) {
                        cloneData.players[j].lifeStatus = false;
                        cloneData.players[j].therapyDay = 0;
                        cloneData = updateCounter(cloneData, j, true);
                        // data.players[j].therapyDay = 0;
                        trigerAction += 1;
                        messageActions.push({
                            chatID: actID,
                            text: 'На вас было совершено покушение...',
                        });
                        break;
                    }
                    j++;
                }
            } else if (
                (player.role === 'Комиссар' && player.copCheck) ||
                player.role === 'Сенсей' ||
                player.role === 'Крёстный отец'
            ) {
                let j = 0;
                const actID = player.actID,
                    checkingID = player.userID,
                    role = player.role;
                cloneData.players[i].actID = 0;
                for (const playerAct of data.players) {
                    if (playerAct.userID === actID) {
                        trigerAction += 1;
                        if (role === 'Крёстный отец') {
                            cloneData.players[j].votes = false;
                            messageActions.push({
                                chatID: actID,
                                text: 'Вы уехали из города и не можете посетить дневное собрание...',
                            });
                        } else {
                            messageActions.push({
                                chatID: actID,
                                text: 'Кто-то сильно заинтересовался твоей ролью...',
                            });
                        }
                        if (role === 'Комиссар') {
                            messageActions.push({
                                chatID: checkingID,
                                text: `${playerAct.name} - ${playerAct.role}`,
                            });
                        } else if (role === 'Сенсей') {
                            switch (playerAct.role) {
                                case 'Комиссар':
                                case 'Лейтенант':
                                    messageActions.push({
                                        chatID: checkingID,
                                        text: `${playerAct.name} - полицейский`,
                                    });
                                    break;
                                case 'Дон':
                                case 'Крёстный отец':
                                    messageActions.push({
                                        chatID: checkingID,
                                        text: `${playerAct.name} - мафия`,
                                    });
                                    break;
                                default:
                                    messageActions.push({
                                        chatID: checkingID,
                                        text: `${playerAct.name} - мирный`,
                                    });
                            }
                        }
                        break;
                    }
                    j++;
                }
            }
        }
        i++;
    };
    return { cloneData, trigerAction, messageActions };
}

//Медик оживляет или убивает игроков
export function medicMove(data, cloneData, trigerAction, messageActions) {
    let i = 0;
    for (const player of data.players) {
        if (player.lifeStatus && player.role === 'Доктор' && player.actID !== 0) {
            let j = 0;
            const actID = player.actID;
            cloneData.players[i].actID = 0;
            trigerAction += 1;
            for (const playerAct of cloneData.players) {
                if (playerAct.userID === actID) {
                    if (playerAct.lifeStatus) {
                        if (playerAct.therapyDay !== 0 && playerAct.therapyDay === cloneData.dataGame.counterDays - 2) {
                            cloneData.players[j].lifeStatus = false;
                            cloneData.players[j].therapyDay = cloneData.dataGame.counterDays;
                            cloneData = updateCounter(cloneData, j, true);
                            messageActions.push({
                                chatID: actID,
                                text: 'Доктор принёс еще таблетки и у вас случилась передозировка... Можете сказать "спасибо" доктору в чате с игрой',
                            });
                        } else {
                            cloneData.players[j].therapyDay = cloneData.dataGame.counterDays;
                            messageActions.push({
                                chatID: actID,
                                text: 'У вас болела голова и доктор дал вам таблетку...',
                            });
                        }
                    } else {
                        cloneData.players[j].lifeStatus = true;
                        cloneData.players[j].therapyDay = 0;
                        cloneData = updateCounter(cloneData, j, false);
                        messageActions.push({
                            chatID: actID,
                            text: 'Но доктор успел вас спасти...',
                        });
                    }
                    break;
                }
                j++;
            }
            break;
        }
        i++;
    }
    return { cloneData, trigerAction, messageActions };
}

//Телохранитель спасает игроков
export function bodyguardMove(data, cloneData, trigerAction, messageActions) {
    let i = 0;
    for (const player of data.players) {
        if (player.lifeStatus && player.role === 'Телохранитель' && player.actID !== 0) {
            let j = 0;
            const actID = player.actID;
            cloneData.players[i].actID = 0;
            trigerAction += 1;
            for (const playerAct of cloneData.players) {
                if (playerAct.userID === actID) {
                    if (playerAct.lifeStatus) {
                        messageActions.push({
                            chatID: actID,
                            text: 'Телохранитель защищал вас всю ночь, но нападения не произошло...',
                        });
                    } else {
                        cloneData.players[i].role = 'Мирный житель';
                        cloneData.players[j].lifeStatus = true;
                        cloneData = updateCounter(cloneData, j, false);
                        messageActions.push({
                            chatID: actID,
                            text: 'Но телохранитель вас спас и получил ранение...',
                        });
                        messageActions.push({
                            chatID: cloneData.players[i].userID,
                            text: 'Вы спасли жителя, но получили ранение и больше не можете работать телохранителем...',
                        });
                    }
                    break;
                }
                j++;
            }
            break;
        }
        i++;
    }
    return { cloneData, trigerAction, messageActions };
}

//Отправляем сообщения, если кого-то убили
export function killAndReassignRoles(data, cloneData, trigerAction, messageActions, ChatID) {
    let i = 0;
    let kill = 0;
    for (const player of data.players) {
        if (!player.lifeStatus && data.players[i].lifeStatus) {
            kill += 1;
            if (player.initialRole === 'Счастливчик') {
                if (Math.random() > 0.65) {
                    cloneData.players[i].lifeStatus = true;
                    cloneData = updateCounter(cloneData, i, false);
                    kill -= 1;
                    messageActions.push({
                        chatID: ChatID,
                        text: 'Этой ночью кому-то из жителей повезло...',
                    });
                    messageActions.push({
                        chatID: player.userID,
                        text: 'Этой ночью вам повезло и вы чудом выжили...',
                    });
                } else {
                    cloneData.players[i].dyingMessage = true;
                    messageActions.push({
                        chatID: player.userID,
                        text: 'Вас убили :(\nВы можешь отправить своё предсмертное сообщение в чате с игрой!',
                    });
                    messageActions.push({
                        chatID: ChatID,
                        text: `Этой ночью погиб ${player.name} - ${player.role}`,
                    });
                }
                break;
            } else {
                cloneData.players[i].dyingMessage = true;
                messageActions.push({
                    chatID: player.userID,
                    text: 'Вас убили :(\nВы можешь отправить своё предсмертное сообщение в чате с игрой!',
                });
                messageActions.push({
                    chatID: ChatID,
                    text: `Этой ночью погиб ${player.name} - ${player.role}`,
                });
            }
            if (player.initialRole === 'Дон') {
                let j = 0;
                for (const playerAct of cloneData.players) {
                    if (playerAct.lifeStatus && playerAct.role === 'Крёстный отец') {
                        cloneData.players[j].role = 'Дон';
                        messageActions.push({
                            chatID: playerAct.userID,
                            text: 'Дон убит, теперь вы глава мафии!',
                        });
                        break;
                    }
                    j++;
                }
            } else if (player.initialRole === 'Комиссар') {
                let j = 0;
                for (const playerAct of cloneData.players) {
                    if (playerAct.lifeStatus && playerAct.role === 'Лейтенант') {
                        cloneData.players[j].role = 'Комиссар';
                        messageActions.push({
                            chatID: playerAct.userID,
                            text: 'Комиссар убит, теперь вы возглавляете участок!',
                        });
                        break;
                    }
                    j++;
                }
            } else if (player.initialRole === 'Триада') {
                let j = 0;
                for (const playerAct of cloneData.players) {
                    if (playerAct.lifeStatus && playerAct.role === 'Сенсей') {
                        cloneData.players[j].role = 'Триада';
                        messageActions.push({
                            chatID: playerAct.userID,
                            text: 'Триада убита, теперь вы главный!',
                        });
                        break;
                    }
                    j++;
                }
            }
        }
        i++;
    }
    if (kill === 0) {
        messageActions.push({
            chatID: ChatID,
            text: 'Хм, этой ночью никто не умер...',
        });
    }
    return { cloneData, trigerAction, messageActions };
}

//Обрабатываем результаты ночи
export async function processingResultsNight(data, ChatID) {
    let messageActions = [];
    let trigerAction = 0;
    //Очищаем действия у того, к кому сходила красотка
    if (data.dataGame.counterPlayers >= 10) {
        ({ data, trigerAction, messageActions } = beautyMove(data, trigerAction, messageActions));
    }
    let cloneData = JSON.parse(JSON.stringify(data));
    //Стреляем по игрокам и проверяем их
    ({ cloneData, trigerAction, messageActions } = shootingAndCheckingPlayers(
        data,
        cloneData,
        trigerAction,
        messageActions
    ));
    //Ход медика, оживляем или убиваем игроков
    ({ cloneData, trigerAction, messageActions } = medicMove(data, cloneData, trigerAction, messageActions));
    //Ход телохранителя, спасаем игроков
    ({ cloneData, trigerAction, messageActions } = bodyguardMove(data, cloneData, trigerAction, messageActions));
    //Проверяем были ли действия ночью
    if (trigerAction !== 0) {
        cloneData.dataGame.inactivePlay = 5;
        //Отправляем в чат информацию, если кого-то убили
        ({ cloneData, trigerAction, messageActions } = killAndReassignRoles(
            data,
            cloneData,
            trigerAction,
            messageActions,
            ChatID
        ));
    }
    return { cloneData, trigerAction, messageActions };
}

//Обновляем счетчики жителей
function updateCounter(data, i, action) {
    if (action) {
        data.dataGame.counterPlayers -= 1;
        switch (data.players[i].initialRole) {
            case 'Триада':
            case 'Сенсей':
                data.dataGame.counterTriada -= 1;
                break;
            case 'Дон':
            case 'Крёстный отец':
                data.dataGame.counterMafia -= 1;
                break;
            default:
                data.dataGame.counterWorld -= 1;
        }
    } else {
        data.dataGame.counterPlayers += 1;
        switch (data.players[i].initialRole) {
            case 'Триада':
            case 'Сенсей':
                data.dataGame.counterTriada += 1;
                break;
            case 'Дон':
            case 'Крёстный отец':
                data.dataGame.counterMafia += 1;
                break;
            default:
                data.dataGame.counterWorld += 1;
        }
    }
    return data;
}
