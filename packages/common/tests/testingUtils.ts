// https://stackoverflow.com/a/58716087
function flushPromises() {
    return new Promise(jest.requireActual("timers").setImmediate)
}

export {
    flushPromises
}