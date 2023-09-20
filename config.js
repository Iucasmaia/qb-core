
global.vector2 = (x, y) => ({
    x: x * 1.0,
    y: y * 1.0
})

global.vector3 = (x, y, z) => ({
    x: x * 1.0,
    y: y * 1.0,
    z: z * 1.0
})

global.vector4 = (x, y, z, w) => ({
    x: x * 1.0,
    y: y * 1.0,
    z: z * 1.0,
    heading: w * 1.0
})

global.diff2D = (p1, p2) => {
    return PolyVectorTools.vector2(Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y))
}

global.distance2D = (p1, p2) => {
    const x = p1.x - p2.x
    const y = p1.y - p2.y
    return Math.sqrt(x * x + y * y)
}

global.midpoint2d = (p1, p2) => global.vector2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)


global.QBConfig = {}

QBConfig.MaxPlayers = GetConvarInt('sv_maxclients', 48) // Gets max players from config file, default 48
QBConfig.DefaultSpawn = vector4(-1035.71, -2731.87, 12.86, 0.0)
QBConfig.UpdateInterval = 5 // how often to update player data in minutes
QBConfig.StatusInterval = 5000 // how often to check hunger/thirst status in milliseconds

QBConfig.Money = {}
QBConfig.Money.MoneyTypes = { cash: 500, bank: 5000, crypto: 0 } // type = startamount - Add or remove money types for your server (for ex. blackmoney = 0), remember once added it will not be removed from the database!
QBConfig.Money.DontAllowMinus = [ 'cash', 'crypto' ] // Money that is not allowed going in minus
QBConfig.Money.PayCheckTimeOut = 10 // The time in minutes that it will give the paycheck
QBConfig.Money.PayCheckSociety = false // If true paycheck will come from the society account that the player is employed at, requires qb-management

QBConfig.Player = {}
QBConfig.Player.HungerRate = 4.2 // Rate at which hunger goes down.
QBConfig.Player.ThirstRate = 3.8 // Rate at which thirst goes down.
QBConfig.Player.Bloodtypes = [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
]

QBConfig.Server = {} // General server config
QBConfig.Server.Closed = false // Set server closed (no one can join except people with ace permission 'qbadmin.join')
QBConfig.Server.ClosedReason = "Server Closed" // Reason message to display when people can't join the server
QBConfig.Server.Uptime = 0 // Time the server has been up.
QBConfig.Server.Whitelist = false // Enable or disable whitelist on the server
QBConfig.Server.WhitelistPermission = 'admin' // Permission that's able to enter the server when the whitelist is on
QBConfig.Server.PVP = true // Enable or disable pvp on the server (Ability to shoot other players)
QBConfig.Server.Discord = "" // Discord invite link
QBConfig.Server.CheckDuplicateLicense = false // Check for duplicate rockstar license on join
QBConfig.Server.Permissions = [ 'god', 'admin', 'mod' ] // Add as many groups as you want here after creating them in your server.cfg

QBConfig.Commands = {} // Command Configuration
QBConfig.Commands.OOCColor = [255, 151, 133] // RGB color code for the OOC command

QBConfig.Notify = {}

QBConfig.Notify.NotificationStyling = {
    group: false, // Allow notifications to stack with a badge instead of repeating
    position: "right", // top-left | top-right | bottom-left | bottom-right | top | bottom | left | right | center
    progress: true // Display Progress Bar
}

// These are how you define different notification variants
// The "color" key is background of the notification
// The "icon" key is the css-icon code, this project uses `Material Icons` & `Font Awesome`
QBConfig.Notify.VariantDefinitions = {
    success: {
        classes: 'success',
        icon: 'task_alt'
    },
    primary: {
        classes: 'primary',
        icon: 'notifications'
    },
    error: {
        classes: 'error',
        icon: 'warning'
    },
    police: {
        classes: 'police',
        icon: 'local_police'
    },
    ambulance: {
        classes: 'ambulance',
        icon: 'fas fa-ambulance'
    }
}