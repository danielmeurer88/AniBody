
/**
 * 
 * @returns {MouseHandler}
 */
function MouseHandler(){
    EngineObject.call(this);
    
    this.LeftMouseClickHandlerCBOs = new PriorityQueue();
    this.RightMouseClickHandlerCBOs = new PriorityQueue();
    this.WheelHandlerCBOs = new PriorityQueue();
    this.WheelLimiter = 0.1;
    
    this.HoverRequests = [];
    
    this._oldLeftFramesDown = 0;
    this._oldRightFramesDown = 0;
    
this.Initialize();
}
MouseHandler.prototype = Object.create(EngineObject.prototype);
MouseHandler.prototype.constructor = MouseHandler;

MouseHandler.prototype.Initialize = function(){
    
    // if it's a favorit browsers
    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
    // increase wheel limiter
        this.WheelLimiter = 1.5;
    }
};

/**
 * Function WheelHandler() will be called by the Engine, when it detects a turning of the mouse wheel or that simulates it.
 * Function will also trigger all added MouseHandler with type = "wheel"
 * @param {type} dx
 * @param {type} dy
 * @returns {undefined}
 */
MouseHandler.prototype.WheelHandler = function(dx, dy){
        
    var arr = this.WheelHandlerCBOs.heap;
    var d;
    var event = {
        GoThrough : true,
        Timestamp : Date.now(),
        Frame : this.Engine.Counter.Frames,
        Delta : { X : dx*this.WheelLimiter, Y : dy*this.WheelLimiter },
        Type : "wheel"
    };

    for(var i=0; event.GoThrough && i<arr.length; i++){
        d = arr[i].data;
        d.function.call(d.that, event, d.parameter);
    }
    
};

/**
 * Adds a Callback-Object to a certain AniBody.mouse event type
 * @param {string} type - AniBody.mouse event type
 * @param {object} cbo - callback-object
 * @param {number} prio - priority number (optional)
 * @returns {ref-number|undefined}
 */
MouseHandler.prototype.AddMouseHandler = function(type, cbo, prio){
    var ref;
    if(type === "leftclick"){
        ref = this.LeftMouseClickHandlerCBOs.Enqueue(cbo, prio);
        this.LeftMouseClickHandlerCBOs.Sort();
    }
    if(type === "rightclick"){
        ref = this.RightMouseClickHandlerCBOs.Enqueue(cbo, prio);
        this.RightMouseClickHandlerCBOs.Sort();
    }
    if(type === "wheel"){
        ref = this.WheelHandlerCBOs.Enqueue(cbo, prio);
        this.WheelHandlerCBOs.Sort();
    }
    return ref;
};
/**
 * 
 * @param {number} ref
 * @returns {.Object@call;create.RemoveMouseHandler.tmp|Object.prototype.RemoveMouseHandler.tmp}
 */
MouseHandler.prototype.RemoveMouseHandler = function(type, ref){
    var tmp;

    if(type === "leftclick")
        tmp = this.LeftMouseClickHandlerCBOs.DeleteByReferenceNumber(ref);
    if(type === "rightclick")
        tmp = this.RightMouseClickHandlerCBOs.DeleteByReferenceNumber(ref);
    if(type === "wheel")
        tmp = this.WheelHandlerCBOs.DeleteByReferenceNumber(ref);
    return tmp;
};

MouseHandler.prototype.Flush = function(){
    this.LeftMouseClickHandlerCBOs.Flush();
    this.RightMouseClickHandlerCBOs.Flush();
    this.WheelHandlerCBOs.Flush();
};

MouseHandler.prototype.AddHoverRequest = function(area, object, attr, successvalue, failvalue){
    if(arguments.length<=2) return;
    
    if(!area){
        area = {type:"rect", x:object.X, y:object.Y, width:object.Width, height:object.Height};
    }
    
    if(typeof successvalue === "undefined")
        successvalue = true;
    
    if(typeof failvalue === "undefined")
        failvalue = false;
    
    this.HoverRequests.push({area:area, object:object, attr:attr, success : successvalue, failure : failvalue});
};

MouseHandler.prototype.MouseClickHandler = function(){
    var mouse = this.Engine.Input.Mouse;
    
    // checking leftclicks
    var newfrdown = mouse.Left.FramesDown;
    if (this._oldLeftFramesDown > 0 && newfrdown == 0 && mouse.Left.BusyFrames <= 0) {

        var arr = this.LeftMouseClickHandlerCBOs.heap;
        var d;
        var event = {
            GoThrough: true,
            Timestamp: Date.now(),
            Frame: this.Engine.Counter.Frames,
            Type: "leftclick"
        };

        for (var i = 0; event.GoThrough && i < arr.length; i++) {
            d = arr[i].data;
            d.function.call(d.that, event, d.parameter);
        }
        mouse.Left.BusyFrames = 5;
        
        //if(!event.GoThrough)console.log("LC: item {0}/{1} mit {2}".format(i, arr.length, getClass(d.that) ));
    }

    this._oldLeftFramesDown = this.Engine.Input.Mouse.Left.FramesDown;
    
    // checking right clicks
    var newfrdown = mouse.Right.FramesDown;
    if (this._oldRightFramesDown > 0 && newfrdown == 0 && mouse.Right.BusyFrames <= 0) {

        var arr = this.RightMouseClickHandlerCBOs.heap;
        var d;
        var event = {
            GoThrough: true,
            Timestamp: Date.now(),
            Frame: this.Engine.Counter.Frames,
            Type: "rightclick"
        };

        for (var i = 0; event.GoThrough && i < arr.length; i++) {
            d = arr[i].data;
            d.function.call(d.that, event, d.parameter);
        }
        mouse.Right.BusyFrames = 5;
        
        //if(!event.GoThrough)console.log("RC: item {0}/{1} mit {2}".format(i, arr.length, getClass(d.that) ));
    }

    this._oldRightFramesDown = this.Engine.Input.Mouse.Right.FramesDown;
};

MouseHandler.prototype.ResolveHoverRequest = function(){
    
    var c = this.Engine.Context;
    var yes = [];
    var req;
    var a;
    var res;
    var found;
    var mpos = this.Engine.Input.Mouse.Position.Relative; // the Nullpoint for this position is the canvas not the absolute nullpoint of the document
        
    for(var i=0; i<this.HoverRequests.length; i++){
        req = this.HoverRequests[i];
        a = req.area;
        found = false;
        c.save();
        c.beginPath();
        
        //if(this.Engine.Input.Key.R.FramesPressed == 2)debugger;
        
        if(!found && req.area.type === "rect"){
            c.rect(a.x, a.y, a.width, a.height);
            found = true;
        }
        
        if(!found && req.area.type === "rrect"){
            c.variousRoundedRect(a.x, a.y, a.width, a.height, a.rounding);
            found = true;
        }
        
        if(!found && req.area.type === "vrrect"){
            var r = a.roundings;
            c.variousRoundedRect(a.x, a.y, a.width, a.height, r[0], r[1]||0, r[2]||0, r[3]||0);
            found = true;
        }
        
        if(!found && req.area.type === "circle"){
            c.circle(a.x, a.y, a.radius, a.centroid||true);
            found = true;
        }
        
        if(!found && req.area.type === "function"){
            a.function(c);
            found = true;
        }
        
        res = c.isPointInPath(mpos.X, mpos.Y);
        
        if(res){
            
            //console.log("MouseHover: item nr_{0} + {1} + attr:{2} + background = {3}".format(i, getClass(req.object),req.attr, a.background));
            
            if(a.background){
                req.object[req.attr] = req.success;
            }else{
                yes.push(req);
            }
            
            
        }else{
            req.object[req.attr] = req.failure;
        }
        c.closePath();
        c.restore();
    }
    
    
    
    for(var i=0; i<yes.length; i++){
        req = yes[i];
        
        if(i!==yes.length-1){
            req.object[req.attr] = req.failure;
        }else{
            req.object[req.attr] = req.success;
        }
    }
    
    this.HoverRequests = [];
    
};