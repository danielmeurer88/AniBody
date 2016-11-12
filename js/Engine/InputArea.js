
function InputArea(x, y, width) {

    ABO.call(this);

    this.X = x;
    this.Y = y;
    this.Width = width;
    this.VariableWidth = false; // if true than Width is MinWidth
    this.Height = 0;

    this.Selected = false;

    this.TextHeight = 24;
    this.Font = this.TextHeight + "px sans-serif";

    this.BindKey = "";
    this.Bound = false;

    this.Text = "";
    this.MarkedText = "";

    this.padding = Math.ceil(this.TextHeight / 6);
    this.shading = Math.ceil(this.padding / 2);

    this.MouseOver = false;
    this.State = 0;
    this.OldState = -1;

    // [0] = unselected, [1] = selected
    this.FillStyle = ["#ddd", "#dff"];

    // Cursor
    this.CSSMouseCursor = [
        "pointer",
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

this.Initialize();
}

InputArea.prototype = Object.create(ABO.prototype);
InputArea.prototype.constructor = InputArea;

InputArea.prototype.Initialize = function () {
    this.Height = 2 * this.padding + this.TextHeight;

    // creating an interval function to ensure the blinking of the cursor
    this.Engine.Counter.AddCounterFunction({
        parameter: this,
        function: function (ob) {
            ob.CursorVisible = !ob.CursorVisible;
        },
        every: 12
    });
    
    // register a keydown handler to fetch key strokes directly
    $(document).on("keydown", {object: this}, function (e) {
        var that = e.data.object;
        if (that.Selected) {
            if (e.key /* Firefox*/)
                that.AddLetter(e.key);
            else
                //that.AddLetter( String.fromCharCode( e.charCode ));
                that.AddLetter(String.getKeyByEvent(e));
            if (e.which == 8) { // 8 = backspace
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    });
};

InputArea.prototype.Update = function () {

    // Touch Alternative
//    if(this.Engine.IsTouchDevice && this.Selected)
//        this.ShowMobileAlternative();
//    else
//        this.HideMobileAlternative();

    var m = this.Engine.Input.Mouse;
    var p = m.Position.Camera;
    var k = this.Engine.Input.Key;

    this.MouseOver = this.isPointInObject(p);

    if (m.Left.FramesUp == 1 && this.MouseOver) {
        this.Selected = true;
        if(this.Engine.IsTouchDevice){
            var text = window.prompt("Your input:", this.Text);
            this.Text = text;
            this.Selected = false;
        }
    }

    if (k.Esc.FramesPressed == 1)
        this.Selected = false;

    if (this.Selected && k.Left.FramesPressed == 1 || this.Selected && k.Left.FramesPressed > 10 && k.Left.FramesPressed % 3 == 0)
        if (this.CursorPos > 0) {
            this.CursorPos--;
            this.CursorPosChanged = true;
        }

    if (this.Selected && k.Right.FramesPressed == 1 || this.Selected && k.Right.FramesPressed > 10 && k.Right.FramesPressed % 3 == 0)
        if (this.CursorPos < this.Text.length) {
            this.CursorPos++;
            this.CursorPosChanged = true;
        }

    if (this.MouseOver && this.Selected && m.Left.FramesDown == 1)
        //this.ChangeCursorPosAccordingTo(m.Position.Relative); // parameter 1 = Terrains 0/0 - Point
        this.ChangeCursorPosAccordingTo(m.Position);

    if (this.MouseOver)
        switch (this.State) {
            case 0 :
                {
                    this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursor[this.State]);
                }
                ;
                break;
            case 1 :
                {
                    this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursor[this.State]);
                }
                ;
                break;
            case 2 :
                {
                    this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursor[this.State]);
                }
                ;
                break;
        }



    if (k.Backspace.FramesPressed == 1 || k.Backspace.FramesPressed > 10 && k.Backspace.FramesPressed % 3 == 0) {
        this.RemoveLetter();
    }

    // marked text = letter that will be deleted if backspace is pressed
    if (this.Selected)
        this.CheckText();
};

InputArea.prototype.Draw = function (c) {

    c.save();

    var cam = this.Engine.Camera.SelectedCamera;

    // Begin - background rectangle
    c.fillStyle = (this.Selected) ? this.FillStyle[1] : this.FillStyle[0];
    
    // using rect() and fill() instead of fillRect() because the latter destroys the path, which we use to clip later.
    c.rect(this.X - cam.X, this.Y - cam.Y, this.Width, this.Height);
    c.fill();
    // End - background rectangle
    
    // clipping the path, which we build with rect()
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
    // End - grey box shades



    // Begin - the writing cursor
    if (this.Selected && this.CursorVisible) {
        this.CursorWidth = c.measureText(this.Text.substr(0, this.CursorPos)).width;
        c.beginPath();
        // no need to subtract the cam.X from the x-coords because "txtx" already took care of that
        c.moveTo(txtx + this.CursorWidth, this.Y + this.padding - cam.Y);
        c.lineTo(txtx + this.CursorWidth, this.Y + this.padding + this.TextHeight - cam.Y);
        c.closePath();
        c.strokeStyle = "black";
        c.stroke();
    }
    // End - the writing cursor

    c.restore();

};

InputArea.prototype.BindToStorageEntry = function (key) {
    if (key != "") {
        var txt = this.Engine.Storage.ReadFromStorage(key);
        if (txt.code) {
            txt = this.Engine.Storage.WriteToStorage(key, "");
        }
        this.Bound = true;
        this.BindKey = key;
        this.Text = txt;
    }
}

InputArea.prototype.isPointInObject = function (p) {
    return (this.X <= p.X && p.X <= this.X+this.Width && this.Y <= p.Y && p.Y <= this.Y + this.Height);
};

InputArea.prototype.ChangeCursorPosAccordingTo = function (mpos) { // tmpos is the current mouse position relatively to zero point of the terrain!!!

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
* @description Adds a single letter to the Text attribute of the InputArea where the cursor is
 * @param {String} add
 * @returns {undefined} */
InputArea.prototype.AddLetter = function (add) {
    if (!add || add.length > 1)
        return;

    this.Text = this.Text.substr(0, this.CursorPos) + add + this.Text.substr(++this.CursorPos - 1);
    if(this.Bound)
        this.Engine.Storage.WriteToStorage(this.BindKey, this.Text);
};
/**
* @description Remove one letter from the Text where the cursor is
 * @returns {undefined} */
InputArea.prototype.RemoveLetter = function () {
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
InputArea.prototype.CheckText = function () {
    if (this.CursorWidth - this.off >= this.cmax)
        this.off += this.step;

    if (this.CursorWidth - this.off <= this.cmin)
        this.off -= this.step;

    if (this.off < 0)
        this.off = 0;
};

InputArea.prototype.ShowMobileAlternative = function(){
    
//    if(!this.AlternativeActive){
//        var input = document.createElement("input");
//        input.setAttribute("id", "InputAlternative"+this.UniqueID);
//        $("body").append(input);
//        this.AlternativeActive = true;
//    }
//    
//    
//    $(input).css({
//        "position" : "absolute",
//        "left" : this.X + this.Engine.Input.Canvas.X + "px",
//        "top" : this.Y + this.Engine.Input.Canvas.X + "px",
//        "width" : this.Width,
//        "font-size" : this.TextHeight + "px",
//        "z-display" : "999",
//        "display" : "auto"
//    });
    
};

InputArea.prototype.HideMobileAlternative = function(){
    
//    $("#InputAlternative"+this.UniqueID).css({
//        "position" : "absolute",
//        "left" : this.X + this.Engine.Input.Canvas.X + "px",
//        "top" : this.Y + this.Engine.Input.Canvas.X + "px",
//        "width" : this.Width,
//        "font-size" : this.TextHeight + "px",
//        "z-display" : "999",
//        "display" : "none"
//    });
};