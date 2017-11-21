
Anibody.ui.Toaster = function Toaster(type, title, txt, ms) {
    Anibody.classes.Widget.call(this);
    this.X = 0;
    this.Y = 0;
    this.Width = 0;
    this.Height = 0;
    this.Rounding = 0;
    
    this._blur = 5;
    
    this.PositionQutient = 0.55;

    this.Title = title;
    if (typeof txt === "string")
        this.Text = [txt];
    else
        this.Text = txt;

    this.Padding = Anibody.ui.Toaster.prototype.DefaultPadding;
    this.RowSpace = Anibody.ui.Toaster.prototype.DefaultRowSpace;
    this.FontHeight = Anibody.ui.Toaster.prototype.DefaultFontHeight;
    this.Rows = false;

    this.Image = false;
    this.BackgroundImage = false;

    this.IsMouseOver = false;
    this.IsMouseOverClose = false;
    
    this.Xbox = {
        x: 0, y: 0, width: this.FontHeight, height: this.FontHeight
    };
    
    this.BackgroundColor = Anibody.ui.Toaster.prototype.DefaultDefaultBackgroundColor;
    this.FontColor = Anibody.ui.Toaster.prototype.DefaultDefaultFontColor;
    
    this.Type = type;
    switch(type){
        case "warning" : this.BackgroundColor = Anibody.ui.Toaster.prototype.DefaultWarningBackgroundColor;this.FontColor = Anibody.ui.Toaster.prototype.DefaultWarningFontColor; break;
        case "success" : this.BackgroundColor = Anibody.ui.Toaster.prototype.DefaultSuccessBackgroundColor;this.FontColor = Anibody.ui.Toaster.prototype.DefaultSuccessFontColor; break;
        case "error" : this.BackgroundColor = Anibody.ui.Toaster.prototype.DefaultErrorBackgroundColor;this.FontColor = Anibody.ui.Toaster.prototype.DefaultErrorFontColor; break;
        default: console.log("toaster type = " + type); this.Type = "default"; break;
    }
    
    this.Milliseconds = ms || 4000;
    this._refMH = null;
    
    this._isBlocking = false;
    this._isOverwriting = true;
    
    
    // IE does not support context.filter - chrome, firefox, opera do
    this._filter = false;
    if(document.createElement("CANVAS").getContext("2d").filter)
        this._filter = true;

    this.Initialize();
}
Anibody.ui.Toaster.prototype = Object.create(Anibody.classes.Widget.prototype);
Anibody.ui.Toaster.prototype.constructor = Anibody.ui.Toaster;

Anibody.ui.Toaster.BlockMode = false;
Anibody.ui.Toaster.CurrentInstance = null;

Anibody.ui.Toaster.prototype.DefaultDefaultBackgroundColor = "black";
Anibody.ui.Toaster.prototype.DefaultDefaultFontColor = "white";

Anibody.ui.Toaster.prototype.DefaultWarningBackgroundColor = "orange";
Anibody.ui.Toaster.prototype.DefaultWarningFontColor = "white";

Anibody.ui.Toaster.prototype.DefaultSuccessBackgroundColor = "green";
Anibody.ui.Toaster.prototype.DefaultSuccessFontColor = "white";

Anibody.ui.Toaster.prototype.DefaultErrorBackgroundColor = "red";
Anibody.ui.Toaster.prototype.DefaultErrorFontColor = "white";

Anibody.ui.Toaster.prototype.DefaultFontHeight = 15;
Anibody.ui.Toaster.prototype.DefaultPadding = 5;
Anibody.ui.Toaster.prototype.DefaultRowSpace = 3;

/**
 * @see README_DOKU.txt
 */
Anibody.ui.Toaster.prototype.Initialize = function () {

    this._calculateValues();
    this._getBackgroundImage();
    this._createImage();
    this._adjustPosition();
    
};
/**
 * opens the toaster: 
 * - starts a flow (flow animation, emerging the toaster from the bottom)
 * - asynchron: at the end of the animation, a timeout triggers FlowClose()
 * - register a draw, a update, a process input - function) 
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype.Open = function () {
    
    if(Anibody.ui.Toaster.BlockMode)
        return;
    
    if(this._isBlocking){
        Anibody.ui.Toaster.BlockMode = true;
    }
    
    this.CloseCurrentInstance();
    Anibody.ui.Toaster.CurrentInstance = this;
    
    var can = this.Engine.Canvas;

    new Flow(this, "Y", can.height - this.Height, 600, {
        that: this, parameter: true, function() {

            var f = function (t) {
                t.FlowClose();
            };
            window.setTimeout(f, this.Milliseconds, this);

        }
    }).Start();

    this.AddMouseHandler(12);

    this.Register(); // Widget.Register()

};
/**
 * Closes the toaster with a flow animation disapearing to the bottom
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype.FlowClose = function () {
    var can = this.Engine.Canvas;
    new Flow(this, "Y", can.height, 600, {
        that: this, parameter: true, function() {
            this.Close();
        }
    }).Start();
};
/**
 * closes the toaster without a flow animation, just disapearing on the spot
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype.Close = function () {
    this.Deregister(); // Widget.Deregister()
    this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._refMH);
    this._refMH = null;
    
    Anibody.ui.Toaster.CurrentInstance = null;
    Anibody.ui.Toaster.BlockMode = false;
};
/**
 * registers the left click mouse handler that checks for a left mouse click on the X
 * @param {number} prior (optional)
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype.AddMouseHandler = function (prior) {

    this._refMH = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", {
        parameter: this.Engine,
        that: this,
        function: function (e, engine) {
            
            if(this.IsMouseOver)
                e.GoThrough = false;
            
            if (this.IsMouseOverClose) {
                this.Close();
                e.GoThrough = false;
            }
        }
    }, prior);

};

/**
 * @see README_DOKU.txt
 */
Anibody.ui.Toaster.prototype.ProcessInput = function () {
    var area = {
        x: this.X,
        y: this.Y,
        width: this.Width,
        height: this.Height,
        type: "rect",
        background: true
    };

    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOver");

    area = {
        x: this.X + this.Width - this.RowSpace - this.FontHeight,
        y: this.Y + this.RowSpace,
        width: this.FontHeight,
        height: this.FontHeight,
        type: "rect"
    };

    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverClose");
};

/**
 * @see README_DOKU.txt
 */
Anibody.ui.Toaster.prototype.Update = function () {
    this.Xbox.x = this.X + this.Width - this.RowSpace - this.FontHeight;
    this.Xbox.y = this.Y + this.RowSpace;

    if (this.IsMouseOverClose)
        this.Engine.Input.Mouse.Cursor.Set("pointer");
};

/**
 * @see README_DOKU.txt
 */
Anibody.ui.Toaster.prototype.Draw = function (c) {
        c.save();
        
        c.drawImage(this.BackgroundImage, this.X, this.Y);
        c.drawImage(this.Image, this.X, this.Y);
        c.restore();
};

/**
 * Calculating the height with a set width to conceal the given text with
 * a black rectangle
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype._calculateValues = function () {
    var can = this.Engine.Canvas;
    var c = this.Engine.Context;

    // setting the width of the text box
    this.Width = Math.round(can.width / 2.6);

    // setting the font height - needed for correct calculations
    c.setFontHeight(this.FontHeight);

    var allwords = [];
    var alllengths = [];
    // measures the length of the " "-symbol
    var spacelen = c.measureText(" ").width;

    var temp;
    // loops through all elements of the string array
    for (var i = 0; i < this.Text.length; i++) {
        // splits them into single elements (words)
        temp = this.Text[i].split(" ");
        // and loops through them
        for (var j = 0; j < temp.length; j++) {
            allwords.push(temp[j]);
            alllengths.push(c.measureText(temp[j]).width);
        }
        // at the end of every string element of the array will be a "\n"
        // * if it is not the last element of the array
        if (i < this.Text.length - 1) {
            allwords.push("\\n");
            alllengths.push(0);
        }
    }
    // at the end of the loop - we have two arrays
    // - allwords - which has all words
    // - alllengths - which has all lengths of the string element in 'allwords' with the same index

    // now we want to find out how many rows needs to be created so
    // - we use every word
    // - every row won't exceed the width of the box (considering the padding as well)
    // - every "\n" marks the end of the current row

    this.Rows = [];
    var templen = 0;
    this.Rows.push("");
    for (var i = 0; i < allwords.length; i++) {

        if (allwords[i] === "\\n") {
            i++;
            this.Rows.push(allwords[i] + " ");
            templen = 0 + alllengths[i] + spacelen;
        } else {
            // true if the current word won't exceed the width+padding of the box
            if (templen + alllengths[i] + spacelen < this.Width - 2 * this.Padding) {
                // adds the word + " " to the current row
                this.Rows[this.Rows.length - 1] += allwords[i] + " ";
                templen += alllengths[i] + spacelen;
            } else {
                // removes the last " "-symbol of the current row
                this.Rows[this.Rows.length - 1] = this.Rows[this.Rows.length - 1].substr(0, this.Rows[this.Rows.length - 1].length - 1);
                // begins a new row and adds the current word + " " to it
                this.Rows.push(allwords[i] + " ");
                templen = 0 + alllengths[i] + spacelen;
            }
        }
    }
    // removes the last " "-symbol of the last row
    this.Rows[this.Rows.length - 1] = this.Rows[this.Rows.length - 1].substr(0, this.Rows[this.Rows.length - 1].length - 1);

    // now that we know how many rows there are, we can calculate the height
    // 
    // the height only for the toaster text
    this.Height = 2 * this.Padding + this.FontHeight * this.Rows.length + this.RowSpace * this.Rows.length - 1;
    // plus the extra height for the title with closing "x"
    this.Height += 2 * this.RowSpace + this.FontHeight;

};

/**
 * Transforming the texts into an Image
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype._createImage = function () {
    // creating an offscreen canvas with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = this.Width + 2*this._blur;
    off.height = this.Height + this._blur;
    var coff = off.getContext("2d");

    coff.setFontHeight(this.FontHeight);
    
    // extra background layer
    /*
    coff.fillStyle = getRGBA(this.BackgroundColor, 0.6, 0.4);
    coff.fillRect(0,0, off.width, off.height);
    */
    
    // creating the black rectangle
    coff.fillStyle = this.BackgroundColor;
    coff.fillRect(this._blur, this._blur, this.Width, this.Height);

    coff.textAlign = "left";
    coff.textBaseline = "top";
    coff.fillStyle = this.FontColor;

    coff.strokeStyle = this.FontColor;

    var x = this.Padding + this._blur;
    var y = this.RowSpace + this._blur;

    /* ++++++++++ creating the title ++++++++ */
    coff.fillText(this.Title, x, y);
    coff.lineWidth = 2;
    /* ++++++++++ creating the title's cross ++++++++ */
    coff.drawCross(this.Width  + this._blur - this.FontHeight / 2 - this.RowSpace, this.RowSpace  + this._blur + this.FontHeight / 2, this.FontHeight);
    coff.lineWidth = 1;


    y = 2 * this.RowSpace + this.FontHeight  + this._blur;
    
    /* ++++++++++ seperation line ++++++++ */
    coff.beginPath();
    coff.moveTo(x, y);
    coff.lineTo(x + this.Width - 2 * this.Padding, y);
    coff.stroke();
    coff.closePath();

    y = this.Padding + 3 * this.RowSpace + this.FontHeight;

    /* ++++++++++ creating the text ++++++++ */
    for (var i = 0; i < this.Rows.length; i++) {
        coff.fillText(this.Rows[i], x, y);
        y += this.FontHeight + this.RowSpace;
    }
    
    /* ++++++++++ creating the image and saving ++++++++ */
    var url = off.toDataURL();
    this.Image = document.createElement("IMG");
    this.Image.crossOrigin = "";
    this.Image.src = url;

};

/**
 * sets the image to the offside of the bottom right corner so
 * that the image is able to "pop up" like a slice of bread in a toaster
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype._adjustPosition = function () {
    var can = this.Engine.Canvas;
    this.X = can.width * this.PositionQutient;
    this.Y = can.height;
};
/**
 * sets the state of the blocking feature
 * @param {boolean} blocking
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype.SetBlocking = function(blocking){
    this._isBlocking = blocking;
};
/**
 * sets the state of the overwritting feature
 * @param {boolean} ow
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype.SetOverwriting = function(ow){
    this._isOverwriting = ow;
};

/**
 * if the overwriting feature is active, it
 * checks if another instance of Toaster is currently open 
 * and closes it if there is
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype.CloseCurrentInstance = function(){
    if(this._isOverwriting && Anibody.ui.Toaster.CurrentInstance !== null){
        Anibody.ui.Toaster.CurrentInstance.Close();
    }
};

/**
 * transformes the text into an image
 * @returns {undefined}
 */
Anibody.ui.Toaster.prototype._getBackgroundImage = function(){
    
    var can = document.createElement("CANVAS");
    can.width = this.Width + 2*this._blur;
    can.height = this.Height + this._blur;
    var c = can.getContext("2d");
    
    c.lineWidth = this._blur;
    c.filter = "blur("+(this._blur/2)+"px)";    
    
    c.strokeStyle = getRGBA(this.BackgroundColor, 0.6);
    
    c.strokeRect(this._blur,this._blur, can.width-this._blur*2, can.height);
                
    var url = can.toDataURL();
    this.BackgroundImage = document.createElement("IMG");
    this.BackgroundImage.src = url;

};
/**
 * collection of the available types
 * @type Object
 */
Anibody.ui.Toaster.prototype.Types = {
    Default : "default",
    Warning : "warning",
    Error : "error",
    Success : "success"
};