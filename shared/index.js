global.QBShared = global.QBShared || {}
let StringCharset = []
let NumberCharset = []

QBShared.StarterItems = [
    {item: 'phone', amount: 1},
    {item: 'id_card', amount: 1},
    {item: 'driver_license', amount: 1},
]

for (let i = 48; i <= 57; i++) NumberCharset.push(String.fromCharCode(i))
for (let i = 65; i <= 90; i++) StringCharset.push(String.fromCharCode(i))
for (let i = 97; i <= 122; i++) StringCharset.push(String.fromCharCode(i))

QBShared.RandomStr = function (length) {
    if (length <= 0) return ''
    return QBShared.RandomStr(length - 1) + StringCharset[Math.floor(Math.random() * StringCharset.length)]
}

QBShared.RandomInt = function (length) {
    if (length <= 0) return ''
    return QBShared.RandomInt(length - 1) + NumberCharset[Math.floor(Math.random() * NumberCharset.length)]
}

QBShared.SplitStr = function (str, delimiter) {
    return str.split(delimiter)
}

QBShared.Trim = function (value) {
    if (!value) return null
    return value.trim()
}

QBShared.FirstToUpper = function (value) {
    if (!value) return null
    return value.charAt(0).toUpperCase() + value.slice(1)
}

QBShared.Round = function (value, numDecimalPlaces) {
    if (!numDecimalPlaces) return Math.round(value)
    let power = Math.pow(10, numDecimalPlaces)
    return Math.round(value * power) / power
}

QBShared.ChangeVehicleExtra = function (vehicle, extra, enable) {
    if (DoesExtraExist(vehicle, extra)) {
        if (enable) {
            SetVehicleExtra(vehicle, extra, false)
            if (!IsVehicleExtraTurnedOn(vehicle, extra)) {
                QBShared.ChangeVehicleExtra(vehicle, extra, enable)
            }
        } else {
            SetVehicleExtra(vehicle, extra, true)
            if (IsVehicleExtraTurnedOn(vehicle, extra)) {
                QBShared.ChangeVehicleExtra(vehicle, extra, enable)
            }
        }
    }
}

QBShared.SetDefaultVehicleExtras = function (vehicle, config) {
    // Clear Extras
    for (let i = 1; i <= 20; i++) {
        if (DoesExtraExist(vehicle, i)) {
            SetVehicleExtra(vehicle, i, 1)
        }
    }
    for (var [id, enabled] of Object.entries(config)) {
        QBShared.ChangeVehicleExtra(vehicle, Number(id), typeof enabled === 'boolean' ? enabled : true)
    }
}

QBShared.MaleNoGloves = {
    [0]: true,
    [1]: true,
    [2]: true,
    [3]: true,
    [4]: true,
    [5]: true,
    [6]: true,
    [7]: true,
    [8]: true,
    [9]: true,
    [10]: true,
    [11]: true,
    [12]: true,
    [13]: true,
    [14]: true,
    [15]: true,
    [18]: true,
    [26]: true,
    [52]: true,
    [53]: true,
    [54]: true,
    [55]: true,
    [56]: true,
    [57]: true,
    [58]: true,
    [59]: true,
    [60]: true,
    [61]: true,
    [62]: true,
    [112]: true,
    [113]: true,
    [114]: true,
    [118]: true,
    [125]: true,
    [132]: true
}

QBShared.FemaleNoGloves = {
    [0]: true,
    [1]: true,
    [2]: true,
    [3]: true,
    [4]: true,
    [5]: true,
    [6]: true,
    [7]: true,
    [8]: true,
    [9]: true,
    [10]: true,
    [11]: true,
    [12]: true,
    [13]: true,
    [14]: true,
    [15]: true,
    [19]: true,
    [59]: true,
    [60]: true,
    [61]: true,
    [62]: true,
    [63]: true,
    [64]: true,
    [65]: true,
    [66]: true,
    [67]: true,
    [68]: true,
    [69]: true,
    [70]: true,
    [71]: true,
    [129]: true,
    [130]: true,
    [131]: true,
    [135]: true,
    [142]: true,
    [149]: true,
    [153]: true,
    [157]: true,
    [161]: true,
    [165]: true
}