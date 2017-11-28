
Anibody.visual.Sprite = function Sprite(codename, clipX, clipY,clipWidth, clipHeight) {
    Anibody.classes.ABO.call(this);
    this.Codename = codename;
    this.SpriteImage = {complete : false}; // the whole image
    this.ClipCanvas = null;
    this.ClipContext = null;
    this.X = clipX;
    this.Y = clipY;
    this.Width = clipWidth;
    this.Height = clipHeight;
    
    this.Clippings = [];
    this._clippingsCounter = [];
    this.ActiveClippingIndex = -1;
    
    this.Flags = {};
    
    this._useDefault = false;
    this.DefaultClipping = null;
    this._defaultCounter = null;
    
    this.ClippingTemplate = null;
    
    this.FlagConstraints = [];

    this.Initialize();
};

Anibody.visual.Sprite.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Sprite.prototype.constructor = Anibody.visual.Sprite;

Anibody.visual.Sprite.prototype.DefaultClippingTemplate = {
        NumberOfClips : 1,
        FPS : 10,
        Orign : {x:0, y:0},
        PlayMode : "loop",
        FlagNames : ["default"]
    };

Anibody.visual.Sprite.prototype.Initialize = function(){
    
    // in case it is the image already
    if(this.Codename instanceof HTMLImageElement)
        this.SpriteImage = this.Codename;
    
    if(this.Engine.MediaManager && this.Engine.MediaManager.GetPicture && typeof this.Codename === "string")
        this.SpriteImage = this.Engine.MediaManager.GetPicture(this.Codename);
    
    if(!this.SpriteImage){
        throw "Could not access the Image for the Sprite";
    }
    
    this.ClippingTemplate = {
        NumberOfClips : Anibody.visual.Sprite.prototype.DefaultClippingTemplate.NumberOfClips,
        FPS : Anibody.visual.Sprite.prototype.DefaultClippingTemplate.FPS,
        Orign : {x:Anibody.visual.Sprite.prototype.DefaultClippingTemplate.Orign.x, y:Anibody.visual.Sprite.prototype.DefaultClippingTemplate.Orign.y},
        PlayMode : Anibody.visual.Sprite.prototype.DefaultClippingTemplate.PlayMode,
        FlagNames : Anibody.visual.Sprite.prototype.DefaultClippingTemplate.FlagNames
    };
    
    this.ClipCanvas = document.createElement("CANVAS");
    this.ClipCanvas.width = this.Width;
    this.ClipCanvas.height = this.Height;
    this.ClipContext = this.ClipCanvas.getContext("2d");
    
    
};

Anibody.visual.Sprite.prototype.GetTemplate = function(){return this.ClippingTemplate;};

Anibody.visual.Sprite.prototype.SetTemplateAttribute = function(attr, val){this.ClippingTemplate[attr] = val;};

/**
 * 
 * @param {Clipping} dclip
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.SetDefaultClipping = function (dclip) {
    this.AddClipping(dclip, true);
};

Anibody.visual.Sprite.prototype.AddClipping = function(obj, def){
    
    if(typeof def === "undefined")
        def = false;
    
    var temp = {
        NumberOfClips : this.ClippingTemplate.NumberOfClips,
        FPS : this.ClippingTemplate.FPS,
        Orign : {x:this.ClippingTemplate.Orign.x, y:this.ClippingTemplate.Orign.y},
        PlayMode : this.ClippingTemplate.PlayMode,
        FlagNames : this.ClippingTemplate.FlagNames
    };
    
    if(typeof obj === "object"){
        
        if(obj.NumberOfClips) temp.NumberOfClips = obj.NumberOfClips;
        if(obj.FPS) temp.FPS = obj.FPS;
        if(obj.Orign && !isNaN(obj.Orign.x)) temp.Orign.x = obj.Orign.x;
        if(obj.Orign && !isNaN(obj.Orign.y)) temp.Orign.y = obj.Orign.y;
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
        tempc = new Anibody.util.Counter([0,temp.NumberOfClips-1], 1000/temp.FPS, cbo, endcbo); //range, ms, cbo, endcbo
        
        if(temp.PlayMode === "loop"){
            tempc.SetLoop(true);
            
        tempc.Start();
    }
    }else
        tempc = {};
    
    if(!def){
        this._clippingsCounter.push(tempc);
        
    }
    else
        this._defaultCounter = tempc;
    
    
    
};

Anibody.visual.Sprite.prototype.AddClippings = function(){
    for(var i=0; i<arguments.length; i++)
        this.AddClipping(arguments[i]);
};

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
};

Anibody.visual.Sprite.prototype._checkClipping = function(names, i){
    var correct = true;
 
    for(var n=0; n<names.length; n++){
        if(correct && !this.Clippings[i].FlagNames.isElement(names[n]))
            correct = false;
    }
    
    return correct;
};

Anibody.visual.Sprite.prototype.Draw = function(c){
    
    if(!this.SpriteImage || !this.SpriteImage.complete)
        return;
    
    var cp = false;
    
    if(this._useDefault && this.DefaultClipping!== null){
        cp = this.DefaultClipping;
    }else
        if(this.ActiveClippingIndex >= 0 && this.ActiveClippingIndex < this.Clippings.length){
            cp = this.Clippings[this.ActiveClippingIndex];
        }
    
    if(!cp) return;
    
    var x = cp.Orign.x + this.Width * cp._internal;
    this.ClipContext.clearRect(0, 0, this.Width, this.Height);
    
    // ToDo : later draw on ClipContext
    
    c.drawImage(this.SpriteImage, /* sprite img */
        x, cp.Orign.y, /* where on the sprite to start clipping (x, y) */
        this.Width, this.Height, /* where on the sprite to end? clipping (width, height) */
        this.X, this.Y, this.Width, this.Height /* where on the canvas (x, y, width, height) */
    );
    
};

Anibody.visual.Sprite.prototype.Update = function(){
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
 * Set the flags to true
 * @params {strings} 
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.SetFlags = function (names, states) {
    for(var i=0; i<names.length; i++)
        if(typeof names[i] === "string"){
            this.SetFlag(names[i], states[i])
        }
};

Anibody.visual.Sprite.prototype._checkConstraints = function (target) {
    var c;
    for(var i=0; i<this.FlagConstraints.length; i++){
        if(this.FlagConstraints[i].subject === target){
            this._applyConstraint(this.FlagConstraints[i]);
        } 
    }
};

Anibody.visual.Sprite.prototype._applyConstraint = function (c) {
    if(c.type === "radio"){
        var tarval;
        
        tarval = this.Flags[c.subject];
        for(var i=0; i<c.objects.length; i++)
            this.Flags[c.objects[i]] = !tarval;
    }
};

Anibody.visual.Sprite.prototype.AddRadioConstraint = function () {
    
    var c;
    for(var i=0; i<arguments.length; i++){
        
        var group = [];
        for(var j=0; j<arguments.length; j++)
            if(arguments[i] !== arguments[j])
                group.push(arguments[j]);
        
        c = {type:"radio", subject:arguments[i], objects : group}
        this.FlagConstraints.push(c);
    }
};