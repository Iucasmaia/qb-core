QBCore.Functions = {}

// Player

QBCore.Functions.GetPlayerData = function (cb) {
    if (!cb) return QBCore.PlayerData
    cb(QBCore.PlayerData)
}

QBCore.Functions.GetCoords = function (entity) {
    var coords = GetEntityCoords(entity)
    return {
        x: coords[0],
        y: coords[1],
        z: coords[2],
        h: GetEntityHeading(entity)
    }
}

QBCore.Functions.HasItem = function (items, amount) {
    return exports['qb-inventory'].HasItem(items, amount)
}

// Utility

QBCore.Functions.DrawText = function (x, y, width, height, scale, r, g, b, a, text) {
    // Use local function instead
    SetTextFont(4)
    SetTextScale(scale, scale)
    SetTextColour(r, g, b, a)
    SetTextEntry('STRING')
    AddTextComponentString(text)
    DrawText(x - width / 2, y - height / 2 + 0.005)
}

QBCore.Functions.DrawText3D = function (x, y, z, text) {
    // Use local function instead
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry('STRING')
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x, y, z, 0)
    DrawText(0.0, 0.0)
    var factor = (text.length) / 370
    DrawRect(0.0, 0.0 + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
}

QBCore.Functions.RequestAnimDict = function (animDict) {
	if (HasAnimDictLoaded(animDict)) return
	RequestAnimDict(animDict)
	while (!HasAnimDictLoaded(animDict)) {
		Wait(0)
    }
}

QBCore.Functions.PlayAnim = function (animDict, animName, upperbodyOnly, duration) {
    var flags = upperbodyOnly && 16 || 0
    var runTime = duration || -1
    QBCore.Functions.RequestAnimDict(animDict)
    TaskPlayAnim(PlayerPedId(), animDict, animName, 8.0, 1.0, runTime, flags, 0.0, false, false, true)
    RemoveAnimDict(animDict)
}

QBCore.Functions.LoadModel = function (model) {
    if (HasModelLoaded(model)) return
	RequestModel(model)
	while (!HasModelLoaded(model)) {
		Wait(0)
    }
}

QBCore.Functions.LoadAnimSet = function (animSet) {
    if (HasAnimSetLoaded(animSet)) return
    RequestAnimSet(animSet)
    while (!HasAnimSetLoaded(animSet)) {
        Wait(0)
    }
}

RegisterNuiCallbackType('getNotifyConfig')
on('__cfx_nui:getNotifyConfig', (_, cb) => {
    cb(QBCore.Config.Notify)
})

QBCore.Functions.Notify = function (text, texttype = 'primary', length = 5000) {
    if (typeof text === "object") {
        var ttext = text.text || 'Placeholder'
        var caption = text.caption || 'Placeholder'
        SendNUIMessage({
            action: 'notify',
            type: texttype,
            length: length,
            text: ttext,
            caption: caption
        })
    } else {
        SendNUIMessage({
            action: 'notify',
            type: texttype,
            length: length,
            text: text
        })
    }
}

QBCore.Debug = function (resource, obj, depth) {
    emitNet('QBCore:DebugSomething', resource, obj, depth)
}

// Callback Functions

// Client Callback
QBCore.Functions.CreateClientCallback = function (name, cb) {
    QBCore.ClientCallbacks[name] = cb
}

QBCore.Functions.TriggerClientCallback = function (name, cb, ...args) {
    if (!QBCore.ClientCallbacks[name]) return
    QBCore.ClientCallbacks[name](cb, ...args)
}

// Server Callback
QBCore.Functions.TriggerCallback = function (name, cb, ...args) {
    QBCore.ServerCallbacks[name] = cb
    emitNet('QBCore:Server:TriggerCallback', name, ...args)
}

QBCore.Functions.Progressbar = function (name, label, duration, useWhileDead, canCancel, disableControls, animation, prop, propTwo, onFinish, onCancel) {
    if (GetResourceState('progressbar') !== 'started') throw new Error('progressbar needs to be started in order for QBCore.Functions.Progressbar to work')
    exports['progressbar'].Progress({
        name: name.toLowerCase(),
        duration: duration,
        label: label,
        useWhileDead: useWhileDead,
        canCancel: canCancel,
        controlDisables: disableControls,
        animation: animation,
        prop: prop,
        propTwo: propTwo,
    }, function(cancelled) {
        if (!cancelled) {
            if (onFinish) {
                onFinish()
            }
        } else {
            if (onCancel) {
                onCancel()
            }
        }
    })
}

// Getters

QBCore.Functions.GetVehicles = function () {
    return GetGamePool('CVehicle')
}

QBCore.Functions.GetObjects = function () {
    return GetGamePool('CObject')
}

QBCore.Functions.GetPlayers = function () {
    return GetActivePlayers()
}

QBCore.Functions.GetPeds = function (ignoreList) {
    var pedPool = GetGamePool('CPed')
    var peds = []
    ignoreList = ignoreList || []
    for (let i = 0; i < pedPool.length; i++) {
        var found = false
        for (let j = 0; j < ignoreList.length; j++) {
            if (ignoreList[j] === pedPool[i]) {
                found = true
            }
        }
        if (!found) {
            peds.push(pedPool[i])
        }
    }
    return peds
}

QBCore.Functions.GetClosestPed = function(coords, ignoreList) {
    var ped = PlayerPedId()
    if (!coords) {
        coords = GetEntityCoords(ped)
    }
    ignoreList = ignoreList || []
    var peds = QBCore.Functions.GetPeds(ignoreList)
    var closestDistance = -1
    var closestPed = -1
    for (let i = 0; i < peds.length; i++) {
        var pedCoords = GetEntityCoords(peds[i])
        var distance = Math.sqrt((pedCoords[0] - coords[0]) ** 2 + (pedCoords[1] - coords[1]) ** 2 + (pedCoords[2] - coords[2]) ** 2)
        if (closestDistance === -1 || closestDistance > distance) {
            closestPed = peds[i]
            closestDistance = distance
        }
    }
    return { closestPed, closestDistance }
}

QBCore.Functions.IsWearingGloves = function () {
    var ped = PlayerPedId()
    var armIndex = GetPedDrawableVariation(ped, 3)
    var model = GetEntityModel(ped)
    if (model == `mp_m_freemode_01`) {
        if (QBCore.Shared.MaleNoGloves[armIndex]) {
            return false
        }
    } else {
        if (QBCore.Shared.FemaleNoGloves[armIndex]) {
            return false
        }
    }
    return true
}

QBCore.Functions.GetPlayersFromCoords = function(coords, distance = 5) {
    var players = GetActivePlayers()
    var ped = PlayerPedId()
    if (!coords) {
        coords = GetEntityCoords(ped)
    }
    var closePlayers = []
    for (let i = 0; i < players.length; i++) {
        var player = players[i]
        var target = GetPlayerPed(player)
        var targetCoords = GetEntityCoords(target)
        var targetdistance = Math.sqrt((targetCoords[0] - coords[0]) ** 2 + (targetCoords[1] - coords[1]) ** 2 + (targetCoords[2] - coords[2]) ** 2)
        if (targetdistance <= distance) {
            closePlayers.push(player)
        }
    }
    return closePlayers
}

QBCore.Functions.GetClosestPlayer = function(coords) {
    var ped = PlayerPedId()
    if (!coords) {
        coords = GetEntityCoords(ped)
    }
    var closestPlayers = QBCore.Functions.GetPlayersFromCoords(coords)
    var closestDistance = -1
    var closestPlayer = -1
    for (let i = 0; i < closestPlayers.length; i++) {
        if (closestPlayers[i] !== PlayerId() && closestPlayers[i] !== -1) {
            var pos = GetEntityCoords(GetPlayerPed(closestPlayers[i]))
            var distance = Math.sqrt((pos[0] - coords[0]) ** 2 + (pos[1] - coords[1]) ** 2 + (pos[2] - coords[2]) ** 2)
            if (closestDistance === -1 || closestDistance > distance) {
                closestPlayer = closestPlayers[i]
                closestDistance = distance
            }
        }
    }
    return { closestPlayer, closestDistance }
}

QBCore.Functions.GetClosestVehicle = function (coords) {
    var ped = PlayerPedId()
    var vehicles = GetGamePool('CVehicle')
    var closestDistance = -1
    var closestVehicle = -1
    if (!coords) {
        coords = GetEntityCoords(ped)
    }
    for (let i = 0; i < vehicles.length; i++) {
        var vehicle = vehicles[i]
        var vehicleCoords = GetEntityCoords(vehicle)
        var distance = Math.sqrt((vehicleCoords[0] - coords[0]) ** 2 + (vehicleCoords[1] - coords[1]) ** 2 + (vehicleCoords[2] - coords[2]) ** 2)
        if (closestDistance === -1 || closestDistance > distance) {
            closestVehicle = vehicle
            closestDistance = distance
        }
    }
    return { closestVehicle, closestDistance }
}

QBCore.Functions.GetClosestObject = function (coords) {
    var ped = PlayerPedId()
    var objects = GetGamePool('CObject')
    var closestDistance = -1
    var closestObject = -1
    if (!coords) {
        coords = GetEntityCoords(ped)
    }
    for (let i = 0; i < objects.length; i++) {
        var object = objects[i]
        var objectCoords = GetEntityCoords(object)
        var distance = Math.sqrt((objectCoords[0] - coords[0]) ** 2 + (objectCoords[1] - coords[1]) ** 2 + (objectCoords[2] - coords[2]) ** 2)
        if (closestDistance === -1 || closestDistance > distance) {
            closestObject = object
            closestDistance = distance
        }
    }
    return { closestObject, closestDistance }
}

QBCore.Functions.GetClosestBone = function (entity, list) {
    var playerCoords = GetEntityCoords(PlayerPedId())
    var bone, coords, distance
    list.forEach(element => {
        var boneCoords = GetWorldPositionOfEntityBone(entity, element.id || element)
        let boneDistance = Math.sqrt(
            (playerCoords.x - boneCoords.x) ** 2 + 
            (playerCoords.y - boneCoords.y) ** 2 + 
            (playerCoords.z - boneCoords.z) ** 2
        )
        if (!coords) {
            bone = element
            coords = boneCoords
            distance = boneDistance
        } else if (distance > boneDistance) {
            bone = element
            coords = boneCoords
            distance = boneDistance
        }
    })
    if (!bone) {
        bone = {id: GetEntityBoneIndexByName(entity, "bodyshell"), type: "remains", name: "bodyshell"};
        coords = GetWorldPositionOfEntityBone(entity, bone.id);
        distance = Math.sqrt(
            (coords.x - playerCoords.x) ** 2 + 
            (coords.y - playerCoords.y) ** 2 + 
            (coords.z - playerCoords.z) ** 2
        )
    }
    return { bone, coords, distance }
}

QBCore.Functions.GetBoneDistance = function (entity, boneType, boneIndex) {
    var bone
    if (boneType == 1) {
        bone = GetPedBoneIndex(entity, boneIndex)
    } else {
        bone = GetEntityBoneIndexByName(entity, boneIndex)
    }
    var boneCoords = GetWorldPositionOfEntityBone(entity, bone)
    var playerCoords = GetEntityCoords(PlayerPedId())
    return Math.sqrt(
        (boneCoords.x - playerCoords.x) ** 2 + 
        (boneCoords.y - playerCoords.y) ** 2 + 
        (boneCoords.z - playerCoords.z) ** 2
    )
}

QBCore.Functions.AttachProp = function(ped, model, boneId, x, y, z, xR, yR, zR, vertex) {
    var modelHash = typeof model === 'string' ? GetHashKey(model) : model
    var bone = GetPedBoneIndex(ped, boneId)
    QBCore.Functions.LoadModel(modelHash)
    var prop = CreateObject(modelHash, 1.0, 1.0, 1.0, 1, 1, 0)
    AttachEntityToEntity(prop, ped, bone, x, y, z, xR, yR, zR, 1, 1, 0, 1, vertex ? 0 : 2, 1)
    SetModelAsNoLongerNeeded(modelHash)
    return prop
}

// Vehicle

QBCore.Functions.SpawnVehicle = function (model, cb, coords, isnetworked, teleportInto) {
    var ped = PlayerPedId();
    model = typeof model === 'string' ? GetHashKey(model) : model
    if (!IsModelInCdimage(model)) return
    if (!coords) coords = GetEntityCoords(ped)
    var heading = coords[3] ? coords[3] : 0.0
    QBCore.Functions.LoadModel(model)
    let veh = CreateVehicle(model, coords[0], coords[1], coords[2], heading, isnetworked, false)
    let netid = NetworkGetNetworkIdFromEntity(veh)
    SetVehicleHasBeenOwnedByPlayer(veh, true)
    SetNetworkIdCanMigrate(netid, true)
    SetVehicleNeedsToBeHotwired(veh, false)
    SetVehRadioStation(veh, 'OFF')
    SetVehicleFuelLevel(veh, 100.0)
    SetModelAsNoLongerNeeded(model)
    if (teleportInto) TaskWarpPedIntoVehicle(PlayerPedId(), veh, -1)
    if (cb) cb(veh)
}

QBCore.Functions.DeleteVehicle = function (vehicle) {
    SetEntityAsMissionEntity(vehicle, true, true)
    DeleteVehicle(vehicle)
}

QBCore.Functions.GetPlate = function (vehicle) {
    if (vehicle == 0) return
    return QBCore.Shared.Trim(GetVehicleNumberPlateText(vehicle))
}

QBCore.Functions.GetVehicleLabel = function (vehicle) {
    if (vehicle == null || vehicle == 0) return
    return GetLabelText(GetDisplayNameFromVehicleModel(GetEntityModel(vehicle)))
}

QBCore.Functions.SpawnClear = function (coords, radius = 5) {
    if (!coords) coords = GetEntityCoords(PlayerPedId())
    var vehicles = GetGamePool('CVehicle')
    var closeVeh = []
    for (let i = 0; i < vehicles.length; i++) {
        let vehicleCoords = GetEntityCoords(vehicles[i])
        let distance = Math.sqrt((vehicleCoords[0] - coords[0]) ** 2 + (vehicleCoords[1] - coords[1]) ** 2 + (vehicleCoords[2] - coords[2]) ** 2)
        if (distance <= radius) {
            closeVeh.push(vehicles[i])
        }
    }
    if (closeVeh.length > 0) return false
    return true
}

QBCore.Functions.GetVehicleProperties = function (vehicle) {
    if (DoesEntityExist(vehicle)) {
        var [pearlescentColor, wheelColor] = GetVehicleExtraColours(vehicle)
        var [colorPrimary, colorSecondary] = GetVehicleColours(vehicle)
        if (GetIsVehiclePrimaryColourCustom(vehicle)) {
            var [r, g, b] = GetVehicleCustomPrimaryColour(vehicle)
            colorPrimary = {r, g, b}
        }
        if (GetIsVehicleSecondaryColourCustom(vehicle)) {
            var [r, g, b] = GetVehicleCustomSecondaryColour(vehicle)
            colorSecondary = {r, g, b}
        }
        var extras = {}
        for (let extraId = 0; extraId <= 12; extraId++) {
            if (DoesExtraExist(vehicle, extraId)) {
                var state = IsVehicleExtraTurnedOn(vehicle, extraId) === 1
                extras[extraId.toString()] = state
            }
        }
        var modLivery = GetVehicleMod(vehicle, 48)
        if (GetVehicleMod(vehicle, 48) == -1 && GetVehicleLivery(vehicle) !== 0) {
            modLivery = GetVehicleLivery(vehicle)
        }
        var tireHealth = {}
        for (let i = 0; i <= 3; i++) {
            tireHealth[i] = GetVehicleWheelHealth(vehicle, i)
        }
        var tireBurstState = {}
        for (let i = 0; i <= 5; i++) {
            tireBurstState[i] = IsVehicleTyreBurst(vehicle, i, false)
        }
        var tireBurstCompletely = {}
        for (let i = 0; i <= 5; i++) {
            tireBurstCompletely[i] = IsVehicleTyreBurst(vehicle, i, true)
        }
        var windowStatus = {}
        for (let i = 0; i <= 7; i++) {
            windowStatus[i] = IsVehicleWindowIntact(vehicle, i) === 1
        }
        var doorStatus = {}
        for (let i = 0; i <= 5; i++) {
            doorStatus[i] = IsVehicleDoorDamaged(vehicle, i) === 1
        }
        return {
            model: GetEntityModel(vehicle),
            plate: QBCore.Functions.GetPlate(vehicle),
            plateIndex: GetVehicleNumberPlateTextIndex(vehicle),
            bodyHealth: QBCore.Shared.Round(GetVehicleBodyHealth(vehicle), 0.1),
            engineHealth: QBCore.Shared.Round(GetVehicleEngineHealth(vehicle), 0.1),
            tankHealth: QBCore.Shared.Round(GetVehiclePetrolTankHealth(vehicle), 0.1),
            fuelLevel: QBCore.Shared.Round(GetVehicleFuelLevel(vehicle), 0.1),
            dirtLevel: QBCore.Shared.Round(GetVehicleDirtLevel(vehicle), 0.1),
            oilLevel: QBCore.Shared.Round(GetVehicleOilLevel(vehicle), 0.1),
            color1: colorPrimary,
            color2: colorSecondary,
            pearlescentColor: pearlescentColor,
            dashboardColor: GetVehicleDashboardColour(vehicle),
            wheelColor: wheelColor,
            wheels: GetVehicleWheelType(vehicle),
            wheelSize: GetVehicleWheelSize(vehicle),
            wheelWidth: GetVehicleWheelWidth(vehicle),
            tireHealth: tireHealth,
            tireBurstState: tireBurstState,
            tireBurstCompletely: tireBurstCompletely,
            windowTint: GetVehicleWindowTint(vehicle),
            windowStatus: windowStatus,
            doorStatus: doorStatus,
            xenonColor: GetVehicleXenonLightsColour(vehicle),
            neonEnabled: [
                IsVehicleNeonLightEnabled(vehicle, 0),
                IsVehicleNeonLightEnabled(vehicle, 1),
                IsVehicleNeonLightEnabled(vehicle, 2),
                IsVehicleNeonLightEnabled(vehicle, 3)
            ],
            neonColor: GetVehicleNeonLightsColour(vehicle),
            headlightColor: GetVehicleHeadlightsColour(vehicle),
            interiorColor: GetVehicleInteriorColour(vehicle),
            extras: extras,
            tyreSmokeColor: GetVehicleTyreSmokeColor(vehicle),
            modSpoilers: GetVehicleMod(vehicle, 0),
            modFrontBumper: GetVehicleMod(vehicle, 1),
            modRearBumper: GetVehicleMod(vehicle, 2),
            modSideSkirt: GetVehicleMod(vehicle, 3),
            modExhaust: GetVehicleMod(vehicle, 4),
            modFrame: GetVehicleMod(vehicle, 5),
            modGrille: GetVehicleMod(vehicle, 6),
            modHood: GetVehicleMod(vehicle, 7),
            modFender: GetVehicleMod(vehicle, 8),
            modRightFender: GetVehicleMod(vehicle, 9),
            modRoof: GetVehicleMod(vehicle, 10),
            modEngine: GetVehicleMod(vehicle, 11),
            modBrakes: GetVehicleMod(vehicle, 12),
            modTransmission: GetVehicleMod(vehicle, 13),
            modHorns: GetVehicleMod(vehicle, 14),
            modSuspension: GetVehicleMod(vehicle, 15),
            modArmor: GetVehicleMod(vehicle, 16),
            modKit17: GetVehicleMod(vehicle, 17),
            modTurbo: IsToggleModOn(vehicle, 18),
            modKit19: GetVehicleMod(vehicle, 19),
            modSmokeEnabled: IsToggleModOn(vehicle, 20),
            modKit21: GetVehicleMod(vehicle, 21),
            modXenon: IsToggleModOn(vehicle, 22),
            modFrontWheels: GetVehicleMod(vehicle, 23),
            modBackWheels: GetVehicleMod(vehicle, 24),
            modCustomTiresF: GetVehicleModVariation(vehicle, 23),
            modCustomTiresR: GetVehicleModVariation(vehicle, 24),
            modPlateHolder: GetVehicleMod(vehicle, 25),
            modVanityPlate: GetVehicleMod(vehicle, 26),
            modTrimA: GetVehicleMod(vehicle, 27),
            modOrnaments: GetVehicleMod(vehicle, 28),
            modDashboard: GetVehicleMod(vehicle, 29),
            modDial: GetVehicleMod(vehicle, 30),
            modDoorSpeaker: GetVehicleMod(vehicle, 31),
            modSeats: GetVehicleMod(vehicle, 32),
            modSteeringWheel: GetVehicleMod(vehicle, 33),
            modShifterLeavers: GetVehicleMod(vehicle, 34),
            modAPlate: GetVehicleMod(vehicle, 35),
            modSpeakers: GetVehicleMod(vehicle, 36),
            modTrunk: GetVehicleMod(vehicle, 37),
            modHydrolic: GetVehicleMod(vehicle, 38),
            modEngineBlock: GetVehicleMod(vehicle, 39),
            modAirFilter: GetVehicleMod(vehicle, 40),
            modStruts: GetVehicleMod(vehicle, 41),
            modArchCover: GetVehicleMod(vehicle, 42),
            modAerials: GetVehicleMod(vehicle, 43),
            modTrimB: GetVehicleMod(vehicle, 44),
            modTank: GetVehicleMod(vehicle, 45),
            modWindows: GetVehicleMod(vehicle, 46),
            modKit47: GetVehicleMod(vehicle, 47),
            modLivery: modLivery,
            modKit49: GetVehicleMod(vehicle, 49),
            liveryRoof: GetVehicleRoofLivery(vehicle),
        }
    } else {
        return
    }
}

QBCore.Functions.SetVehicleProperties = function (vehicle, props) {
    if (DoesEntityExist(vehicle)) {
        if (props.extras) {
            for (var [id, enabled] of Object.entries(props.extras)) {
                SetVehicleExtra(vehicle, Number(id), enabled ? 0 : 1)
            }
        }

        var [colorPrimary, colorSecondary] = GetVehicleColours(vehicle)
        var [pearlescentColor, wheelColor] = GetVehicleExtraColours(vehicle)
        SetVehicleModKit(vehicle, 0)
        if (props.plate) {
            SetVehicleNumberPlateText(vehicle, props.plate)
        }
        if (props.plateIndex) {
            SetVehicleNumberPlateTextIndex(vehicle, props.plateIndex)
        }
        if (props.bodyHealth) {
            SetVehicleBodyHealth(vehicle, props.bodyHealth + 0.0)
        }
        if (props.engineHealth) {
            SetVehicleEngineHealth(vehicle, props.engineHealth + 0.0)
        }
        if (props.tankHealth) {
            SetVehiclePetrolTankHealth(vehicle, props.tankHealth)
        }
        if (props.fuelLevel) {
            SetVehicleFuelLevel(vehicle, props.fuelLevel + 0.0)
        }
        if (props.dirtLevel) {
            SetVehicleDirtLevel(vehicle, props.dirtLevel + 0.0)
        }
        if (props.oilLevel) {
            SetVehicleOilLevel(vehicle, props.oilLevel)
        }
        if (props.color1) {
            if (typeof props.color1 == "number") {
                ClearVehicleCustomPrimaryColour(vehicle)
                SetVehicleColours(vehicle, props.color1, colorSecondary)
            } else {
                SetVehicleCustomPrimaryColour(vehicle, props.color1[1], props.color1[2], props.color1[3])
            }
        }
        if (props.color2) {
            if (typeof props.color2 == "number") {
                ClearVehicleCustomSecondaryColour(vehicle)
                SetVehicleColours(vehicle, props.color1 || colorPrimary, props.color2)
            } else {
                SetVehicleCustomSecondaryColour(vehicle, props.color2[1], props.color2[2], props.color2[3])
            }
        }
        if (props.pearlescentColor) {
            SetVehicleExtraColours(vehicle, props.pearlescentColor, wheelColor)
        }
        if (props.interiorColor) {
            SetVehicleInteriorColor(vehicle, props.interiorColor)
        }
        if (props.dashboardColor) {
            SetVehicleDashboardColour(vehicle, props.dashboardColor)
        }
        if (props.wheelColor) {
            SetVehicleExtraColours(vehicle, props.pearlescentColor || pearlescentColor, props.wheelColor)
        }
        if (props.wheels) {
            SetVehicleWheelType(vehicle, props.wheels)
        }
        if (props.tireHealth) {
            for (var [wheelIndex, health] of Object.entries(props.tireHealth)) {
                SetVehicleWheelHealth(vehicle, wheelIndex, health)
            }
        }
        if (props.tireBurstState) {
            for (var [wheelIndex, burstState] of Object.entries(props.tireBurstState)) {
                if (burstState) {
                    SetVehicleTyreBurst(vehicle, Number(wheelIndex), false, 1000.0)
                }
            }
        }
        if (props.tireBurstCompletely) {
            for (var [wheelIndex, burstState] of Object.entries(props.tireBurstCompletely)) {
                if (burstState) {
                    SetVehicleTyreBurst(vehicle, Number(wheelIndex), true, 1000.0)
                }
            }
        }
        if (props.windowTint) {
            SetVehicleWindowTint(vehicle, props.windowTint)
        }
        if (props.windowStatus) {
            for (var [windowIndex, smashWindow] of Object.entries(props.windowStatus)) {
                if (!smashWindow) {
                    SmashVehicleWindow(vehicle, windowIndex)
                }
            }
        }
        if (props.doorStatus) {
            for (var [doorIndex, breakDoor] of Object.entries(props.doorStatus)) {
                if (breakDoor) {
                    SetVehicleDoorBroken(vehicle, tonumber(doorIndex), true)
                }
            }
        }
        if (props.neonEnabled) {
            SetVehicleNeonLightEnabled(vehicle, 0, props.neonEnabled[1])
            SetVehicleNeonLightEnabled(vehicle, 1, props.neonEnabled[2])
            SetVehicleNeonLightEnabled(vehicle, 2, props.neonEnabled[3])
            SetVehicleNeonLightEnabled(vehicle, 3, props.neonEnabled[4])
        }
        if (props.neonColor) {
            SetVehicleNeonLightsColour(vehicle, props.neonColor[1], props.neonColor[2], props.neonColor[3])
        }
        if (props.headlightColor) {
            SetVehicleHeadlightsColour(vehicle, props.headlightColor)
        }
        if (props.interiorColor) {
            SetVehicleInteriorColour(vehicle, props.interiorColor)
        }
        if (props.wheelSize) {
            SetVehicleWheelSize(vehicle, props.wheelSize)
        }
        if (props.wheelWidth) {
            SetVehicleWheelWidth(vehicle, props.wheelWidth)
        }
        if (props.tyreSmokeColor) {
            SetVehicleTyreSmokeColor(vehicle, props.tyreSmokeColor[1], props.tyreSmokeColor[2], props.tyreSmokeColor[3])
        }
        if (props.modSpoilers) {
            SetVehicleMod(vehicle, 0, props.modSpoilers, false)
        }
        if (props.modFrontBumper) {
            SetVehicleMod(vehicle, 1, props.modFrontBumper, false)
        }
        if (props.modRearBumper) {
            SetVehicleMod(vehicle, 2, props.modRearBumper, false)
        }
        if (props.modSideSkirt) {
            SetVehicleMod(vehicle, 3, props.modSideSkirt, false)
        }
        if (props.modExhaust) {
            SetVehicleMod(vehicle, 4, props.modExhaust, false)
        }
        if (props.modFrame) {
            SetVehicleMod(vehicle, 5, props.modFrame, false)
        }
        if (props.modGrille) {
            SetVehicleMod(vehicle, 6, props.modGrille, false)
        }
        if (props.modHood) {
            SetVehicleMod(vehicle, 7, props.modHood, false)
        }
        if (props.modFender) {
            SetVehicleMod(vehicle, 8, props.modFender, false)
        }
        if (props.modRightFender) {
            SetVehicleMod(vehicle, 9, props.modRightFender, false)
        }
        if (props.modRoof) {
            SetVehicleMod(vehicle, 10, props.modRoof, false)
        }
        if (props.modEngine) {
            SetVehicleMod(vehicle, 11, props.modEngine, false)
        }
        if (props.modBrakes) {
            SetVehicleMod(vehicle, 12, props.modBrakes, false)
        }
        if (props.modTransmission) {
            SetVehicleMod(vehicle, 13, props.modTransmission, false)
        }
        if (props.modHorns) {
            SetVehicleMod(vehicle, 14, props.modHorns, false)
        }
        if (props.modSuspension) {
            SetVehicleMod(vehicle, 15, props.modSuspension, false)
        }
        if (props.modArmor) {
            SetVehicleMod(vehicle, 16, props.modArmor, false)
        }
        if (props.modKit17) {
            SetVehicleMod(vehicle, 17, props.modKit17, false)
        }
        if (props.modTurbo) {
            ToggleVehicleMod(vehicle, 18, props.modTurbo)
        }
        if (props.modKit19) {
            SetVehicleMod(vehicle, 19, props.modKit19, false)
        }
        if (props.modSmokeEnabled) {
            ToggleVehicleMod(vehicle, 20, props.modSmokeEnabled)
        }
        if (props.modKit21) {
            SetVehicleMod(vehicle, 21, props.modKit21, false)
        }
        if (props.modXenon) {
            ToggleVehicleMod(vehicle, 22, props.modXenon)
        }
        if (props.xenonColor) {
            SetVehicleXenonLightsColor(vehicle, props.xenonColor)
        }
        if (props.modFrontWheels) {
            SetVehicleMod(vehicle, 23, props.modFrontWheels, false)
        }
        if (props.modBackWheels) {
            SetVehicleMod(vehicle, 24, props.modBackWheels, false)
        }
        if (props.modCustomTiresF) {
            SetVehicleMod(vehicle, 23, props.modFrontWheels, props.modCustomTiresF)
        }
        if (props.modCustomTiresR) {
            SetVehicleMod(vehicle, 24, props.modBackWheels, props.modCustomTiresR)
        }
        if (props.modPlateHolder) {
            SetVehicleMod(vehicle, 25, props.modPlateHolder, false)
        }
        if (props.modVanityPlate) {
            SetVehicleMod(vehicle, 26, props.modVanityPlate, false)
        }
        if (props.modTrimA) {
            SetVehicleMod(vehicle, 27, props.modTrimA, false)
        }
        if (props.modOrnaments) {
            SetVehicleMod(vehicle, 28, props.modOrnaments, false)
        }
        if (props.modDashboard) {
            SetVehicleMod(vehicle, 29, props.modDashboard, false)
        }
        if (props.modDial) {
            SetVehicleMod(vehicle, 30, props.modDial, false)
        }
        if (props.modDoorSpeaker) {
            SetVehicleMod(vehicle, 31, props.modDoorSpeaker, false)
        }
        if (props.modSeats) {
            SetVehicleMod(vehicle, 32, props.modSeats, false)
        }
        if (props.modSteeringWheel) {
            SetVehicleMod(vehicle, 33, props.modSteeringWheel, false)
        }
        if (props.modShifterLeavers) {
            SetVehicleMod(vehicle, 34, props.modShifterLeavers, false)
        }
        if (props.modAPlate) {
            SetVehicleMod(vehicle, 35, props.modAPlate, false)
        }
        if (props.modSpeakers) {
            SetVehicleMod(vehicle, 36, props.modSpeakers, false)
        }
        if (props.modTrunk) {
            SetVehicleMod(vehicle, 37, props.modTrunk, false)
        }
        if (props.modHydrolic) {
            SetVehicleMod(vehicle, 38, props.modHydrolic, false)
        }
        if (props.modEngineBlock) {
            SetVehicleMod(vehicle, 39, props.modEngineBlock, false)
        }
        if (props.modAirFilter) {
            SetVehicleMod(vehicle, 40, props.modAirFilter, false)
        }
        if (props.modStruts) {
            SetVehicleMod(vehicle, 41, props.modStruts, false)
        }
        if (props.modArchCover) {
            SetVehicleMod(vehicle, 42, props.modArchCover, false)
        }
        if (props.modAerials) {
            SetVehicleMod(vehicle, 43, props.modAerials, false)
        }
        if (props.modTrimB) {
            SetVehicleMod(vehicle, 44, props.modTrimB, false)
        }
        if (props.modTank) {
            SetVehicleMod(vehicle, 45, props.modTank, false)
        }
        if (props.modWindows) {
            SetVehicleMod(vehicle, 46, props.modWindows, false)
        }
        if (props.modKit47) {
            SetVehicleMod(vehicle, 47, props.modKit47, false)
        }
        if (props.modLivery) {
            SetVehicleMod(vehicle, 48, props.modLivery, false)
            SetVehicleLivery(vehicle, props.modLivery)
        }
        if (props.modKit49) {
            SetVehicleMod(vehicle, 49, props.modKit49, false)
        }
        if (props.liveryRoof) {
            SetVehicleRoofLivery(vehicle, props.liveryRoof)
        }
    }
}

QBCore.Functions.LoadParticleDictionary = function (dictionary) {
    if (HasNamedPtfxAssetLoaded(dictionary)) return
    RequestNamedPtfxAsset(dictionary)
    while (!HasNamedPtfxAssetLoaded(dictionary)) {
        Wait(0)
    }
}

// QBCore.Functions.StartParticleAtCoord = function (dict, ptName, looped, coords, rot, scale, alpha, color, duration) {
//     if (!coords) {
//         coords = GetEntityCoords(PlayerPedId())
//     }
//     QBCore.Functions.LoadParticleDictionary(dict)
//     UseParticleFxAssetNextCall(dict)
//     SetPtfxAssetNextCall(dict)
//     var particleHandle
//     if (looped) {
//         particleHandle = StartParticleFxLoopedAtCoord(ptName, coords[0], coords[1], coords[2], rot.x, rot.y, rot.z, scale || 1.0)
//         if (color) {
//             SetParticleFxLoopedColour(particleHandle, color.r, color.g, color.b, false)
//         }
//         SetParticleFxLoopedAlpha(particleHandle, alpha || 10.0)
//         if (duration) {
//             Wait(duration)
//             StopParticleFxLooped(particleHandle, 0)
//         }
//     } else {
//         SetParticleFxNonLoopedAlpha(alpha || 10.0)
//         if (color) {
//             SetParticleFxNonLoopedColour(color.r, color.g, color.b)
//         }
//         StartParticleFxNonLoopedAtCoord(ptName, coords[0], coords[1], coords[2], rot.x, rot.y, rot.z, scale || 1.0)
//     }
//     return particleHandle
// }

// QBCore.Functions.StartParticleOnEntity = function (dict, ptName, looped, entity, bone, offset, rot, scale, alpha, color, evolution, duration) {
//     QBCore.Functions.LoadParticleDictionary(dict)
//     UseParticleFxAssetNextCall(dict)
//     var particleHandle, boneID
//     if (bone && GetEntityType(entity) == 1) {
//         boneID = GetPedBoneIndex(entity, bone)
//     } else
//     if (bone) {
//         boneID = GetEntityBoneIndexByName(entity, bone)
//     }
//     if (looped) {
//         if (bone) {
//             particleHandle = StartParticleFxLoopedOnEntityBone(ptName, entity, offset.x, offset.y, offset.z, rot.x, rot.y, rot.z, boneID, scale)
//         } else {
//             particleHandle = StartParticleFxLoopedOnEntity(ptName, entity, offset.x, offset.y, offset.z, rot.x, rot.y, rot.z, scale)
//         }
//         if (evolution) {
//             SetParticleFxLoopedEvolution(particleHandle, evolution.name, evolution.amount, false)
//         }
//         if (color) {
//             SetParticleFxLoopedColour(particleHandle, color.r, color.g, color.b, false)
//         }
//         SetParticleFxLoopedAlpha(particleHandle, alpha)
//         if (duration) {
//             Wait(duration)
//             StopParticleFxLooped(particleHandle, 0)
//         }
//     } else {
//         SetParticleFxNonLoopedAlpha(alpha || 10.0)
//         if (color) {
//             SetParticleFxNonLoopedColour(color.r, color.g, color.b)
//         }
//         if (bone) {
//             StartParticleFxNonLoopedOnPedBone(ptName, entity, offset.x, offset.y, offset.z, rot.x, rot.y, rot.z, boneID, scale)
//         } else {
//             StartParticleFxNonLoopedOnEntity(ptName, entity, offset.x, offset.y, offset.z, rot.x, rot.y, rot.z, scale)
//         }
//     }
//     return particleHandle
// }

QBCore.Functions.GetStreetNametAtCoords = function (coords) {
    var [streetname1, streetname2] = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    return {
        main: GetStreetNameFromHashKey(streetname1),
        cross: GetStreetNameFromHashKey(streetname2)
    }
}

QBCore.Functions.GetZoneAtCoords = function (coords) {
    return GetLabelText(GetNameOfZone(coords))
}

QBCore.Functions.GetCardinalDirection = function (entity) {
    entity = DoesEntityExist(entity) && entity || PlayerPedId()
    if (DoesEntityExist(entity)) {
        let heading = GetEntityHeading(entity)
        if ((heading >= 0 && heading < 45) || (heading >= 315 && heading < 360)) {
            return "North"
        } else if (heading >= 45 && heading < 135) {
            return "West"
        } else if (heading >= 135 && heading < 225) {
            return "South"
        } else if (heading >= 225 && heading < 315) {
            return "East"
        }
    } else {
        return "Cardinal Direction Error"
    }
}

QBCore.Functions.GetCurrentTime = function () {
    var obj = {}
    obj.min = GetClockMinutes()
    obj.hour = GetClockHours()

    if (obj.hour <= 12) {
        obj.ampm = "AM"
    } else if (obj.hour >= 13) {
        obj.ampm = "PM"
        obj.formattedHour = obj.hour - 12
    }
    if (obj.min <= 9) {
        obj.formattedMin = "0" + obj.min
    } else {
        obj.formattedMin = obj.min.toString()
    }
    return obj
}

QBCore.Functions.GetGroundZCoord = function (coords) {
    if (!coords) return
    var [retval, groundZ] = GetGroundZFor_3dCoord(coords[0], coords[1], coords[2], 0)
    if (retval) {
        return {
            x: coords.x,
            y: coords.y,
            z: groundZ
        }
    } else {
        console.log('Couldn\'t find Ground Z Coordinates given 3D Coordinates')
        console.log(coords)
        return coords
    }
}

QBCore.Functions.GetGroundHash = function (entity) {
    var coords = GetEntityCoords(entity)
    var num = StartShapeTestCapsule(coords[0], coords[1], coords[2] + 4, coords[0], coords[1], coords[2] - 2.0, 1, 1, entity, 7)
    var [retval, success, endCoords, surfaceNormal, materialHash, entityHit] = GetShapeTestResultIncludingMaterial(num)
    return {
        materialHash,
        entityHit,
        surfaceNormal,
        endCoords,
        success,
        retval
    }
}








console.log(
    'oi',
    QBCore.Functions.GetGroundZCoord(PlayerPedId())
    // QBCore.Functions.GetVehicleLabel(GetVehiclePedIsIn(PlayerPedId(), false))
)