/**
 * @description Displays a button
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @returns {Button}
 */
function Button(x, y, width, height) {
    ABO.call(this);
        
    this.Type = "Button";
    this.X = x || 0;
    this.Y = y || 0;
    this.Width = width || 0;
    this.Height = height || 0;
    this._inflated; // saves the original width and height, used if you want to inflat an deflated button
    
    this.HoverText = ""; // this string will be transformed to an image 
    this.HoverImage = false; // which will be saved here
    this.HoverFramesLimit = 25; // number of frames, the mouse has to hover over the button until the hoverimage is displayed
    this.HoverPosition = {x:0, y:0}; // position, where the imagewill be drawn - best position will be calculated in an extra function later
    this.HoverFontHeight = Button.prototype.DefaultHoverFontHeight;
    this.HoverFontColor = Button.prototype.DefaultHoverFontColor;
    
    this.OldState = -1;
    this.State = 0; // 0 - not clicked, 1 - is about to click|mouse down over button , 2 - clicked
    
    this.CoolDown = 50; // number of milliseconds until the button is ready to be clicked again
    this.GonnaRefresh = true; // flag, if button is going to be clicked again or 
    
    // a callback-object ( {function:f, that: objWillBeThis, parameter: obj};
    this.TriggerCallbackObject = {that:this, function:function(){}, parameter:false};
    this.IsMouseOver = false; // boolean
    this._mouseOverFrames = 0;
    
    this._labelWidth = [0, 0, 0]; // will be calculated
    this._textStart = [0, 0, 0];
    
    
    //**********************************
    //    Appearance
    //**********************************
    this.Label = ["", "", ""];
    
    this.FontHeight = [14, 14, 14];
    this.FontType = ["sans-serif", "sans-serif", "sans-serif"];
    // how the box depending on the state is displayed
    this.DisplayType = ["color", "color", "color"]; // string-array: "image", "color", "both"
    this.Rounding = Button.prototype.DefaultRounding;
    
    this.ColorCode = [];
    // single array element must be copied because javascript copies array by reference
    this.ColorCode[0] = Button.prototype.DefaultColorCode[0];
    this.ColorCode[1] = Button.prototype.DefaultColorCode[1];
    this.ColorCode[2] = Button.prototype.DefaultColorCode[2];
    
    this.Codename = [false, false, false]; // the codename of the images
    
    this.HoverShadeColor = Button.prototype.DefaultHoverShadeColor
    
    this.Padding = 0;
    this.TextAlign = "center";
    
    this.SpriteLoaded = false;
    this.Images = [];
    this.ButtonLayout = false;
    
    // the cursor, when the mouse is on the box and depending on state
    this.CSSMouseCursor = ["pointer", "default", "wait"];

    // single array element must be copied because if you copy the default array and later
    // you change the elements of the instance array -> you also change the default array (copy by reference)
    this.FontColor = [];
    this.FontColor[0] = Button.prototype.DefaultFontColor[0];
    this.FontColor[1] = Button.prototype.DefaultFontColor[1];
    this.FontColor[2] = Button.prototype.DefaultFontColor[2];
    
    this.Active = true;
    this.ActivationFunctionObject = {function : function(p){ return this.Active;}, that : this, parameter : {}};
    
    this._ref = null;
    this._ref_reghov = null;
    
    this._counter = 0;
    this._counterBorderColor = Button.prototype.DefaultCounterBorderColor;
    this._counterBackgroundColor = Button.prototype.DefaultCounterBackgroundColor;
    this._counterFontColor = Button.prototype.DefaultCounterFontColor;
    
    this._urgency = false;
    this._urgencyBorderColor = Button.prototype.DefaultUrgencyBorderColor;
    this._urgencyBackgroundColor = Button.prototype.DefaultUrgencyBackgroundColor;
    this._urgencyFontColor = Button.prototype.DefaultUrgencyFontColor;
    
    // if an argument is an object, it will be checked if it contains attributes that defines the button
    for(var i=0; i<arguments.length; i++)
        if(this._getClass(arguments[i]) === "Object")
            this._handleObject(arguments[i]);
    
    this.Initialize();
}

Button.prototype = Object.create(ABO.prototype);
Button.prototype.constructor = Button;

Button.prototype.DefaultMask = null;

Button.prototype.DefaultRounding = 4;
Button.prototype.DefaultHoverRowSpace = 3;
Button.prototype.DefaultHoverPadding = 4;
Button.prototype.DefaultHoverFontHeight = 14;
Button.prototype.DefaultFontColor = ["black", "black", "black"];
Button.prototype.DefaultHoverBackgroundColor = "#eee";
Button.prototype.DefaultHoverFontColor = "black";
Button.prototype.DefaultColorCode = ["#cfcfcf", "#bdbdbd", "#666"];
Button.prototype.DefaultHoverShadeColor = "rgba(0,0,0,0.2)";

Button.prototype.DefaultCounterBorderColor = ["red", "red", "red"];
Button.prototype.DefaultCounterBackgroundColor = ["white", "white", "white"];
Button.prototype.DefaultCounterFontColor = ["red", "red", "red"];

Button.prototype.DefaultUrgencyBorderColor = ["white", "white", "white"];
Button.prototype.DefaultUrgencyBackgroundColor = ["red", "red", "red"];
Button.prototype.DefaultUrgencyFontColor = ["white", "white", "white"];

/**
 * Checkf it the given object contains any attr that may define the instance
 * if the default value of an attribute is originally an array but the value of the object is not,
 * the method Set() makes sure the single value will be saved within the instance as an array
 * @param {object} obj
 * @returns {undefined}
 */
Button.prototype._handleObject = function (obj) {
    var _thisclass;
    var _objclass;
    
    if (typeof obj !== "undefined")
        for (var key in obj) {
            if (typeof this[key] != "undefined"){
                
                // find out if the default value is an array
                _thisclass = this._getClass(this[key]);
                if( _thisclass === "Array"){
                    // find out if obj. value is an array
                    _objclass = this._getClass(obj[key]);
                    if( _objclass === "Array"){
                        this[key][0] = obj[key][0];
                        this[key][1] = obj[key][1] || obj[key][0];
                        this[key][2] = obj[key][2] || obj[key][0];
                    }else{
                        this.Set(key, obj[key]);
                    }
                }else{
                    // default is not an array an probably need no array
                    this[key] = obj[key];
                    
                }
                
            }
                        
        }
    
};

/**
 * Returns the constructor function name of the variable
 * @param {anything} obj
 * @returns {String}
 */
Button.prototype._getClass = function (obj) {
    if(typeof obj === "undefined") return "undefined";
    var con = obj.constructor.toString();
    var ifunc = con.indexOf("function ");
    var ibracket = con.indexOf("(");
    if(ifunc == 0){
        con = con.substr(9, ibracket - 9);
    }
    return con;    
};

/**
 * will be called at the end of the constructor function and it can be seen as an
 * extension of it
 * @returns {undefined}
 */
Button.prototype.Initialize = function () {
    
    if(this.X === "center"){
        var c = this.Engine.Canvas;
        this.X = (c.width - this.Width) / 2;
    }
    
    this._inflated = {width : this.Width, height: this.Height};
    this.HoverPosition = {x:this.X+this.Width+5, y:this.Y-5};

    if(this.TriggerCallbackObject)
        this.AddMouseHandler(5);

    this.Center = {X: this.X + this.Width / 2, Y: this.Y + this.Height / 2};
    this.GetLabelWidth(0);
    
    //applies the default mask if one is set
    if(Button.prototype.DefaultMask != null)
        this.ApplyDefaultMask();
    
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
Button.prototype.AddMouseHandler = function(prior, name){

    this._ref = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", {
        parameter : this.Engine,
        that : this,
        function : function(e, engine){
            if(this.Active && this.IsMouseOver){
                e.GoThrough = false;
                this.Trigger();
            }   
        }
    }, prior, name);

};

/**
 * removes the mouse left click handler
 * @param {Number} prior priority of the PriorityQueue of LeftClick handlers(optional)
 * @param {string} name (optional)
 * @returns {undefined}
 */
Button.prototype.RemoveMouseHandler = function(){this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref);};

/**
 * the drawing of the transformed hover text will be registered as a foreground draw function
 * - won't register twice
 * - the function, which will be registered can be seen as an extension of the draw-function but it will be executed in the foreground
 * @returns {undefined}
 */
Button.prototype._registerHoverImageDrawing = function(){
    
    // if _ref_reghov is not null that means it was already registered
    if(this._ref_reghov != null) return; 
    
    var f = function(c){
        
        if (this.IsMouseOver && this._mouseOverFrames >= this.HoverFramesLimit) {
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
Button.prototype._deregisterHoverImageDrawing = function(){
    if(this._ref_reghov == null) return; 
    this.Engine.RemoveForegroundDrawFunctionObject(this._ref_reghov);
    this._ref_reghov = null
};

/**
 * ProcessInput()
 * @returns {undefined}
 */
Button.prototype.ProcessInput = function () {
          
    var area = this.GetArea(0, this.Rounding);
     
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOver");
     
};

/**
 * Update()
 * @returns {undefined}
 */
Button.prototype.Update = function () {
    
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
 * Draw
 * @param {2DCanvasContext} c
 * @returns {undefined}
 */
Button.prototype.Draw = function (c) {

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
Button.prototype.Set = function (attr, val, val2, val3) {
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
Button.prototype.SetCoolDown = function (cd) {
    this.CoolDown = cd;
};

/**
 * Triggers the TriggerCallbackObject, which is suppose to contain the desired function that
 * behold th argorithmn, what happens when the button is clicked
 * @returns {undefined}
 */
Button.prototype.Trigger = function (extern) {
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
        
        if (this.GonnaRefresh && this.CoolDown >= 0)
            setTimeout(function () {
                arguments[0].State = 0;
            }, this.CoolDown, this);

    }
};

/**
 * calculates the label's width of a certain or the current state, which is important later during drawing
 * @param {Number} state (optional)
 * @returns {undefined}
 */
Button.prototype.GetLabelWidth = function (state) {

    state = arguments.length <= 0 ? this.State : state;

    var c = this.Engine.Context;
    c.save();
    c.textBaseline = "middle";
    c.font = this.FontHeight[state] + "px " + this.FontType[state];
    this._labelWidth[state] = c.measureText(this.Label[state]).width;
    c.restore();

};

/**
 * Sets the TriggerCallbackObject (TCO) and adds the needed mouse handler
 * Function is needed when the TCO is not set at the moment of the instanciation or later
 * @param {Object} tco TriggerCallbackObject
 * @param {Number} prior Priority (optional)
 * @param {String} name Name (optional)
 * @returns {undefined}
 */
Button.prototype.SetTriggerCallbackObject = function (tco, prior, name) {
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
Button.prototype.SetActiveFunctionObject = function (afo) {
    if(afo.that === "self"){
        afo.that = this;
    }
    this.ActivationFunctionObject = afo;
};

/**
 * @description Returns the current appearance (Mask) of the button.
 * @returns {Object}
 */
Button.prototype.GetMask = function () {
    // { DisplayType: "string", Code: "string", Label: "string", Cursor: "string", TextColor: "string", FontHeight: Number, FontType: "string" }
    return {
        State0: {DisplayType: this.DisplayType[0], ColorCode: this.ColorCode[0], Codename:this.Codename[0], Label: this.Label[0], Cursor: this.CSSMouseCursor[0], TextColor: this.FontColor[0], FontHeight: this.FontHeight[0], FontType: this.FontType[0]},
        State1: {DisplayType: this.DisplayType[1], ColorCode: this.ColorCode[1], Codename:this.Codename[1], Label: this.Label[1], Cursor: this.CSSMouseCursor[1], TextColor: this.FontColor[1], FontHeight: this.FontHeight[1], FontType: this.FontType[1]},
        State2: {DisplayType: this.DisplayType[2], ColorCode: this.ColorCode[2], Codename:this.Codename[2], Label: this.Label[2], Cursor: this.CSSMouseCursor[2], TextColor: this.FontColor[2], FontHeight: this.FontHeight[2], FontType: this.FontType[2]},
        SingleValues : { Rounding : this.Rounding, CoolDown : this.CoolDown, HoverFramesLimit : this.HoverFramesLimit, HoverFontHeight : this.HoverFontHeight, Padding : this.Padding}
    };

};

/**
 * @description The button takes on the appearance, descriped in the mask object
 * @param {Object} m Mask Object
 * @returns {undefined}
 */
Button.prototype.SetMask = function (m) {
    this.SetAppearance(m.State0, m.State1, m.State2, m.SingleValues);
};

/**
 * @description Saves the current mask as the DefaultMask
 * @param {Object} m Mask Object
 * @returns {undefined}
 */
Button.prototype.SaveMask = function () {
    Button.prototype.DefaultMask = this.GetMask();
};

/**
 * @description The button takes on the appearance, saved as the default mask
 * @returns {undefined}
 */
Button.prototype.ApplyDefaultMask = function () {
    if(Button.prototype.DefaultMask!=null)
        this.SetAppearance(Button.prototype.DefaultMask.State0, Button.prototype.DefaultMask.State1, Button.prototype.DefaultMask.State2, Button.prototype.DefaultMask.SingleValues);
    else
        return false;
};

/**
 * @description Changes the appearance - should only be called from SetMask()
 * @param {Object} s0
 * @param {Object} s1
 * @param {Object} s2
 * @returns {undefined}
 */
Button.prototype.SetAppearance = function (s0, s1, s2, sv) {

    // optimales Objekt
    /*
    { DisplayType: "string", ColorCode: "string", Codename : "string",
      Label: "string", Cursor: "string", TextColor: "string",
      FontHeight: Number, FontType: "string" };
    */

    if(arguments.length < 3)
        s2 = s0;
    
    if(arguments.length < 2)
        s1 = s0;

    /* state 0 */
    if (s0.DisplayType)
        this.DisplayType[0] = s0.DisplayType;
    if (s0.ColorCode)
        this.ColorCode[0] = s0.ColorCode;
    if (s0.Codename){
        this.Codename[0] = s0.Codename;
        this.LoadImage(s0.Codename, 0);
    }
    if (s0.Label)
        this.Label[0] = s0.Label;
    if (s0.Cursor)
        this.CSSMouseCursor[0] = s0.Cursor;
    if (s0.TextColor)
        this.FontColor[0] = s0.FontColor;
    if (s0.FontHeight)
        this.FontHeight[0] = s0.FontHeight;
    if (s0.FontType)
        this.FontType[0] = s0.FontType;

    /* state 1 */
    if (s1.DisplayType)
        this.DisplayType[1] = s1.DisplayType;
    if (s1.ColorCode)
        this.ColorCode[1] = s1.ColorCode;
    if (s1.Codename){
        this.Codename[1] = s1.Codename;
        this.LoadImage(s1.Codename, 1);
    }
    if (s1.Label)
        this.Label[1] = s1.Label;
    if (s1.Cursor)
        this.CSSMouseCursor[1] = s1.Cursor;
    if (s1.TextColor)
        this.FontColor[1] = s1.FontColor;
    if (s1.FontHeight)
        this.FontHeight[1] = s1.FontHeight;
    if (s1.FontType)
        this.FontType[1] = s1.FontType;

    /* state 2 */
    if (s2.DisplayType)
        this.DisplayType[2] = s2.DisplayType;
    if (s2.ColorCode)
        this.ColorCode[2] = s2.ColorCode;
    if (s2.Codename){
        this.Codename[2] = s2.Codename;
        this.LoadImage(s2.Codename, 2);
    }
    if (s2.Label)
        this.Label[2] = s2.Label;
    if (s2.Cursor)
        this.CSSMouseCursor[2] = s2.Cursor;
    if (s2.TextColor)
        this.FontColor[2] = s2.FontColor;
    if (s2.FontHeight)
        this.FontHeight[2] = s2.FontHeight;
    if (s2.FontType)
        this.FontType[2] = s2.FontType;
    
    //Rounding,CoolDown,HoverFramesLimit,HoverFontHeight
    if(typeof sv !== "undefined"){
        if(typeof sv.Rounding !== "undefined")
            this.Rounding = sv.Rounding;
        if(typeof sv.CoolDown !== "undefined")
            this.CoolDown = sv.CoolDown;
        if(typeof sv.HoverFramesLimit !== "undefined")
            this.HoverFramesLimit = sv.HoverFramesLimit;
        if(typeof sv.HoverFontHeight !== "undefined")
            this.HoverFontHeight = sv.HoverFontHeight;
        if(typeof sv.Padding !== "undefined")
            this.Padding = sv.Padding;
    }

    this.SetPadding(this.Padding);
};

/**
 * @deprecated needs further testing
 * @description Loads the needed images from a single image (a sprite = a series of images in one file)
 * @param {String} codename MediaManager codename
 * @param {type} vertical - images are vertically aligned if true or by default
 * @returns {undefined}
 */
Button.prototype.SetImagesThroughSprite = function (codename,vertical) {
    
    if(arguments.length <= 1)
        vertical = true; 
    
    var x = 0; var y = 0;
    var width = this.Width;
    var height = this.Height;
    
    var img = this.Engine.MediaManager.GetImage(codename);
    var url;
       
    if(!img) return;
    
    this.Images = [];
    
    // an offsight canvas of minirized size will be created
    var can = document.createElement("CANVAS");
    can.width = width;
    can.height = height;
    var con = can.getContext("2d");
    
    for(var i=0; i<3; i++){
        
        con.clearRect(0,0, width, height);
        con.drawImage(img, /* sprite img */
        x, y, /* where on the sprite to start clipping (x, y) */
        width, height, /* where on the sprite to end clipping (width, height) */
        0,0, width, height); /* where on the off canvas to draw the clipping (0, 0, width, height) */
        url = can.toDataURL();
        this.Images.push(document.createElement("IMG"));
        this.Images[i].src = url;
        
        if(vertical)
            y += height;
        else
            x += width;
    }
    
    this.DisplayType = ["image", "image", "image"];
    this.SpriteLoaded = true;
};

/**
 * Sets padding, which will be used
 * @param {Number} padding in pixel
 * @param {boolean} widthcorrection - if new padding and current width of the
 * label is bigger than the width of the box, the width of the button will adjust
 * if this is true
 * @returns {undefined}
 */
Button.prototype.SetPadding = function (padding,widthcorrection) {
    
    if(arguments.length <= 0)
        padding = 0;
    
    if(arguments.length <= 1)
        widthcorrection = false;
    
    this._labelWidth = [0, 0, 0]; // will be calculated
    this._textStart = [0, 0, 0];
    
    var c = this.Engine.Context;
    c.save();
    
    var max=0;
    var tmp;
    
    for(var i=0; i<3; i++){
        c.setFontHeight(this.FontHeight[i]);
        this._labelWidth[i] = c.measureText(this.Label[i]).width;
        tmp = 2* this.Padding + this._labelWidth[i];
        if(max < tmp)
            max = tmp;
    }
    
    if(widthcorrection)
        this.Width = max;
};

/**
 * loads the image for the current state or for all states
 * @param {string} codename
 * @param {number} state
 * @returns {undefined}
 */
Button.prototype.LoadImage = function (codename,state) {
    
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
 * Transforms a certain text into an image and sets this image to the image that will be displayed
 * shrinks the text by decreasing the font height if it doesn't fit into the box
 * @param {string|string-array} texts
 * @param {number} startfh - the font height, with which the function starts testing
 * @returns {undefined}
 */
Button.prototype.AddTextAsImage = function (texts, startfh) {
    
    // our text need to fit in the box
    var box = {
        x:0, y:0, width:this.Width, height : this.Height
    };
    
    // making sure that the 1 parameter is an array of strings
    if(typeof texts === "string")
        texts = [texts];
    
    var c = this.Engine.Context;
    var padding = 5; // the distance between the the border of the black box and the texts
    var rowspace = 3; // the distance between the text rows
    
    
    // setting the width of the text box
    var width = box.width;

    var allwords = [];
    
    var temp;
    // loops through all elements of the string array
    for(var i=0; i<texts.length; i++){
        // splits them into single elements (words)
        temp = texts[i].split(" ");
        // and loops through them
        for(var j=0; j<temp.length; j++){
            allwords.push(temp[j]);
        }
        // at the end of every string element of the array will be a "\n"
        // * if it is not the last element of the array
        if(i < texts.length-1){
            allwords.push("\\n");
        }
    }
    
    // gets the length of all words
    
    var neededheight = box.height + 1;
    var fontheight = startfh + 1 || 25;

    while(neededheight > box.height && fontheight > 0){
        
        fontheight--;
        
        c.setFontHeight(fontheight); // setting the font height - needed for correct calculations
        var spacelen = c.measureText(" ").width; // measures the length of the " "-symbol
        var alllengths = [];
        
        for(var i=0; i<allwords.length; i++){
            if(allwords[i] !== "\\n")
                alllengths.push( c.measureText(allwords[i]).width );
            else
                alllengths.push(0);
        }

        var rows = [];
        var templen=0;
        rows.push("");
        
        for(var i=0; i<allwords.length; i++){

            if(allwords[i] === "\\n"){
                i++;
                rows.push(allwords[i] + " ");
                templen = 0 + alllengths[i] + spacelen;
            }else{
                // true if the current word won't exceed the width+padding of the box
                if(templen + alllengths[i] + spacelen < width-2*padding){
                    // adds the word + " " to the current row
                    rows[rows.length-1] += allwords[i] + " ";
                    templen += alllengths[i] + spacelen;
                }else{
                    // removes the last " "-symbol of the current row
                    rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);
                    // begins a new row and adds the current word + " " to it
                    rows.push(allwords[i] + " ");
                    templen = 0 + alllengths[i] + spacelen;
                }
            }
        }
        // removes the last " "-symbol of the last row
        rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);

        // now that we know how many rows there are, we can calculate the height
        neededheight = 2*padding + fontheight*rows.length + rowspace*rows.length-1;
    }
        
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    
    // center it vertically by calculating the vertical padding as follows...
    var vpadding = padding + (box.height - neededheight) / 2;
    
    // creating an offscreen canvas with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = box.width;
    off.height = box.height;
    var coff = off.getContext("2d");
    
    // creating the black box and writing all rows
    // ... 
    coff.setFontHeight(fontheight);
    
    coff.textAlign = "left";
    coff.textBaseline = "top";
    coff.fillStyle= this.FontColor[0];
    
    coff.strokeStyle = "white";
    
    var x = padding;
    var y = vpadding;
    
    for(var i=0; i< rows.length; i++){
        coff.fillText(rows[i], x,y);
        y += fontheight + rowspace;
    }
    
    // saving the drawing as an image
    var url = off.toDataURL();
    var img = document.createElement("IMG");
    img.src = url;
    
    
    // DisplayType must not be "color" - instead it is "both"
    if(this.DisplayType[0] === "color")
        this.DisplayType[0] = "both";
    
    if(this.DisplayType[1] === "color")
        this.DisplayType[1] = "both";
    
    if(this.DisplayType[2] === "color")
        this.DisplayType[2] = "both";
    
    
    this.Label = [" ", " ", " "];
    this.Images = [img, img, img];
    
};

/**
 * Transforms a certain text into an image and sets this image as hover image
 * @param {string|string-array} texts
 * @returns {undefined}
 */
Button.prototype.SetHoverText = function (texts) {
    
    // making sure that the 1 parameter is an array of strings
    if(typeof texts === "string")
        texts = [texts];
    
    this.HoverText = texts;
    
    //starts transforming
    this._createHoverImage();
    
};

/**
 * Transforms the HoverText into in image and saves it as HoverImage
 * @param {Number} fh Font Height of the text(optional)
 * @returns {undefined}
 */
Button.prototype._createHoverImage = function (fh) {
    
    var texts = this.HoverText;
    
    var color = this.HoverFontColor;
    var fontheight = fh || this.HoverFontHeight;
    
    var allwords = [];
    
    var temp;
    // loops through all elements of the texts array
    for(var i=0; i<texts.length; i++){
        // splits them into single elements (words)
        temp = texts[i].split(" ");
        // and loops through them
        for(var j=0; j<temp.length; j++){
            allwords.push(temp[j]);
        }
        // at the end of every string element of the array will be a "\n"
        // * if it is not the last element of the array
        if(i < texts.length-1){
            allwords.push("\\n");
        }
    }
    
    // set a maximum value for the later used width
    var width = this.Engine.Canvas.width / 3;
    
    var padding = Button.prototype.DefaultHoverPadding; // the distance between the the border of the image and the text
    var rowspace = Button.prototype.DefaultHoverRowSpace; // the distance between the text rows
    // gets the length of all words
    var c = this.Engine.Context;
    c.save();
    
    c.setFontHeight(fontheight); // setting the font height - needed for correct calculations
    var spacelen = c.measureText(" ").width; // measures the length of the " "-symbol
    var alllengths = [];

    // loops through all elements of the string array
    for(var i=0; i<allwords.length; i++){
        if(allwords[i] !== "\\n")
            alllengths.push( c.measureText(allwords[i]).width );
        else
            alllengths.push(0);
    }

    var rows = [];
    var rowlengths = [];
    rows.push("");
    rowlengths.push(0);
    
    for(var i=0; i<allwords.length; i++){

        if(allwords[i] === "\\n"){
            i++;
            rows.push(allwords[i] + " ");
            rowlengths.push(0 + alllengths[i] + spacelen);
        }else{
            // true if the current word won't exceed the width+padding of the box
            if(rowlengths[rows.length-1] + alllengths[i] + spacelen < width-2*padding){
                // adds the word + " " to the current row
                rows[rows.length-1] += allwords[i] + " ";
                rowlengths[rows.length-1] += alllengths[i] + spacelen;
            }else{
                // removes the last " "-symbol of the current row
                rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);
                rowlengths[rows.length-1] -= spacelen;
                // begins a new row and adds the current word + " " to it
                rows.push(allwords[i] + " ");
                rowlengths.push(alllengths[i] + spacelen);
            }
        }
    }
    // removes the last " "-symbol of the last row
    rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);
    
    // finding the maximum length among the rows...
    var max = 0;
    for(var i=0; i<rows.length; i++){
        if(rowlengths[i] > max)
            max = rowlengths[i];
    }
    // and resize the width
    width = Math.ceil(max + 2*padding);
    
    // now that we know how many rows there are, we can calculate the height
    var height = 2*padding + fontheight*rows.length + rowspace*rows.length-1;
    
    
    // creating an offscreen canvas with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = width;
    off.height = height;
    c.restore();
    
    // new instanciation of c
    var c = off.getContext("2d");
    
    c.setFontHeight(fontheight);
    
    c.strokeStyle = "black";
    c.fillStyle = this.DefaultHoverBackgroundColor;
    
    c.fillRect(0,0, width,height);
    c.strokeRect(0,0,width, height);
    
    c.textAlign = "left";
    c.textBaseline = "top";
    c.fillStyle= color;
    
    var x = padding;
    var y = padding;
    
    for(var i=0; i< rows.length; i++){
        c.fillText(rows[i], x,y);
        y += fontheight + rowspace;
    }
    
    // saving the drawing as an image
    var url = off.toDataURL();
    var img = document.createElement("IMG");
    img.src = url;
        
    this.HoverImage = img;
};

/**
 * Finds the position for the drawing of the hover image due to the current position of the button
 * Saves it in HoverPosition
 * @returns {undefined}
 */
Button.prototype._findHoverPosition = function () {
    
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
Button.prototype.SetHoverFramesLimit = function (nof) {
    this.HoverFramesLimit = nof;
};

/**
 * Inflates the deflated button
 * @returns {undefined}
 */
Button.prototype.Inflate = function () {
    this.Width = this._inflated.width;
    this.Height = this._inflated.height;
};

/**
 * Deflates the button
 * @returns {undefined}
 */
Button.prototype.Deflate = function () {
    this._inflated.width = this.Width;
    this._inflated.height = this.Height;
    this.Width = 0;
    this.Height = 0;
};

/**
 * generates a layout image, which creates the illusion of a 3D Button by using linear gradients on the edges and radiate gradients on the corners
 * between the rectangle of the button and an inner (imaginable) rectangle
 * @description Needs further testing
 * @param {number} depth - the difference between the outer rect and the inner rect in pixel
 * @param {array} stops - [stop[,stop...]], stop = {stop:Number [0,1], color: colorcode string}
 * @returns {undefined}
 */
Button.prototype.AddInnerButtonLayout = function(depth,stops){
    
    // create 9 (imaginary) boxes according to the values in the arguments (box, depth)
    // tl = top-left, top, tr = top-right
    // left, m = middle, right
    // bl = bottom-left, bottom, br = bottom-right
    var r = this.Rounding;
    if(typeof r === "undefined")
        r=0;
    var w = this.Width
    var h = this.Height;
    
    if(typeof depth === "undefined")
        depth = Math.round(h/4);
    
    if(typeof stops === "undefined" || stops.length <= 0)
        stops = [{stop:0, color:"rgba(0,0,0,0.5)"},{stop:0.5, color:"rgba(0,0,0,0.25)"},{stop:1, color:"rgba(0,0,0,0)"}];
    
    // top row
    var y = 0;
    var tl = {x:0, y:0, width: depth + r, height: depth + r};
    var top = {x:depth + r, y:0, width: w - 2*(depth+r), height: depth};
    var tr = {x:top.x+top.width, y:0, width: depth+r, height: depth+r};
    // middle row
    var left = {x:0, y:depth + r, width: depth, height: h - 2*(depth+r)};
    var m = {x:depth+r, y:top.y + top.height, width: w - 2*(depth+r), height: h - 2*top.height};
    var right = {x: w - depth, y:depth + r, width: depth, height: h - 2*(depth+r)};
    // bottom row
    var bl = {x:0, y:h - depth - r, width: depth + r, height: depth + r};
    var bottom = {x:depth + r, y: h - depth, width: w - 2*(depth+r), height: depth};
    var br = {x:bottom.x+bottom.width, y: h - depth - r, width: depth+r, height: depth+r};
    
    var ratio = top.height / tl.height; // radial gradient correction ratio
    
    //stops sort
    stops = stops.sort(function(a,b){
        if(a.stop > b.stop) return 1; else return -1;
    });
    
    var can = document.createElement("CANVAS");
    can.width = w;
    can.height = h;
    var c = can.getContext("2d");
    
    var lcolor = stops[stops.length-1].color;
    c.fillStyle = lcolor;
    c.fillRect(m.x, m.y, m.width, m.height);
    c.fillRect(left.x+left.width, left.y, depth, depth);
    c.fillRect(m.x+m.width, left.y, depth, depth);
    
    //+++++++++++++
    // TOP
    var ling = c.createLinearGradient(top.x,top.y,top.x,top.height);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(top.x, top.y, top.width, top.height);
    
    //+++++++++++++
    // BOTTOM
    ling = c.createLinearGradient(bottom.x,bottom.y+bottom.height,bottom.x,bottom.y);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(bottom.x, bottom.y, bottom.width, bottom.height);
    
    //+++++++++++++
    // LEFT
    ling = c.createLinearGradient(left.x,left.y,left.x+left.width,left.y);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(left.x, left.y, left.width, left.height);
    
    //+++++++++++++
    // Right
    ling = c.createLinearGradient(right.x+right.width,right.y,right.x,right.y);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(right.x, right.y, right.width, right.height);
    
    //++++++++++
    // TOP-LEFT
    var radg = c.createRadialGradient(
            tl.x+tl.width, tl.y+tl.height,depth+r,
            tl.x+tl.width, tl.y+tl.height,0
    );
    for(var i=0; i<stops.length ;i++){
        radg.addColorStop(stops[i].stop*ratio /* mit einen Wert [0-1] multi */, stops[i].color);
    }
    c.fillStyle = radg;
    c.beginPath();
    // centroid
    c.moveTo(tl.x+tl.width, tl.y+tl.height);
    c.lineTo(tl.x, tl.y+tl.height);
    //c.lineTo(tl.x+tl.width, tl.y);
    c.arcTo(
            tl.x, tl.y,
            tl.x+tl.width, tl.y,
            tl.width);
    c.closePath();
    c.fill();
    
    //++++++++++
    // TOP-RIGHT
    var radg = c.createRadialGradient(
            tr.x, tr.y+tr.height,depth+r,
            tr.x, tr.y+tr.height,0
    );
    for(var i=0; i<stops.length ;i++){
        radg.addColorStop(stops[i].stop*ratio, stops[i].color);
    }
    c.fillStyle = radg;
    c.beginPath();
    // centroid
    c.moveTo(tr.x, tr.y+tr.height);
    c.lineTo(tr.x+tr.width, tr.y+tr.height);
    //c.lineTo(tr.x+tr.width, tr.y);
    c.arcTo(
            tr.x+tr.width, tr.y,
            tr.x, tr.y,
            tr.width);
    c.closePath();
    c.fill();
    
    //++++++++++
    // BOTTOM-LEFT
    var radg = c.createRadialGradient(
            bl.x+bl.width, bl.y,depth+r,
            bl.x+bl.width, bl.y,0
    );
    for(var i=0; i<stops.length ;i++){
        radg.addColorStop(stops[i].stop*ratio /* mit einen Wert [0-1] multi */, stops[i].color);
    }
    c.fillStyle = radg;
    c.beginPath();
    // centroid
    c.moveTo(bl.x+bl.width, bl.y);
    c.lineTo(bl.x, bl.y);
    //c.lineTo(bl.x+bl.width, bl.y);
    c.arcTo(
            bl.x, bl.y+bl.height,
            bl.x+bl.width, bl.y+bl.height,
            bl.width);
    c.closePath();
    c.fill();
    
    //++++++++++
    // Bottom-RIGHT
    var radg = c.createRadialGradient(
            br.x, br.y,depth+r,
            br.x, br.y,0
    );
    for(var i=0; i<stops.length ;i++){
        radg.addColorStop(stops[i].stop*ratio, stops[i].color);
    }
    c.fillStyle = radg;
    c.beginPath();
    // cenbroid
    c.moveTo(br.x, br.y);
    c.lineTo(br.x+br.width, br.y);
    //c.lineTo(br.x+br.width, br.y);
    c.arcTo(
            br.x+br.width, br.y+br.height,
            br.x, br.y+br.height,
            br.width);
    c.closePath();
    c.fill();
    
    // saving the drawing as an image
    var url = can.toDataURL();
    var img = document.createElement("IMG");
    img.src = url;
    
    this.ButtonLayout = img;
    
};

Button.prototype.AddButtonEffectOnlyLightning = function(depth, stops){
    
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
    
    // shorter variables
    var w = this.Width;
    var h = this.Height;
    var r = this.Rounding;
    
    // ------------------------------ Boxes
    // top left corner
    var tl = {x:0, y:0, width: depth + r, height: depth + r};
    // top edge ( minus top left corner )
    var top = {x:depth + r, y:0, width: w - (depth+r), height: depth};
    // middle row ( minus top left corner )
    var left = {x:0, y:depth + r, width: depth, height: h - (depth+r)};
        
    // radial gradient correction ratio
    var ratio = top.height / tl.height; 
    
    // creating an offscreen canvas to draw upon
    var can = document.createElement("CANVAS");
    can.width = w;
    can.height = h;
    var c = can.getContext("2d");
    
    // ------------------------------- start drawing
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
    // ----------- end drawing
    
    //--------------------------------------------
    // creating the image
    var url = can.toDataURL();
    var img = document.createElement("IMG");
    img.src = url;
    
    this.ButtonLayout = img;
    
};

Button.prototype.AddButtonEffect = function(depth, stops){
    
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

Button.prototype.SetCounter = function (c) {if(!isNaN(c) || c >= 0)this._counter = c;};

Button.prototype.GetCounter = function () {return this._counter;};

Button.prototype.IncreaseCounter = function () {this._counter++;};

Button.prototype.DecreaseCounter = function () {if(this._counter)this._counter--;};

Button.prototype.SetUrgency = function (ur) {
    if(typeof ur === "undefined")
        this._urgency = false;
    else
        this._urgency = ur;
    
};

Button.prototype.Circlize = function () {
    var min = Math.min(this.Width, this.Height);
    this.Rounding = min/2;
};