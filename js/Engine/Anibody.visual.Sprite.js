

Anibody.visual.Sprite = function Sprite(codename, x, y) {
    Anibody.classes.ABO.call(this);

    this.Image = {complete : false}; // the whole image
    this.Codename = codename;
    
    this.Clippings = [];
    this.DefaultClipping = null;
    this.FlagList = {}; // an object full of booleans, which specifically tells which clipping should be used for drawing

    this.X = x;
    this.Y = y;

    this.OldClipping = null;
    this.ActiveClipping = null;

    this.Initialize();
};

Anibody.visual.Sprite.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Sprite.prototype.constructor = Anibody.visual.Sprite;

Anibody.visual.Sprite.prototype.Initialize = function () {
    if(this.Image && !this.Image.complete){
        this.LoadImage();
    }
};

/**
 * Adds one or several Clippings to the Sprite
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.LoadImage = function (codename) {
    if(typeof codename === "undefined")
        codename = this.Codename;
    if(this.Engine.MediaManager){
        this.Codename = codename;
        this.Image = this.Engine.MediaManager.GetPicture(codename);
    }
};

/**
 * Adds one or several Clippings to the Sprite
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.AddClipping = function (/* clippings seperated by commas */) {
    var temp;
    for (var i = 0; i < arguments.length; i++) {
        temp = arguments[i];
        
        if(temp instanceof Anibody.visual.Clipping){
            temp.Image = this.Image;
            temp.EI = this.EI;
            this.Clippings.push(temp);
            
            if(typeof temp.FlagNames === "string" && temp.FlagNames === "default"){
                this.DefaultClipping = temp;
            }
            
            for(var attr in temp.FlagNames){
                this.FlagList[temp.FlagNames[attr]] = false;
            }
        }
    }
};

Anibody.visual.Sprite.prototype.SetAllFlags = function (state) {
    for(var name in this.FlagList){
        this.FlagList[name] = state;
    }
};

Anibody.visual.Sprite.prototype.SetFlag = function (flagname, state) {
        this.FlagList[flagname] = state;
};

/**
 * 
 * @returns {Array}
 */
Anibody.visual.Sprite.prototype._getActiveFlags = function () {
    var name;
    var actives = [];
    for (name in this.FlagList) {
        if (this.FlagList[name])
            actives.push(name);
    }
    return actives;
};

Anibody.visual.Sprite.prototype._getActiveClipping = function () {
    var actives = this._getActiveFlags(); // actives is a string array of all flags, whose value is true
    var cur; // current regarded clipping

    for (var c = 0; c < this.Clippings.length; c++) {
        // loops all Clippings 
        cur = this.Clippings[c].IsCorrectClipping(actives);
        if (cur)
            return this.Clippings[c];
    }
    return false;

};

Anibody.visual.Sprite.prototype.Update = function () {
    this.ActiveClipping = this._getActiveClipping();
    
    if(!this.ActiveClipping && this.DefaultClipping){
        this.ActiveClipping = this.DefaultClipping;
    }
    
    if(this.ActiveClipping !== this.OldClipping){
        if(this.OldClipping!==null)
            this.OldClipping.Stop();
        this.ActiveClipping.Start();
    }
    
    this.OldClipping = this.ActiveClipping;
    
};

/**
 * Resets ActiveClipping
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.ResetActiveClipping = function () {
    if(this.ActiveClipping)
        this.ActiveClipping.Reset();
    
};

/**
 * Resets DefaultClipping
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.ResetDefaultClipping = function () {
    if(this.DefaultClipping)
        this.DefaultClipping.Reset();
};

Anibody.visual.Sprite.prototype.Draw = function (c) { 
    c.save();
    c.translate(this.X, this.Y);
    this.ActiveClipping.Draw(c);
    c.restore();
};

/**
 * A clipping is a row of pictures which represents an animation
 * @param {object} firstClip - object of x,y,width,height of the first clipped picture
 * @param {number} numClips - the names of the booleans that describe this Clipping (should be unique among the Clippings in a Sprite)
 * @param {number} fps - frames per second
 * @param {array} flagName - names of the booleans in Sprite.FlagList that need to be true to choose this Clipping
 * @param {string} playtype - string "once" or "loop" mode 
 * @returns {Anibody.visual.Clipping}
 */
Anibody.visual.Clipping = function Clipping(firstClip, numClips, fps, flagNames, playtype) {
    Anibody.classes.ABO.call(this);
    this.StartX = firstClip.x;
    this.StartY = firstClip.y;

    this.X = firstClip.x;
    this.Y = firstClip.y;
    this.Width = firstClip.width;
    this.Height = firstClip.height;
    this.Current = 0;
    this.Amount = numClips;
    this.FlagNames = flagNames; // string or [strings,..]
    
    this.Speed = 1000/fps;
    this.offCanvas = null;
    this.offContext = null;
    this.Image = {complete : false};
    
    this.SpriteIndex = 0;

    playtype = (typeof playtype === "string") ? playtype : "loop";
    this.PlayType = playtype; // "once", "loop"
    this.Counter = null;
    
this.Initialize();
};
Anibody.visual.Clipping.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Clipping.prototype.constructor = Anibody.visual.Clipping;

Anibody.visual.Clipping.prototype.Initialize = function () {
    
    this.offCanvas = document.createElement("CANVAS");
    this.offCanvas.width = this.Width;
    this.offCanvas.height = this.Height;
    this.offContext = this.offCanvas.getContext("2d");
    
    var cbo = function(i){
        if(!this.Image.complete) return;
        
        this.X = this.StartX + this.Width*i;  
        this.offContext.clearRect(0,0,this.Width, this.Height);
        this.offContext.drawImage(this.Image, /* sprite img */
            this.X, this.StartY, /* where on the sprite to start clipping (x, y) */
            this.Width, this.Height, /* where on the sprite to end? clipping (width, height) */
            0, 0, this.Width, this.Height /* where on the canvas (x, y, width, height) */
        );
        
    }.getCallbackObject(this);
    
    this.Counter = new Anibody.util.Counter([0,this.Amount-1], this.Speed, cbo, false);
    
    if(this.PlayType === "once"){
        this.Counter.SetLoop(false);
    }else{
        this.Counter.SetLoop(true);
    }
    
};

Anibody.visual.Clipping.prototype.Start = function () {
    this.Counter.Start();
};

Anibody.visual.Clipping.prototype.Stop = function () {
    this.Counter.Stop();
};

Anibody.visual.Clipping.prototype.Reset = function () {
    this.Counter.Reset();
};

Anibody.visual.Clipping.prototype.Draw = function (c) {
    c.drawImage(this.offCanvas, 0, 0);
};

/**
 * checks if all in an argument given flag names are equal to the flags of this instance
 * @param {array of strings} actives - the name of the flags
 * @returns {boolean}
 */
Anibody.visual.Clipping.prototype.IsCorrectClipping = function (actives) {
    var curActive;
    var correct = true;

    for (var f = 0; correct && f < this.FlagNames.length; f++) {
        // loops all flagnames, which are a constraint for the current clipping
        curActive = this.FlagNames[f];
        // check if curActive is the same as an element of actives
        correct = actives.indexOf(curActive);
        if (correct >= 0)
            correct = true; // still correct
        else
            correct = false;
    }

    return correct;
};

/**
 * A clipping is a row of pictures which represents an animation
 * @param {number} startx - x of the first clipped picture
 * @param {number} starty - y of the first clipped picture
 * @param {number} numClips - the names of the booleans that describe this Clipping (should be unique among the Clippings in a Sprite)
 * @param {number} fps - frames per second
 * @param {array} flagName - names of the booleans in Sprite.FlagList that need to be true to choose this Clipping
 * @param {string} playtype - string "once" or "loop" mode 
 * @returns {Anibody.visual.Clipping}
 */
Anibody.visual.Clipping.prototype.Template = function (startx, starty, flagNames, obj) {
    var numClips = this.Amount;
    var fps = 1000/this.Speed;
    var playtype = this.PlayType;
    
    if(typeof obj !== "undefined"){
        if(typeof obj.NumberOfClips !== "undefined") numClips = obj.NumberOfClips;
        if(typeof obj.FPS !== "undefined") fps = obj.FPS;
        if(typeof obj.PlayType !== "undefined") playtype = obj.PlayType;
    }
    
    var cl = new Anibody.visual.Clipping({x:startx,y:starty,width:this.Width, height:this.Height}, numClips, fps, flagNames, playtype);
    return cl;
};