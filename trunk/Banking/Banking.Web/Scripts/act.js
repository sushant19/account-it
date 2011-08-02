(function () {
    // functions are stored here
    var actions = {};

    // main object
    var act = function (name, args, context) {
        return invoke(name, args, context);
    }

    // finds and executes function from actions with given context
    var invoke = function (name, args, context) {
        if (typeof (actions[name]) == 'function') {
            return actions[name].call(context, args);
        } else {
            throw new Error('Function not found: ' + name);
        }
    }

    // stores function in actions
    var bind = function (name, func) {
        actions[name] = func;
        return act;
    }

    // removes function from actions
    var unbind = function (name) {
        delete actions[name];
        return act;
    }

    // attaching methods
    act.bind = bind;
    act.unbind = unbind;

    // publishing main object (likely in Window)
    this.act = act;
})();