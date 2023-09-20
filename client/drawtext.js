function hideText() {
    SendNUIMessage({
        action: 'HIDE_TEXT',
    })
}

function drawText (text, position) {
    if (typeof position !== "string") position = "left"
    SendNUIMessage({
        action: 'DRAW_TEXT',
        data: {
            text: text,
            position: position
        }
    })
}

function changeText (text, position) {
    if (typeof position !== "string") position = "left"
    SendNUIMessage({
        action: 'CHANGE_TEXT',
        data: {
            text: text,
            position: position
        }
    })
}

function keyPressed () {
    setTick(async () => { //Not sure if a thread is needed but why not eh?
        SendNUIMessage({
            action: 'KEY_PRESSED',
        })
        await Wait(500)
        hideText()
    })
}

onNet('qb-core:client:DrawText', (text, position) => {
    drawText(text, position)
})

onNet('qb-core:client:ChangeText', (text, position) => {
    changeText(text, position)
})

onNet('qb-core:client:HideText', () => {
    hideText()
})

onNet('qb-core:client:KeyPressed', () => {
    keyPressed()
})

exports('DrawText', drawText)
exports('ChangeText', changeText)
exports('HideText', hideText)
exports('KeyPressed', keyPressed)