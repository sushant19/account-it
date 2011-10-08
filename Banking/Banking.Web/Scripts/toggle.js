// new Toggle constructor
// initialState - string: ON | OFF | ON_TO_OFF | OFF_TO_ON
// allowInterrupt - bool: true | false
// onHandler, offHandler - function(callback)
function Toggle(initialState, allowInterrupt, handlers) {
    console.log('Toggle instance created; initialState = ' + initialState + '; allowInterrupt = ' + allowInterrupt);
    // state constants
    var st = {
        ON: 'ON',
        OFF: 'OFF',
        ON_TO_OFF: 'ON_TO_OFF',
        OFF_TO_ON: 'OFF_TO_ON'
    }
    // checking params
    if (!st[initialState]) {
        throw new Error('Unknown state: ' + initialState);
    }
    // utilizing params
    var currentState = initialState;
    var allow = allowInterrupt;
    // publishing handlers
    this.onHandler = handlers.on;
    this.offHandler = handlers.off;
    // state property
    this.state = function () {
        return currentState;
    }
    // callback queue
    var callbacks = new Queue();
    // how many times was changeState() called; used in proceed();
    var changeCounter = 0;
    // from, allowed, through, to - states
    // callback is called when handler is complete
    function changeState(from, allowed, through, to, handler, callback) {
        //console.log("changeState called; current state: " + currentState + "; next state: " + to);
        // state change possible
        if (currentState === from || (allow && currentState === allowed)) {
            changeCounter++;
            //console.log("setting transition state: " + through);
            currentState = through;
            // interruption - so clearing callbacks queue
            if (currentState === allowed) {
                callbacks.empty();
            }
            callbacks.add(callback);
            // executing handler or whenComplete
            if (typeof (handler) === 'function') {
                handler(proceed);
            } else {
                whenComplete();
            }
        // state is currently changing to desired
        } else if (currentState === through) {
            callbacks.add(callback);
        // state is already desired
        } else if (currentState === to && typeof(callback) === 'function') {
            callback();
        }
        var callId = changeCounter;
        // executes given function or whenComplete only if there was no interruption
        function proceed(func) {
            // interruption check
            var a;
            if (callId === changeCounter) {
                if (typeof (func) === 'function') {
                    func();
                } else {
                    whenComplete();
                }
            }
        }
        // callback wrapper, also changes state to final
        function whenComplete() {
            //console.log("setting final state: " + to);
            currentState = to;
            callbacks.callAll();
            callbacks.empty();
        }
    }

    this.on = function (callback) {
        changeState(st.OFF, st.ON_TO_OFF, st.OFF_TO_ON, st.ON, this.onHandler, callback);
    }

    this.off = function (callback) {
        changeState(st.ON, st.OFF_TO_ON, st.ON_TO_OFF, st.OFF, this.offHandler, callback);
    }
}
// constructor of CallbackQueue
// useful for organizing callbacks
function Queue() {
    var arr = [];
    this.add = function (func) {
        if (typeof (func) === 'function') {
            arr.unshift(func);
        }
    }
    this.callFirst = function () {
        console.log(arr.length);
        if (arr.length > 0) {
            arr.pop()();
        }
    }
    this.callAll = function () {
        while(arr.length > 0) {
            this.callFirst();
        }
    }
    this.empty = function () {
        arr = [];
    }
}