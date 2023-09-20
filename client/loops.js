setTick(async () => {
    var sleep = 0
    if (LocalPlayer.state.isLoggedIn) {
        sleep = (1000 * 60) * QBCore.Config.UpdateInterval
        emitNet('QBCore:UpdatePlayer')
    }
    await Wait(sleep)
})

setTick(async () => {
    if (LocalPlayer.state.isLoggedIn) {
        if ((QBCore.PlayerData.metadata['hunger'] <= 0 || QBCore.PlayerData.metadata['thirst'] <= 0) && !(QBCore.PlayerData.metadata['isdead'] || QBCore.PlayerData.metadata["inlaststand"])) {    
            var ped = PlayerPedId();
            var currentHealth = GetEntityHealth(ped);
            var decreaseThreshold = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
            SetEntityHealth(ped, currentHealth - decreaseThreshold);
        }
    }
    await Wait(QBCore.Config.StatusInterval)
})