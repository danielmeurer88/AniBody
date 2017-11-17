
// ++++++++++++++++++++++++++++++++++++++

// needs to be renovated and tested

// ######################################

function Sprite() {
    
    ABO.call(this);
    
    this.Image; // the whole image

    this.DrawImage; // a canvas, on which the needed Clip is drawn - it can be drawn with context.drawImage(this.DrawImage, x, y)

    this.Canvas;
    this.Context;

    this.Clippings = [];
    this.FlagList = {}; // an object full of booleans, which specifically tells which clipping should be used for drawing

    this.Index = 0;
    this.Codename;;
    this.Speed = 6;

    this.ActiveClipping = "undefined";

    this.Error = false;
    this.Constructor = function () {
        
        
    };

    this.AddClipping = function (/* clippings seperated by commas */) {
        var temp;
        for (var i = 0; i < arguments.length; i++) {
            temp = arguments[i];
            temp.EI = this.EI;
            this.Clippings.push(temp);
        }
    };

    this.GetActiveFlags = function () {
        var name;
        var actives = [];
        for (name in this.FlagList) {
            if (this.FlagList[name])
                actives.push(name);
        }
        return actives;
    };

    this.GetActiveClipping = function () {
        var actives = this.GetActiveFlags(); // actives is a string array of all flags, whose value is true
        var cur; // current regarded clipping

        for (var c = 0; c < this.Clippings.length; c++) {
            // loops all Clippings 
            cur = this.Clippings[c].IsCorrectClipping(actives);
            if (cur)
                return this.Clippings[c];
        }

    };

    this.UpdateActiveClipping = function () {
        this.ActiveClipping = this.GetActiveClipping();
        this.ActiveClipping.SpriteIndex = this.Index;
        this.ActiveClipping.CalculateDrawClip();

        this.Canvas = document.createElement("CANVAS");
        this.Canvas.width = this.ActiveClipping.Draw.Width;
        this.Canvas.height = this.ActiveClipping.Draw.Height;
        this.Context = this.Canvas.getContext("2d");

        var s = this;
        var ac = s.ActiveClipping;

        this.Context.drawImage(this.Image, /* sprite img */
                ac.Draw.X, ac.Draw.Y, /* where on the sprite to start clipping (x, y) */
                ac.Draw.Width, ac.Draw.Height, /* where on the sprite to end? clipping (width, height) */
                0, 0, ac.Draw.Width, ac.Draw.Height /* where on the canvas (x, y, width, height) */
                );
        //this.DrawImage = this.Context.getImageData(0, 0, this.Canvas.width, this.Canvas.height);
        this.DrawImage = this.Canvas;
    };

    this.Constructor();
}
Sprite.prototype = Object.create(ABO.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.SetSprite = function(codename, flagList, speed){
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

Sprite.prototype.Update = function(){
    this.UpdateActiveClipping();
};

// ++++++++++++++++++++++++++++++++++++++

// needs to be renovated and tested

// ######################################

function Clipping(startx, starty, clipWidth, clipHeight, numClippings, flagNames) {
    ABO.call(this);
    this.X = startx;
    this.Y = starty;
    this.Numbers = numClippings;
    this.FlagNames = flagNames;

    this.SpriteIndex = 0;

    this.Draw = {X: 0, Y: 0, Width: clipWidth, Height: clipHeight};

    this.IsCorrectClipping = function (actives) {
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

    this.CalculateDrawClip = function () {
        var curclip = this.SpriteIndex % this.Numbers;
        this.Draw.X = this.X + this.Draw.Width * curclip;
        this.Draw.Y = this.Y;
    };

    this.GetDebugString = function () {
        var str = "";
        for (var i = 0; i < this.FlagNames.length - 1; i++)
            str += this.FlagNames[i] + ","
        if (this.FlagNames.length > 0)
            str += this.FlagNames[this.FlagNames.length - 1];
        return str;
    };
}
Clipping.prototype = Object.create(ABO.prototype);
Clipping.prototype.constructor = Clipping;

