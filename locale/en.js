var Translations = {
    error: {
        not_online: 'Player not online',
    },
    success: {
        server_opened: 'The server has been opened',
    },
    info: {
        received_paycheck: 'You received your paycheck of $%{value}',
    },
    command: {
        tp: {
            help: 'TP To Player or Coords (Admin Only)',
            params: {
                x: { name: 'id/x', help: 'ID of player or X position' },
                y: { name: 'y', help: 'Y position' },
                z: { name: 'z', help: 'Z position' },
            },
        },
        car: {
            help: 'Spawn Vehicle (Admin Only)',
            params: {
                model: { name: 'model', help: 'Model name of the vehicle' },
            },
        },
        dv: { help: 'Delete Vehicle (Admin Only)' },
        givemoney: {
            help: 'Give A Player Money (Admin Only)',
            params: {
                id: { name: 'id', help: 'Player ID' },
                moneytype: { name: 'moneytype', help: 'Type of money (cash, bank, crypto)' },
                amount: { name: 'amount', help: 'Amount of money' },
            },
        },
        setmoney: {
            help: 'Set Players Money Amount (Admin Only)',
            params: {
                id: { name: 'id', help: 'Player ID' },
                moneytype: { name: 'moneytype', help: 'Type of money (cash, bank, crypto)' },
                amount: { name: 'amount', help: 'Amount of money' },
            },
        },
        job: { help: 'Check Your Job' },
        setjob: {
            help: 'Set A Players Job (Admin Only)',
            params: {
                id: { name: 'id', help: 'Player ID' },
                job: { name: 'job', help: 'Job name' },
                grade: { name: 'grade', help: 'Job grade' },
            },
        },
        gang: { help: 'Check Your Gang' },
        setgang: {
            help: 'Set A Players Gang (Admin Only)',
            params: {
                id: { name: 'id', help: 'Player ID' },
                gang: { name: 'gang', help: 'Gang name' },
                grade: { name: 'grade', help: 'Gang grade' },
            },
        },
        ooc: { help: 'OOC Chat Message' },
        me: {
            help: 'Show local message',
            params: {
                message: { name: 'message', help: 'Message to send' }
            },
        },
    },
}

global.Lang = global.Lang || new Locale({
    phrases: Translations,
    warnOnMissing: true
})