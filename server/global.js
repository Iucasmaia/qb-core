global.db = require('../db')
global.Wait = (ms) => new Promise(resolve =>  setTimeout(resolve, ms))