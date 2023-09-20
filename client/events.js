// Player load and unload handling
// New method for checking if logged in across all scripts (optional)
// if LocalPlayer.state['isLoggedIn'] then
onNet('QBCore:Client:OnPlayerLoaded', () => {
    ShutdownLoadingScreenNui()
    LocalPlayer.state.set('isLoggedIn', true, false)
    if (!QBConfig.Server.PVP) return
    SetCanAttackFriendly(PlayerPedId(), true, false)
    NetworkSetFriendlyFireOption(true)
})

onNet('QBCore:Client:OnPlayerUnload', () => {
    LocalPlayer.state.set('isLoggedIn', false, false)
})

onNet('QBCore:Client:PvpHasToggled', (pvp_state) => {
    SetCanAttackFriendly(PlayerPedId(), pvp_state, false)
    NetworkSetFriendlyFireOption(pvp_state)
})

// Teleport Commands

onNet('QBCore:Command:TeleportToPlayer', (coords) => {
    var ped = PlayerPedId()
    SetPedCoordsKeepVehicle(ped, coords[0], coords[1], coords[2])
})

onNet('QBCore:Command:TeleportToCoords', (x, y, z, h) => {
    var ped = PlayerPedId()
    SetPedCoordsKeepVehicle(ped, x, y, z)
    SetEntityHeading(ped, h || GetEntityHeading(ped))
})

onNet('QBCore:Command:GoToMarker', async () => {
    const blipMarker = GetFirstBlipInfoId(8)
    if (!DoesBlipExist(blipMarker)) {
        QBCore.Functions.Notify(Lang.t("error.no_waypoint"), "error", 5000)
        return 'marker'
    }

    // Fade screen to hide how clients get teleported.
    DoScreenFadeOut(650)
    while (!IsScreenFadedOut()) {
        await Wait(0)
    }

    const ped = PlayerPedId()
    const coords = GetBlipInfoIdCoord(blipMarker)
    const vehicle = GetVehiclePedIsIn(ped, false)
    const oldCoords = GetEntityCoords(ped)

    const x = coords[0]
    const y = coords[1]
    const Z_START = 950.0
    let found = false
    let groundZ = 850.0

    if (vehicle > 0) {
        FreezeEntityPosition(vehicle, true)
    } else {
        FreezeEntityPosition(ped, true)
    }

    for (let i = Z_START; i >= 0; i -= 25.0) {
        let z = i;
        if ((i % 2) !== 0) {
            z = Z_START - i
        }
        NewLoadSceneStart(x, y, z, x, y, z, 50.0, 0)
        const curTime = GetGameTimer()
        while (IsNetworkLoadingScene()) {
            if (GetGameTimer() - curTime > 1000) {
                break
            }
            await Wait(0)
        }
        NewLoadSceneStop()
        SetPedCoordsKeepVehicle(ped, x, y, z)

        while (!HasCollisionLoadedAroundEntity(ped)) {
            RequestCollisionAtCoord(x, y, z)
            if (GetGameTimer() - curTime > 1000) {
                break
            }
            await Wait(0)
        }
        [found, groundZ] = GetGroundZFor_3dCoord(x, y, z, false)
        if (found) {
            Wait(0)
            SetPedCoordsKeepVehicle(ped, x, y, groundZ)
            break
        }
        await Wait(0)
    }

    DoScreenFadeIn(650)
    if (vehicle > 0) {
        FreezeEntityPosition(vehicle, false)
    } else {
        FreezeEntityPosition(ped, false)
    }

    if (!found) {
        SetPedCoordsKeepVehicle(ped, oldCoords.x, oldCoords.y, oldCoords.z - 1.0)
        QBCore.Functions.Notify(Lang.t("error.tp_error"), "error", 5000)
    }

    SetPedCoordsKeepVehicle(ped, x, y, groundZ)
    QBCore.Functions.Notify(Lang.t("success.teleported_waypoint"), "success", 5000)
})

// Vehicle Commands

onNet('QBCore:Command:SpawnVehicle', async (vehName) => {
    var ped = PlayerPedId()
    var hash = GetHashKey(vehName)
    var coords = GetEntityCoords(ped)
    var veh = GetVehiclePedIsUsing(ped)
    if (!IsModelInCdimage(hash)) return
    RequestModel(hash)
    while (!HasModelLoaded(hash)) {
        await Wait(0)
    }
    if (IsPedInAnyVehicle(ped, false)) {
        SetEntityAsMissionEntity(veh, true, true)
        DeleteVehicle(veh)
    }
    var vehicle = CreateVehicle(hash, coords[0], coords[1], coords[2], GetEntityHeading(ped), true, false)
    TaskWarpPedIntoVehicle(ped, vehicle, -1)
    SetVehicleFuelLevel(vehicle, 100.0)
    SetVehicleDirtLevel(vehicle, 0.0)
    SetModelAsNoLongerNeeded(hash)
    emit("vehiclekeys:client:SetOwner", QBCore.Functions.GetPlate(vehicle))
})

onNet('QBCore:Command:DeleteVehicle', () => {
    var ped = PlayerPedId()
    var veh = GetVehiclePedIsUsing(ped)
    
    if (veh !== 0) {
        SetEntityAsMissionEntity(veh, true, true)
        DeleteVehicle(veh)
    } else {
        var pcoords = GetEntityCoords(ped)
        var vehicles = GetGamePool('CVehicle')
        vehicles.forEach(v => {
            if (Vdist(pcoords[0], pcoords[1], pcoords[2], GetEntityCoords(v)[0], GetEntityCoords(v)[1], GetEntityCoords(v)[2]) <= 5.0) {
                SetEntityAsMissionEntity(v, true, true)
                DeleteVehicle(v)
            }
        })
    }
})

onNet('QBCore:Client:VehicleInfo', (info) => {
    var plate = exports.QBCore.Functions.GetPlate(info.vehicle)
    var hasKeys = true

    if (GetResourceState('qb-vehiclekeys') === 'started') {
        hasKeys = exports['qb-vehiclekeys'].HasKeys()
    }
    var data = {
        vehicle: info.vehicle,
        seat: info.seat,
        name: info.modelName,
        plate: plate,
        driver: GetPedInVehicleSeat(info.vehicle, -1),
        inseat: GetPedInVehicleSeat(info.vehicle, info.seat),
        haskeys: hasKeys
    }
    emit('QBCore:Client:' + info.event + 'Vehicle', data)
})

// Other stuff

onNet('QBCore:Player:SetPlayerData', (val) => {
    QBCore.PlayerData = val
})

onNet('QBCore:Player:UpdatePlayerData', () => {
    emitNet('QBCore:UpdatePlayer')
})

onNet('QBCore:Notify', (text, type, length) => {
    QBCore.Functions.Notify(text, type, length)
})

// This event is exploitable and should not be used. It has been deprecated, and will be removed soon.
onNet('QBCore:Client:UseItem', (item) => {
    const invokingResource = GetInvokingResource()
    const playerId = GetPlayerServerId(PlayerId())
    const debugMessage = `${invokingResource} triggered QBCore:Client:UseItem by ID ${playerId} with the following data. This event is deprecated due to exploitation, and will be removed soon. Check qb-inventory for the right use on this event.`
    QBCore.Debug(debugMessage)
    QBCore.Debug(item)
})

// Callback Events --

// Client Callback
onNet('QBCore:Client:TriggerClientCallback', (name, ...args) => {
    QBCore.Functions.TriggerClientCallback(name, (...args) => {
        emitNet('QBCore:Server:TriggerClientCallback', name, ...args)
    }, ...args)
})

// Server Callback
RegisterNetEvent('QBCore:Client:TriggerCallback', (name, ...args) => {
    if (QBCore.ServerCallbacks[name]) {
        QBCore.ServerCallbacks[name](...args)
        delete QBCore.ServerCallbacks[name]
    }
})

// Me command

function Draw3DText (coords, str) {
    var [onScreen, worldX, worldY] = World3dToScreen2d(coords[0], coords[1], coords[2])
    var camCoords = GetGameplayCamCoord()
    var distance = Vdist(camCoords[0], camCoords[1], camCoords[2], coords[0], coords[1], coords[2])
    var scale = 200 / (GetGameplayCamFov() * distance)
    if (onScreen) {
        SetTextScale(1.0, 0.5 * scale)
        SetTextFont(4)
        SetTextColour(255, 255, 255, 255)
        SetTextEdge(2, 0, 0, 0, 150)
        SetTextProportional(1)
        SetTextOutline()
        SetTextCentre(1)
        BeginTextCommandDisplayText("STRING")
        AddTextComponentSubstringPlayerName(str)
        EndTextCommandDisplayText(worldX, worldY)
    }
}

onNet('QBCore:Command:ShowMe3D', (senderId, msg) => {
    var sender = GetPlayerFromServerId(senderId)
    setTick(async () => {
        var displayTime = 5000 + GetGameTimer()
        while (displayTime > GetGameTimer()) {
            var targetPed = GetPlayerPed(sender)
            var tCoords = GetEntityCoords(targetPed)
            Draw3DText(tCoords, msg)
            await Wait(0)
        }
    })
})

// Listen to Shared being updated
onNet('QBCore:Client:OnSharedUpdate', (tableName, key, value) => {
    QBCore.Shared[tableName][key] = value
    emit('QBCore:Client:UpdateObject')
})

onNet('QBCore:Client:OnSharedUpdateMultiple', (tableName, values) => {
    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            QBCore.Shared[tableName][key] = values[key]
        }
    }
    emit('QBCore:Client:UpdateObject')
})