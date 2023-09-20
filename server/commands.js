QBCore.Commands = {}
QBCore.Commands.List = {}
QBCore.Commands.IgnoreList = { // Ignore old perm levels while keeping backwards compatibility
    ['god']: true, // We don't need to create an ace because god is allowed all commands
    ['user']: true // We don't need to create an ace because builtin.everyone
}

var permissions = QBConfig.Server.Permissions
permissions.forEach(permission => {
    if(!QBCore.Commands.IgnoreList[permission]) {
        ExecuteCommand(`add_ace qbcore.${permission} ${permission} allow`)
    }
})

// Register & Refresh Commands

/**
 * Registers a new command to the QBCore.Commands list and sets the appropriate permissions.
 * 
 * @param {string} name - The name of the command.
 * @param {string} help - A brief description or help text for the command.
 * @param {Array} arguments - An array of expected arguments for the command.
 * @param {boolean} argsrequired - A flag indicating if the arguments are required.
 * @param {Function} callback - The function to be called when the command is executed.
 * @param {string} [permission='user'] - The permission level required to execute the command.
 * @param {...string} extraPerms - Additional permissions for the command.
 */
QBCore.Commands.Add = function(name, help, arguments, argsrequired, callback, permission = 'user', ...extraPerms) {
    let restricted = true // Default to restricted for all commands

    if (permission === 'user') {
        restricted = false // allow all users to use command
    }
    // Register command within fivem
    RegisterCommand(name, (source, args, rawCommand) => {
        if (argsrequired && args.length < arguments.length) {
            return emitNet('chat:addMessage', source, {
                color: [255, 0, 0],
                multiline: true,
                args: ["System", Lang.t("error.missing_args2")]
            })
        }
        callback(source, args, rawCommand)
    }, restricted)

    if (extraPerms && extraPerms.length) {
        extraPerms.push(permission)
        for (let i = 0; i < extraPerms.length; i++) {
            if (!QBCore.Commands.IgnoreList[extraPerms[i]]) { 
                // only create aces for extra perm levels
                ExecuteCommand(`add_ace qbcore.${extraPerms[i]} command.${name} allow`)
            }
        }
    } else {
        if (!QBCore.Commands.IgnoreList[permission]) {
            // only create aces for extra perm levels
            ExecuteCommand(`add_ace qbcore.${permission} command.${name} allow`);
        }
    }

    QBCore.Commands.List[name.toLowerCase()] = {
        name: name.toLowerCase(),
        permission: permission,
        help: help,
        arguments: arguments,
        argsrequired: argsrequired,
        callback: callback
    }
}

QBCore.Commands.Refresh = function (source) {
    var src = source
    var Player = QBCore.Functions.GetPlayer(src)
    var suggestions = []
    if (Player) {
        for (let command in QBCore.Commands.List) {
            var info = QBCore.Commands.List[command]
            var hasPerm = IsPlayerAceAllowed(String(src), `command.${command}`)
            if (hasPerm) {
                suggestions.push({
                    name: '/' + command,
                    help: info.help,
                    params: info.arguments
                })
            } else {
                emitNet('chat:removeSuggestion', src, '/' + command)
            }
        }
        emitNet('chat:addSuggestions', src, suggestions)
    }
}

// Teleport
QBCore.Commands.Add('tp', Lang.t("command.tp.help"), [
    { name: Lang.t("command.tp.params.x.name"), help: Lang.t("command.tp.params.x.help") },
    { name: Lang.t("command.tp.params.y.name"), help: Lang.t("command.tp.params.y.help") },
    { name: Lang.t("command.tp.params.z.name"), help: Lang.t("command.tp.params.z.help") }
], false, function(source, args) {
    if (args[0] && !args[1] && !args[2]) {
        if (!isNaN(args[0])) {
            var target = GetPlayerPed(parseInt(args[0]))
            if (target !== 0) {
                let coords = GetEntityCoords(target)
                emitNet('QBCore:Command:TeleportToPlayer', source, coords)
            } else {
                emitNet('QBCore:Notify', source, Lang.t('error.not_online'), 'error')
            }
        } else {
            var location = QBShared.Locations[args[0]]
            if (location) {
                emitNet('QBCore:Command:TeleportToCoords', source, location.x, location.y, location.z, location.w)
            } else {
                emitNet('QBCore:Notify', source, Lang.t('error.location_not_exist'), 'error')
            }
        }
    } else {
        if (args[0] && args[1] && args[2]) {
            let x = parseFloat(args[0].replace(",",""))
            let y = parseFloat(args[1].replace(",",""))
            let z = parseFloat(args[2].replace(",",""))
            if (x !== 0 && y !== 0 && z !== 0) {
                emitNet('QBCore:Command:TeleportToCoords', source, x, y, z)
            } else {
                emitNet('QBCore:Notify', source, Lang.t('error.wrong_format'), 'error')
            }
        } else {
            emitNet('QBCore:Notify', source, Lang.t('error.missing_args'), 'error')
        }
    }
}, 'admin')

QBCore.Commands.Add('tpm', Lang.t("command.tpm.help"), [], false, function(source) {
    emitNet('QBCore:Command:GoToMarker', source)
}, 'admin')

QBCore.Commands.Add('togglepvp', Lang.t("command.togglepvp.help"), [], false, function() {
    QBConfig.Server.PVP = !QBConfig.Server.PVP
    emitNet('QBCore:Client:PvpHasToggled', -1, QBConfig.Server.PVP)
}, 'admin')

// Permissions

QBCore.Commands.Add('addpermission', Lang.t("command.addpermission.help"), [
    { name: Lang.t("command.addpermission.params.id.name"), help: Lang.t("command.addpermission.params.id.help") },
    { name: Lang.t("command.addpermission.params.permission.name"), help: Lang.t("command.addpermission.params.permission.help") }
], true, function(source, args) {
    var Player = QBCore.Functions.GetPlayer(Number(args[0]))
    var permission = args[1].toLowerCase()
    if (Player) {
        QBCore.Functions.AddPermission(Player.PlayerData.source, permission)
    } else {
        emitNet('QBCore:Notify', source, Lang.t('error.not_online'), 'error')
    }
}, 'god')

QBCore.Commands.Add('removepermission', Lang.t("command.removepermission.help"), [
    { name: Lang.t("command.removepermission.params.id.name"), help: Lang.t("command.removepermission.params.id.help") },
    { name: Lang.t("command.removepermission.params.permission.name"), help: Lang.t("command.removepermission.params.permission.help") }
], true, (source, args) => {
    var Player = QBCore.Functions.GetPlayer(Number(args[0]))
    var permission = args[1].toLowerCase()
    if (Player) {
        QBCore.Functions.RemovePermission(Player.PlayerData.source, permission)
    } else {
        emitNet('QBCore:Notify', source, Lang.t('error.not_online'), 'error')
    }
}, 'god')

// Open & Close Server

QBCore.Commands.Add('openserver', Lang.t("command.openserver.help"), [], false, (source) => {
    if (!QBConfig.Server.Closed) {
        emitNet('QBCore:Notify', source, Lang.t('error.server_already_open'), 'error')
        return
    }
    if (QBCore.Functions.HasPermission(source, 'admin')) {
        QBConfig.Server.Closed = false
        emitNet('QBCore:Notify', source, Lang.t('success.server_opened'), 'success')
    } else {
        QBCore.Functions.Kick(source, Lang.t("error.no_permission"), null, null);
    }
}, 'admin')

QBCore.Commands.Add('closeserver', Lang.t("command.closeserver.help"), [{ name: Lang.t("command.closeserver.params.reason.name"), help: Lang.t("command.closeserver.params.reason.help") }], false, (source, args) => {
    if (QBConfig.Server.Closed) {
        emitNet('QBCore:Notify', source, Lang.t('error.server_already_closed'), 'error')
        return
    }
    if (QBCore.Functions.HasPermission(source, 'admin')) {
        var reason = args[0] || 'No reason specified'
        QBConfig.Server.Closed = true
        QBConfig.Server.ClosedReason = reason
        for (let k in QBCore.Players) {
            if (!QBCore.Functions.HasPermission(k, QBConfig.Server.WhitelistPermission)) {
                QBCore.Functions.Kick(k, reason, null, null)
            }
        }
        emitNet('QBCore:Notify', source, Lang.t('success.server_closed'), 'success')
    } else {
        QBCore.Functions.Kick(source, Lang.t("error.no_permission"), null, null)
    }
}, 'admin')

// Vehicle

QBCore.Commands.Add('car', Lang.t("command.car.help"), [{ name: Lang.t("command.car.params.model.name"), help: Lang.t("command.car.params.model.help") }], true, (source, args) => {
    emitNet('QBCore:Command:SpawnVehicle', source, args[0])
}, 'admin')

QBCore.Commands.Add('dv', Lang.t("command.dv.help"), [], false, (source) => {
    emitNet('QBCore:Command:DeleteVehicle', source)
}, 'admin')

// Money

QBCore.Commands.Add('givemoney', Lang.t("command.givemoney.help"), [{ name: Lang.t("command.givemoney.params.id.name"), help: Lang.t("command.givemoney.params.id.help") }, { name: Lang.t("command.givemoney.params.moneytype.name"), help: Lang.t("command.givemoney.params.moneytype.help") }, { name: Lang.t("command.givemoney.params.amount.name"), help: Lang.t("command.givemoney.params.amount.help") }], true, (source, args) => {
    var Player = QBCore.Functions.GetPlayer(Number(args[0]))
    if (Player) {
        Player.Functions.AddMoney(args[1].toString(), Number(args[2]))
    } else {
        emitNet('QBCore:Notify', source, Lang.t('error.not_online'), 'error')
    }
}, 'admin')

QBCore.Commands.Add('setmoney', Lang.t("command.setmoney.help"), [ { name: Lang.t("command.setmoney.params.id.name"), help: Lang.t("command.setmoney.params.id.help") }, { name: Lang.t("command.setmoney.params.moneytype.name"), help: Lang.t("command.setmoney.params.moneytype.help") }, { name: Lang.t("command.setmoney.params.amount.name"), help: Lang.t("command.setmoney.params.amount.help") }], true, (source, args) => {
    var Player = QBCore.Functions.GetPlayer(Number(args[0]))
    if (Player) {
        Player.Functions.SetMoney(args[1].toString(), Number(args[2]))
    } else {
        emitNet('QBCore:Notify', source, Lang.t('error.not_online'), 'error')
    }
}, 'admin')

// Job

QBCore.Commands.Add('job', Lang.t("command.job.help"), [], false, (source) => {
    var PlayerJob = QBCore.Functions.GetPlayer(source).PlayerData.job
    emitNet('QBCore:Notify', source, Lang.t('info.job_info', { value: PlayerJob.label, value2: PlayerJob.grade.name, value3: PlayerJob.onduty }))
}, 'user')

QBCore.Commands.Add('setjob', Lang.t("command.setjob.help"), [ { name: Lang.t("command.setjob.params.id.name"), help: Lang.t("command.setjob.params.id.help") }, { name: Lang.t("command.setjob.params.job.name"), help: Lang.t("command.setjob.params.job.help") }, { name: Lang.t("command.setjob.params.grade.name"), help: Lang.t("command.setjob.params.grade.help") }], true, (source, args) => {
    var Player = QBCore.Functions.GetPlayer(Number(args[0]))
    if (Player) {
        Player.Functions.SetJob(args[1].toString(), parseInt(args[2]))
    } else {
        emitNet('QBCore:Notify', source, Lang.t('error.not_online'), 'error')
    }
}, 'admin')

// Gang


QBCore.Commands.Add('gang', Lang.t("command.gang.help"), [], false, (source) => {
    var PlayerGang = QBCore.Functions.GetPlayer(source).PlayerData.gang
    emitNet('QBCore:Notify', source, Lang.t('info.gang_info', {value: PlayerGang.label, value2: PlayerGang.grade.name}))
}, 'user')

QBCore.Commands.Add('setgang', Lang.t("command.setgang.help"), [{ name: Lang.t("command.setgang.params.id.name"), help: Lang.t("command.setgang.params.id.help") }, { name: Lang.t("command.setgang.params.gang.name"), help: Lang.t("command.setgang.params.gang.help") }, { name: Lang.t("command.setgang.params.grade.name"), help: Lang.t("command.setgang.params.grade.help") }], true, (source, args) => {
    var Player = QBCore.Functions.GetPlayer(Number(args[0]))
    if (Player) {
        Player.Functions.SetGang(String(args[1]), Number(args[2]))
    } else {
        emitNet('QBCore:Notify', source, Lang.t('error.not_online'), 'error')
    }
},'admin')

// Out of Character Chat
QBCore.Commands.Add('ooc', Lang.t("command.ooc.help"), [], false, (source, args) => {
    var message = args.join(' ');
    var Players = QBCore.Functions.GetPlayers()
    var Player = QBCore.Functions.GetPlayer(source)
    var playerCoords = GetEntityCoords(GetPlayerPed(source))
    Players.forEach(v => {
        if (v === source) {
            emitNet('chat:addMessage', v, {
                color: QBConfig.Commands.OOCColor,
                multiline: true,
                args: ['OOC | ' + GetPlayerName(source), message]
            })
        } else if (distance(playerCoords, GetEntityCoords(GetPlayerPed(v))) < 20.0) {
            emitNet('chat:addMessage', v, {
                color: QBConfig.Commands.OOCColor,
                multiline: true,
                args: ['OOC | ' + GetPlayerName(source), message]
            });
        } else if (QBCore.Functions.HasPermission(v, 'admin')) {
            if (QBCore.Functions.IsOptin(v)) {
                emitNet('chat:addMessage', v, {
                    color: QBConfig.Commands.OOCColor,
                    multiline: true,
                    args: ['Proximity OOC | ' + GetPlayerName(source), message]
                });
                emitNet('qb-log:server:CreateLog', 'ooc', 'OOC', 'white', '**' + GetPlayerName(source) + '** (CitizenID: ' + Player.PlayerData.citizenid + ' | ID: ' + source + ') **Message:** ' + message, false);
            }
        }
    })
},
'user')

function distance(vector1, vector2) {
    return Math.sqrt(Math.pow(vector2.x - vector1.x, 2) + Math.pow(vector2.y - vector1.y, 2) + Math.pow(vector2.z - vector1.z, 2));
}

// Me command

QBCore.Commands.Add('me', Lang.t("command.me.help"), [ { name: Lang.t("command.me.params.message.name"), help: Lang.t("command.me.params.message.help")} ], false, function(source, args) {
    if (args.length < 1) {
        emitNet('QBCore:Notify', source, Lang.t('error.missing_args2'), 'error')
        return
    }
    var ped = GetPlayerPed(source);
    var pCoords = GetEntityCoords(ped);
    var msg = args.join(' ').replace(/[~<].*[>~]/g, '')
    var Players = QBCore.Functions.GetPlayers()

    for (let i = 0; i < Players.length; i++) {
        var Player = Players[i]
        var target = GetPlayerPed(Player)
        var tCoords = GetEntityCoords(target)
        if (target === ped || distance(pCoords, tCoords) < 20) {
            emit('QBCore:Command:ShowMe3D', source, msg)
        }
    }
}, 'user')

RegisterCommand('a', (source, args, rawCommand) => {
    // emitNet('QBCore:Command:SpawnVehicle', source, args)
}, false) // REMOVER