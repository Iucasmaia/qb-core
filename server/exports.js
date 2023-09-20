/**
 * Add or change (a) method(s) in the QBCore.Functions table.
 * 
 * @param {string} methodName 
 * @param {Function} handler 
 * @returns {Object}
 */
function SetMethod (methodName, handler) {
    if (typeof methodName != "string") {
        return {
            status: false,
            message: "invalid_method_name"
        }
    }
    QBCore.Functions[methodName] = handler
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.SetMethod = SetMethod
exports("SetMethod", SetMethod)

/**
 * Add or change (a) field(s) in the QBCore table.
 * 
 * @param {string} fieldName 
 * @param {any} data 
 * @returns {Object}
 */
function SetField (fieldName, data) {
    if (typeof fieldName != "string") {
        return {
            status: false,
            message: "invalid_field_name"
        }
    }
    QBCore[fieldName] = data
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.SetField = SetField
exports("SetField", SetField)

/**
 * Single add job function which should only be used if you planning on adding a single job.
 * 
 * @param {string} jobName 
 * @param {any} job 
 * @returns {Object}
 */
function AddJob (jobName, job) {
    if (typeof jobName != "string") {
        return {
            status: false,
            message: "invalid_job_name"
        }
    }

    if (QBCore.Shared.Jobs[jobName]) {
        return {
            status: false,
            message: "job_exists"
        }
    }
    QBCore.Shared.Jobs[jobName] = job
    emit('QBCore:Client:OnSharedUpdate', -1, 'Jobs', jobName, job)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.AddJob = AddJob
exports('AddJob', AddJob)

/**
 * Multiple Add Jobs.
 * 
 * @param {Object} jobs 
 * @returns {Object}
 */
function AddJobs (jobs) {
    var shouldContinue = true
    var message = "success"
    var errorItem = null

    for (let key in jobs) {
        if (typeof key !== "string") {
            message = 'invalid_job_name'
            shouldContinue = false
            errorItem = jobs[key]
            break
        }

        if (QBCore.Shared.Jobs[key]) {
            message = 'job_exists'
            shouldContinue = false
            errorItem = jobs[key]
            break
        }
        QBCore.Shared.Jobs[key] = value
    }

    if (!shouldContinue) return {
        status: false,
        message: message,
        error: errorItem
    }
    emit('QBCore:Client:OnSharedUpdateMultiple', -1, 'Jobs', jobs)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        false: message,
        error: null
    }
}

QBCore.Functions.AddJobs = AddJobs
exports('AddJobs', AddJobs)

/**
 * Single Remove Job.
 * 
 * @param {string} jobName 
 * @returns {Object}
 */
function RemoveJob (jobName) {
    if (typeof jobName != "string") {
        return false, "invalid_job_name"
    }

    if (!QBCore.Shared.Jobs[jobName]) {
        return {
            status: false,
            message: "job_not_exists"
        }
    }
    delete QBCore.Shared.Jobs[jobName]
    emit('QBCore:Client:OnSharedUpdate', -1, 'Jobs', jobName, null)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.RemoveJob = RemoveJob
exports('RemoveJob', RemoveJob)

/**
 * Single Update Job.
 * 
 * @param {string} jobName 
 * @param {any} job 
 * @returns {Object}
 */
function UpdateJob (jobName, job) {
    if (typeof jobName !== "string") {
        return {
            status: false,
            message: "invalid_job_name"
        }
    }

    if (!QBCore.Shared.Jobs[jobName]) {
        return false, "job_not_exists"
    }
    QBCore.Shared.Jobs[jobName] = job
    emit('QBCore:Client:OnSharedUpdate', -1, 'Jobs', jobName, job)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.UpdateJob = UpdateJob
exports('UpdateJob', UpdateJob)

/**
 * Single Add Item.
 * 
 * @param {string} itemName 
 * @param {any} item 
 * @returns {Object}
 */
function AddItem (itemName, item) {
    if (typeof itemName !== "string") {
        return {
            status: false,
            message: "invalid_item_name"
        }
    }

    if (QBCore.Shared.Items[itemName]) {
        return {
            status: false,
            message: "item_exists"
        }
    }

    QBCore.Shared.Items[itemName] = item

    emit('QBCore:Client:OnSharedUpdate', -1, 'Items', itemName, item)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.AddItem = AddItem
exports('AddItem', AddItem)

/**
 * Single Update Item.
 * 
 * @param {string} itemName 
 * @param {any} item 
 * @returns {Object}
 */
function UpdateItem (itemName, item) {
    if (typeof itemName !== "string") {
        return {
            status: false,
            message: "invalid_item_name"
        }
    }
    if (!QBCore.Shared.Items[itemName]) {
        return {
            status: false,
            message: "item_not_exists"
        }
    }
    QBCore.Shared.Items[itemName] = item
    emit('QBCore:Client:OnSharedUpdate', -1, 'Items', itemName, item)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        false: "success"
    }
}

QBCore.Functions.UpdateItem = UpdateItem
exports('UpdateItem', UpdateItem)

/**
 * Multiple Add Items.
 * 
 * @param {Object} items 
 * @returns {Object}
 */
function AddItems (items) {
    var shouldContinue = true
    var message = "success"
    var errorItem = null

    for (let key in items) {
        if (typeof key !== "string") {
            message = "invalid_item_name"
            shouldContinue = false
            errorItem = items[key]
            break
        }

        if (QBCore.Shared.Items[key]) {
            message = "item_exists"
            shouldContinue = false
            errorItem = items[key]
            break
        }

        QBCore.Shared.Items[key] = value
    }

    if (!shouldContinue) return {
        status: false,
        message: message,
        error: errorItem
    }
    emit('QBCore:Client:OnSharedUpdateMultiple', -1, 'Items', items)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: message,
        error: null
    }
}

QBCore.Functions.AddItems = AddItems
exports('AddItems', AddItems)

/**
 * Single Remove Item.
 * 
 * @param {string} itemName 
 * @returns {[boolean, string]}
 */
function RemoveItem (itemName) {
    if (typeof itemName !== "string") {
        return {
            status: false,
            message: "invalid_item_name"
        }
    }

    if (!QBCore.Shared.Items[itemName]) {
        return {
            status: false,
            message: "item_not_exists"
        }
    }
    delete QBCore.Shared.Items[itemName]
    emit('QBCore:Client:OnSharedUpdate', -1, 'Items', itemName, null)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.RemoveItem = RemoveItem
exports('RemoveItem', RemoveItem)

/**
 * Single Add Gang.
 * 
 * @param {string} gangName 
 * @param {Object} gang 
 * @returns {Object}
 */
function AddGang (gangName, gang) {
    if (typeof gangName !== "string") {
        return {
            status: false,
            message: "invalid_gang_name"
        }
    }

    if (QBCore.Shared.Gangs[gangName]) {
        return {
            status: false,
            message: "gang_exists"
        }
    }
    QBCore.Shared.Gangs[gangName] = gang
    emit('QBCore:Client:OnSharedUpdate', -1, 'Gangs', gangName, gang)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.AddGang = AddGang
exports('AddGang', AddGang)

/**
 * Multiple Add Gangs.
 * 
 * @param {Object} gangs 
 * @returns {Object}
 */
function AddGangs (gangs) {
    var shouldContinue = true
    var message = "success"
    var errorItem = null

    for (let key in gangs) {
        if (typeof key !== "string") {
            message = "invalid_gang_name"
            shouldContinue = false
            errorItem = gangs[key]
            break
        }

        if (QBCore.Shared.Gangs[key]) {
            message = "gang_exists"
            shouldContinue = false
            errorItem = gangs[key]
            break
        }
        QBCore.Shared.Gangs[key] = value
    }

    if (!shouldContinue) {
        return {
            status: false,
            message: message,
            error: errorItem
        }
    }
    emit('QBCore:Client:OnSharedUpdateMultiple', -1, 'Gangs', gangs)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: message,
        error: null
    }
}

QBCore.Functions.AddGangs = AddGangs
exports('AddGangs', AddGangs)

/**
 * Single Remove Item.
 * 
 * @param {string} itemName 
 * @returns {Object}
 */
function RemoveGang (gangName) {
    if (typeof gangName !== "string") {
        return {
            status: false,
            message: "invalid_gang_name"
        }
    }

    if (!QBCore.Shared.Gangs[gangName]) {
        return {
            status: false,
            message: "gang_not_exists"
        }
    }
    delete QBCore.Shared.Gangs[gangName]
    emit('QBCore:Client:OnSharedUpdate', -1, 'Gangs', gangName, null)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.RemoveGang = RemoveGang
exports('RemoveGang', RemoveGang)

/**
 * Multiple Add Gangs.
 * 
 * @param {Object} gangs 
 * @returns {Object}
 */
function UpdateGang (gangName, gang) {
    if (typeof gangName !== "string") {
        return {
            status: false,
            message: "invalid_gang_name"
        }
    }

    if (!QBCore.Shared.Gangs[gangName]) {
        return {
            status: false,
            message: "gang_not_exists"
        }
    }
    QBCore.Shared.Gangs[gangName] = gang
    emit('QBCore:Client:OnSharedUpdate', -1, 'Gangs', gangName, gang)
    emit('QBCore:Server:UpdateObject')
    return {
        status: true,
        message: "success"
    }
}

QBCore.Functions.UpdateGang = UpdateGang
exports('UpdateGang', UpdateGang)

/**
 * Get the core version.
 * 
 * @param {string} invokingResource 
 * @returns {string}
 */
function GetCoreVersion (InvokingResource) {
    var resourceVersion = GetResourceMetadata(GetCurrentResourceName(), 'version')
    if (InvokingResource || InvokingResource !== '') {
        console.log(`${invokingResource || 'Unknown Resource'} called qbcore version check: ${resourceVersion}`)
    }
    return resourceVersion
}

QBCore.Functions.GetCoreVersion = GetCoreVersion
exports('GetCoreVersion', GetCoreVersion)

async function ExploitBan (playerId, origin) {
    var name = GetPlayerName(playerId)
    await db.adicionarBanimento(
        name,
        QBCore.Functions.GetIdentifier(playerId, 'license'),
        QBCore.Functions.GetIdentifier(playerId, 'discord'),
        QBCore.Functions.GetIdentifier(playerId, 'ip'),
        origin,
        2147483647,
        'Anti Cheat'
    )
    DropPlayer(playerId, Lang.t('info.exploit_banned', {discord: QBCore.Config.Server.Discord}))
    emit("qb-log:server:CreateLog", "anticheat", "Anti-Cheat", "red", `${name} has been banned for exploiting ${origin}`, true)
}

exports('ExploitBan', ExploitBan)