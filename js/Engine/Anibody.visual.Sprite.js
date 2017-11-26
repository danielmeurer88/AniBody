

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

Anibody.visual.Sprite.prototype.Draw = function (c) {
    var ac = this.ActiveClipping;

    c.drawImage(this.Image, /* sprite img */
        ac.X, ac.Y, /* where on the sprite to start clipping (x, y) */
        ac.Width, ac.Height, /* where on the sprite to end? clipping (width, height) */
        this.X, this.Y, ac.Width, ac.Height /* where on the canvas (x, y, width, height) */
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
    this.ActiveClipping = this._getActiveClipping();
    
    if(this.ActiveClipping !== this.OldClipping){
        this.OldClipping.Stop();
        this.ActiveClipping.Start();
    }
    this.OldClipping = this.ActiveClipping;
};
Anibody.visual.Sprite.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Sprite.prototype.constructor = Anibody.visual.Sprite;


/**
 * A clipping is a row of pictures which will be a special animation
 * @param {type} startx
 * @param {type} starty
 * @param {type} clipWidth
 * @param {type} clipHeight
 * @param {type} numClippings
 * @param {type} flagNames
 * @returns {Anibody.visual.Clipping}
 */
Anibody.visual.Clipping = function Clipping(startx, starty, clipWidth, clipHeight, numClippings, speed, flagNames) {
    Anibody.classes.ABO.call(this);
    this.StartX = startx;
    this.StartY = starty
    this.X = startx;
    this.Y = starty;
    this.Width = clipWidth;
    this.Height = clipHeight;
    this.Current = 0;
    this.Amount = numClippings;
    this.FlagNames = flagNames;
    
    this.Speed = speed;

    this.SpriteIndex = 0;

    this.Counter = null;
this.Initialize();
};
Anibody.visual.Clipping.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Clipping.prototype.constructor = Anibody.visual.Clipping;

Anibody.visual.Clipping.prototype.Initialize = function () {
    
    var cbo = function(i){
        this.X = this.StartX + this.Width*i;       
    }.getCallbackObject(this);
    
    this.Counter = new Anibody.util.Counter([0,this.Amount-1], this.Speed, cbo, false);
};

Anibody.visual.Clipping.prototype.Start = function () {
    this.Counter.Start();
};

Anibody.visual.Clipping.prototype.Stop = function () {
    this.Counter.Stop();
};

/**
 * checks if all in an argument given flags are equal to the flags of this instance
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