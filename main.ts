input.onLogoEvent(TouchButtonEvent.Touched, function () {
    rwMode = 1 - rwMode
    dispAddress(highAddress)
})
function startCondition () {
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 1)
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
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
    return inData
}
input.onButtonPressed(Button.A, function () {
    highAddress = (highAddress - 1) % 8
    dispAddress(highAddress)
})
function dispAddress (address: number) {
    basic.clearScreen()
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
    highAddress = (highAddress + 1) % 8
    dispAddress(highAddress)
})
function dataOut (data: number) {
    pins.digitalWritePin(sdaPin, data)
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
}
function stopCondition () {
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 1)
    control.waitMicros(5)
    pins.digitalWritePin(sdaPin, 1)
    control.waitMicros(5)
    pins.digitalWritePin(sclPin, 0)
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
    return inData
}
let inData = 0
let rwMode = 0
let highAddress = 0
let sdaPin = 0
let sclPin = 0
sclPin = DigitalPin.P2
sdaPin = DigitalPin.P16
pins.setPull(sclPin, PinPullMode.PullUp)
pins.setPull(sdaPin, PinPullMode.PullUp)
highAddress = 0
let brightOn = 255
let brightOff = 10
basic.forever(function () {
    dispAddress(highAddress)
    for (let lowAddress = 0; lowAddress <= 15; lowAddress++) {
        if (!(highAddress == 0 && lowAddress == 0 || highAddress == 7 && lowAddress == 15)) {
            if (i2cTest(rwMode, highAddress * 16 + lowAddress)) {
                led.plotBrightness(lowAddress % 4 + 1, lowAddress / 4 + 1, brightOff)
            } else {
                led.plotBrightness(lowAddress % 4 + 1, lowAddress / 4 + 1, brightOn)
            }
        }
        basic.pause(20)
    }
    basic.pause(1000)
    basic.clearScreen()
})
