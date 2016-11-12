/**
 * @description Displays a button
 * @param {type} x
 * @param {type} y
 * @param {type} width
 * @param {type} height
 * @param {type} tco callback-object, which will be triggered when user clicks the button
 * @returns {Button}
 */
function Button(x, y, width, height, tco) {
    ABO.call(this);

    this.Type = "Button";
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;

    this.OldState = -1;
    this.State = 0; // 0 - not clicked, 1 - is about to click, 2 - clicked
    
    this.CoolDown = 1000; // number of milliseconds until it is ready to be clicked
    this.GonnaRefresh = true; // flag, if button is going to be pushable again
    
    // a callback-object ( {function:f, that: objWillBeThis, parameter: obj};
    this.TriggerCallbackObject = tco;
    this.MouseOver = false; // boolean
    
    //**********************************
    //    Appearance
    //**********************************
    this.Label = ["", "", ""];
    this.LabelWidth = [0, 0, 0];
    this.FontHeight = [14, 14, 14];
    this.FontType = ["sans-serif", "sans-serif", "sans-serif"];
    // how the box depending on the state is displayed
    this.BoxDisplay = ["color", "color", "color"]; // string-array: "image" or "color"
    // if image then codenames
    // if color then css color codes
    this.BoxCode = ["#999", "#666", "#333"];
    
    this.SpriteLoaded = false;
    this.Images = [];
    // the cursor, when the mouse is on the box and depending on state
    //this.CSSMouseCursor = ["pointer", "default", "wait"];
    this.CSSMouseCursor = ["pointer", "default", "wait"];

    this.TextColor = ["black", "white", "grey"];

    this.Initialize();
}

Button.prototype = Object.create(ABO.prototype);
Button.prototype.constructor = Button;

Button.prototype.Initialize = function () {

    // check if X = "center" - then calculate X so that the Center.X is the real center
    if (this.X == "center") {
        if (!this.Engine.Terrain.Type)
            this.X = (this.Engine.Canvas.width / 2) - (this.Width / 2);
        else
            this.X = (this.Engine.Terrain.Width / 2) - (this.Width / 2);
    }
    // same for Y
    if (this.Y == "center") {
        if (!this.Engine.Terrain.Type)
            this.Y = (this.Engine.Canvas.height / 2) - (this.Height / 2);
        else
            this.Y = (this.Engine.Terrain.Height / 2) - (this.Height / 2);
    }

    this.Center = {X: this.X + this.Width / 2, Y: this.Y + this.Height / 2};
    this.GetLabelWidth(0);
};

Button.prototype.Update = function () {

    var m = this.Engine.Input.Mouse;
    var p = m.Position.Camera;
    
    // is the mouse cursor hovering over the button
    this.MouseOver = this.isPointInObject(p);

    // clicking (mousedown) hovering over the button
    if (m.Left.Down && this.MouseOver && this.State == 0) {
        this.State = 1;
    }
    // releasing the click while over the button
    // same as a click on the Button -> Trigger() will be called
    if (m.Left.Up && this.MouseOver && this.State == 1) {
        this.Trigger();
    }
    
    // changing the mouse cursor regarding the state of the button
    if (this.MouseOver)
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
    // because the Text can change
    if (this.State != this.OldState)
        this.GetLabelWidth();
    this.OldState = this.State;
};

Button.prototype.Draw = function (c) {

    c.save();

    var cam = this.Engine.Camera.SelectedCamera;
    
    // what was chosen? true: drawing a colored box
    // false: image
    if (this.BoxDisplay[this.State] == "color") {

        c.fillStyle = this.BoxCode[this.State];
        c.fillRect(this.X - cam.X, this.Y - cam.Y, this.Width, this.Height);

    } else {
        var img;        
        img = this.Images[this.State];
        c.drawImage(img, this.X - cam.X, this.Y - cam.Y, this.Width, this.Height);

    }

    c.textBaseline = "middle";
    c.textAlign = "center";

    c.font = this.FontHeight[this.State] + "px " + this.FontType[this.State];

    var txtx = (this.X + this.Width / 2) - cam.X;
    var txty = (this.Y + this.Height / 2) - cam.Y;
    c.fillStyle = this.TextColor[this.State];
    c.fillText(this.Label[this.State], txtx, txty);

    c.restore();
};

Button.prototype.SetCoolDown = function (cd) {
    this.CoolDown = cd;
};

Button.prototype.Trigger = function () {
    var tco;
    if (this.State == 1 && this.TriggerCallbackObject) {
        tco = this.TriggerCallbackObject;
        tco.function.call(tco.that, tco.parameter, this);
        this.State = 2;
        
        if (this.GonnaRefresh && this.CoolDown >= 0)
            setTimeout(function () {
                arguments[0].State = 0;
            }, this.CoolDown, this);

    }
};

/**
 * @description Method calculates the LabelWidth, which is important later during drawing
 * @returns {undefined}
 */
Button.prototype.GetLabelWidth = function (state) {

    state = arguments.length <= 0 ? this.State : state;

    var c = this.Engine.Context;
    c.save();
    c.textBaseline = "middle";
    c.font = this.FontHeight[state] + "px " + this.FontType[state];
    this.LabelWidth[state] = c.measureText(this.Label[state]).width;
    c.restore();

};

Button.prototype.isPointInObject = function (p) {
    return (this.X <= p.X && p.X <= this.X+this.Width && this.Y <= p.Y && p.Y <= this.Y + this.Height);
};

Button.prototype.SetTriggerCallbackObject = function (tco) {
    this.TriggerCallbackObject = tco;
};

/**
 * @description Returns the current appearance (Mask) of the button.
 * @returns {Object}
 */
Button.prototype.GetMask = function () {
    // { DisplayType: "string", Code: "string", Label: "string", Cursor: "string", TextColor: "string", FontHeight: Number, FontType: "string" }
    return {
        State0: {DisplayType: this.BoxDisplay[0], Code: this.BoxCode[0], Label: this.Label[0], Cursor: this.CSSMouseCursor[0], TextColor: this.TextColor[0], FontHeight: this.FontHeight[0], FontType: this.FontType[0]},
        State1: {DisplayType: this.BoxDisplay[1], Code: this.BoxCode[1], Label: this.Label[1], Cursor: this.CSSMouseCursor[1], TextColor: this.TextColor[1], FontHeight: this.FontHeight[1], FontType: this.FontType[1]},
        State2: {DisplayType: this.BoxDisplay[2], Code: this.BoxCode[2], Label: this.Label[2], Cursor: this.CSSMouseCursor[2], TextColor: this.TextColor[2], FontHeight: this.FontHeight[2], FontType: this.FontType[2]}
    };

};

/**
 * @description The button takes on the appearance, descriped in the mask object
 * @param {Object} m Mask Object
 * @returns {undefined}
 */
Button.prototype.SetMask = function (m) {
    this.SetAppearance(m.State0, m.State1, m.State2);
};
/**
 * @description Changes the appearance - should only be called from SetMask()
 * @param {Object} s0
 * @param {Object} s1
 * @param {Object} s2
 * @returns {undefined}
 */
Button.prototype.SetAppearance = function (s0, s1, s2) {

    // optimales Objekt
    // { DisplayType: "string", Code: "string", Label: "string", Cursor: "string", TextColor: "string", FontHeight: Number, FontType: "string" };

    /* state 0 */
    if (s0.DisplayType && s0.DisplayType == "image")
        this.BoxDisplay[0] = "image";
    else
        this.BoxDisplay[0] = "color";

    if (s0.Code){
        this.BoxCode[0] = s0.Code;
        // saving the image to the Button instance so that it does not have to be searched in every draw step
        if(this.BoxDisplay[0] == "image")
            this.Images[0] = this.Engine.MediaManager.GetImage(this.BoxCode[0]);
    }
    if (s0.Label)
        this.Label[0] = s0.Label;
    if (s0.Cursor)
        this.CSSMouseCursor[0] = s0.Cursor;
    if (s0.TextColor)
        this.TextColor[0] = s0.TextColor;
    if (s0.FontHeight)
        this.FontHeight[0] = s0.FontHeight;
    if (s0.FontType)
        this.FontType[0] = s0.FontType;

    /* state 1 */
    if (s1.DisplayType && s1.DisplayType == "image")
        this.BoxDisplay[1] = "image";
    else
        this.BoxDisplay[1] = "color";

    if (s1.Code){
        this.BoxCode[1] = s1.Code;
        // saving the image to the Button instance so that it does not have to be searched in every draw step
        if(this.BoxDisplay[1] == "image")
            this.Images[1] = this.Engine.MediaManager.GetImage(this.BoxCode[1]);
    }
    
    
    
    if (s1.Label)
        this.Label[1] = s1.Label;
    if (s1.Cursor)
        this.CSSMouseCursor[1] = s1.Cursor;
    if (s1.TextColor)
        this.TextColor[1] = s1.TextColor;
    if (s1.FontHeight)
        this.FontHeight[1] = s1.FontHeight;
    if (s1.FontType)
        this.FontType[1] = s1.FontType;

    /* state 2 */
    if (s2.DisplayType && s2.DisplayType == "image")
        this.BoxDisplay[2] = "image";
    else
        this.BoxDisplay[2] = "color";

    if (s2.Code){
        this.BoxCode[2] = s2.Code;
        // saving the image to the Button instance so that it does not have to be searched in every draw step
        if(this.BoxDisplay[2] == "image")
            this.Images[2] = this.Engine.MediaManager.GetImage(this.BoxCode[2]);
    }
    if (s2.Label)
        this.Label[2] = s2.Label;
    if (s2.Cursor)
        this.CSSMouseCursor[2] = s2.Cursor;
    if (s2.TextColor)
        this.TextColor[2] = s2.TextColor;
    if (s2.FontHeight)
        this.FontHeight[2] = s2.FontHeight;
    if (s2.FontType)
        this.FontType[2] = s2.FontType;

};

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
    //var imgData = img.getImageData();
    
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
    
    this.BoxDisplay = ["image", "image", "image"];
    this.SpriteLoaded = true;
};