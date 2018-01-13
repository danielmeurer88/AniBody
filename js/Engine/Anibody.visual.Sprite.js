Anibody.SetPackage("Anibody", "visual");

/**
 * Represents a sprite - a collection of clips in one single image.
 * A number of flags decide which clip the sprite will render
 * @param {string|htmlImage} codename - codename of the sprite image or HTMLImageElement
 * @param {number} canvasX - x value of the rendered animation on the canvas
 * @param {number} canvasY - x value of the rendered clip on the canvas
 * @param {number} clipWidth - 
 * @param {number} clipHeight - 
 * @returns {Anibody.visual.Sprite}
 */
Anibody.visual.Sprite = function Sprite(codename, canvasX, canvasY,clipWidth, clipHeight) {
    Anibody.ABO.call(this);
    this.Codename = codename;
    this.SpriteImage = {complete : false}; // the whole image
    this.ClipCanvas = null;
    this.ClipContext = null;
    this.X = canvasX;
    this.Y = canvasY;
    this.Width = clipWidth;
    this.Height = clipHeight;
    
    this.Locked = false;
    
    this.Clippings = [];
    this._clippingsCounter = [];
    this.ActiveClippingIndex = -1;
    this.OldIndex = -1;
    
    this.Flags = {};
    
    this._useDefault = false;
    this.DefaultClipping = null;
    this._defaultCounter = null;
    
    // default values of every clipping added to this sprite instance
    this.ClippingTemplate = null;
    
    this.FlagConstraints = [];

    this.Initialize();
};

Anibody.visual.Sprite.prototype = Object.create(Anibody.ABO.prototype);
Anibody.visual.Sprite.prototype.constructor = Anibody.visual.Sprite;

Object.defineProperty(Anibody.visual.Sprite, "name", {value:"Sprite"});

/**
 * default values of every clipping template added to this sprite instance
 * @type object
 */
Anibody.visual.Sprite.prototype.DefaultClippingTemplate = {
        NumberOfClips : 1,
        FPS : 10,
        Origin : {x:0, y:0},
        PlayMode : "loop",
        FlagNames : ["default"]
    };

Anibody.visual.Sprite.prototype.Initialize = function(){
    
    // in case it is the image already
    if(this.Codename instanceof HTMLImageElement)
        this.SpriteImage = this.Codename;
    
    // if the codename is a string -> try to load the picture from the mediamanager
    if(this.Engine.MediaManager && this.Engine.MediaManager.GetImage && typeof this.Codename === "string")
        this.SpriteImage = this.Engine.MediaManager.GetImage(this.Codename);
    
    if(!this.SpriteImage){
        throw "Could not access the Image for the Sprite";
    }
    
    this.ResetTemplate();

    this.ClipCanvas = document.createElement("CANVAS");
    this.ClipCanvas.width = this.Width;
    this.ClipCanvas.height = this.Height;
    this.ClipContext = this.ClipCanvas.getContext("2d");
    
};

/**
 * returns the template of this instance - attributes of the template can be changed 
 * (pass by reference)
 * @returns {Anibody.visual.Sprite.ClippingTemplate}
 */
Anibody.visual.Sprite.prototype.GetTemplate = function(){return this.ClippingTemplate;};

/**
 * attributes of the template can be changed
 * @param {type} attr - attribute
 * @param {type} val - new value
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.SetTemplateAttribute = function(attr, val){this.ClippingTemplate[attr] = val;};

/**
 * Sets a new default clipping
 * Sprite will use the default clipping if the current states of the flags do not fit
 * to any clippings
 * @param {object} dclip - 
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.SetDefaultClipping = function (dclip) {
    this.AddClipping(dclip, true);
};

/**
 * Molds a new clipping by the template and overwrites the new clipping's by the
 * information found in the given argument
 * @param {object} obj - adds this information to the clipping, molded by the template
 * @param {boolean} def - if true clipping will be defaultclipping and flags won't be added to the sprite
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.AddClipping = function(obj, def){
    
    if(typeof def === "undefined")
        def = false;
    
    var temp = {
        NumberOfClips : this.ClippingTemplate.NumberOfClips,
        FPS : this.ClippingTemplate.FPS,
        Origin : {x:this.ClippingTemplate.Origin.x, y:this.ClippingTemplate.Origin.y},
        PlayMode : this.ClippingTemplate.PlayMode,
        FlagNames : this.ClippingTemplate.FlagNames
    };
    
    if(typeof obj === "object"){
        
        if(obj.NumberOfClips) temp.NumberOfClips = obj.NumberOfClips;
        if(obj.FPS) temp.FPS = obj.FPS;
        if(obj.Origin && !isNaN(obj.Origin.x)) temp.Origin.x = obj.Origin.x;
        if(obj.Origin && !isNaN(obj.Origin.y)) temp.Origin.y = obj.Origin.y;
        if(obj.PlayMode) temp.PlayMode = obj.PlayMode;
        if(obj.FlagNames) temp.FlagNames = obj.FlagNames;
        
    }
    temp._internal = 0;
    
    if(!def){
        this.Clippings.push(temp);
        
        // adding flags to the sprite
        for(var i=0; i<temp.FlagNames.length; i++){
            this.Flags[temp.FlagNames[i]] = false;
        }
    }else
        this.DefaultClipping = temp;
    
    var cbo = function(i){
        this._internal = i;
    }.getCallbackObject(temp);
    
    var endcbo, tempc;
    
    if(temp.NumberOfClips>1){
        tempc = new Anibody.util.Counter([0,temp.NumberOfClips-1], 1000/temp.FPS, cbo); //range, ms, cbo, endcbo
        
        if(temp.PlayMode === "loop"){
            tempc.SetLoop(true);
            tempc.Start();
        }
        
        if(temp.PlayMode === "once"){
            tempc.SetEndCallbackObject(function(){
                this.Unlock();
                this.SetAllFlags(false);
            }.getCallbackObject(this));
            
        }
    }else
        tempc = {};
    
    if(!def){
        this._clippingsCounter.push(tempc);
        
    }
    else
        this._defaultCounter = tempc;

};

/**
 * Allows to add several clippings at once by calling Sprite.AddClipping for
 * every argument
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.AddClippings = function(){
    for(var i=0; i<arguments.length; i++)
        this.AddClipping(arguments[i]);
};
/**
 * @private
 * Finds the clipping that fits the currrent state of the flags
 * if the current state of the flags doesn't fit any clipping, the
 * defaultclipping flag will be set true
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype._findActiveClipping = function(){
    
    // 1. get the names of the active flags
    var names = [];
    var n;
    for(n in this.Flags){
        if(typeof this.Flags[n] === "boolean" && this.Flags[n] === true)
            names.push(n);
    }
        
    // 2. get the clipping's index, which holds all flags
    var i = -1;
    this._useDefault = true;
    
    for (i = 0; this._useDefault && names.length && i < this.Clippings.length; i++) {
        
        // the number of active (flag)names needs to be equal to the flag names, which belongs to the clipping
        // &&
        // check if all active names are found in this clipping (this._checkClipping(names, i))
        if(names.length === this.Clippings[i].FlagNames.length && this._checkClipping(names, i)){
            this.ActiveClippingIndex = i;
            this._useDefault = false;
        }
    }
    
    if(this.ActiveClippingIndex !== this.OldIndex){
        var newcl = this.Clippings[this.ActiveClippingIndex];
        if(this._clippingsCounter[this.ActiveClippingIndex] && this._clippingsCounter[this.ActiveClippingIndex].Reset)
            this._clippingsCounter[this.ActiveClippingIndex].Reset();
        if(newcl.PlayMode === "once"){
            this.Lock();
        }
    }
    this.OldIndex = this.ActiveClippingIndex;
};

/**
 * @private
 * checks if the specified clipping fits the current state of the flags, which are saved in an array
 * @param {string-array} names - names of the active flags
 * @param {number} i - index of the clipping in the clippings-array
 * @returns {.Object@call;create._checkClipping.correct|Boolean|Object.prototype._checkClipping.correct}
 */
Anibody.visual.Sprite.prototype._checkClipping = function(names, i){
    var correct = true;
 
    for(var n=0; n<names.length; n++){
        if(correct && this.Clippings[i].FlagNames.indexOf(names[n]) < 0)
            correct = false;
    }
    
    return correct;
};

/**
 * 
 * @param {type} c
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.Draw = function(c){
    
    if(!this.SpriteImage || !this.SpriteImage.complete)
        return;
    
    var cp = false;
    var cam = this.Engine.GetCamera();
    
    if(this._useDefault && this.DefaultClipping!== null){
        cp = this.DefaultClipping;
    }else
        if(this.ActiveClippingIndex >= 0 && this.ActiveClippingIndex < this.Clippings.length){
            cp = this.Clippings[this.ActiveClippingIndex];
        }
    
    if(!cp) return;
    
    var x = cp.Origin.x + this.Width * cp._internal;
    this.ClipContext.clearRect(0, 0, this.Width, this.Height);
    
    // ToDo : later draw on ClipContext
    
    c.drawImage(this.SpriteImage, /* sprite img */
        x, cp.Origin.y, /* where on the sprite to start clipping (x, y) */
        this.Width, this.Height, /* where on the sprite to end? clipping (width, height) */
        this.X - cam.X, this.Y - cam.Y, this.Width, this.Height /* where on the canvas (x, y, width, height) */
    );
    
};

/**
 * 
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.Update = function(){
    if(!this.Locked)
        this._findActiveClipping();
};

/**
 * change the state of the given flag
 * @param {string} name - flagname
 * @param {boolean} state - new state 
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.SetFlag = function (flagname, state) {
        this.Flags[flagname] = state;
        this._checkConstraints(flagname);
};

/**
 * Set the flags to the given state
 * @params {string-array} names - the names of the flags
 * @param {boolean-array} states - the state of the representive flag
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.SetFlags = function (names, states) {
    for(var i=0; i<names.length; i++)
        if(typeof names[i] === "string"){
            this.SetFlag(names[i], states[i]);
        }
};

/**
 * Set all flage to the given state
 * @params {string-array} names - the names of the flags
 * @param {boolean-array} states - the state of the representive flag
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.SetAllFlags = function (state) {
    for(var attr in this.Flags)
            this.SetFlag(attr, state);
};

/**
 * @private
 * checks if the target flag has a constraint to be considered
 * @param {string} target - flagname
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype._checkConstraints = function (target) {
    var c;
    for(var i=0; i<this.FlagConstraints.length; i++){
        if(this.FlagConstraints[i].subject === target){
            this._applyConstraint(this.FlagConstraints[i]);
        } 
    }
};

/**
 * @private
 * applies constraint according to its type
 * @param {object} c - constraint {type, subject, objects,...}
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype._applyConstraint = function (c) {
    if(c.type === "radio"){
        var tarval;
        
        if(this.Flags[c.subject])
            for(var i=0; i<c.objects.length; i++)
                this.Flags[c.objects[i]] = false;
    }
    
    if(c.type === "opposite"){
        var tarval = this.Flags[c.subject];
        for(var i=0; i<c.objects.length; i++)
            this.Flags[c.objects[i]] = !tarval;
    }
};
/**
 * Adds a "RadioConstraint" to the Sprite (only one of the flags is allowed to be true)
 * @param {strings} flagnames - a number of flagnames
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.AddRadioConstraint = function () {
    
    var c;
    for(var i=0; i<arguments.length; i++){
        
        var group = [];
        for(var j=0; j<arguments.length; j++)
            if(arguments[i] !== arguments[j])
                group.push(arguments[j]);
        
        c = {type:"radio", subject:arguments[i], objects : group};
        this.FlagConstraints.push(c);
    }
};

/**
 * Adds a "OppositeConstraint" to the Sprite. If one flag changes state, the
 * others will be switched to the opposite value
 * @param {strings} flagnames - a number of flagnames
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.AddOppositeConstraint = function () {
    
    var c;
    for(var i=0; i<arguments.length; i++){
        
        var group = [];
        for(var j=0; j<arguments.length; j++)
            if(arguments[i] !== arguments[j])
                group.push(arguments[j]);
        
        c = {type:"opposite", subject:arguments[i], objects : group};
        this.FlagConstraints.push(c);
    }
};

/**
 * Adds a "RadioConstraint" to the Sprite (only one of the flags is allowed to be true)
 * @param {strings} flagnames - a number of flagnames
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.ResetTemplate = function () {
    
    this.ClippingTemplate  = {
        NumberOfClips : Anibody.visual.Sprite.prototype.DefaultClippingTemplate.NumberOfClips,
        FPS : Anibody.visual.Sprite.prototype.DefaultClippingTemplate.FPS,
        Origin : {x:Anibody.visual.Sprite.prototype.DefaultClippingTemplate.Origin.x, y:Anibody.visual.Sprite.prototype.DefaultClippingTemplate.Origin.y},
        PlayMode : Anibody.visual.Sprite.prototype.DefaultClippingTemplate.PlayMode,
        FlagNames : Anibody.visual.Sprite.prototype.DefaultClippingTemplate.FlagNames
    };
};

/**
 * Sets the constant updating for the right clipping under lock down or not
 * @param {type} state
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.SetLocked = function (state) {
    this.Locked = state;
};

/**
 * Sets the constant updating for the right clipping under lock down
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.Lock = function () {
    this.Locked = true;
};

/**
 * Continue the constant updating for the right clipping
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.Unlock = function () {
    this.Locked = false;
};

Anibody.visual.Sprite.prototype.ResetClippingIndex = function () {
    this.ActiveClippingIndex = -1;
    this.OldIndex = -1;
    this.SetAllFlags(false);
};