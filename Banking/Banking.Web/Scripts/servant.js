// Constructs new Servant
function Servant(handlers) {
    // flags
    var available = false;
    var fulfillScheduled = false;
    // not yet released requirements
    var requirements = [];
    // for debugging purposes only 
    this.reqs = function () {
        return requirements;
    }
    // executes callback as soon as servant is available
    this.require = function (onAvailable) {
        // call onAvailable or do nothing if it's not a function
        var callback = (typeof (onAvailable) === 'function') ?
            onAvailable : function () { };
        // creating requirement
        var req = new Requirement(callback, function () {
            // if all requirements are released...
            if (requirements.every(function (item) {
                return (true === item.released);
            })) {
                // ... then servant is free
                requirements = [];      // cleaning 
                available = false;      // leaving
                handlers.off();         // waving goodbye :)
            }
        });
        // registering requirement
        requirements.push(req);
        // scheduling requirements fulfill when available
        if (false === available && false === fulfillScheduled) {
            handlers.on(function () {
                available = true;               // just came
                // fulfilling all requirements
                for (var i in requirements) {
                    requirements[i].fulfill();
                }
                // avoiding repetition
                fulfillScheduled = false;
            });
        // fulfilling immediately
        } else if (true === available) {
            req.fulfill();
        }
        return req;
    }

    // Constructs new Requirement
    function Requirement(onAvailable, onRelease) {
        // flags
        this.fulfilled = false;
        this.released = false;
        // executes onAvailable (only once)
        this.fulfill = function () {
            if (false === this.fulfilled) {
                this.fulfilled = true;
                onAvailable();
            }
        }
        
        // executes onRelease (only once)
        this.release = function () {
            // released considered fulfilled, too
            this.fulfilled = true;
            if (false === this.released) {
                this.released = true;
                onRelease();
            }
        }
    }
}
