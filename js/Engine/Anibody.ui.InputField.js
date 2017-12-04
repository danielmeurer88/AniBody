Anibody.SetPackage("Anibody", "ui");

/**
 * 
 * @param {type} x
 * @param {type} y
 * @param {type} width
 * @param {type} height
 * @param {type} padding
 * @returns {InputField}
 */
Anibody.ui.InputField = function InputField(x, y, width, height, padding) {

    Anibody.classes.ABO.call(this);

    this.Active = true;

    this.X = x;
    this.Y = y;
    this.Width = width;
    this.VariableWidth = false; // if true than Width is MinWidth
    
    this.Height = (typeof height !== "undefined" && height) ? height : 20;
    this.padding = (typeof padding !== "undefined" && padding) ? padding : 2;
    
    this.Selected = false;

    this.FontHeight = this.Height - 2*this.padding;
    this.Font = this.FontHeight + "px sans-serif";

    this.BindKey = "";
    this.Bound = false;

    this.Text = "";
    this.MarkedText = "";

    this.CharLimiter = function(char){ return true; };
    this.LimitationFailCallbackObject = {that:this, function(char, para){return;}, parameter:{}};
    
    this.shading = Math.ceil(this.padding / 2);

    this.IsMouseOver = false;
    this.State = 0;
    this.OldState = -1;

    // [0] = unselected, [1] = selected
    this.FillStyle = [Anibody.ui.InputField.prototype.DefaultUnselectedColor, Anibody.ui.InputField.prototype.DefaultSelectedColor];

    // Cursor
    this.CSSMouseCursor = [
        "text",
        "default",
        "wait"
    ];
    // the index of the text where the cursor should be
    this.CursorPos = this.Text.length;
    // signals that the cursor position has changed and new calculations has to be made
    this.CursorPosChanged = true;
    this.CursorWidth = 0;

    this.CursorVisible = true;

    this.off = 0;
    this.step = parseInt(this.Width / 20);
    this.cmin = 2 * this.step;
    this.cmax = this.Width - 2 * this.step;

    this.AlternativeActive = false;

    this._ref_keyd = null;
    this._ref_mhan = null;
    
this.Initialize();
}

Anibody.ui.InputField.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.ui.InputField.prototype.constructor = Anibody.ui.InputField;

Anibody.ui.InputField.prototype.DefaultUnselectedColor = "#eee";
Anibody.ui.InputField.prototype.DefaultSelectedColor = "#fff";

/**
 * can be seen as an extension of the constructor function
 * @returns {undefined}
 */
Anibody.ui.InputField.prototype.Initialize = function () {

    // creating an interval function to ensure the blinking of the cursor
    var ms = 800;
    var changef = function (that) {
        that.CursorVisible = !that.CursorVisible;
    };
    window.setInterval(changef, ms, this);
    
    var onkeydownfunc = function(e){
        var that = e.data.object;        
        if (that.Selected) {
            if (e.key /* event.key does not exist in all browsers*/)
                that.AddLetter(e.key);
            else
                that.AddLetter(String.getKeyByEvent(e));
            if (e.which == 8) { // 8 = backspace
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    };
    
    // register a keydown handler to fetch key strokes directly
    $(document).on("keydown", {object: this}, onkeydownfunc);
    
    if (window.top != window.self) {
        this.ParentKeyDownEvent = $(window.parent.document).on("keydown", {object: this},onkeydownfunc);
    }
};
/**
 * Update
 * @returns {undefined}
 */
Anibody.ui.InputField.prototype.Update = function () {

    var m = this.Engine.Input.Mouse;
    var k = this.Engine.Input.Keys;

    // left click on the input field
    if (m.Left.FramesUp == 1 && this.IsMouseOver) {
        this.Selected = true;
        if(this.Engine.IsTouchDevice){
            var text = window.prompt("Your input:", this.Text);
            this.Text = text;
            this.Selected = false;
        }
    }

    if (k.Esc.FramesPressed == 1)
        this.Selected = false;

    // pressing the left arrow on the keyboard -> causing the cursor position to decrease / move left
    if (this.Selected && k.Left.FramesPressed == 1 || this.Selected && k.Left.FramesPressed > 10 && k.Left.FramesPressed % 3 == 0)
        if (this.CursorPos > 0) {
            this.CursorPos--;
            this.CursorPosChanged = true;
        }
    
    // pressing the right arrow on the keyboard -> causing the cursor position to increase / move right
    if (this.Selected && k.Right.FramesPressed == 1 || this.Selected && k.Right.FramesPressed > 10 && k.Right.FramesPressed % 3 == 0)
        if (this.CursorPos < this.Text.length) {
            this.CursorPos++;
            this.CursorPosChanged = true;
        }

    // click on the input field when is is already selected -> causes that the cursor jumps behind the letter, on which the user clicked
    if (this.IsMouseOver && this.Selected && m.Left.FramesDown == 1)
        this.ChangeCursorPosAccordingTo(m.Position);

    // pressing backspace on the keyboard -> causing to remove the letter behind the cursor position
    if (k.Backspace.FramesPressed == 1 || k.Backspace.FramesPressed > 10 && k.Backspace.FramesPressed % 3 == 0) {
        this.RemoveLetter();
    }
    
    if (this.IsMouseOver)
        this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursor[this.State]);
    
    // marked text = letter that will be removed if backspace is pressed
    if (this.Selected)
        this._checkText();
};

/**
 * ProcessInput
 * @returns {undefined}
 */
Anibody.ui.InputField.prototype.ProcessInput = function () {
    this.Engine.Input.MouseHandler.AddHoverRequest(this.GetArea(0,0), this, "IsMouseOver");
};

/**
 * Draw
 * @param {2dCanvasContext} c
 * @returns {undefined}
 */
Anibody.ui.InputField.prototype.Draw = function (c) {

    c.save();
    
    var cam = this.Engine.Camera.SelectedCamera;

    // Begin - background rectangle
    c.fillStyle = (this.Selected) ? this.FillStyle[1] : this.FillStyle[0];
    
    // cancels out all open paths
    c.beginPath();
    // using rect() and fill() instead of fillRect() because the latter destroys the path, which we use to clip later.
    c.rect(this.X - cam.X, this.Y - cam.Y, this.Width, this.Height);
    c.fill();
    c.closePath();
    // End - background rectangle
    
    // clipping the path, which was build with rect()
    c.clip();
    c.globalCompositeOperation = "source-atop";

    // Begin - Text
    c.textBaseline = "middle";
    c.font = this.Font;
    // x,y where the text starts
    var txtx = (this.X + this.padding) - cam.X - this.off;
    var txty = (this.Y + this.Height / 2) - cam.Y;

    c.fillStyle = "black";
    c.fillText(this.Text, txtx, txty);
    // End - Text

    c.globalCompositeOperation = "source-over";

    // Begin - grey box shades
    c.beginPath();
    c.moveTo(this.X - cam.X, (this.Y+this.Height) - cam.Y);
    c.lineTo(this.X - cam.X, this.Y - cam.Y);
    c.lineTo((this.X+this.Width) - cam.X, this.Y - cam.Y);
    c.strokeStyle = this.shading + "px grey";
    c.stroke();
    c.closePath();
    // End - grey box shades



    // Begin - the writing cursor
    if (this.Selected && this.CursorVisible) {
        this.CursorWidth = c.measureText(this.Text.substr(0, this.CursorPos)).width;
        c.beginPath();
        // no need to subtract the cam.X from the x-coords because "txtx" already took care of that
        c.moveTo(txtx + this.CursorWidth, this.Y + this.padding - cam.Y);
        c.lineTo(txtx + this.CursorWidth, this.Y + this.padding + this.FontHeight - cam.Y);
        
        c.strokeStyle = "black";
        c.stroke();
        c.closePath();
    }
    // End - the writing cursor

    c.restore();

};

/**
 * @description needs further testing
 * @param {string} key
 * @returns {undefined}
 */
Anibody.ui.InputField.prototype.BindToStorageEntry = function (key) {
    if (typeof key === "string" && key.length > 0) {
        var txt = this.Engine.Storage.ReadFromStorage(key);
        if (txt.code) {
            txt = this.Engine.Storage.WriteToStorage(key, "");
        }
        this.Bound = true;
        this.BindKey = key;
        this.Text = txt;
    }
};

/**
 * whenever the user clicks on the already selected input field, cursor position can jump to
 * this position - this function handles the possibilties
 * @param {type} mpos
 * @returns {undefined}
 */
Anibody.ui.InputField.prototype.ChangeCursorPosAccordingTo = function (mpos) { // tmpos is the current mouse position relatively to zero point of the terrain!!!

    this.CursorPosChanged = true;

    var tpos = mpos.Camera; // camera position on the terrain

    // possibility 1: there is no text
    if (this.Text.length <= 0) {
        this.CursorPos = 0;
        return;
    }

    var clickx = tpos.X - (this.X + this.padding); // clickx = length between the beginning of the TextArea.Text and the x-coord of the mouse pos
    var c = document.createElement("CANVAS").getContext("2d");
    c.font = this.Font;
    var textWidth = c.measureText(this.Text).width - this.off;

    //possibility 2: the click was on the right side of the text => CursorPos needs to be at the end of the text
    if (clickx >= textWidth) {
        this.CursorPos = this.Text.length;
        return;
    }

    // possibility 3 : click was somewhere between
    var width = 0 - this.off;
    var i = 0;
    while (width < clickx && i < this.Text.length) {
        i++;
        width = c.measureText(this.Text.substr(0, i)).width - this.off;
    }
    this.CursorPos = i;


    if (this.CursorPos > 0)
        this.MarkedText = this.Text.substr(this.CursorPos - 1, 1);
    else
        this.MarkedText = "n/a";
};

/**
 * Sets the cursor to the end of the input
 * @returns {undefined}
 */
Anibody.ui.InputField.prototype.SetCursorPosToEnd = function () { 
    this.CursorPosChanged = true;
    this.CursorPos = this.Text.length;
};

/**
* @description Adds a single letter to the Text attribute of the InputField where the cursor is
 * @param {String} add
 * @returns {undefined} */
Anibody.ui.InputField.prototype.AddLetter = function (add) {
    if (!add || add.length > 1)
        return;
    
    if(!this.CharLimiter(add)){
        var lfc = this.LimitationFailCallbackObject;
        lfc.function.call(lfc.that, add, lfc.parameter);
        return;
    }
    
    this.Text = this.Text.substr(0, this.CursorPos) + add + this.Text.substr(++this.CursorPos - 1);
    if(this.Bound)
        this.Engine.Storage.WriteToStorage(this.BindKey, this.Text);
};
/**
* @description Remove one letter from the Text where the cursor is
 * @returns {undefined} */
Anibody.ui.InputField.prototype.RemoveLetter = function () {
    if (this.Text.length > 0) {
        var a, b;
        if (this.CursorPos > 0)
            a = this.Text.substr(0, this.CursorPos - 1);
        else
            a = "";
        b = this.Text.substr(this.CursorPos);
        this.Text = a + b;
        if (this.CursorPos > 0)
            this.CursorPos--;
    }
    if(this.Bound)
        this.Engine.Storage.WriteToStorage(this.BindKey, this.Text);

};
/**
* @description Calculates the off value regarding the current off value and the limits cmax, cmin
* @returns {undefined}
 */
Anibody.ui.InputField.prototype._checkText = function () {
    if (this.CursorWidth - this.off >= this.cmax)
        this.off += this.step;

    if (this.CursorWidth - this.off <= this.cmin)
        this.off -= this.step;

    if (this.off < 0)
        this.off = 0;
};
/**
 * Adds a limiter function, that returns if the character, typed by the user, is allowed or not
 * if the chartacter fails, the given callback can be triggered
 * @param {function} lim
 * @param {object} limFailCbo
 * @returns {undefined}
 */
Anibody.ui.InputField.prototype.AddCharLimiter = function (lim, limFailCbo) {
    
    if(typeof lim === "function"){
    
        this.CharLimiter = lim;
    
    }
    
    if(typeof limFailCbo !== "undefined"){
        
        this.LimitationFailCallbackObject = limFailCbo;
        
    }
    
};