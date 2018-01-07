Anibody.SetPackage("Anibody", "input", "Input");

/**
 * An application programming interface that stands between the engine and the developer and handles touch related functions.
 * This API manages registration of known ways of input possibilities to touch devices like
 * "Tap", "LongTap" or "Swipe" - for one or two fingers
 * (for the 2nd finger events, the 1st finger has to be touching the screen/resting on the screen)
 * @returns {TouchHandler}
 */
Anibody.input.Input.TouchHandler = function TouchHandler(){
    Anibody.EngineObject.call(this);
    
    // FLAGS
    this.PreventDefault = true;
    this.PreventScrolling = true;
    this.FakeMouseClick = this.Engine.Flags.Touch2FakeMouseClick; //flag if a (short) tap will call for a fake mouse click - useful if the default will be prevented
    // a FakeMouseClick will only be recognized by the AniBody-Engine as a real mouse click in the MouseHandler
    this.Detect = {
        Tap1 : true,
        Tap2 : true,
        LongTap1 : true,
        LongTap2 : true,
        Swipe1 : true,
        Swipe2 : true,
        TouchStart1 : true,
        TouchStart2 : true,
        TouchMove1 : true,
        TouchMove2 : true,
        TouchEnd1 : true,
        TouchEnd2 : true
    };

    
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
    
    this.DeviceIsTouchDevice = false; // not implemented yet
    this.TouchDeviceRecognization = []; // not implemented yet
    
    this.ExpectTouch = false; // true: no guesture has been matched to the current screen touch, false: algorithm does not need to search guesture anymore
    
    this.Finger1 = {
        X : 0,
        Y : 0,
        Detected : false,
        TapListener : [],
        LongTapListener : [],
        SwipeListener : [],
        TouchStartListener : [],
        MoveListener : [],
        TouchEndListener : []
    };
    
    this.Finger2 = {
        X : 0,
        Y : 0,
        Detected : false,
        TapListener : [],
        LongTapListener : [],
        SwipeListener : [],
        TouchStartListener : [],
        MoveListener : [],
        TouchEndListener : []
    };
    
this.Initialize();
};
Anibody.input.Input.TouchHandler.prototype = Object.create(Anibody.EngineObject.prototype);
Anibody.input.Input.TouchHandler.prototype.constructor = Anibody.input.Input.TouchHandler;

//Object.defineProperty(Anibody.input.Input.TouchHandler, "name", {value:"TouchHandler"});

/**
 * @see README_DOKU.txt
 */
Anibody.input.Input.TouchHandler.prototype.Initialize = function(){
    
    this.EventListener.TouchStartEvent = this.Engine.Canvas.addEventListener("touchstart",
                this.TouchStartHandler.bind(this), false);
    this.EventListener.TouchMoveEvent = this.Engine.Canvas.addEventListener("touchmove",
                this.TouchMoveHandler.bind(this), false);
    this.EventListener.TouchEndEvent = this.Engine.Canvas.addEventListener("touchend",
                this.TouchEndHandler.bind(this), false);
                
};

Anibody.input.Input.TouchHandler.prototype.TouchStartHandler = function(e){
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

    var newe;
    if (this.Finger2.Detected) {
        if(this.Detect.TouchStart2){
            newe = this._getTouchEventObject("touchstartfinger2");
            for (var i = 0; i<this.Finger2.TouchStartListener.length; i++) {
                cbo = this.Finger2.TouchStartListener[i];
                Anibody.CallObject(cbo,{
                    preparameter:newe,
                    useApply : true
                });
            }// for
        }
            
    } else {
        if(this.Detect.TouchStart1){
            newe = this._getTouchEventObject("touchstartfinger1");
            for (var i = 0; i<this.Finger1.TouchStartListener.length; i++) {
                cbo = this.Finger1.TouchStartListener[i];
                Anibody.CallObject(cbo,{
                    preparameter:newe,
                    useApply : true
                });
            }//for
        }
            
    }

    if(this.PreventDefault)
        e.preventDefault();
};

Anibody.input.Input.TouchHandler.prototype.TouchMoveHandler = function(e){
    this.EventObjects.TouchMoveEvent = e;
    
    // handler could not have been called if there was at least finger 1 but will there be finger 2 or more as well?
    this.Finger2.Detected = false;
    
    this.Finger1.X = e.touches[0].clientX;
    this.Finger1.Y = e.touches[0].clientY;
    
    if(e.touches.length >= 2){
        this.Finger2.Detected = true;
        
        this.Finger2.X = e.touches[1].clientX;
        this.Finger2.Y = e.touches[1].clientY;
    }

    var newe;
    // check if there are move listener on the detected finger and call them
    if (this.Finger2.Detected) {
        if(this.Detect.TouchMove2){
            newe = this._getTouchEventObject("touchmovefinger2");
            for (var i = 0; i<this.Finger2.MoveListener.length; i++) {
                cbo = this.Finger2.MoveListener[i];
                Anibody.CallObject(cbo,{
                    preparameter:newe,
                    useApply : true
                });
            }
        }
    } else {
        if(this.Detect.TouchMove1){
            newe = this._getTouchEventObject("touchmovefinger1");
            for (var i = 0; i<this.Finger1.MoveListener.length; i++) {
                cbo = this.Finger1.MoveListener[i];
                Anibody.CallObject(cbo,{
                    preparameter:newe,
                    useApply : true
                });
            }
        }
    }

    if (this.PreventScrolling) {
        e.preventDefault(); // prevent scrolling when touch inside Canvas
    }
    
    
};

Anibody.input.Input.TouchHandler.prototype.TouchEndHandler = function(e){
    
    this.EventObjects.TouchEndEvent = e;
    var starte = this.EventObjects.TouchStartEvent;
    // the touchEndEvent does not have the attribute 'touches' -> therefor we use the last TouchMoveEvent or TouchStartEvent if user hasn't moved
    var laste = this.EventObjects.TouchMoveEvent || this.EventObjects.TouchStartEvent;
    
    // the duration of the touch <= time now - time at the beginning
    var timedelta = e.timeStamp - this.EventObjects.TouchStartEvent.timeStamp;
    var xdelta = laste.touches[0].clientX - starte.touches[0].clientX;
    var ydelta = laste.touches[0].clientY - starte.touches[0].clientY;
    
    this.Finger2.Detected = false;
    if(laste.touches.length >= 2){
        this.Finger2.Detected = true;
        // now that there are more fingers on the screen we don't care for finger 1 data anymore
        xdelta = laste.touches[1].clientX - starte.touches[1].clientX;
        ydelta = laste.touches[1].clientY - starte.touches[1].clientY;
    }
        
    // TESTING FOR A SHORT TOUCH --> TAP
    if(timedelta <= this.DEFINEDVALUES.TapLimit && this._movementWithin(xdelta, ydelta, this.DEFINEDVALUES.VarianceLimit)){
        // it's a tap --> there are no further gestures to be expected
        this.ExpectTouch = false;

        // is it a tap with the first or the second finger
        if(!this.Finger2.Detected){
            if(this.Detect.Tap1)
                this.OnTapFinger1();
            
        }else{
            if(this.Detect.Tap2)
                this.OnTapFinger2();
        }

    }// Tap testing ENDIF
    
    // TESTING FOR A Longer TOUCH --> LONGTAP - only if ExpectTouch is still true (gesture has not been figured out yet)
    if(this.ExpectTouch && timedelta > this.DEFINEDVALUES.TapLimit && this._movementWithin(xdelta, ydelta, this.DEFINEDVALUES.VarianceLimit)){
        // it's a longtap --> there are no further gestures to be expected
        this.ExpectTouch = false;

        // is it a longtap with the first or the second finger
        if(!this.Finger2.Detected){
            if(this.Detect.LongTap1)
                this.OnLongTapFinger1();
        }else{
            if(this.Detect.LongTap2)
                this.OnLongTapFinger2();
        }

    }// LongTap testing ENDIF
    
    // TESTING FOR A SWIPE and testing for the direction - only if ExpectTouch is still true (gesture has not been figured out yet)
    // direction will be handled as an 0,1 Object - {X : [0|1], Y : [0|1]}
    if(this.ExpectTouch && timedelta <= this.DEFINEDVALUES.SwipeTimeLimit && !this._movementWithin(xdelta,ydelta, this.DEFINEDVALUES.SwipeTrackLimit)){
        this.ExpectTouch = false;
        
        var dir = this._getDirectionObject(xdelta, ydelta);
        
        if(!this.Finger2.Detected){
            if(this.Detect.Swipe1)
                this.OnSwipeFinger1(dir);
        }else{
            if(this.Detect.Swipe2)
                this.OnSwipeFinger2(dir);
        }
    }
    
    // if(this.ExpectTouch)
    //     console.log("No guesture matched: timedelta: {0}, xdelta: {1}, ydelta: {2}".format(timedelta, xdelta, ydelta));
    var newe;
    if (this.Finger2.Detected) {
        if(this.Detect.TouchEnd2){
            newe = this._getTouchEventObject("touchendfinger2");
            for (var i = 0; i<this.Finger2.TouchEndListener.length; i++) {
                cbo = this.Finger2.TouchEndListener[i];
                Anibody.CallObject(cbo,{
                    preparameter:newe,
                    useApply : true
                });
            }
        }
    } else {
        if(this.Detect.TouchEnd1){
            newe = this._getTouchEventObject("touchendfinger1");
            for (var i = 0; i<this.Finger1.TouchEndListener.length; i++) {
                cbo = this.Finger1.TouchEndListener[i];
                Anibody.CallObject(cbo,{
                    preparameter:newe,
                    useApply : true
                });
            }
        }
    }
    
    //clean-up at the end
    this.EventObjects.TouchMoveEvent = false; // Start- and EndEventObject will be overwritten in the next guesture but MoveEventObject only if the guesture moves - to be sure => clean it up
    this.Finger1.Detected = false;
    this.Finger2.Detected = false;
    this.ExpectTouch = false;
    
    if(this.PreventDefault)
        e.preventDefault();
};

Anibody.input.Input.TouchHandler.prototype.Update = function(){
    
    if(!this.ExpectTouch)
        return false;
};

Anibody.input.Input.TouchHandler.prototype._movementWithin = function(x,y,limit){
    if(Math.abs(x) <= limit && Math.abs(y) <= limit)
        return true;
    else
        false;
};
/**
 * returns the direction object from the x,y-difference of the touch start and touch end
 * {X,Y} with X,Y : [-1|0|1]
 * -1 -> change in negative X or Y
 * 0 -> no change
 * 1 -> change in positive X or Y 
 * @param {number} x - difference in x direction
 * @param {number} y - difference in y direction
 * @returns {Object|Boolean}
 */
Anibody.input.Input.TouchHandler.prototype._getDirectionObject = function(x,y){
    var dir;
    if(arguments.length >= 2){
        // testing if horizontal swipe (x) or vertical swipe (y) is bigger
        if (Math.abs(x) > Math.abs(y)) {
            // horizontal swipe was bigger
            if (x > 0)
                dir = {X: 1, Y: 0};// right
            else
                dir = {X: -1, Y: 0};// left
        } else {
            // vertical swipe was bigger
            if (y > 0)
                dir = {X: 0, Y: 1};// down
            else
                dir = {X: 0, Y: -1};// up
        }
        return dir;
    } 
    
    return false;
};

/**
 * Transforms a direction object into the respective word of the english language
 * @param {type} dir
 * @returns {String|Boolean}
 */
Anibody.input.Input.TouchHandler.prototype._getSwipeDirection = function(dir){
    if(arguments.length === 1){
        if(dir.Y === 0)
            return (dir.X ===1) ? "right" : "left";
        else
            return (dir.Y === 1) ? "down" : "up";
    }
    
    return false;
};

/**
 * Triggers all Listeners registered to a tap with finger 1
 * @returns {undefined}
 */
Anibody.input.Input.TouchHandler.prototype.OnTapFinger1 = function(){
    console.log("Finger1 Tap");
    if(this.FakeMouseClick){
        this.Engine.Input.Mouse.FakeMouseClick(this.Finger1.X, this.Finger1.Y);
    }
    
    var cbo;
    var e = this._getTouchEventObject("tapfinger1");
    for(var i=0; i<this.Finger1.TapListener.length; i++){
        cbo = this.Finger1.TapListener[i];
        Anibody.CallObject(cbo,{
            preparameter:e,
            useApply : true
        });
    }
};
/**
 * Triggers all Listeners registered to a tap with finger 2 (1st finger resting on the screen, 2nd finger does the tapping)
 * @returns {undefined}
 */
Anibody.input.Input.TouchHandler.prototype.OnTapFinger2 = function(){
    console.log("Finger2 Tap");
    var cbo;
    var e = this._getTouchEventObject("tapfinger2");
    for(var i=0; i<this.Finger2.TapListener.length; i++){
        cbo = this.Finger2.TapListener[i];
        Anibody.CallObject(cbo,{
            preparameter:e,
            useApply : true
        });
    }
};
/**
 * Triggers all Listeners registered to a long tap with finger 1
 * @returns {undefined}
 */
Anibody.input.Input.TouchHandler.prototype.OnLongTapFinger1 = function(){
    console.log("Finger1 LongTap");
    var cbo;
    var e = this._getTouchEventObject("longtapfinger1");
    for(var i=0; i<this.Finger1.LongTapListener.length; i++){
        cbo = this.Finger1.LongTapListener[i];
        Anibody.CallObject(cbo,{
            preparameter:e,
            useApply : true
        });
    }
};
/**
 * Triggers all Listeners registered to a long tap with finger 2 (1st finger resting on the screen, 2nd finger does the long tapping)
 * @returns {undefined}
 */
Anibody.input.Input.TouchHandler.prototype.OnLongTapFinger2 = function(){
    console.log("Finger2 LongTap");
    var cbo;
    var e = this._getTouchEventObject("longtapfinger2");
    for(var i=0; i<this.Finger2.LongTapListener.length; i++){
        cbo = this.Finger2.LongTapListener[i];
        Anibody.CallObject(cbo,{
            preparameter:e,
            useApply : true
        });
    }
};
/**
 * Triggers all Listeners registered to a swipe with finger 1
 * @param {object} dir - holds the information of the swipe direction and will be given to the registered callbacks as their 2nd argument
 * @returns {undefined}
 */
Anibody.input.Input.TouchHandler.prototype.OnSwipeFinger1 = function(dir){
    console.log("Finger1 " + this._getSwipeDirection(dir) + " swipe - " + JSON.stringify(dir));
    var cbo;
    var e = this._getTouchEventObject("swipefinger1");
    for(var key in dir){
        e[key] = dir[key];
    }
    for(var i=0; i<this.Finger1.SwipeListener.length; i++){
        cbo = this.Finger1.SwipeListener[i];
        Anibody.CallObject(cbo,{
            preparameter:e,
            useApply : true
        });
    }
};
/**
 * Triggers all Listeners registered to a swipe with finger 2 (first finger resting on the screen, 2nd finger does the swiping)
 * @param {object} dir - holds the information of the swipe direction and will be given to the registered callbacks as their 2nd argument
 * @returns {undefined}
 */
Anibody.input.Input.TouchHandler.prototype.OnSwipeFinger2 = function(dir){
    console.log("Finger2 " + this._getSwipeDirection(dir) + " swipe - " + JSON.stringify(dir));
    var cbo;
    var e = this._getTouchEventObject("swipefinger2");
    for(var key in dir){
        e[key] = dir[key];
    }
    for(var i=0; i<this.Finger2.SwipeListener.length; i++){
        cbo = this.Finger2.SwipeListener[i];
        Anibody.CallObject(cbo,{
            preparameter:e,
            useApply : true
        });
    }
};

/**
 * adds/registers a new Listener (callback-object) to a touch event
 * @param {string} eventtype - name of the event found in the collection 'TouchHandler.prototype.Types'
 * @param {object} listener - callback-object
 * (for swipe listener only: 2nd argument will be object of {X:-1|0|1,Y:-1|0|1})
 * @returns {undefined}
 */
Anibody.input.Input.TouchHandler.prototype.AddEventListener = function(eventtype, cbo){
    switch(eventtype){
        case "tapfinger1" : this.Finger1.TapListener.push(cbo);break;
        case "tapfinger2" : this.Finger2.TapListener.push(cbo);break;
        case "longtapfinger1" : this.Finger1.LongTapListener.push(cbo);break;
        case "longtapfinger2" : this.Finger2.LongTapListener.push(cbo);break;
        case "swipefinger1" : this.Finger1.SwipeListener.push(cbo);break;
        case "swipefinger2" : this.Finger2.SwipeListener.push(cbo);break;
        case "touchstartfinger1" : this.Finger1.TouchStartListener.push(cbo);break;
        case "touchstartfinger2" : this.Finger2.TouchStartListener.push(cbo);break;
        case "movefinger1" : this.Finger1.MoveListener.push(cbo);break;
        case "movefinger2" : this.Finger2.MoveListener.push(cbo);break;
        case "touchendfinger1" : this.Finger1.TouchEndListener.push(cbo);break;
        case "touchendfinger2" : this.Finger2.TouchEndListener.push(cbo);break;
        default : console.log("could not add event listener with type "+eventtype);
    }
};

/**
 * returns the event object given as first parameter for touch event handler
 * @param {string} type - touch event type
 */
Anibody.input.Input.TouchHandler.prototype._getTouchEventObject = function(type){
    
    var x,y;
    var finger = type[type.length-1];

    if( finger === "1"){
        x = this.Finger1.X;
        y = this.Finger1.Y;
    }else{
        x = this.Finger2.X;
        y = this.Finger2.Y;
    }

    return {
        TouchHandler : this,
        eventtype : type,
        finger : finger,
        x : x,
        y : y,
        screenX : x,
        screenY : y
    };

};