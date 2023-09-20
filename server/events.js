// Event Handler

on('chatMessage', (source, name, message) => {
    if (message.charAt(0) === '/') {
        CancelEvent()
        return
    }
})

on('playerDropped', function(reason) {
    var src = source
    if (!QBCore.Players[src]) return
    var Player = QBCore.Players[src]
    TriggerEvent('qb-log:server:CreateLog', 'joinleave', 'Dropped', 'red', '**' + GetPlayerName(src) + '** (' + Player.PlayerData.license + ') left+' +'\n **Reason:** ' + reason)
    Player.Functions.Save()
    delete QBCore.Player_Buckets[Player.PlayerData.license]
    delete QBCore.Players[src]
})

// Player Connecting

onPlayerConnecting = function (name, _, deferrals) {
    var src = source
    var license
    var identifiers = QBCore.Functions.GetPlayerIdentifiers(src)
    console.log(identifiers)
    deferrals.defer()

    // Mandatory wait
    Wait(0)

    if (QBCore.Config.Server.Closed) {
        if (!IsPlayerAceAllowed(src, 'qbadmin.join')) {
            deferrals.done(QBCore.Config.Server.ClosedReason)
        }
    }

    for (let key in identifiers) {
        if (key === 'license') {
            license = identifiers[key]
            break
        }
    }

    if (GetConvarInt("sv_fxdkMode", false)) {
        license = 'license:AAAAAAAAAAAAAAAA' // Dummy License
    }

    if (!license) {
        deferrals.done(Lang.t('error.no_valid_license'))
    } else if (QBCore.Config.Server.CheckDuplicateLicense && QBCore.Functions.IsLicenseInUse(license)) {
        deferrals.done(Lang.t('error.duplicate_license'))
    }

    var databaseTime = Date.now()
    // conduct database-dependant checks
        deferrals.update(Lang.t('info.checking_ban'), name)
        try {
            var {isBanned, Reason} = QBCore.Functions.IsPlayerBanned(src)
            if (isBanned) {
                deferrals.done(Reason)
                return
            }

            if (QBCore.Config.Server.Whitelist) {
                deferrals.update(Lang.t('info.checking_whitelisted'), name)
                if (!QBCore.Functions.IsWhitelisted(src)) {
                    deferrals.done(Lang.t('error.not_whitelisted'))
                }
            }

            deferrals.update(Lang.t('info.join_server'), name)
            deferrals.done()

        
        } catch (databaseError) {
            deferrals.done(Lang.t('error.connecting_database_error'))
            console.error(databaseError)
        }

    // if conducting checks for too long then raise error
    if (Date.now() - databaseTime > 30000) {
        deferrals.done(Lang.t('error.connecting_database_timeout'))
        console.error(Lang.t('error.connecting_database_timeout'))
        Wait(1000)
    }
    // Add any additional defferals you may need!
}

on('playerConnecting', onPlayerConnecting)

// Open & Close Server (prevents players from joining)

RegisterNetEvent('QBCore:Server:CloseServer', function(reason) {
    var src = source
    if (QBCore.Functions.HasPermission(src, 'admin')) {
        reason = reason || 'No reason specified'
        QBCore.Config.Server.Closed = true
        QBCore.Config.Server.ClosedReason = reason
        for(let playerKey in QBCore.Players) {
            let k = QBCore.Players[playerKey]
            if (!QBCore.Functions.HasPermission(k, QBCore.Config.Server.WhitelistPermission)) {
                QBCore.Functions.Kick(k, reason, null, null)
            }
        }
    } else {
        QBCore.Functions.Kick(src, Lang.t("error.no_permission"), null, null)
    }
})


// Callback Events

// Client Callback
RegisterNetEvent('QBCore:Server:TriggerClientCallback', function(name, ...args) {
    if (QBCore.ClientCallbacks[name]) {
        QBCore.ClientCallbacks[name](...args)
        delete QBCore.ClientCallbacks[name]
    }
})

// Server Callback
RegisterNetEvent('QBCore:Server:TriggerCallback', function(name, ...args) {
    var src = source
    QBCore.Functions.TriggerCallback(name, src, function(...args) {
        TriggerClientEvent('QBCore:Client:TriggerCallback', src, name, ...args)
    }, ...args)
})

// Player

RegisterNetEvent('QBCore:UpdatePlayer', function() {
    var src = source
    var Player = QBCore.Functions.GetPlayer(src)
    if (!Player) return
    var newHunger = Player.PlayerData.metadata['hunger'] - QBCore.Config.Player.HungerRate
    var newThirst = Player.PlayerData.metadata['thirst'] - QBCore.Config.Player.ThirstRate
    if (newHunger <= 0) {
        newHunger = 0
    }
    if (newThirst <= 0) {
        newThirst = 0
    }
    Player.Functions.SetMetaData('thirst', newThirst)
    Player.Functions.SetMetaData('hunger', newHunger)
    TriggerClientEvent('hud:client:UpdateNeeds', src, newHunger, newThirst)
    Player.Functions.Save()
})

RegisterNetEvent('QBCore:ToggleDuty', function() {
    var src = source
    var Player = QBCore.Functions.GetPlayer(src)
    if (!Player) return
    if (Player.PlayerData.job.onduty) {
        Player.Functions.SetJobDuty(false)
        TriggerClientEvent('QBCore:Notify', src, Lang.t('info.off_duty'))
    } else {
        Player.Functions.SetJobDuty(true)
        TriggerClientEvent('QBCore:Notify', src, Lang.t('info.on_duty'))
    }   
    TriggerEvent('QBCore:Server:SetDuty', src, Player.PlayerData.job.onduty)
    TriggerClientEvent('QBCore:Client:SetDuty', src, Player.PlayerData.job.onduty)
})

// BaseEvents

// Vehicles
RegisterServerEvent('baseevents:enteringVehicle', function(veh, seat, modelName) {
    var src = source
    var data = {
        vehicle: veh,
        seat: seat,
        name: modelName,
        event: 'Entering'
    }
    TriggerClientEvent('QBCore:Client:VehicleInfo', src, data)
})

RegisterServerEvent('baseevents:enteredVehicle', function(veh, seat, modelName) {
    var src = source
    var data = {
        vehicle: veh,
        seat: seat,
        name: modelName,
        event: 'Entered'
    }
    TriggerClientEvent('QBCore:Client:VehicleInfo', src, data)
})

RegisterServerEvent('baseevents:enteringAborted', function() {
    var src = source
    TriggerClientEvent('QBCore:Client:AbortVehicleEntering', src)
})

RegisterServerEvent('baseevents:leftVehicle', function(veh, seat, modelName) {
    var src = source
    var data = {
        vehicle: veh,
        seat: seat,
        name: modelName,
        event: 'Left'
    }
    TriggerClientEvent('QBCore:Client:VehicleInfo', src, data)
})

// Items

// This event is exploitable and should not be used. It has been deprecated, and will be removed soon.
RegisterNetEvent('QBCore:Server:UseItem', function(item) {
    var src = source
    console.log(`${GetInvokingResource()} triggered QBCore:Server:UseItem by ID ${src} with the following data. This event is deprecated due to exploitation, and will be removed soon. Check qb-inventory for the right use on this event.`)
    QBCore.Debug(item)
})

// This event is exploitable and should not be used. It has been deprecated, and will be removed soon. function(itemName, amount, slot)
RegisterNetEvent('QBCore:Server:RemoveItem', function(itemName, amount) {
    var src = source
    console.log(`${GetInvokingResource()} triggered QBCore:Server:RemoveItem by ID ${src} for ${amount} ${itemName}. This event is deprecated due to exploitation, and will be removed soon. Adjust your events accordingly to do this server side with player functions.`)
})

// This event is exploitable and should not be used. It has been deprecated, and will be removed soon. function(itemName, amount, slot, info)
RegisterNetEvent('QBCore:Server:AddItem', function(itemName, amount) {
    var src = source
    console.log(`${GetInvokingResource()} triggered QBCore:Server:AddItem by ID ${src} for ${amount} ${itemName}. This event is deprecated due to exploitation, and will be removed soon. Adjust your events accordingly to do this server side with player functions.`)
})

// Non-Chat Command Calling (ex: qb-adminmenu)

RegisterNetEvent('QBCore:CallCommand', (command, args) => {
    var src = source
    if (!QBCore.Commands.List[command]) return
    var Player = QBCore.Functions.GetPlayer(src)
    if (!Player) return
    var hasPerm = QBCore.Functions.HasPermission(src, "command." + QBCore.Commands.List[command].name)
    if (hasPerm) {
        if (QBCore.Commands.List[command].argsrequired &&
            QBCore.Commands.List[command].arguments.length !== 0 &&
            !args[QBCore.Commands.List[command].arguments.length - 1]) {
            emitNet('QBCore:Notify', src, Lang.t('error.missing_args2'), 'error')
        } else {
            QBCore.Commands.List[command].callback(src, args)
        }
    } else {
        emitNet('QBCore:Notify', src, Lang.t('error.no_access'), 'error')
    }
})

// Use this for player vehicle spawning
// Vehicle server-side spawning callback (netId)
// use the netid on the client with the NetworkGetEntityFromNetworkId native
// convert it to a vehicle via the NetToVeh native
QBCore.Functions.CreateCallback('QBCore:Server:SpawnVehicle', function(source, cb, model, coords, warp) {
    var veh = QBCore.Functions.SpawnVehicle(source, model, coords, warp)
    cb(NetworkGetNetworkIdFromEntity(veh))
})

// Use this for long distance vehicle spawning
// vehicle server-side spawning callback (netId)
// use the netid on the client with the NetworkGetEntityFromNetworkId native
// convert it to a vehicle via the NetToVeh native
QBCore.Functions.CreateCallback('QBCore:Server:CreateVehicle', function(source, cb, model, coords, warp) {
    var veh = QBCore.Functions.CreateAutomobile(source, model, coords, warp)
    cb(NetworkGetNetworkIdFromEntity(veh))
})

//QBCore.Functions.CreateCallback('QBCore:HasItem', function(source, cb, items, amount)
// https://github.com/qbcore-framework/qb-inventory/blob/e4ef156d93dd1727234d388c3f25110c350b3bcf/server/main.lua#L2066
//end)