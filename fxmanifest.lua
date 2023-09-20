fx_version 'cerulean'
game 'gta5'
author 'maia'
description 'QB-Core in Javascript using MongoDB.'
version '1.2.6' -- version '1.0.0'

shared_scripts {
    'config.js',
    'shared/locale.js',
    'locale/en.js',
    'locale/*.js',
    'shared/index.js',
    'shared/jobs.js',
    'shared/gangs.js',
    -- 'shared/items.js',
    -- 'shared/vehicles.js',
    -- 'shared/weapons.js',
    -- 'shared/locations.js'
}

client_scripts {
    'client/global.js',
    'client/index.js',
    'client/functions.js',
    'client/loops.js',
    'client/events.js',
    'client/drawtext.js'
}

server_scripts {
    'server/global.js',
    'server/index.js',
    'server/functions.lua', -- Lua
    'server/functions.js',
    'server/player.js',
    'server/exports.js',
    'server/events.js',
    'server/debug.js',
    'server/commands.js',
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/css/style.css',
    'html/css/drawtext.css',
    'html/js/*.js'
}

dependencies {
    'db'
}