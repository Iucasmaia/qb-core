global.QBCore = global.QBCore || {}
QBCore.Config = global.QBConfig
QBCore.Shared = global.QBShared
global.QBCore.ClientCallbacks = global.QBCore.ClientCallbacks || {}
global.QBCore.ServerCallbacks = global.QBCore.ServerCallbacks || {}

exports('GetCoreObject', function () {
    return QBCore
})
// To use this export in a script instead of manifest method
// Just put this line of code below at the very top of the script
// var QBCore = exports['qbjs']:GetCoreObject()