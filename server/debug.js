/**
 * Prints a table/object recursively with indents.
 * 
 * @param {Object} obj - The object to print.
 * @param {number} [indent=0] - The current indent level.
 */
function tPrint(obj, indent = 0) {
    if (typeof obj === 'object' && obj !== null) {
        for (const [k, v] of Object.entries(obj)) {
            const objType = typeof v
            const formatting = `${"  ".repeat(indent)} ${k}:`

            if (objType === "object") {
                console.log(`\x1b[33m${formatting}\x1b[0m`)
                tPrint(v, indent + 1);
            } else if (objType === 'boolean') {
                console.log(`\x1b[31m${formatting} ${v}\x1b[0m`)
            } else if (objType === "function") {
                console.log(`\x1b[35m${formatting} ${v}\x1b[0m`)
            } else if (objType === 'number') {
                console.log(`\x1b[34m${formatting} ${v}\x1b[0m`)
            } else if (objType === 'string') {
                console.log(`\x1b[32m${formatting} '${v}'\x1b[0m`)
            } else {
                console.log(`\x1b[37m${formatting} ${v}\x1b[0m`)
            }
        }
    } else {
        console.log(`${"  ".repeat(indent)}\x1b[37m${obj}\x1b[0m`)
    }
}

onNet('QBCore:DebugSomething', (tbl, indent, resource) => {
    console.log(`\x1b[4m\x1b[36m[ ${resource} : DEBUG]\x1b[0m`)
    tPrint(tbl, indent)
    console.log('\x1b[4m\x1b[36m[ END DEBUG ]\x1b[0m')
})

QBCore.Debug = function(tbl, indent) {
    emit('QBCore:DebugSomething', tbl, indent, GetInvokingResource() || "qb-core")
}

QBCore.ShowError = function(resource, msg) {
    console.log('\x1b[31m[' + resource + ':ERROR]\x1b[0m ' + msg)
}

QBCore.ShowSuccess = function(resource, msg) {
    console.log('\x1b[32m[' + resource + ':LOG]\x1b[0m ' + msg)
}