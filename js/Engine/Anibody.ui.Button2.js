Anibody.SetPackage("Anibody", "ui");

/**
 * @description Displays a button
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @returns {Button}
 */
Anibody.ui.Button = function Button(x, y, options) {
    Anibody.ABO.call(this);
    
    var main = {

    };

    this._stateKeys = ["Label", "FontHeight", "FontType", "FontColor", "DisplayType", "ColorCode", "Codename", "CSSMouseCursor"];
    this._statesValues = {};
    var key;
    for(key in this._stateKeys){

        this._statesValues[key] = "";

        Object.defineProperty(this, key, {
            set: function (val) {
                if(val.push){
                    if(val.length===1){
                        this._statesValues[key][0] = val[0];
                        this._statesValues[key][1] = val[0];
                        this._statesValues[key][2] = val[0];
                    }
                    if(val.length===2){
                        this._statesValues[key][0] = val[0];
                        this._statesValues[key][1] = val[1];
                        this._statesValues[key][2] = val[1];
                    }
                    if(val.length===3){
                        this._statesValues[key][0] = val[0];
                        this._statesValues[key][1] = val[1];
                        this._statesValues[key][2] = val[2];
                    }
                }else{
                    this._statesValues[key][0] = val;
                    this._statesValues[key][1] = val;
                    this._statesValues[key][2] = val;
                }
            },
            get: function () { return this._statesValues[key];}
        });
    }


    this.ClickEasement = 0;
    
    this.Type = "Button";
    this.X = (isNaN(x)) ? 0 : x;
    this.Y = (isNaN(y)) ? 0 : y;
    this.Width = Anibody.ui.Button.DefaultButtonTemplate.Width;
    this.Height = Anibody.ui.Button.DefaultButtonTemplate.Height;
    
    this.OldState = -1;
    this.State = 0; // 0 - not clicked, 1 - is about to click|mouse down over button , 2 - clicked
    
    this.CoolDown = Anibody.ui.Button.DefaultButtonTemplate.CoolDown; // number of milliseconds until the button is ready to be clicked again
    this.OnTimeButton = Anibody.ui.Button.DefaultButtonTemplate.OnTimeButton; // flag, if button is going to be clicked again or 
    
    // a callback-object ( {function:f, that: objWillBeThis, parameter: obj};
    this.TriggerCallbackObject = {that:this, function:function(){}, parameter:false};
    this.IsMouseOver = false; // boolean
    this._mouseOverFrames = 0;
        
    //**********************************
    //    Appearance
    //**********************************
    
    // DisplayType: string-array: "image", "color", "both"
    
    this.Rounding = Anibody.ui.Button.DefaultButtonTemplate.Rounding;
    
    this.Images = [];
    this.ButtonLayout = null; // can be an image
    
    // single array element must be copied because if you copy the default array and later
    // you change the elements of the instance array -> you also change the default array (copy by reference)
    
    this.Active = true;
    this.ActivationFunctionObject = {function : function(p){ return this.Active;}, that : this, parameter : {}};
    
    this._ref = null;
    this._ref_reghov = null;
    
    this._copyText = "";
    this._withMaxScale = false;
    
    this.Initialize();
};

Anibody.ui.Button.prototype = Object.create(Anibody.ABO.prototype);
Anibody.ui.Button.prototype.constructor = Anibody.ui.Button;

Object.defineProperty(Anibody.ui.Button, "name", {value:"Button"});

/**
 * @private
 * backup template, necessary to reset the DefaultTemplate, which molds the instances
 * @type object
 */
Anibody.ui.Button._defaultButtonTemplate = {
    
    Width : 200,
    Height : 60,
    CoolDown : 50,
    OnTimeButton : false,
    
    Label : ["", "", ""],
    CSSMouseCursor : ["pointer", "default", "wait"],
    
    FontHeight : [14, 14, 14],
    FontType : ["sans-serif", "sans-serif", "sans-serif"],
    // how the box depending on the state is displayed
    DisplayType : ["color", "color", "color"], // string-array: "image", "color", "both"
    Codename : [false, false, false],
    
    Padding : 3,
    TextAlign : "center",
    
    Rounding : 4,
    
    HoverText : "",
    FramesUntilHover : 25,
    HoverRowSpace : 3,
    HoverPadding : 4,
    HoverFontHeight : 14,
    FontColor : ["black", "black", "black"],
    HoverBackgroundColor : "#eee",
    HoverFontColor : "black",
    ColorCode : ["#cfcfcf", "#bdbdbd", "#666"],
    HoverShadeColor : "rgba(0,0,0,0.2)",

    CounterBorderColor : ["red", "red", "red"],
    CounterBackgroundColor : ["white", "white", "white"],
    CounterFontColor : ["red", "red", "red"],

    UrgencyBorderColor : ["white", "white", "white"],
    UrgencyBackgroundColor : ["red", "red", "red"],
    UrgencyFontColor : ["white", "white", "white"]
};

/**
 * @type object - will be a copy of _defaultButtonTemplate when the
 * first Button instance is created
 */
Anibody.ui.Button.DefaultButtonTemplate = null;

/**
 * @see README_DOKU.txt
 */
Anibody.ui.Button.prototype.Initialize = function () {
        
    if(this.X === "center"){
        this.X = (this.Engine.Canvas.width - this.Width) / 2;
    }
    
    this.HoverPosition = {x:this.X+this.Width+5, y:this.Y-5};

    if(this.TriggerCallbackObject)
        this.AddMouseHandler(5);

    this.Center = {X: this.X + this.Width / 2, Y: this.Y + this.Height / 2};
    this.GetLabelWidth(0);
        
    // gets the images from the MediaManager if needed
    if(this.DisplayType[0] === "image" || this.DisplayType[0] === "both")
        this.Images[0] = this.Engine.MediaManager.GetImage(this.Codename[0]);
    
    if(this.DisplayType[1] === "image" || this.DisplayType[1] === "both")
        this.Images[1] = this.Engine.MediaManager.GetImage(this.Codename[1]);
    
    if(this.DisplayType[2] === "image" || this.DisplayType[2] === "both")
        this.Images[2] = this.Engine.MediaManager.GetImage(this.Codename[2]);
    
    
    this.SetPadding(this.Padding);
    
    // transform the Hover text to an image if there is text to be transformed
    if(this.HoverText.length > 0)
        this.SetHoverText(this.HoverText);
    
};

/**
 * registeres a mouse left click handler
 * @param {Number} prior priority of the PriorityQueue of LeftClick handlers(optional)
 * @param {string} name (optional)
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.AddMouseHandler = function(prior, name){

    this._ref = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", {
        parameter : this.Engine,
        that : this,
        function : function(e, engine){
            if(this.Active && this.IsMouseOver){
                e.Handled = true;
                this.Trigger();
            }   
        }
    }, prior, name);

};

/**
 * @see README_DOKU.txt
 */
Anibody.ui.Button.prototype.RemoveMouseHandler = function(){this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref);};

/**
 * the drawing of the transformed hover text will be registered as a foreground draw function
 * - won't register twice
 * - the function, which will be registered can be seen as an extension of the draw-function but it will be executed in the foreground
 * @returns {undefined}
 */
Anibody.ui.Button.prototype._registerHoverImageDrawing = function(){
    
    // if _ref_reghov is not null that means it was already registered
    if(this._ref_reghov != null) return; 
    
    var f = function(c){
        
        if (this.IsMouseOver && this._mouseOverFrames >= this.FramesUntilHover) {
            // isMouseOver should be asked as well so that the hover text won't be always displayed if the limit is 0 or negative
            if (this.HoverImage) {
                this._findHoverPosition();
                c.drawImage(this.HoverImage,this.HoverPosition.x,this.HoverPosition.y);
            }
        }
        
        
    };
    
    var fo = {that:this, function:f, parameter: this.Engine.Context};
    this._ref_reghov = this.Engine.AddForegroundDrawFunctionObject(fo);
};

/**
 * deregistration of the foreground draw function
 * @returns {undefined}
 */
Anibody.ui.Button.prototype._deregisterHoverImageDrawing = function(){
    if(this._ref_reghov == null) return; 
    this.Engine.RemoveForegroundDrawFunctionObject(this._ref_reghov);
    this._ref_reghov = null
};
/**
 * @see README_DOKU.txt
 */
Anibody.ui.Button.prototype.ProcessInput = function () {
          
    var area = this.GetArea(this.ClickEasement, this.Rounding);
     
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOver");
     
};
/**
 * @see README_DOKU.txt
 */
Anibody.ui.Button.prototype.Update = function () {
    
    // activation function checks if the button must be active or not
    var afo = this.ActivationFunctionObject;
    this.Active = afo.function.call(afo.that, afo.parameter);
    
    // if not active, this will be the end of the Update() for this frame
    if(!this.Active){
        this._mouseOverFrames = 0;
        return;
    }
    
    // if the image is not false than
    // this._registerHoverImageDrawing() will be triggered
    if (this.HoverImage) {
        this._registerHoverImageDrawing();
    }

    var m = this.Engine.Input.Mouse;
    
    // updates the number of frames, in which the mouse is over the button
    if(this.IsMouseOver)
        this._mouseOverFrames++;
    else
        this._mouseOverFrames = 0;
    
    // updates the correct state
    
    // clicking (mousedown) hovering over the button
    if (m.Left.Down && this.IsMouseOver && this.State == 0) {
        this.State = 1;
    }

    // reset state 1 if the button was pressed while the mouse was over it but the release was not over the button
    if (m.Left.Up && this.State == 1) {
        this.State = 0;
    }
    
    // updates the correct cursor symbol
    
    // changing the mouse cursor regarding the state of the button
    if (this.IsMouseOver)
        switch (this.State) {
            case 0 :
                this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursor[this.State]);
                break;
            case 1 :
                this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursor[this.State]);
                break;
            case 2 :
                this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursor[this.State]);
                break;
        }
    
    // has the state changed while updating -> recalculating the Label Width
    // because the Text could change
    if (this.State != this.OldState)
        this.GetLabelWidth();
    this.OldState = this.State;
};
/**
 * @see README_DOKU.txt
 */
Anibody.ui.Button.prototype.Draw = function (c) {

    c.save();

    // the currently selected camera
    var cam = this.Engine.Camera.SelectedCamera;
    
    if(this.Active){
        c.globalAlpha = 1;
    }else{
        c.globalAlpha = 0.5;
    }
    
    // the background of the button if needed
    
    if (this.DisplayType[this.State] == "color" || this.DisplayType[this.State] == "both") {
        c.fillStyle = this.ColorCode[this.State];
        c.fillVariousRoundedRect(this.X - cam.X, this.Y - cam.Y, this.Width, this.Height, this.Rounding);
    }
    
    if(this.DisplayType[this.State] == "image" || this.DisplayType[this.State] == "both") {
        if(this.Images[this.State])
            c.drawRoundedImage(this.Images[this.State], this.X - cam.X, this.Y - cam.Y, this.Width, this.Height, this.Rounding);
    }
    
    // draws shade if need be
    if(this.IsMouseOver && this.Active){
        c.fillStyle = this.HoverShadeColor;
        c.fillVariousRoundedRect(this.X - cam.X, this.Y - cam.Y, this.Width, this.Height, this.Rounding);
    }
    
    // draws the layout if one was requested
    if(this.ButtonLayout)
        c.drawRoundedImage(this.ButtonLayout, this.X - cam.X, this.Y - cam.Y, this.Width, this.Height, this.Rounding);

    // drawing the button label

    c.textBaseline = "middle";
    c.textAlign = "left";
    //c.textAlign = this.TextAlign;

    c.font = this.FontHeight[this.State] + "px " + this.FontType[this.State];
    
    var txtx;
    var txty;
    
    if(this.TextAlign === "center" || this.TextAlign === "middle"){
        txtx = this.X + (this.Width/2) - (this._labelWidth[this.State] / 2) - cam.X;
        txty = this.Y + (this.Height/2) - cam.Y;
    }
    
    if(this.TextAlign === "left"){
        txtx = this.X + this.Padding - cam.X;
        txty = this.Y + (this.Height/2) - cam.Y;
    }
    
    c.fillStyle = this.FontColor[this.State];
    c.fillText(this.Label[this.State], txtx, txty);
    
    // drawing counter
    if(this._counter > 0 && !this._urgency){
        var cr = this.Height*0.15;
        var cx = this.X + this.Width - (cr + this.Height*0.05);
        var cy = this.Y + this.Height - (cr + this.Height*0.05);
        var ratio = 1.5;
        
        if(this._counter > 9)
            ratio = 1.1;
        
        c.fillStyle = this._counterBackgroundColor[this.State];
        c.fillCircle(cx,cy, cr, true);
        c.lineWidth = 2;
        c.strokeStyle = this._counterBorderColor[this.State];
        c.strokeCircle(cx,cy, cr, true);
        c.fillStyle = this._counterFontColor[this.State];
        c.setFontHeight(cr*ratio);
        c.font = "bold " + c.font;
        c.fillSpinnedText(cx,cy,this._counter.toString());
    }
    
    if(this._urgency){
        var cr = this.Height*0.15;
        var cx = this.X + this.Width - (cr + this.Height*0.05);
        var cy = this.Y + this.Height - (cr + this.Height*0.05);
        var ratio = 1.5;
                
        c.fillStyle = this._urgencyBackgroundColor[this.State];
        c.fillCircle(cx,cy, cr, true);
        c.lineWidth = 2;
        c.strokeStyle = this._urgencyBorderColor[this.State];
        c.strokeCircle(cx,cy, cr, true);
        c.fillStyle = this._urgencyFontColor[this.State];
        c.setFontHeight(cr*ratio);
        c.font = "bold " + c.font;
        c.fillSpinnedText(cx,cy,"!");
    }
    c.restore();
};

/**
 * Sets one, two or three values to an attribute which needs an array with 3 elements
 * the index of the elements represents the state, in which the button is
 * @param {String} attr
 * @param {anything} val
 * @param {anything} val2
 * @param {anything} val3
 * @returns {Array}
 */
Anibody.ui.Button.prototype.Set = function (attr, val, val2, val3) {
    if(arguments.length < 3){
        val2 = val;
    }
    if(arguments.length < 4){
        val3 = val;
    }
    this[attr] = [];
    this[attr][0] = val;
    this[attr][1] = val2;
    this[attr][2] = val3;
    
    return this[attr];
};

/**
 * Sets the cooldown
 * @param {Number} cd
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.SetCoolDown = function (cd) {
    this.CoolDown = cd;
};

/**
 * Triggers the TriggerCallbackObject, which is suppose to contain the desired function that
 * behold th argorithmn, what happens when the button is clicked
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.Trigger = function (extern) {
    var tco;
    
    if(extern){
        this.State=1;
    }
    
    if (this.State == 1 && this.TriggerCallbackObject) {
        this._mouseOverFrames = 0;
        tco = this.TriggerCallbackObject;
        tco.that = (tco.that === "self" || typeof tco.that === "undefined") ? this : tco.that;
        tco.function.call(tco.that, tco.parameter, this);
        this.IsMouseOver = false;
        this.State = 2;
        
        if (!this.OnTimeButton && this.CoolDown >= 0)
            setTimeout(function () {
                arguments[0].State = 0;
            }, this.CoolDown, this);

    }
};


/**
 * Sets the TriggerCallbackObject (TCO) and adds the needed mouse handler
 * Function is needed when the TCO is not set at the moment of the instanciation or later
 * @param {Object} tco TriggerCallbackObject
 * @param {Number} prior Priority (optional)
 * @param {String} name Name (optional)
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.SetTriggerCallbackObject = function (tco, prior, name) {
    if(this._ref != null)
        this.RemoveMouseHandler();
    
    prior = prior || 5;
    
    this.TriggerCallbackObject = tco;
    this.AddMouseHandler(prior, name);
};

/**
 * Sets the ActivationFunctionObject (AFO)
 * Function is needed when the AFO is not set at the moment of the instanciation or later
 * @param {Object} afo ActivationFunctionObject
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.SetActiveFunctionObject = function (afo) {
    if(afo.that === "self"){
        afo.that = this;
    }
    this.ActivationFunctionObject = afo;
};

/**
 * loads the image for the current state or for all states
 * @param {string} codename
 * @param {number} state
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.LoadImage = function (codename,state) {
    
    if(typeof codename === "undefined") return false;
    
    if(typeof state !== "undefined")
        this.Images[state] = this.Engine.MediaManager.GetImage(codename);
    else{
        this.Images[0] = this.Engine.MediaManager.GetImage(codename);
        this.Images[1] = this.Engine.MediaManager.GetImage(codename);
        this.Images[2] = this.Engine.MediaManager.GetImage(codename);
    }
};

/**
 * Transforms a certain text into an image and sets this image as hover image
 * @param {string|string-array} texts
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.SetHoverText = function (texts) {
    
    this.HoverText = "test";
    
    var constwidth = 260;
    var paddingvert = 3;
    var paddinghor = 5;
    var bckgrnd = "grey"

    var style = 'background-color:' +bckgrnd+ '; border: 1px black solid; width:' +constwidth+ 'px; padding: ' +paddingvert+ 'px ' +paddinghor+ 'px;';

    var html = '<div style="'+style+'">' + this.HoverText + '</div>';

    this.HoverImage = Anibody.static.TransformHTML2Image(html);
    
    this._findHoverPosition();
};


/**
 * Finds the position for the drawing of the hover image due to the current position of the button
 * Saves it in HoverPosition
 * @returns {undefined}
 */
Anibody.ui.Button.prototype._findHoverPosition = function () {
    
    var can = this.Engine.Canvas;
    var center = {x:can.width/2, y:can.height/2}; // centroid of canvas
    var p1, p2, p3, p4; // top-left-point, top-right-p, bottom-right-p, bottom-left-p
    
    // the rectanglization
    // - creating the 4 outer points (p1,p2,p3,p4)
    // connected by a 4 lines, they render a rectangle
    
    p1 = {x:this.X, y:this.Y};
    p2 = {x:this.X + this.Width, y:this.Y};
    p3 = {x:this.X + this.Width, y:this.Y + this.Height};
    p4 = {x:this.X, y:this.Y + this.Height};
    
    // if we divide the canvas in 4 equal areas then now we want to find in which
    // of these 4 areas lies the bigger part of the highlighted area
    // the idea is the following:
    // we take the centroid of the canvas
    // we take the centroid of the rectangleized highlighted area
    // c. of area - c. of canvas = cp (control point)
    
    var cpx = (p1.x+p2.x+p3.x+p4.x)/4;
    var cpy = (p1.y+p2.y+p3.y+p4.y)/4;
    cpx -= center.x;
    cpy -= center.y;
    
    var img = this.HoverImage;
    var off = 5;
    
    // the x and y value of the control point tell us
    // in which corner the highlighted area mainly lies
    
    // if we know the corner then we position the text next to the opposite rectanglized point
    if(cpx > 0 && cpy > 0){
        // area is at the bottom right corner
        this.HoverPosition.x = p1.x - img.width - off;
        this.HoverPosition.y = p1.y - img.height - off;
    }
    
    if(cpx > 0 && cpy < 0){
        // area is at the top right corner
        this.HoverPosition.x = p4.x - img.width - off;
        this.HoverPosition.y = p4.y + off;
    }
    
    if(cpx <= 0 && cpy >= 0){
        // area is at the bottom left corner
        this.HoverPosition.x = p2.x + off;
        this.HoverPosition.y = p2.y - img.height - off;
    }
    
    if(cpx <= 0 && cpy <= 0){
        // area is at the top left corner
        this.HoverPosition.x = p3.x + off;
        this.HoverPosition.y = p3.y + off;
    }
    
};

/**
 * Sets the number of frames that have to pass with mouse over the button until the hover images is displayed
 * @param {type} nof number of frames
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.SetHoverFramesLimit = function (nof) {
    this.HoverFramesLimit = nof;
};


/**
 * adds an 3D Button effect to the button
 * @param {type} depth
 * @param {type} stops
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.AddButtonEffect = function(depth, stops){
    
    if(isNaN(depth))
        depth = Math.floor(this.Height/8);
    
    if(typeof stops === "undefined" || stops.length <= 0)
        stops = [
            {stop:0, color:"rgba(255,255,255,0.5)"},
            {stop:0.5, color:"rgba(255,255,255,0.25)"},
            {stop:1, color:"rgba(255,255,255,0)"}
        ];
    //stops sort
    stops = stops.sort(function(a,b){
        if(a.stop > b.stop) return 1; else return -1;
    });
    
    //if(typeof stops === "undefined" || stops.length <= 0)
    var stops_b = [
            {stop:0, color:"rgba(0,0,0,0.5)"},
            {stop:0.5, color:"rgba(0,0,0,0.25)"},
            {stop:1, color:"rgba(0,0,0,0)"}
        ];
    //stops sort
    stops_b = stops_b.sort(function(a,b){
        if(a.stop > b.stop) return 1; else return -1;
    });
    
    // shorter variables
    var w = this.Width;
    var h = this.Height;
    var r = this.Rounding;
    
    // ------------------------------ Light Boxes
    // top left corner
    var tl = {x:0, y:0, width: depth + r, height: depth + r};
    // top edge ( minus top left corner )
    var top = {x:depth + r, y:0, width: w - (depth+r), height: depth};
    // middle row ( minus top left corner )
    var left = {x:0, y:depth + r, width: depth, height: h - (depth+r)};
    // --------------------------------------------
    
    // ------------------------------- Dark Boxes
    var bottom = {x:0, y: h - depth, width: w - (depth+r), height: depth};
    var right = {x: w - depth, y:0, width: depth, height: h -(depth+r)};
    var br = {x:bottom.x+bottom.width, y: h - depth - r, width: depth+r, height: depth+r};
    // ------------------------------------------
        
    // radial gradient correction ratio
    var ratio = top.height / tl.height; 
    
    // creating an offscreen canvas to draw upon
    var can = document.createElement("CANVAS");
    can.width = w;
    can.height = h;
    var c = can.getContext("2d");
    
    // ------------------------------- start drawing lights
    // TOP
    var ling = c.createLinearGradient(top.x,top.y,top.x,top.height);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(top.x, top.y, top.width, top.height);
    
    //+++++++++++++
    // LEFT
    ling = c.createLinearGradient(left.x,left.y,left.x+left.width,left.y);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(left.x, left.y, left.width, left.height);
    
    //++++++++++
    // TOP-LEFT
    var radg = c.createRadialGradient(
            tl.x+tl.width, tl.y+tl.height,depth+r,
            tl.x+tl.width, tl.y+tl.height,0
    );
    for(var i=0; i<stops.length ;i++){
        radg.addColorStop(stops[i].stop*ratio /* mit einen Wert [0-1] multi */, stops[i].color);
    }
    // adding the last of the stops without ratio so that the gradient covers the whole corner
    radg.addColorStop(stops[stops.length-1].stop /* mit einen Wert [0-1] multi */, stops[stops.length-1].color);
    
    c.fillStyle = radg;
    c.fillRect(tl.x, tl.y, tl.width, tl.height);
    // ----------- end drawing lights
    
    // ------------------------------- start drawing shades
    
    c.fillStyle = "black";
    // right
    ling = c.createLinearGradient(right.x+right.width,right.y,right.x,right.y);
    for(var i=0; i<stops_b.length ;i++){
        ling.addColorStop(stops_b[i].stop, stops_b[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(right.x, right.y, right.width, right.height);
    
    // bottom
    ling = c.createLinearGradient(bottom.x,bottom.y+bottom.height,bottom.x,bottom.y);
    for(var i=0; i<stops_b.length ;i++){
        ling.addColorStop(stops_b[i].stop, stops_b[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(bottom.x, bottom.y, bottom.width, bottom.height);
    
    // bottom right
    var radg = c.createRadialGradient(
            br.x, br.y,depth+r,
            br.x, br.y,0
    );
    for(var i=0; i<stops_b.length ;i++){
        radg.addColorStop(stops_b[i].stop*ratio, stops_b[i].color);
    }
    radg.addColorStop(stops_b[stops_b.length-1].stop, stops_b[stops_b.length-1].color);
    
    c.fillStyle = radg;
    c.fillRect(br.x, br.y, br.width, br.height);
    
    // ----------- end drawing shades
    
    //--------------------------------------------
    // creating the image
    var url = can.toDataURL();
    var img = document.createElement("IMG");
    img.src = url;
    
    this.ButtonLayout = img;
    
};

/**
 * Resets ButtonTemplate
 * @returns {undefined}
 */
Anibody.ui.Button.prototype.ResetTemplate = function () {
    Anibody.ui.Button.ResetTemplate();
};

Anibody.ui.Button._processOptions = function(target, actor, aggressive){
    
    if(typeof aggressive === "undefined")
        aggressive = false;
    
    for(var attr in actor){
        
        // if the attribute exists in target object or does the function even care
        if(aggressive || typeof target[attr] !== "undefined"){
            
            // does the target expects an array as the value for the attribut
            // or does the function even care
            if(aggressive || target[attr].push){
                // it's an array or doesn't matter
                
                //check if the attr in actor is an array or only one value
                if(actor[attr].push){
                    // it's an array
                    target[attr] = actor[attr];
                }else{
                    // it's only one value but it should be (in Button) three
                    target[attr] = [actor[attr], actor[attr], actor[attr]];
                }
                
            }else{
                // it has only one value
                target[attr] = actor[attr];
            }
            
        }
        
    }
};

Anibody.ui.Button.prototype.SetTemplateByObject = function (obj) {
    Anibody.ui.Button._processOptions(Anibody.ui.Button.DefaultButtonTemplate, obj);
};

Anibody.ui.Button.SetTemplateByObject = function (obj) {
    Anibody.ui.Button._processOptions(Anibody.ui.Button.DefaultButtonTemplate, obj);
};

/**
 * Resets ButtonTemplate
 * @returns {undefined}
 */
Anibody.ui.Button.ResetTemplate = function () {
    
    Anibody.ui.Button.DefaultButtonTemplate = {};
    var d = Anibody.ui.Button.DefaultButtonTemplate;


    d.Height =  Anibody.ui.Button._defaultButtonTemplate.Height;
    d.Width =  Anibody.ui.Button._defaultButtonTemplate.Width;
    
    d.CoolDown = Anibody.ui.Button._defaultButtonTemplate.CoolDown;
    
    d.Label = [ 
        Anibody.ui.Button._defaultButtonTemplate.Label[0],
        Anibody.ui.Button._defaultButtonTemplate.Label[1], 
        Anibody.ui.Button._defaultButtonTemplate.Label[2]
    ];
    
    d.CSSMouseCursor = [
        Anibody.ui.Button._defaultButtonTemplate.CSSMouseCursor[0],
        Anibody.ui.Button._defaultButtonTemplate.CSSMouseCursor[1],
        Anibody.ui.Button._defaultButtonTemplate.CSSMouseCursor[2]
    ];
    
    d.FontHeight = [
        Anibody.ui.Button._defaultButtonTemplate.FontHeight[0],
        Anibody.ui.Button._defaultButtonTemplate.FontHeight[1], 
        Anibody.ui.Button._defaultButtonTemplate.FontHeight[2]
    ];
    d.FontType = [
        Anibody.ui.Button._defaultButtonTemplate.FontType[0],
        Anibody.ui.Button._defaultButtonTemplate.FontType[1], 
        Anibody.ui.Button._defaultButtonTemplate.FontType[2]
    ];
    // how the box depending on the state is displayed
    d.DisplayType = [
        Anibody.ui.Button._defaultButtonTemplate.DisplayType[0],
        Anibody.ui.Button._defaultButtonTemplate.DisplayType[1], 
        Anibody.ui.Button._defaultButtonTemplate.DisplayType[2]
    ]; // string-array= "image", "color", "both"
    
    d.Codename = [
        Anibody.ui.Button._defaultButtonTemplate.Codename[0],
        Anibody.ui.Button._defaultButtonTemplate.Codename[1],
        Anibody.ui.Button._defaultButtonTemplate.Codename[2]
    ];
    
    d.Rounding = Anibody.ui.Button._defaultButtonTemplate.Rounding;
    d.Padding = Anibody.ui.Button._defaultButtonTemplate.Padding;
    d.TextAlign = Anibody.ui.Button._defaultButtonTemplate.TextAlign;
    
    d.FramesUntilHover = Anibody.ui.Button._defaultButtonTemplate.FramesUntilHover;
    d.HoverRowSpace = Anibody.ui.Button._defaultButtonTemplate.HoverRowSpace;
    d.HoverPadding = Anibody.ui.Button._defaultButtonTemplate.HoverPadding;
    d.HoverFontHeight = Anibody.ui.Button._defaultButtonTemplate.HoverFontHeight;
    d.FontColor = [
        Anibody.ui.Button._defaultButtonTemplate.FontColor[0],
        Anibody.ui.Button._defaultButtonTemplate.FontColor[1], 
        Anibody.ui.Button._defaultButtonTemplate.FontColor[2]
    ];
    d.HoverBackgroundColor = Anibody.ui.Button._defaultButtonTemplate.HoverBackgroundColor;
    d.HoverFontColor = Anibody.ui.Button._defaultButtonTemplate.HoverFontColor;
    
    d.HoverText = Anibody.ui.Button._defaultButtonTemplate.HoverText;
    
    d.ColorCode = [
        Anibody.ui.Button._defaultButtonTemplate.ColorCode[0],
        Anibody.ui.Button._defaultButtonTemplate.ColorCode[1], 
        Anibody.ui.Button._defaultButtonTemplate.ColorCode[2]
    ];
    d.HoverShadeColor = Anibody.ui.Button._defaultButtonTemplate.HoverShadeColor;

    d.CounterBorderColor = [
        Anibody.ui.Button._defaultButtonTemplate.CounterBorderColor[0],
        Anibody.ui.Button._defaultButtonTemplate.CounterBorderColor[1], 
        Anibody.ui.Button._defaultButtonTemplate.CounterBorderColor[2]
    ];
    d.CounterBackgroundColor = [
        Anibody.ui.Button._defaultButtonTemplate.CounterBackgroundColor[0],
        Anibody.ui.Button._defaultButtonTemplate.CounterBackgroundColor[1], 
        Anibody.ui.Button._defaultButtonTemplate.CounterBackgroundColor[2]
    ];
    d.CounterFontColor = [
        Anibody.ui.Button._defaultButtonTemplate.CounterFontColor[0],
        Anibody.ui.Button._defaultButtonTemplate.CounterFontColor[1], 
        Anibody.ui.Button._defaultButtonTemplate.CounterFontColor[2]
    ];

    d.UrgencyBorderColor = [
        Anibody.ui.Button._defaultButtonTemplate.UrgencyBorderColor[0],
        Anibody.ui.Button._defaultButtonTemplate.UrgencyBorderColor[1], 
        Anibody.ui.Button._defaultButtonTemplate.UrgencyBorderColor[2]
    ];
    d.UrgencyBackgroundColor = [
        Anibody.ui.Button._defaultButtonTemplate.UrgencyBackgroundColor[0],
        Anibody.ui.Button._defaultButtonTemplate.UrgencyBackgroundColor[1], 
        Anibody.ui.Button._defaultButtonTemplate.UrgencyBackgroundColor[2]
    ];
    d.UrgencyFontColor = [
        Anibody.ui.Button._defaultButtonTemplate.UrgencyFontColor[0],
        Anibody.ui.Button._defaultButtonTemplate.UrgencyFontColor[1], 
        Anibody.ui.Button._defaultButtonTemplate.UrgencyFontColor[2]
    ];
};
    
/**
 * Resets ButtonTemplate
 * @returns {object}
 */
Anibody.ui.Button.GetTemplate = function () {
    return Anibody.ui.Button.DefaultButtonTemplate;
};

/**
 * Resets ButtonTemplate
 * @returns {undefined}
 */
Anibody.ui.Button.SetTemplateAttribute = function (attr, val) {
    if(typeof Anibody.ui.Button.DefaultButtonTemplate[attr] !== "undefined"){
        Anibody.ui.Button.DefaultButtonTemplate[attr] = val;
        return true;
    }else{
        return false;
    }
};

Anibody.ui.Button.ResetTemplate();