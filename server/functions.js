QBCore.Functions = {}
QBCore.Player_Buckets = {}
QBCore.Entity_Buckets = {}
QBCore.UsableItems = {}

/**
 * Gets the coordinates of an entity
 * 
 * @param {number} entity 
 * @returns {Object}
 */
QBCore.Functions.GetCoords = function (entity) {
    var coords = GetEntityCoords(entity, false)
    var heading = GetEntityHeading(entity)
    return {
        x: coords[0],
        y: coords[1],
        z: coords[2],
        h: heading
    }
}

/**
 * Gets player identifier of the given type
 * 
 * @param {any} source 
 * @param {string} idtype 
 * @returns {string|null}
 */
QBCore.Functions.GetIdentifier = function (source, idtype) {
    var identifiers = GetPlayerIdentifierByType(source, idtype)
    if (identifiers) return identifiers
    return null
}

/**
 * Gets player identifiers
 * 
 * @param {any} source
 * @returns {object}
 */
QBCore.Functions.GetPlayerIdentifiers = function (source) {
    var ids = ['steamid', 'license', 'discord', 'xbl', 'liveid', 'ip']
    var result = {}
    for (let id of ids) {
        var res = GetPlayerIdentifierByType(source, id)
        result[id] = res
    }
    return result
}

/**
 * Gets a players server id (source). Returns 0 if no player is found.
 * 
 * @param {string} identifier 
 * @returns {number}
 */
QBCore.Functions.GetSource = function (identifier) {
    for (let [src, _] of  QBCore.Players) {
        var idens = QBCore.Functions.GetPlayerIdentifiers(src)
        for (let key in idens) {
            if (key === 'license') {
                if (idens[key] === identifier) {
                    return src
                }
            }
        }
    }
    return 0
}

/**
 * Get player with given server id (source)
 * 
 * @param {any} source 
 * @returns {Object}
 */
QBCore.Functions.GetPlayer = function (source) {
    if (typeof source === 'number') {
        return QBCore.Players[source]
    } else {
        return QBCore.Players[QBCore.Functions.GetSource(source)]
    }
}

/**
 * Get player by citizen id
 * 
 * @param {string} citizenid 
 * @returns {Object|null}
 */
QBCore.Functions.GetPlayerByCitizenId = function (citizenid) {
    for (let src in QBCore.Players) {
        if (QBCore.Players[src].PlayerData.citizenid === citizenid) {
            return QBCore.Players[src]
        }
    }    
    return null
}

/**
 * Get offline player by citizen id
 * 
 * @param {string} citizenid 
 * @returns {Object|null}
 */
QBCore.Functions.GetOfflinePlayerByCitizenId = function (citizenid) {
    return QBCore.Player.GetOfflinePlayer(citizenid)
}

/**
 * Get player by phone number
 * 
 * @param {number} number 
 * @returns {Object|null}
 */
QBCore.Functions.GetPlayerByPhone = function (number) {
    for (let src in QBCore.Players) {
        if (QBCore.Players[src].PlayerData.charinfo.phone == number) {
            return QBCore.Players[src]
        }
    }
    return null
}

/**
 * Get all players. Returns the server ids of all players.
 * 
 * @returns {Object}
 */
QBCore.Functions.GetPlayers = function () {
    var sources = []
    for (let k in QBCore.Players) {
        sources.push(k)
    }
    return sources
}

/**
 * Will return an array of QB Player class instances
 * unlike the GetPlayers() wrapper which only returns IDs.
 * 
 * @returns {Object[]}
 */
QBCore.Functions.GetQBPlayers = function () {
    return QBCore.Players
}

/**
 * Gets a list of all on duty players of a specified job and the number.
 * 
 * @param {string} job 
 * @returns {Array<Object>, number}
 */
QBCore.Functions.GetPlayersOnDuty = function (job) {
    var players = []
    var count = 0
    for (let src in QBCore.Players) {
        var Player = QBCore.Players[src]
        if (Player.PlayerData.job.name === job) {
            if (Player.PlayerData.job.onduty) {
                players.push(src)
                count++
            }
        }
    }
    return { players, count }
}

/**
 * Returns only the amount of players on duty for the specified job.
 * 
 * @param {any} job 
 * @returns {number}
 */
QBCore.Functions.GetDutyCount = function (job) {
    var count = 0
    for (let src in QBCore.Players) {
        var Player = QBCore.Players[src]
        if (Player.PlayerData.job.name === job && Player.PlayerData.job.onduty) {
            count++
        }
    }
    return count
}

// Routing buckets (Only touch if you know what you are doing)

/**
 * Returns the objects related to buckets, first returned value is the player buckets, second one is entity buckets.
 * 
 * @returns {Array<Object>, Array<Object>}
 */
QBCore.Functions.GetBucketObjects = function () {
    return {
        playerBuckets: QBCore.Player_Buckets,
        entityBuckets: QBCore.Entity_Buckets
    }
}

/**
 * Will set the provided player id / source into the provided bucket id.
 * 
 * @param {any} source 
 * @param {any} bucket 
 * @returns {boolean}
 */
QBCore.Functions.SetPlayerBucket = function (source, bucket) {
    if (source && bucket) {
        var plicense = QBCore.Functions.GetIdentifier(source, 'license')
        SetPlayerRoutingBucket(source, bucket)
        QBCore.Player_Buckets[plicense] = {id: source, bucket: bucket}
        return true
    } else {
        return false
    }
}

/**
 * Will set any entity into the provided bucket, for example peds / vehicles / props / etc.
 * 
 * @param {number} entity 
 * @param {number} bucket 
 * @returns {boolean}
 */
QBCore.Functions.SetEntityBucket = function (entity, bucket) {
    if (entity && bucket) {
        SetEntityRoutingBucket(entity, bucket)
        QBCore.Entity_Buckets[entity] = {id: entity, bucket: bucket}
        return true
    } else {
        return false
    }
}

/**
 * Will return an array of all the player ids inside the current bucket.
 * 
 * @param {number} bucket 
 * @returns {Array<number>|boolean}
 */
QBCore.Functions.GetPlayersInBucket = function (bucket) {
    var curr_bucket_pool = []
    if (QBCore.Player_Buckets && Object.keys(QBCore.Player_Buckets).length) {
        for (let key in QBCore.Player_Buckets) {
            if (QBCore.Player_Buckets[key].bucket === bucket) {
                curr_bucket_pool.push(QBCore.Player_Buckets[key].id)
            }
        }
        return curr_bucket_pool
    } else {
        return false
    }
}

/**
 * Will return an array of all the entities inside the current bucket
 * (not for player entities, use GetPlayersInBucket for that).
 * 
 * @param {number} bucket 
 * @returns {Array|boolean}
 */
QBCore.Functions.GetEntitiesInBucket = function (bucket) {
    var curr_bucket_pool = []
    if (QBCore.Entity_Buckets && Object.keys(QBCore.Entity_Buckets).length) {
        for (let key in QBCore.Entity_Buckets) {
            if (QBCore.Entity_Buckets[key].bucket === bucket) {
                curr_bucket_pool.push(QBCore.Entity_Buckets[key].id)
            }
        }
        return curr_bucket_pool
    } else {
        return false
    }
}

/**
 * Server side vehicle creation with optional callback.
 * The CreateVehicle RPC still uses the client for creation so players must be near.
 * 
 * @param {any} source 
 * @param {any} model 
 * @param {Object} coords 
 * @param {boolean} warp 
 * @returns {number}
 */
QBCore.Functions.SpawnVehicle = function (source, model, coords, warp) {
    var ped = GetPlayerPed(source)
    model = typeof model === 'string' ? GetHashKey(model) : model
    if (!coords) coords = GetEntityCoords(ped)
    var heading = coords[3] ? coords[3] : 0.0
    var veh = CreateVehicle(model, coords[0], coords[1], coords[2], heading, true, true)
    while (!DoesEntityExist(veh)) Wait(0)
    if (warp) {
        while (GetVehiclePedIsIn(ped) !== veh) {
            Wait(0)
            TaskWarpPedIntoVehicle(ped, veh, -1)
        }
    }
    while (NetworkGetEntityOwner(veh) !== source) Wait(0)
    return veh
}

/**
 * Server side vehicle creation with optional callback.
 * The CreateAutomobile native is still experimental but doesn't use client for creation.
 * Doesn't work for all vehicles!
 * 
 * @param {any} source 
 * @param {any} model 
 * @param {Object} coords 
 * @param {boolean} warp 
 * @returns {number}
 */
QBCore.Functions.CreateAutomobile = function (source, model, coords, warp) {
    model = typeof model === 'string' ? GetHashKey(model) : model
    if (!coords) coords = GetEntityCoords(GetPlayerPed(source))
    var heading = coords.w ? coords.w : 0.0
    var CreateAutomobile = GetHashKey('CREATE_AUTOMOBILE')
    var veh = Citizen.invokeNative(CreateAutomobile, model, coords, heading, true, true)
    while (!DoesEntityExist(veh)) Wait(0)
    if (warp) TaskWarpPedIntoVehicle(GetPlayerPed(source), veh, -1)
    return veh
}

/**
 * New & more reliable server side native for creating vehicles.
 * 
 * @param {any} source 
 * @param {any} model 
 * @param {any} vehtype - The appropriate vehicle type for the model info.
 *                        Can be one of automobile, bike, boat, heli, plane, submarine, trailer, and (potentially) train.
 *                        This should be the same type as the type field in vehicles.meta.
 * @param {Object} coords 
 * @param {boolean} warp 
 * @returns {number}
 */
QBCore.Functions.CreateVehicle = function (source, model, vehtype, coords, warp) {
    model = typeof model === 'string' ? GetHashKey(model) : model
    vehtype = typeof vehtype === 'string' ? String(vehtype) : vehtype
    if (!coords) coords = GetEntityCoords(GetPlayerPed(source))
    var heading = coords.w ? coords.w : 0.0
    var veh = CreateVehicleServerSetter(model, vehtype, coords, heading)
    while (!DoesEntityExist(veh)) Wait(0)
    if (warp) TaskWarpPedIntoVehicle(GetPlayerPed(source), veh, -1)
    return veh
}

// Paychecks (standalone - don't touch)
PaycheckInterval = function () {
    if (Object.keys(QBCore.Players).length) {
        for (let key in QBCore.Players) {
            var Player = QBCore.Players[key]
            if (Player) {
                var payment = QBShared.Jobs[Player.PlayerData.job.name]['grades'][String(Player.PlayerData.job.grade.level)].payment
                if (!payment) payment = Player.PlayerData.job.payment
                if (Player.PlayerData.job && payment > 0 && (QBShared.Jobs[Player.PlayerData.job.name].offDutyPay || Player.PlayerData.job.onduty)) {
                    if (QBCore.Config.Money.PayCheckSociety) {
                        var account = exports['qb-management'].GetAccount(Player.PlayerData.job.name)
                        if (account !== 0) { // Checks if player is employed by a society
                            if (account < payment) { // Checks if company has enough money to pay society
                                emitNet('QBCore:Notify', Player.PlayerData.source, Lang.t('error.company_too_poor'), 'error')
                            } else {
                                Player.Functions.AddMoney('bank', payment, 'paycheck')
                                exports['qb-management'].RemoveMoney(Player.PlayerData.job.name, payment)
                                emitNet('QBCore:Notify', Player.PlayerData.source, Lang.t('info.received_paycheck', { value: payment }))
                            }
                        } else {
                            Player.Functions.AddMoney('bank', payment, 'paycheck')
                            emitNet('QBCore:Notify', Player.PlayerData.source, Lang.t('info.received_paycheck', { value: payment }))
                        }
                    } else {
                        Player.Functions.AddMoney('bank', payment, 'paycheck')
                        emitNet('QBCore:Notify', Player.PlayerData.source, Lang.t('info.received_paycheck', { value: payment }))
                    }
                }
            }
        }
    }
    setTimeout(PaycheckInterval, QBCore.Config.Money.PayCheckTimeOut * 60 * 1000)
}

// Callback Functions

/**
 * Trigger Client Callback
 * 
 * @param {string} name 
 * @param {any} source 
 * @param {function} cb 
 * @param {...any} args 
 */
QBCore.Functions.TriggerClientCallback = function (name, source, cb, ...args) {
    QBCore.ClientCallbacks[name] = cb
    emitNet('QBCore:Client:TriggerClientCallback', source, name, ...args)
}

/**
 * Create Server Callback
 * 
 * @param {string} name 
 * @param {function} cb 
 */
QBCore.Functions.CreateCallback = function (name, cb) {
    QBCore.ServerCallbacks[name] = cb
}

/**
 * Trigger Server Callback
 * 
 * @param {string} name 
 * @param {any} source 
 * @param {function} cb 
 * @param {...any} args 
 */
QBCore.Functions.TriggerCallback = function (name, source, cb, ...args) {
    if (!QBCore.ServerCallbacks[name]) return
    QBCore.ServerCallbacks[name](source, cb, ...args)
}

// Items

/**
 * Create a usable item
 * 
 * @param {string} item 
 * @param {function} data 
 */
QBCore.Functions.CreateUseableItem = function (item, data) {
    QBCore.UsableItems[item] = data
}

/**
 * Checks if the given item is usable
 * 
 * @param {string} item 
 * @returns {any}
 */
QBCore.Functions.CanUseItem = function (item) {
    return QBCore.UsableItems[item]
}

/**
 * Use item
 * 
 * @param {any} source 
 * @param {string} item 
 */
QBCore.Functions.UseItem = function (source, item) {
    if (GetResourceState('qb-inventory') === 'missing') {
        return
    }
    exports['qb-inventory'].UseItem(source, item)
}

/**
 * Kick Player
 * 
 * @param {any} source 
 * @param {string} reason 
 * @param {boolean} setKickReason 
 * @param {boolean} deferrals 
 */
QBCore.Functions.Kick = function (source, reason, setKickReason, deferrals) {
    reason = '\n' + reason + '\n🔸 Check our Discord for further information: ' + QBCore.Config.Server.Discord
    if (setKickReason) {
        setKickReason(reason)
    }
    if (deferrals) {
        deferrals.update(reason)
        Wait(2500)
    }
    if (source) {
        DropPlayer(source, reason)
    }

    for (let i = 0; i < 4; i++) {
        while (source && GetPlayerPing(source) >= 0) {
            Wait(100)
            DropPlayer(source, reason)
        }
        Wait(5000)
    }
}

/**
 * Check if player is whitelisted, kept like this for backwards compatibility or future plans
 * 
 * @param {any} source 
 * @returns {boolean}
 */
QBCore.Functions.IsWhitelisted = function (source) {
    if (!QBCore.Config.Server.Whitelist) return true
    if (QBCore.Functions.HasPermission(source, QBCore.Config.Server.WhitelistPermission)) return true
    return false
}

// Setting & Removing Permissions

/**
 * Add permission for player
 * 
 * @param {any} source 
 * @param {string} permission 
 */
QBCore.Functions.AddPermission = function (source, permission) {
    if (!IsPlayerAceAllowed(source, permission)) {
        ExecuteCommand(`add_principal player.${source} qbcore.${permission}`)
        QBCore.Commands.Refresh(source)
    }
}

/**
 * Remove permission from player
 * 
 * @param {any} source 
 * @param {string} permission 
 */
QBCore.Functions.RemovePermission = function (source, permission) {
    if (permission) {
        if (IsPlayerAceAllowed(source, permission)) {
            ExecuteCommand(`remove_principal player.${source} qbcore.${permission}`);
            QBCore.Commands.Refresh(source);
        }
    } else {
        for (let p of QBCore.Config.Server.Permissions) {
            if (IsPlayerAceAllowed(source, p)) {
                ExecuteCommand(`remove_principal player.${source} qbcore.${p}`)
                QBCore.Commands.Refresh(source)
            }
        }
    }
}

// Checking for Permission Level

/**
 * Check if player has permission
 * 
 * @param {any} source 
 * @param {string|Array} permission 
 * @returns {boolean}
 */
QBCore.Functions.HasPermission = function (source, permission)  {
    if (typeof permission === "string") {
        if (IsPlayerAceAllowed(source, permission)) return true
    } else if (Array.isArray(permission)) {
        for (let permLevel of permission) {
            if (IsPlayerAceAllowed(source, permLevel)) return true
        }
    }
    return false
}

/**
 * Get the players permissions
 * 
 * @param {any} source 
 * @returns {Object}
 */
QBCore.Functions.GetPermission = function (source) {
    var src = source
    var perms = {}
    for (let p of QBCore.Config.Server.Permissions) {
        if (IsPlayerAceAllowed(src, p)) {
            perms[p] = true
        }
    }
    return perms
}

/**
 * Get admin messages opt-in state for player
 * 
 * @param {any} source 
 * @returns {boolean}
 */
QBCore.Functions.IsOptin = function (source) {
    var license = QBCore.Functions.GetIdentifier(source, 'license')
    if (!license || !QBCore.Functions.HasPermission(source, 'admin')) return false
    var Player = QBCore.Functions.GetPlayer(source)
    return Player.PlayerData.optin
}

/**
 * Toggle opt-in to admin messages
 * 
 * @param {any} source 
 */
QBCore.Functions.ToggleOptin = function (source) {
    var license = QBCore.Functions.GetIdentifier(source, 'license')
    if (!license || !QBCore.Functions.HasPermission(source, 'admin')) return
    var Player = QBCore.Functions.GetPlayer(source)
    Player.PlayerData.optin = !Player.PlayerData.optin
    Player.Functions.SetPlayerData('optin', Player.PlayerData.optin)
}

/**
 * Check if player is banned
 * 
 * @param {any} source 
 * @returns {[boolean, string?]}
 */
QBCore.Functions.IsPlayerBanned = async function (source) {
    var plicense = QBCore.Functions.GetIdentifier(source, 'license')
    var result = await db.existeBanimento(plicense)
    if (!result) return false
    if (new Date().getTime() < result.expire) {
        var timeTable = new Date(result.expire)
        return {
            status: true,
            message:`You have been banned from the server:\n${result.reason}\nYour ban expires ${timeTable.getDate()}/${timeTable.getMonth() + 1}/${timeTable.getFullYear()} ${timeTable.getHours()}:${timeTable.getMinutes()}\n`
        }
    } else {
        await db.removerBanimento(result.license)
    }
    return false
}

/**
 * Check for duplicate license
 * 
 * @param {any} license 
 * @returns {boolean}
 */
QBCore.Functions.IsLicenseInUse = function (license) {
    var players = exports[GetCurrentResourceName()].GetPlayersFunction()
    for (let player of players) {
        var identifiers = QBCore.Functions.GetPlayerIdentifiers(player)
        if (identifiers.license === license) {
            return true
        }
    }
    return false
}

// Utility functions

/**
 * Check if a player has an item [deprecated]
 * 
 * @param {any} source 
 * @param {Array|string} items 
 * @param {number} amount 
 * @returns {boolean}
 */
QBCore.Functions.HasItem = function (source, items, amount) {
    if (GetResourceState('qb-inventory') == 'missing') return
    return exports['qb-inventory'].HasItem(source, items, amount)
}

/**
 * Notify
 * 
 * @param {any} source 
 * @param {string} text 
 * @param {string} type 
 * @param {number} length 
 */
QBCore.Functions.Notify = function (source, text, type, length) {
    emitNet('QBCore:Notify', source, text, type, length)
}

/**
 * ??? ... ok
 * @param {any} source 
 * @param {any} data 
 * @param {any} pattern 
 * @returns {boolean}
 */
QBCore.Functions.PrepForSQL = function (source, data, pattern) {
    data = tostring(data)
    var src = source
    var player = QBCore.Functions.GetPlayer(src)
    var result = data.match(data, pattern)
    if (!result || result[0].length !== data.length) {
        emit('qb-log:server:CreateLog', 'anticheat', 'SQL Exploit Attempted', 'red', `${player.PlayerData.license} attempted to exploit SQL!`)
        return false
    }
    return true
}