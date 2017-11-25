

Anibody.visual.Sprite = function Sprite(codename) {
    Anibody.classes.ABO.call(this);

    this.Image = {complete : false}; // the whole image
    this.Codename = codename;
    
    this.Clippings = [];
    this.FlagList = {}; // an object full of booleans, which specifically tells which clipping should be used for drawing

    this.Index = 0;
    this.ActiveClipping = null;
    this.FPS = 6;
    this.Milli = 1000/this.FPS;

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
    if(this.MediaManager)
        this.Image = this.MediaManager.GetPicture(codename);
};

/**
 * Adds one or several Clippings to the Sprite
 * @returns {undefined}
 */
Anibody.visual.Sprite.prototype.AddClipping = function (/* clippings seperated by commas */) {
    var temp;
    for (var i = 0; i < arguments.length; i++) {
        temp = arguments[i];
        temp.EI = this.EI;
        if(temp instanceof Anibody.visual.Clipping)
            this.Clippings.push(temp);
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

Anibody.visual.Sprite.prototype.UpdateActiveClipping = function () {
    this.ActiveClipping = this._getActiveClipping();
    this.ActiveClipping.SpriteIndex = this.Index;
    this.ActiveClipping.CalculateDrawClip();

    
    //this.DrawImage = this.Context.getImageData(0, 0, this._offCanvas.width, this._offCanvas.height);
    this.DrawImage = this._offCanvas;
};

Anibody.visual.Sprite.prototype.Draw = function (c) {
    var s = this;
    var ac = s.ActiveClipping;

    c.drawImage(this.Image, /* sprite img */
        ac.Draw.X, ac.Draw.Y, /* where on the sprite to start clipping (x, y) */
        ac.Draw.Width, ac.Draw.Height, /* where on the sprite to end? clipping (width, height) */
        0, 0, ac.Draw.Width, ac.Draw.Height /* where on the canvas (x, y, width, height) */
    );
};

Anibody.visual.Sprite.prototype.SetSprite = function (codename, flagList, speed) {
    this.Codename = codename;

    this.Image = this.Engine.MediaManager.GetImage(this.Codename);
    if (!this.Image)
        this.Error = true;

    var f = function (that) {
        that.Index++;
    };
    this.Engine.IntervalHandler.AddIntervalFunction({
        parameter: this,
        function: f,
        every: this.Speed
    });

    this.FlagList = flagList;
};

Anibody.visual.Sprite.prototype.Update = function () {
    this.UpdateActiveClipping();
};
Anibody.visual.Sprite.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Sprite.prototype.constructor = Anibody.visual.Sprite;

// ++++++++++++++++++++++++++++++++++++++

// needs to be renovated and tested

// ######################################

Anibody.visual.Clipping = function Clipping(startx, starty, clipWidth, clipHeight, numClippings, flagNames) {
    Anibody.classes.ABO.call(this);
    this.X = startx;
    this.Y = starty;
    this.Numbers = numClippings;
    this.FlagNames = flagNames;

    this.SpriteIndex = 0;

    this.Draw = {X: 0, Y: 0, Width: clipWidth, Height: clipHeight};

};
Anibody.visual.Clipping.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Clipping.prototype.constructor = Anibody.visual.Clipping;

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

Anibody.visual.Clipping.prototype.CalculateDrawClip = function () {
    var curclip = this.SpriteIndex % this.Numbers;
    this.Draw.X = this.X + this.Draw.Width * curclip;
    this.Draw.Y = this.Y;
};

Anibody.visual.Clipping.prototype.GetDebugString = function () {
    var str = "";
    for (var i = 0; i < this.FlagNames.length - 1; i++)
        str += this.FlagNames[i] + ",";
    if (this.FlagNames.length > 0)
        str += this.FlagNames[this.FlagNames.length - 1];
    return str;
};