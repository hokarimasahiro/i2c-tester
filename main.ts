input.onLogoEvent(TouchButtonEvent.Touched, function () {
    rwMode = 1 - rwMode
    lowAddress = 0
    basic.clearScreen()
})
function startCondition () {
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
    control.waitMicros(5)
    pins.digitalWritePin(sdaPin, 0)
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 0)
    control.waitMicros(5)
}
function daraIn () {
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
    inData = pins.digitalReadPin(sdaPin)
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 0)
    control.waitMicros(5)
    return inData
}
input.onButtonPressed(Button.A, function () {
    highAddress += -1
    if (highAddress < 0) {
        highAddress = 7
    }
    lowAddress = 0
    basic.clearScreen()
})
function dispAddress (address: number) {
    for (let bitPosition = 0; bitPosition <= 2; bitPosition++) {
        if ((address >> bitPosition) & 0x01) {
            led.plot(4 - bitPosition, 0)
        }
    }
    led.plotBrightness(0, 0, rwMode * 255)
}
function i2cTest (rwMode: number, address: number) {
    startCondition()
    for (let bitPosition2 = 0; bitPosition2 <= 6; bitPosition2++) {
        dataOut((address >> (6 - bitPosition2)) & 0x01)
    }
    dataOut(rwMode)
    pins.setPull(sdaPin, PinPullMode.PullUp)
    inData = ackWait()
    stopCondition()
    return inData
}
input.onButtonPressed(Button.B, function () {
    highAddress += 1
    if (highAddress > 7) {
        highAddress = 0
    }
    lowAddress = 0
    basic.clearScreen()
})
function dataOut (data: number) {
    pins.digitalWritePin(sdaPin, data)
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 0)
    control.waitMicros(5)
}
function stopCondition () {
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
    pins.digitalWritePin(sdaPin, 1)
    control.waitMicros(5)
    control.waitMicros(5)
}
function ackWait () {
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
    basic.pause(20)
    inData = pins.digitalReadPin(sdaPin)
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
    for (let カウンター = 0; カウンター <= 7; カウンター++) {
        daraIn()
    }
    dataOut(nack)
    return inData
}
let i2cAddress = 0
let inData = 0
let lowAddress = 0
let rwMode = 0
let nack = 0
let highAddress = 0
let sdaPin = 0
let sclPin = 0
serial.redirectToUSB()
let ack = 0
sclPin = DigitalPin.P2
sdaPin = DigitalPin.P16
pins.setPull(sdaPin, PinPullMode.PullUp)
pins.digitalWritePin(sclPin, 1)
highAddress = 0
let brightOn = 255
let brightOff = 10
nack = 1
basic.forever(function () {
    dispAddress(highAddress)
    i2cAddress = highAddress * 16 + lowAddress
    if (i2cAddress != 0 && i2cAddress != 127) {
        serial.writeLine(convertToText(i2cAddress))
        if (i2cTest(rwMode, i2cAddress)) {
            led.plotBrightness(lowAddress % 4 + 1, lowAddress / 4 + 1, brightOff)
        } else {
            led.plotBrightness(lowAddress % 4 + 1, lowAddress / 4 + 1, brightOn)
        }
    } else {
        led.unplot(lowAddress % 4 + 1, lowAddress / 4 + 1)
    }
    lowAddress = (lowAddress + 1) % 16
    basic.pause(20)
})
