

Anibody.visual.Sprite = function Sprite(codename, x, y) {
    Anibody.classes.ABO.call(this);

    this.Image = {complete : false}; // the whole image
    this.Codename = codename;
    
    this.Clippings = [];
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
            for(var attr in temp.FlagNames){
                this.FlagList[temp.FlagNames[attr]] = false;
            }
        }
    }
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

};

Anibody.visual.Sprite.prototype.Update = function (c) {
    this.ActiveClipping = this._getActiveClipping();
};

Anibody.visual.Sprite.prototype.Draw = function (c) {
    var ac = this.ActiveClipping;
    
    c.save();
    c.translate(this.X, this.Y);
    ac.Draw(c);
    c.restore();
    
};

/**
 * A clipping is a row of pictures which will be a special animation
 * @param {type} startx
 * @param {type} starty
 * @param {type} clipWidth
 * @param {type} clipHeight
 * @param {type} numClippings
 * @param {string array} flagNames - string array of boolean names that need to be true to be the correct clipping
 * in a sprite
 * @returns {Anibody.visual.Clipping}
 */
Anibody.visual.Clipping = function Clipping(startx, starty, clipWidth, clipHeight, numClippings, fps, flagNames) {
    Anibody.classes.ABO.call(this);
    this.StartX = startx;
    this.StartY = starty;

    this.X = startx;
    this.Y = starty;
    this.Width = clipWidth;
    this.Height = clipHeight;
    this.Current = 0;
    this.Amount = numClippings;
    this.FlagNames = flagNames;
    
    this.Speed = 1000/fps;
    this.offCanvas = null;
    this.offContext = null;
    this.Image = {complete : false};
    
    this.SpriteIndex = 0;

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
    this.Counter.SetLoop(true);
    this.Counter.Start();
};

Anibody.visual.Clipping.prototype.Start = function () {
    this.Counter.Start();
};

Anibody.visual.Clipping.prototype.Stop = function () {
    this.Counter.Stop();
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