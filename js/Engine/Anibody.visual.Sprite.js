
// ++++++++++++++++++++++++++++++++++++++

// needs to be renovated and tested

// ######################################

Anibody.visual.Sprite = function Sprite() {
    Anibody.classes.ABO.call(this);

    this.Image = null; // the whole image
    this.DrawImage = null; // a canvas, on which the needed Clip is drawn - it can be drawn with context.drawImage(this.DrawImage, x, y)

    this._offCanvas = null;
    this.Context = null;

    this.Clippings = [];
    this.FlagList = {}; // an object full of booleans, which specifically tells which clipping should be used for drawing

    this.Index = 0;
    this.Codename = null;
    this.Speed = 6;

    this.ActiveClipping = null;

    this.Error = false;

    this.Initialize();
};

Anibody.visual.Sprite.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Sprite.prototype.constructor = Anibody.visual.Sprite;

Anibody.visual.Sprite.prototype.Initialize = function () {
};

Anibody.visual.Sprite.prototype.AddClipping = function (/* clippings seperated by commas */) {
    var temp;
    for (var i = 0; i < arguments.length; i++) {
        temp = arguments[i];
        temp.EI = this.EI;
        this.Clippings.push(temp);
    }
};

Anibody.visual.Sprite.prototype.GetActiveFlags = function () {
    var name;
    var actives = [];
    for (name in this.FlagList) {
        if (this.FlagList[name])
            actives.push(name);
    }
    return actives;
};

Anibody.visual.Sprite.prototype.GetActiveClipping = function () {
    var actives = this.GetActiveFlags(); // actives is a string array of all flags, whose value is true
    var cur; // current regarded clipping

    for (var c = 0; c < this.Clippings.length; c++) {
        // loops all Clippings 
        cur = this.Clippings[c].IsCorrectClipping(actives);
        if (cur)
            return this.Clippings[c];
    }

};

Anibody.visual.Sprite.prototype.UpdateActiveClipping = function () {
    this.ActiveClipping = this.GetActiveClipping();
    this.ActiveClipping.SpriteIndex = this.Index;
    this.ActiveClipping.CalculateDrawClip();

    this._offCanvas = document.createElement("CANVAS");
    this._offCanvas.width = this.ActiveClipping.Draw.Width;
    this._offCanvas.height = this.ActiveClipping.Draw.Height;
    this.Context = this._offCanvas.getContext("2d");

    var s = this;
    var ac = s.ActiveClipping;

    this.Context.drawImage(this.Image, /* sprite img */
            ac.Draw.X, ac.Draw.Y, /* where on the sprite to start clipping (x, y) */
            ac.Draw.Width, ac.Draw.Height, /* where on the sprite to end? clipping (width, height) */
            0, 0, ac.Draw.Width, ac.Draw.Height /* where on the canvas (x, y, width, height) */
            );
    //this.DrawImage = this.Context.getImageData(0, 0, this._offCanvas.width, this._offCanvas.height);
    this.DrawImage = this._offCanvas;
};

Anibody.visual.Sprite.prototype.SetSprite = function (codename, flagList, speed) {
    this.Codename = codename;
    this.Speed = (speed) ? speed : 6;

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