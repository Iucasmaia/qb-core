// var db = require('../db')
QBCore.Players = {}
QBCore.Player = {}

QBCore.Player.Login = async function (source, citizenid, newData) {
    if (source && source !== '') {
        if (citizenid) {
            var license = QBCore.Functions.GetIdentifier(source, 'license')
            var PlayerData = await db.existePlayer(citizenid)
            if (PlayerData && license == PlayerData.license) {
                PlayerData.money = PlayerData.money
                PlayerData.job = PlayerData.job
                PlayerData.position = PlayerData.position
                PlayerData.metadata = PlayerData.metadata
                PlayerData.charinfo = PlayerData.charinfo
                if (PlayerData.gang) {
                    PlayerData.gang = PlayerData.gang
                } else {
                    PlayerData.gang = {}
                }
                QBCore.Player.CheckPlayerData(source, PlayerData)
            } else {
                DropPlayer(source, Lang.t("info.exploit_dropped"))
                TriggerEvent('qb-log:server:CreateLog', 'anticheat', 'Anti-Cheat', 'white', GetPlayerName(source) + ' Has Been Dropped For Character Joining Exploit', false)
            }
        } else {
            QBCore.Player.CheckPlayerData(source, newData)
        }
        return true
    } else {
        QBCore.ShowError(GetCurrentResourceName(), 'ERROR QBCORE.PLAYER.LOGIN - NO SOURCE GIVEN!')
        return false
    }
}

QBCore.Player.GetOfflinePlayer = async function (citizenid) {
    if (citizenid) {
        var PlayerData = await db.existePlayer(citizenid)
        if (PlayerData) {
            PlayerData.money = PlayerData.money
            PlayerData.job = PlayerData.job
            PlayerData.position = PlayerData.position
            PlayerData.metadata = PlayerData.metadata
            PlayerData.charinfo = PlayerData.charinfo
            if (PlayerData.gang) {
                PlayerData.gang = PlayerData.gang
            } else {
                PlayerData.gang = {}
            }
            return await QBCore.Player.CheckPlayerData(null, PlayerData)
        }
    }
    return null
}

QBCore.Player.CheckPlayerData = async function (source, PlayerData) {
    var PlayerData = PlayerData || {}
    var Offline = true
    if (source) {
        PlayerData.source = source
        PlayerData.license = PlayerData.license || QBCore.Functions.GetIdentifier(source, 'license')
        PlayerData.name = GetPlayerName(source)
        Offline = false
    }
    PlayerData.citizenid = PlayerData.citizenid || await QBCore.Player.CreateCitizenId()
    PlayerData.cid = PlayerData.cid || 1
    PlayerData.money = PlayerData.money || {}
    PlayerData.optin = PlayerData.optin || true
    for (let moneytype in QBConfig.Money.MoneyTypes) {
        PlayerData.money[moneytype] = PlayerData.money[moneytype] || QBConfig.Money.MoneyTypes[moneytype];
    }

    // Charinfo
    PlayerData.charinfo = PlayerData.charinfo || {}
    PlayerData.charinfo.firstname = PlayerData.charinfo.firstname || 'Firstname'
    PlayerData.charinfo.lastname = PlayerData.charinfo.lastname || 'Lastname'
    PlayerData.charinfo.birthdate = PlayerData.charinfo.birthdate || '00-00-0000'
    PlayerData.charinfo.gender = PlayerData.charinfo.gender || 0
    PlayerData.charinfo.backstory = PlayerData.charinfo.backstory || 'placeholder backstory'
    PlayerData.charinfo.nationality = PlayerData.charinfo.nationality || 'USA'
    PlayerData.charinfo.phone = PlayerData.charinfo.phone || await QBCore.Functions.CreatePhoneNumber()
    PlayerData.charinfo.account = PlayerData.charinfo.account || await QBCore.Functions.CreateAccountNumber()
    // -- MetadataQBCore.Functions.GetIdentifier(source, 'license')
    PlayerData.metadata = PlayerData.metadata || {}
    PlayerData.metadata['hunger'] = PlayerData.metadata['hunger'] || 100
    PlayerData.metadata['thirst'] = PlayerData.metadata['thirst'] || 100
    PlayerData.metadata['stress'] = PlayerData.metadata['stress'] || 0
    PlayerData.metadata['isdead'] = PlayerData.metadata['isdead'] || false
    PlayerData.metadata['inlaststand'] = PlayerData.metadata['inlaststand'] || false
    PlayerData.metadata['armor'] = PlayerData.metadata['armor'] || 0
    PlayerData.metadata['ishandcuffed'] = PlayerData.metadata['ishandcuffed'] || false
    PlayerData.metadata['tracker'] = PlayerData.metadata['tracker'] || false
    PlayerData.metadata['injail'] = PlayerData.metadata['injail'] || 0
    PlayerData.metadata['jailitems'] = PlayerData.metadata['jailitems'] || {}
    PlayerData.metadata['status'] = PlayerData.metadata['status'] || {}
    PlayerData.metadata['phone'] = PlayerData.metadata['phone'] || {}
    PlayerData.metadata['fitbit'] = PlayerData.metadata['fitbit'] || {}
    PlayerData.metadata['commandbinds'] = PlayerData.metadata['commandbinds'] || {}
    PlayerData.metadata['bloodtype'] = PlayerData.metadata['bloodtype'] || QBCore.Config.Player.Bloodtypes[Math.floor(Math.random() * QBConfig.Player.Bloodtypes.length)]
    PlayerData.metadata['dealerrep'] = PlayerData.metadata['dealerrep'] || 0
    PlayerData.metadata['craftingrep'] = PlayerData.metadata['craftingrep'] || 0
    PlayerData.metadata['attachmentcraftingrep'] = PlayerData.metadata['attachmentcraftingrep'] || 0
    PlayerData.metadata['currentapartment'] = PlayerData.metadata['currentapartment'] || null
    PlayerData.metadata['jobrep'] = PlayerData.metadata['jobrep'] || {}
    PlayerData.metadata['jobrep']['tow'] = PlayerData.metadata['jobrep']['tow'] || 0
    PlayerData.metadata['jobrep']['trucker'] = PlayerData.metadata['jobrep']['trucker'] || 0
    PlayerData.metadata['jobrep']['taxi'] = PlayerData.metadata['jobrep']['taxi'] || 0
    PlayerData.metadata['jobrep']['hotdog'] = PlayerData.metadata['jobrep']['hotdog'] || 0
    PlayerData.metadata['callsign'] = PlayerData.metadata['callsign'] || 'NO CALLSIGN'
    PlayerData.metadata['fingerprint'] = PlayerData.metadata['fingerprint'] || await QBCore.Player.CreateFingerId()
    PlayerData.metadata['walletid'] = PlayerData.metadata['walletid'] || await QBCore.Player.CreateWalletId()
    PlayerData.metadata['criminalrecord'] = PlayerData.metadata['criminalrecord'] || {
        ['hasRecord']: false,
        ['date']: null
    }
    PlayerData.metadata['licences'] = PlayerData.metadata['licences'] || {
        ['driver']: true,
        ['business']: false,
        ['weapon']: false
    }
    PlayerData.metadata['inside'] = PlayerData.metadata['inside'] || {
        house: null,
        apartment: {
            apartmentType: null,
            apartmentId: null,
        }
    }
    PlayerData.metadata['phonedata'] = PlayerData.metadata['phonedata'] || {
        SerialNumber: await QBCore.Player.CreateSerialNumber(),
        InstalledApps: {},
    }
    // Job
    if (PlayerData.job && PlayerData.job.name && !QBCore.Shared.Jobs[PlayerData.job.name]) PlayerData.job = null
    PlayerData.job = PlayerData.job || {}
    PlayerData.job.name = PlayerData.job.name || 'unemployed'
    PlayerData.job.label = PlayerData.job.label || 'Civilian'
    PlayerData.job.payment = PlayerData.job.payment || 10
    PlayerData.job.type = PlayerData.job.type || 'none'
    if (QBCore.Shared.ForceJobDefaultDutyAtLogin || PlayerData.job.onduty == null) {
        PlayerData.job.onduty = QBCore.Shared.Jobs[PlayerData.job.name].defaultDuty
    }
    PlayerData.job.isboss = PlayerData.job.isboss || false
    PlayerData.job.grade = PlayerData.job.grade || {}
    PlayerData.job.grade.name = PlayerData.job.grade.name || 'Freelancer'
    PlayerData.job.grade.level = PlayerData.job.grade.level || 0
    // Gang
    if (PlayerData.gang && PlayerData.gang.name && !QBCore.Shared.Gangs[PlayerData.gang.name]) PlayerData.gang = null
    PlayerData.gang = PlayerData.gang || {}
    PlayerData.gang.name = PlayerData.gang.name || 'none'
    PlayerData.gang.label = PlayerData.gang.label || 'No Gang Affiliaton'
    PlayerData.gang.isboss = PlayerData.gang.isboss || false
    PlayerData.gang.grade = PlayerData.gang.grade || {}
    PlayerData.gang.grade.name = PlayerData.gang.grade.name || 'none'
    PlayerData.gang.grade.level = PlayerData.gang.grade.level || 0
    // Other
    PlayerData.position = PlayerData.position || QBConfig.DefaultSpawn
    PlayerData.items = GetResourceState('qb-inventory') != 'missing' && exports['qb-inventory'].LoadInventory(PlayerData.source, PlayerData.citizenid) || {}
    return QBCore.Player.CreatePlayer(PlayerData, Offline)
}

// On player logout

QBCore.Player.Logout = function (source) {
    TriggerClientEvent('QBCore:Client:OnPlayerUnload', source)
    TriggerEvent('QBCore:Server:OnPlayerUnload', source)
    TriggerClientEvent('QBCore:Player:UpdatePlayerData', source)
    Wait(200)
    delete QBCore.Players[source]
}

QBCore.Player.CreatePlayer = function (PlayerData, Offline) {
    var self = {}
    self.Functions = {}
    self.PlayerData = PlayerData
    self.Offline = Offline

    self.Functions.UpdatePlayerData = function () {
        if (self.Offline) return // Unsupported for Offline Players
        TriggerEvent('QBCore:Player:SetPlayerData', self.PlayerData)
        TriggerClientEvent('QBCore:Player:SetPlayerData', self.PlayerData.source, self.PlayerData)
    }

    self.Functions.SetJob = function (job, grade) {
        job = job.toLowerCase()
        grade = String(grade) || '0'
        if (!QBCore.Shared.Jobs[job]) return false
        self.PlayerData.job.name = job
        self.PlayerData.job.label = QBCore.Shared.Jobs[job].label
        self.PlayerData.job.onduty = QBCore.Shared.Jobs[job].defaultDuty
        self.PlayerData.job.type = QBCore.Shared.Jobs[job].type || 'none'
        if (QBCore.Shared.Jobs[job].grades[grade]) {
            var jobgrade = QBCore.Shared.Jobs[job].grades[grade]
            self.PlayerData.job.grade = {}
            self.PlayerData.job.grade.name = jobgrade.name
            self.PlayerData.job.grade.level = Number(grade)
            self.PlayerData.job.payment = jobgrade.payment || 30
            self.PlayerData.job.isboss = jobgrade.isboss || false
        } else {
            self.PlayerData.job.grade = {}
            self.PlayerData.job.grade.name = 'No Grades'
            self.PlayerData.job.grade.level = 0
            self.PlayerData.job.payment = 30
            self.PlayerData.job.isboss = false
        }
        if (!self.Offline) {
            self.Functions.UpdatePlayerData()
            TriggerEvent('QBCore:Server:OnJobUpdate', self.PlayerData.source, self.PlayerData.job)
            TriggerClientEvent('QBCore:Client:OnJobUpdate', self.PlayerData.source, self.PlayerData.job)
        }
        return true
    }

    self.Functions.SetGang = function (gang, grade) {
        gang = gang.toLowerCase()
        grade = String(grade) || '0'
        if (!QBCore.Shared.Gangs[gang]) return false
        self.PlayerData.gang.name = gang
        self.PlayerData.gang.label = QBCore.Shared.Gangs[gang].label
        if (QBCore.Shared.Gangs[gang].grades[grade]) {
            var ganggrade = QBCore.Shared.Gangs[gang].grades[grade]
            self.PlayerData.gang.grade = {}
            self.PlayerData.gang.grade.name = ganggrade.name
            self.PlayerData.gang.grade.level = Number(grade)
            self.PlayerData.gang.isboss = ganggrade.isboss || false
        } else {
            self.PlayerData.gang.grade = {}
            self.PlayerData.gang.grade.name = 'No Grades'
            self.PlayerData.gang.grade.level = 0
            self.PlayerData.gang.isboss = false
        }
        if (!self.Offline) {
            self.Functions.UpdatePlayerData()
            TriggerEvent('QBCore:Server:OnGangUpdate', self.PlayerData.source, self.PlayerData.gang)
            TriggerClientEvent('QBCore:Client:OnGangUpdate', self.PlayerData.source, self.PlayerData.gang)
        }
        return true
    }

    self.Functions.SetJobDuty = function (onDuty) {
        self.PlayerData.job.onduty = !!onDuty // Make sure the value is a boolean if null is sent
        TriggerEvent('QBCore:Server:OnJobUpdate', self.PlayerData.source, self.PlayerData.job)
        TriggerClientEvent('QBCore:Client:OnJobUpdate', self.PlayerData.source, self.PlayerData.job)
        self.Functions.UpdatePlayerData()
    }

    self.Functions.SetPlayerData = function (key, val) {
        if (!key || typeof key !== 'string') return
        self.PlayerData[key] = val
        self.Functions.UpdatePlayerData()
    }

    self.Functions.SetMetaData = function (meta, val) {
        if (!meta || typeof meta !== 'string') return
        if (meta == 'hunger' || meta == 'thirst') {
            val = val > 100 && 100 || val
        }
        self.PlayerData.metadata[meta] = val
        self.Functions.UpdatePlayerData()
    }

    self.Functions.GetMetaData = function (meta) {
        if (!meta || typeof meta !== 'string') return
        return self.PlayerData.metadata[meta]
    }

    self.Functions.AddJobReputation = function (amount) {
        if (!amount) return
        amount = Number(amount)
        self.PlayerData.metadata['jobrep'][self.PlayerData.job.name] = self.PlayerData.metadata['jobrep'][self.PlayerData.job.name] + amount
        self.Functions.UpdatePlayerData()
    }

    self.Functions.AddMoney = function (moneytype, amount, reason) {
        reason = reason || 'unknown'
        moneytype = moneytype.toLowerCase()
        amount = Number(amount)
        if (amount < 0) return
        if (!self.PlayerData.money[moneytype]) return false
        self.PlayerData.money[moneytype] = self.PlayerData.money[moneytype] + amount
        if (!self.Offline) {
            self.Functions.UpdatePlayerData()
            if (amount > 100000) {
                TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'AddMoney', 'lightgreen', '**' + GetPlayerName(self.PlayerData.source) + ' (citizenid: ' + self.PlayerData.citizenid + ' | id: ' + self.PlayerData.source + ')** $' + amount + ' (' + moneytype + ') added, new ' + moneytype + ' balance: ' + self.PlayerData.money[moneytype] + ' reason: ' + reason, true)
            } else {
                TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'AddMoney', 'lightgreen', '**' + GetPlayerName(self.PlayerData.source) + ' (citizenid: ' + self.PlayerData.citizenid + ' | id: ' + self.PlayerData.source + ')** $' + amount + ' (' + moneytype + ') added, new ' + moneytype + ' balance: ' + self.PlayerData.money[moneytype] + ' reason: ' + reason)
            }
            TriggerClientEvent('hud:client:OnMoneyChange', self.PlayerData.source, moneytype, amount, false)
            TriggerClientEvent('QBCore:Client:OnMoneyChange', self.PlayerData.source, moneytype, amount, "add", reason)
            TriggerEvent('QBCore:Server:OnMoneyChange', self.PlayerData.source, moneytype, amount, "add", reason)
        }
        return true
    }

    self.Functions.RemoveMoney = function (moneytype, amount, reason) {
        reason = reason || 'unknown'
        moneytype = moneytype.toLowerCase()
        amount = Number(amount)
        if (amount < 0) return
        if (!self.PlayerData.money[moneytype]) return false
        for (let mtype of QBCore.Config.Money.DontAllowMinus) {
            if (mtype === moneytype) {
                if ((self.PlayerData.money[moneytype] - amount) < 0) return false
            }
        }
        self.PlayerData.money[moneytype] = self.PlayerData.money[moneytype] - amount
        if (!self.Offline) {
            self.Functions.UpdatePlayerData()
            if (amount > 100000) {
                TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'RemoveMoney', 'red', '**' + GetPlayerName(self.PlayerData.source) + ' (citizenid: ' + self.PlayerData.citizenid + ' | id: ' + self.PlayerData.source + ')** $' + amount + ' (' + moneytype + ') removed, new ' + moneytype + ' balance: ' + self.PlayerData.money[moneytype] + ' reason: ' + reason, true)
            } else {
                TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'RemoveMoney', 'red', '**' + GetPlayerName(self.PlayerData.source) + ' (citizenid: ' + self.PlayerData.citizenid + ' | id: ' + self.PlayerData.source + ')** $' + amount + ' (' + moneytype + ') removed, new ' + moneytype + ' balance: ' + self.PlayerData.money[moneytype] + ' reason: ' + reason)
            }
            TriggerClientEvent('hud:client:OnMoneyChange', self.PlayerData.source, moneytype, amount, true)
            if (moneytype == 'bank') {
                TriggerClientEvent('qb-phone:client:RemoveBankMoney', self.PlayerData.source, amount)
            }
            TriggerClientEvent('QBCore:Client:OnMoneyChange', self.PlayerData.source, moneytype, amount, "remove", reason)
            TriggerEvent('QBCore:Server:OnMoneyChange', self.PlayerData.source, moneytype, amount, "remove", reason)
        }
        return true
    }

    self.Functions.SetMoney = function (moneytype, amount, reason) {
        reason = reason || 'unknown'
        moneytype = moneytype.toLowerCase()
        amount = Number(amount)
        if (amount < 0) return false
        if (!self.PlayerData.money[moneytype]) return false
        var difference = amount - self.PlayerData.money[moneytype]
        self.PlayerData.money[moneytype] = amount
        if (!self.Offline) {
            self.Functions.UpdatePlayerData()
            TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'SetMoney', 'green', '**' + GetPlayerName(self.PlayerData.source) + ' (citizenid: ' + self.PlayerData.citizenid + ' | id: ' + self.PlayerData.source + ')** $' + amount + ' (' + moneytype + ') set, new ' + moneytype + ' balance: ' + self.PlayerData.money[moneytype] + ' reason: ' + reason)
            TriggerClientEvent('hud:client:OnMoneyChange', self.PlayerData.source, moneytype, math.abs(difference), difference < 0)
            TriggerClientEvent('QBCore:Client:OnMoneyChange', self.PlayerData.source, moneytype, amount, "set", reason)
            TriggerEvent('QBCore:Server:OnMoneyChange', self.PlayerData.source, moneytype, amount, "set", reason)
        }
        return true
    }

    self.Functions.GetMoney = function (moneytype) {
        if (!moneytype) return false
        moneytype = moneytype.toLowerCase()
        return self.PlayerData.money[moneytype]
    }

    self.Functions.SetCreditCard = function (cardNumber) {
        self.PlayerData.charinfo.card = cardNumber
        self.Functions.UpdatePlayerData()
    }

    self.Functions.GetCardSlot = function (cardNumber, cardType) {
        var item = String(cardType).toLowerCase()
        var slots = exports['qb-inventory'].GetSlotsByItem(self.PlayerData.items, item)
        for (let slot of slots) {
            if (slot) {
                if (self.PlayerData.items[slot].info.cardNumber == cardNumber) return slot
            }
        }
        return null
    }

    self.Functions.Save = function () {
        if (self.Offline) {
            QBCore.Player.SaveOffline(self.PlayerData)
        } else {
            QBCore.Player.Save(self.PlayerData.source)
        }
    }

    self.Functions.Logout = function () {
        if (self.Offline) return // Unsupported for Offline Players
        QBCore.Player.Logout(self.PlayerData.source)
    }

    self.Functions.AddMethod = function (methodName, handler) {
        self.Functions[methodName] = handler
    }

    self.Functions.AddField = function (fieldName, data) {
        self[fieldName] = data
    }

    if (self.Offline) {
        return self
    } else {
        QBCore.Players[self.PlayerData.source] = self
        QBCore.Player.Save(self.PlayerData.source)
        // At this point we are safe to emit new instance to third party resource for load handling
        TriggerEvent('QBCore:Server:PlayerLoaded', self)
        self.Functions.UpdatePlayerData()
    }
}

// Add a new function to the Functions table of the player class
// Use-case:
// [[
    // on('QBCore:Server:PlayerLoaded', function(Player) {
    //     QBCore.Functions.AddPlayerMethod(Player.PlayerData.source, "functionName", function(oneArg, orMore) {
    //         // do something here
    //     })
    // })
// ]]

QBCore.Functions.AddPlayerMethod = function (ids, methodName, handler) {
    var idType = typeof ids
    if (idType == "number") {
        if (ids == -1) {
            for(let playerKey in QBCore.Players) {
                let v = QBCore.Players[playerKey]
                v.Functions.AddMethod(methodName, handler)
            }
        } else {
            if (!QBCore.Players[ids]) return
            QBCore.Players[ids].Functions.AddMethod(methodName, handler)
        }
    } else if (idType == "array") {
        ids.forEach(id => {
            QBCore.Functions.AddPlayerMethod(id, methodName, handler)
        })
    }
}

// Add a new field table of the player class
// Use-case:
// [[
//     on('QBCore:Server:PlayerLoaded', function(Player) {
//         QBCore.Functions.AddPlayerField(Player.PlayerData.source, "fieldName", "fieldData")
//     })
// ]]

QBCore.Functions.AddPlayerField = function (ids, fieldName, data) {
    var idType = typeof ids
    if (idType == "number") {
        if (ids == -1) {
            for(let playerKey in QBCore.Players) {
                let v = QBCore.Players[playerKey]
                v.Functions.AddField(fieldName, data)
            }
        } else {
            if (!QBCore.Players[ids]) return
            QBCore.Players[ids].Functions.AddField(fieldName, data)
        }
    } else if (idType == "array") {
        ids.forEach(id => {
            QBCore.Functions.AddPlayerField(id, fieldName, data)
        })
    }
}

QBCore.Player.Save = async function (source) {
    var ped = GetPlayerPed(source)
    var pcoords = GetEntityCoords(ped)
    var PlayerData = QBCore.Players[source].PlayerData
    if (PlayerData) {
        var create = await db.adicionarPlayer(
            PlayerData.citizenid,
            Number(PlayerData.cid),
            PlayerData.license,
            PlayerData.name,
            PlayerData.money,
            PlayerData.charinfo,
            PlayerData.job,
            PlayerData.gang,
            pcoords,
            PlayerData.metadata,
        )
        console.log('QBCore.Player.Save = \n', create, '\n')
        if (GetResourceState('qb-inventory') !== 'missing') exports['qb-inventory'].SaveInventory(source)
        QBCore.ShowSuccess(GetCurrentResourceName(), PlayerData.name + ' PLAYER SAVED!')
    } else {
        QBCore.ShowError(GetCurrentResourceName(), 'ERROR QBCORE.PLAYER.SAVE - PLAYERDATA IS EMPTY!')
    }
}

QBCore.Player.SaveOffline = async function (PlayerData) {
    if (PlayerData) {
        var create = await db.adicionarPlayer(
            PlayerData.citizenid,
            Number(PlayerData.cid),
            PlayerData.license,
            PlayerData.name,
            PlayerData.money,
            PlayerData.charinfo,
            PlayerData.job,
            PlayerData.gang,
            PlayerData.position,
            PlayerData.metadata,
            PlayerData.inventory,
        )
        console.log('QBCore.Player.SaveOffline = \n', create, '\n')
        if (GetResourceState('qb-inventory') !== 'missing') exports['qb-inventory'].SaveInventory(PlayerData, true)
        QBCore.ShowSuccess(GetCurrentResourceName(), PlayerData.name + ' OFFLINE PLAYER SAVED!')
    } else {
        QBCore.ShowError(GetCurrentResourceName(), 'ERROR QBCORE.PLAYER.SAVEOFFLINE - PLAYERDATA IS EMPTY!')
    }
}

QBCore.Player.DeleteCharacter = async function (source, citizenid) {
    var license = QBCore.Functions.GetIdentifier(source, 'license')
    var result = await db.existePlayer(citizenid)
    if (license == result.license) {
        var deleted = await db.removerPlayer(citizenid)
        if (deleted) {
            TriggerEvent('qb-log:server:CreateLog', 'joinleave', 'Character Deleted', 'red', '**' + GetPlayerName(source) + '** ' + license + ' deleted **' + citizenid + '**..')
        }
    } else {
        DropPlayer(source, Lang.t("info.exploit_dropped"))
        TriggerEvent('qb-log:server:CreateLog', 'anticheat', 'Anti-Cheat', 'white', GetPlayerName(source) + ' Has Been Dropped For Character Deletion Exploit', true)
    }
}

QBCore.Player.ForceDeleteCharacter = async function (citizenid) {
    var result = await db.existePlayer(citizenid)
    if (result) {
        var Player = QBCore.Functions.GetPlayerByCitizenId(citizenid)
        if (Player) {
            DropPlayer(Player.PlayerData.source, "An admin deleted the character which you are currently using")
        }
        var deleted = await db.removerPlayer(citizenid)
        if (deleted) {
            TriggerEvent('qb-log:server:CreateLog', 'joinleave', 'Character Force Deleted', 'red', 'Character **' + citizenid + '** got deleted')
        }
    }
}

// Inventory Backwards Compatibility

QBCore.Player.SaveInventory = function (source) {
    if (GetResourceState('qb-inventory') == 'missing') return
    exports['qb-inventory'].SaveInventory(source, false)
}

QBCore.Player.SaveOfflineInventory = function (PlayerData) {
    if (GetResourceState('qb-inventory') == 'missing') return
    exports['qb-inventory'].SaveInventory(PlayerData, true)
}

QBCore.Player.GetTotalWeight = function (items) {
    if (GetResourceState('qb-inventory') == 'missing') return
    return exports['qb-inventory'].GetTotalWeight(items)
}

QBCore.Player.GetSlotsByItem = function (items, itemName) {
    if (GetResourceState('qb-inventory') == 'missing') return
    return exports['qb-inventory'].GetSlotsByItem(items, itemName)
}

QBCore.Player.GetFirstSlotByItem = function (items, itemName) {
    if (GetResourceState('qb-inventory') == 'missing') return
    return exports['qb-inventory'].GetFirstSlotByItem(items, itemName)
}

// Util Functions

QBCore.Player.CreateCitizenId = async function () {
    var UniqueFound = false
    var CitizenId = null
    while (!UniqueFound) {
        CitizenId = String(QBCore.Shared.RandomStr(3) + QBCore.Shared.RandomInt(5)).toUpperCase()
        var result = await db.existePlayer(CitizenId)
        if (!result) {
            UniqueFound = true
        }
    }
    return CitizenId
}

QBCore.Functions.CreateAccountNumber = async function () {
    var UniqueFound = false
    var AccountNumber = null
    while (!UniqueFound) {
        AccountNumber = 'US0' + Math.floor(Math.random() * 9 + 1) + 'QBCore' + 
                        Math.floor(Math.random() * (9999 - 1111 + 1) + 1111) + 
                        Math.floor(Math.random() * (9999 - 1111 + 1) + 1111) + 
                        Math.floor(Math.random() * (99 - 11 + 1) + 11)
        var result = await db.existeAccountNumber(AccountNumber)
        if (!result) {
            UniqueFound = true 
        }
    }
    return AccountNumber
}

QBCore.Functions.CreatePhoneNumber = async function () {
    var UniqueFound = false
    var PhoneNumber = null
    while (!UniqueFound) {
        PhoneNumber =   Math.floor(Math.random() * (999 - 100 + 1) + 100) + 
                        Math.floor(Math.random() * (9999999 - 1000000 + 1) + 1000000).toString()
        var result = await db.existePhoneNumber(PhoneNumber)
        if (!result) {
            UniqueFound = true 
        }
    }
    return PhoneNumber
}

QBCore.Player.CreateFingerId = async function () {
    var UniqueFound = false
    var FingerId = null
    while (!UniqueFound) {
        FingerId = String(QBCore.Shared.RandomStr(2) + QBCore.Shared.RandomInt(3) + QBCore.Shared.RandomStr(1) + QBCore.Shared.RandomInt(2) + QBCore.Shared.RandomStr(3) + QBCore.Shared.RandomInt(4))
        var result = await db.existeFingerId(FingerId)
        if (!result) {
            UniqueFound = true
        }
    }
    return FingerId
}

QBCore.Player.CreateWalletId = async function () {
    var UniqueFound = false
    var WalletId = null
    while (!UniqueFound) {
        WalletId = 'QB-' + Math.floor(Math.random() * (99999999 - 11111111 + 1) + 11111111).toString()
        var result = await db.existeWalletId(WalletId)
        if (!result) {
            UniqueFound = true
        }
    }
    return WalletId
}

QBCore.Player.CreateSerialNumber = async function () {
    var UniqueFound = false
    var SerialNumber = null
    while (!UniqueFound) {
        SerialNumber = Math.floor(Math.random() * (99999999 - 11111111 + 1) + 11111111);
        var result = await db.existeSerialNumber(SerialNumber)
        if (!result) {
            UniqueFound = true
        }
    }
    return SerialNumber
}

// PaycheckInterval() // This starts the paycheck system