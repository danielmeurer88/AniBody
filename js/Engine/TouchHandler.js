
function TouchHandler(){
    EngineObject.call(this);
    
    // FLAGS
    this.AlwaysPreventDefault = true;
    this.PreventScrolling = true;
    
    // DEFINED VALUES
    this.DEFINEDVALUES = {
        TapLimit : 300, // max duration of a tap ( every tap longer will be recognized as a long tap
        VarianceLimit : 50, // max pixel amount the user is allowed to variate while performing a tap or long tap
        SwipeTrackLimit : 150,
        SwipeTimeLimit : 600
    }, 
    
    
    // PROPERTIES
    this.EventObjects = {
        TouchStartEvent : false,
        TouchMoveEvent : false,
        TouchEndEvent : false
    };
    
    this.EventListener = {
        TouchStartEvent : false,
        TouchMoveEvent : false,
        TouchEndEvent : false
    };
    
    this.ExpectTouch = false; // important for the update-function
    
    this.Finger1 = {
        X : 0,
        Y : 0,
        Detected : false
    };
    
    this.Finger2 = {
        X : 0,
        Y : 0,
        Detected : false
    };
    
}
TouchHandler.prototype = Object.create(EngineObject.prototype);
TouchHandler.prototype.constructor = TouchHandler;

TouchHandler.prototype.Initialize = function(){
    
    this.EventListener.TouchStartEvent = this.Engine.Canvas.addEventListener("touchstart",
                this.TouchStartHandler.bind(this), false);
    this.EventListener.TouchMoveEvent = this.Engine.Canvas.addEventListener("touchmove",
                this.TouchMoveHandler.bind(this), false);
    this.EventListener.TouchEndEvent = this.Engine.Canvas.addEventListener("touchend",
                this.TouchEndHandler.bind(this), false);
    
};

TouchHandler.prototype.TouchStartHandler = function(e){
    this.EventObjects.TouchStartEvent = e;
    
    this.ExpectTouch = true;
    // get x,y-coords because at least one finger needs to be on the screen
    this.Finger1.Detected = true;
    this.Finger1.X = e.touches[0].clientX;
    this.Finger1.Y = e.touches[0].clientY;
    this.Finger2.Detected = false; // first it is false, but following code will correct it if there is a second finger
    // now checking if there are more than one...
    if (e.touches.length >= 2) {
       // there are at least 2 fingers
        this.Finger2.X = e.touches[1].clientX;
        this.Finger2.Y = e.touches[1].clientY;
        this.Finger2.Detected = true;
    }
    if(this.AlwaysPreventDefault)
    e.preventDefault();
};

TouchHandler.prototype.TouchMoveHandler = function(e){
    this.EventObjects.TouchMoveEvent = e;
    
    // handler could not have been called if there was at least finger 1 but will there be finger 2 or more as well?
    this.Finger2.Detected = false;      
    if(e.touches.length >= 2){
        this.Finger2.Detected = true;
    }

    if (this.PreventScrolling) {
        e.preventDefault(); // prevent scrolling when touch inside Canvas
    }
    
};

/**
 * 
 * @param {type} e
 * @returns {undefined}
 */
TouchHandler.prototype.TouchEndHandler = function(e){
    
    this.EventObjects.TouchEndEvent = e;
    var starte = this.EventObjects.TouchStartEvent;
    // the touchEndEvent does not have the attribute 'touches' -> therefor we use the last TouchMoveEvent or TouchStartEvent if user hasn't moved
    var laste = this.EventObjects.TouchMoveEvent || this.EventObjects.TouchStartEvent;
    
    // the duration of the touch <= time now - time at the beginning
    var timedelta = e.timeStamp - this.EventObjects.TouchStartEvent.timeStamp;
    var xdelta = starte.touches[0].clientX - laste.touches[0].clientX;
    var ydelta = starte.touches[0].clientY - laste.touches[0].clientY;
    
    this.Finger2.Detected = false;
    if(laste.touches.length >= 2){
        this.Finger2.Detected = true;
        // now that there are more fingers on the screen we don't care for finger 1 data anymore
        xdelta = starte.touches[1].clientX - laste.touches[1].clientX;
        ydelta = starte.touches[1].clientY - laste.touches[1].clientY;
    }
    
    // TESTING FOR A SHORT TOUCH --> TAP
    if(timedelta <= this.DEFINEDVALUES.TapLimit && this._movementWithin(xdelta, ydelta, this.DEFINEDVALUES.VarianceLimit)){
        // it's a tap --> there are no further gestures to be expected
        this.ExpectTouch = false;

        // is it a tap with the first or the second finger
        if(!this.Finger2.Detected){
            console.log("Finger1 Tap");
        }else{
            console.log("Finger2 Tap");
        }

    }// Tap testing ENDIF
    
    // TESTING FOR A Longer TOUCH --> LONGTAP - only if ExpectTouch is still true (gesture has not been figured out yet)
    if(this.ExpectTouch && timedelta > this.DEFINEDVALUES.TapLimit && this._movementWithin(xdelta, ydelta, this.DEFINEDVALUES.VarianceLimit)){
        // it's a longtap --> there are no further gestures to be expected
        this.ExpectTouch = false;

        // is it a longtap with the first or the second finger
        if(!this.Finger2.Detected){
            console.log("Finger1 LongTap");
        }else{
            console.log("Finger2 LongTap");
        }

    }// LongTap testing ENDIF
    
    // TESTING FOR A SWIPE and testing for the direction - only if ExpectTouch is still true (gesture has not been figured out yet)
    // direction will be handled as an 0,1 Object - {X : [0|1], Y : [0|1]}
    if(this.ExpectTouch && timedelta <= this.DEFINEDVALUES.SwipeTimeLimit && !this._movementWithin(xdelta,ydelta, this.DEFINEDVALUES.SwipeTrackLimit)){
        console.log(this._getDirection(xdelta, ydelta, true) + " swipe");
        var dir = this._getDirection(xdelta, ydelta);
        console.log(JSON.stringify(dir));
    }
    
    //clean-up at the end
    this.Finger1.Detected = false;
    this.Finger2.Detected.false;
    this.ExpectTouch = false;
};

TouchHandler.prototype.Update = function(){
    
    if(!this.ExpectTouch)
        return false;
    
    // an update function is needed if a touch pi is implemented
    /* OLD CODE

     */
    
};

TouchHandler.prototype._movementWithin = function(x,y,limit){
    if(Math.abs(x) <= limit && Math.abs(y) <= limit)
        return true;
    else
        false;
};

TouchHandler.prototype._getDirection = function(x,y, string){
    var dir;
    if (Math.abs(x) > Math.abs(y)) {
        // horizontal swipe was bigger
        if (x > 0) {
            // right
            dir = {X: 1, Y: 0};
        } else {
            // left
            dir = {X: -1, Y: 0};
        }

    } else {
        // vertical swipe was bigger
        if (y > 0) {
            // down
            dir = {X: 0, Y: 1};
        } else {
            // up
            dir = {X: 0, Y: -1};
        }
    }
    if(!string)
        return dir;
    else{
        if(dir.Y == 0)
            return dir.X==1 ? "right" : "left";
        else
            return dir.Y == 1 ? "down" : "up";
    }
};