/**
 * Presents a dialog box to the user, in which the user can confirms their decision of a given text
 * @param {string/string array} text
 * @param {callback-object} cbo - a callback-object, which contents a function that will triggered if the user confirms the given text
 * @returns {Confirm}
 */
Anibody.ui.Confirm = function Confirm(text, cbo) {
    Anibody.classes.ABO.call(this);

    // the quotient, which will be multiplied with the canvas width to calculate the width of the alert box
    this.ContentWidthQuotient = 0.6;

    this.Text = text;
    this.ImageText = false;
    this.Rows = [];
    this.RowLengths = [];

    this.ConfirmCallback = cbo;

    this.Rounding = Anibody.ui.Confirm.prototype.DefaultRounding;
    this.FontHeight = Anibody.ui.Confirm.prototype.DefaultFontHeight;
    this.BoxPadding = Anibody.ui.Confirm.prototype.DefaultBoxPadding;
    this.RowSpace = Anibody.ui.Confirm.prototype.DefaultRowSpace;
    this.FontPadding = this.BoxPadding;

    // the whole confirm dialog box
    this.ContentBox = {};

    this.YesBox = {
        x: 0,
        y: 0,
        width: 60,
        height: 40
    };

    this.NoBox = {
        x: 0,
        y: 0,
        width: 60,
        height: 40
    };

    this.IsMouseOverYes = false;
    this.IsMouseOverNo = false;
    this.IsMouseOverContent = false;
    this.IsMouseOverBackground = false;

    this.Opacity = 0;

    this._ref_ip = null;
    this._ref_draw = null;
    this._ref_upd = null;
    this._ref_mhan = null;

    this.Initialize();
}
Anibody.ui.Confirm.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.ui.Confirm.prototype.constructor = Anibody.ui.Confirm;

Anibody.ui.Confirm.prototype.ContentBoxColor = "#999";
Anibody.ui.Confirm.prototype.BoxBorderColor = "black";
Anibody.ui.Confirm.prototype.BoxColor = "#ccc";
Anibody.ui.Confirm.prototype.BoxFontColor = "#fff";
Anibody.ui.Confirm.prototype.OutsideColor = "rgba(0,0,0,0.8)";
Anibody.ui.Confirm.prototype.DefaultRounding = 10;
Anibody.ui.Confirm.prototype.DefaultFontHeight = 18;
Anibody.ui.Confirm.prototype.DefaultBoxPadding = 5;
Anibody.ui.Confirm.prototype.DefaultRowSpace = 4;

/**
 * @see README_DOKU.txt
 */
Anibody.ui.Confirm.prototype.Initialize = function () {

    this._createTextImage();

    this._recalculateSizes();

};

/**
 * The length of the text will be calculated and if it is longer than than the expected width
 * of the alert box, it will be cut into rows. Later the so processed text will be
 * transformed into an image. 
 * @returns {undefined}
 */
Anibody.ui.Confirm.prototype._createTextImage = function () {

    // creating an offscreen canvas with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = this.Engine.Canvas.width * this.ContentWidthQuotient;
    off.height = 300;
    var c = off.getContext("2d");

    c.font = this.Engine.Context.font;
    c.setFontHeight(this.FontHeight);

    var allwords = [];
    if (typeof this.Text === "string")
        var texts = [this.Text];
    else
        var texts = this.Text;

    var temp;
    // loops through all elements of the string array
    for (var i = 0; i < texts.length; i++) {
        // splits them into single elements (words)
        temp = texts[i].split(" ");
        // and loops through them
        for (var j = 0; j < temp.length; j++) {
            allwords.push(temp[j]);
        }
        // at the end of every string element of the array will be a "\n"
        // * if it is not the last element of the array
        if (i < texts.length - 1) {
            allwords.push("\\n");
        }
    }

    var spacelen = c.measureText(" ").width; // measures the length of the " "-symbol
    var alllengths = [];

    for (var i = 0; i < allwords.length; i++) {
        if (allwords[i] !== "\\n")
            alllengths.push(c.measureText(allwords[i]).width);
        else
            alllengths.push(0);
    }

    var rows = [];
    var rowlengths = [];
    rows.push("");
    rowlengths.push(0);

    for (var i = 0; i < allwords.length; i++) {

        if (allwords[i] === "\\n") {
            i++;
            rows.push(allwords[i] + " ");
            rowlengths.push(0 + alllengths[i] + spacelen);
        } else {
            // true if the current word won't exceed the width+padding of the box
            if (rowlengths[rows.length - 1] + alllengths[i] + spacelen < off.width - 2 * this.FontPadding) {
                // adds the word + " " to the current row
                rows[rows.length - 1] += allwords[i] + " ";
                rowlengths[rows.length - 1] += alllengths[i] + spacelen;
            } else {
                // removes the last " "-symbol of the current row
                rows[rows.length - 1] = rows[rows.length - 1].substr(0, rows[rows.length - 1].length - 1);
                rowlengths[rows.length - 1] -= spacelen;
                // begins a new row and adds the current word + " " to it
                rows.push(allwords[i] + " ");
                rowlengths.push(alllengths[i] + spacelen);
            }
        }
    }
    // removes the last " "-symbol of the last row
    rows[rows.length - 1] = rows[rows.length - 1].substr(0, rows[rows.length - 1].length - 1);
    // now that we know how many rows there are, we can calculate the height

    this.Rows = rows;
    this.RowLengths = rowlengths;

    // finding the maximum length among the rows...
    var maxw = 0;
    for (var i = 0; i < rows.length; i++) {
        if (rowlengths[i] > maxw)
            maxw = rowlengths[i];
    }
    // and resize the width

    var box = {
        x: this.BoxPadding,
        y: this.BoxPadding,
        width: maxw + 2 * this.BoxPadding,
        height: this.Rows.length * this.FontHeight + (this.Rows.length - 1) * this.RowSpace + 2 * this.FontPadding,
        type: "rect"
    };

    // creating an offscreen canvas AGAIN with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = box.width;
    off.height = box.height;
    var c = off.getContext("2d");
    c.setFontHeight(this.FontHeight);
    c.textAlign = "left";
    c.textBaseline = "top";

    for (var i = 0; i < this.Rows.length; i++) {
        c.fillText(this.Rows[i], box.x, box.y + this.FontHeight * i + this.RowSpace * i);
    }
    this.ImageText = document.createElement("IMG");
    this.ImageText.width = off.width;
    this.ImageText.height = box.height;
    this.ImageText.src = off.toDataURL();

};

/**
 * recalculate the necessary size of the Confirm.
 * @returns {undefined}
 */
Anibody.ui.Confirm.prototype._recalculateSizes = function () {

    var margin = this.BoxPadding;
    var can = this.Engine.Canvas;

    this.Width = can.width;
    this.Height = can.height;

    this.ContentBox.width = this.ImageText.width;
    this.ContentBox.height = this.ImageText.height + this.YesBox.height + 2 * margin;

    this.ContentBox.x = can.width / 2 - this.ContentBox.width / 2;
    this.ContentBox.y = can.height / 2 - this.ContentBox.height / 2;

    // 
    this.YesBox.x = this.ContentBox.x + (this.ContentBox.width / 3) - this.YesBox.width / 2;
    this.YesBox.y = this.ContentBox.y + this.ContentBox.height - this.YesBox.height - margin;

    this.NoBox.x = this.ContentBox.x + (this.ContentBox.width * 2 / 3) - this.NoBox.width / 2;
    this.NoBox.y = this.ContentBox.y + this.ContentBox.height - this.NoBox.height - margin;
};
/**
 * creates a foreground draw function object, that is ready to be registered
 * @returns {object}
 */
Anibody.ui.Confirm.prototype._createForegroundDrawFunctionObject = function () {

    var f = function (c) {
        c.save();

        c.globalAlpha = this.Opacity;
        c.fillStyle = this.OutsideColor;
        c.fillRect(0, 0, c.canvas.width, c.canvas.height);


        var box = this.ContentBox;
        c.beginPath();
        c.variousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding);
        c.clip();

        c.fillStyle = this.ContentBoxColor;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, 0);

        // drawing text
        c.drawImage(this.ImageText, this.ContentBox.x, this.ContentBox.y);

        c.restore();
        c.save();


        // Ja
        var box = this.YesBox;
        c.setFontHeight(box.height * 0.5);

        c.fillStyle = this.BoxColor;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding / 3 * 2);
        c.fillStyle = this.BoxFontColor;
        c.fillSpinnedText(box.x + box.width / 2, box.y + box.height / 2, "Ja", 0);
        // nein
        var box = this.NoBox;
        c.fillStyle = this.BoxColor;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding / 3 * 2);
        c.fillStyle = this.BoxFontColor;
        c.fillSpinnedText(box.x + box.width / 2, box.y + box.height / 2, "Nein", 0);

        c.restore();

        c.save();
        c.strokeStyle = this.BoxBorderColor;
        c.lineWidth = 5;

        var box = this.ContentBox;
        c.strokeVariousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding);
        c.restore();

    };

    return {that: this, function: f, parameter: this.Engine.Context};
};
/**
 * creates a process input function object, that is ready to be registered
 * @returns {object}
 */
Anibody.ui.Confirm.prototype._createProcessInputFunctionObject = function () {

    var f = function (en) {

        var box = this.ContentBox;

        var area = {
            function: function (c) {
                // creating a negative winding rectangle path that equals to -1
                c.moveTo(0, 0);
                c.lineTo(0, c.canvas.height);
                c.lineTo(c.canvas.width, c.canvas.height);
                c.lineTo(c.canvas.width, 0);
                c.lineTo(0, 0);
                // now content box as positive
                c.rect(box.x, box.y, box.width, box.height);
            },
            type: "function"
        };

        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverBackground");

        var area = {
            x: box.x, y: box.y, width: box.width, height: box.height, rounding: 0,
            type: "rrect"
        };

        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverContent");

        box = this.YesBox;
        area = {
            x: box.x, y: box.y, width: box.width, height: box.height, rounding: 0,
            type: "rrect"
        };
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverYes");

        box = this.NoBox;
        area = {
            x: box.x, y: box.y, width: box.width, height: box.height, rounding: 0,
            type: "rrect"
        };
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverNo");

    };

    return {that: this, function: f, parameter: this.Engine};
};
/**
 * creates a update function object, that is ready to be registered
 * @returns {object}
 */
Anibody.ui.Confirm.prototype._createUpdateFunctionObject = function () {

    var f = function (en) {

        this._recalculateSizes();

        if (this.IsMouseOverYes || this.IsMouseOverNo)
            this.Engine.Input.Mouse.Cursor.Set("pointer");

    };

    return {that: this, function: f, parameter: this.Engine};
};
/**
 * creates a Mouse handler object, that is ready to be registered
 * @returns {object}
 */
Anibody.ui.Confirm.prototype._createMouseHandlerObject = function () {

    var f = function (e) {

        e.GoThrough = false;

        if (this.IsMouseOverYes) {
            this.Stop();
            Anibody.CallObject(this.ConfirmCallback)
        }
        if (this.IsMouseOverBackground || this.IsMouseOverNo) {
            this.Stop();
        }


    };

    return {that: this, function: f, parameter: this.Engine};
};

/**
 * Starts/Opens the Presenter dialog box
 * @returns {undefined}
 */
Anibody.ui.Confirm.prototype.Start = function () {
    this.Active = true;

    new Flow(this, "Opacity", 1, 600, {
        that: this, parameter: true, function: function (p) {}
    }).Start();

    var ipfo = this._createProcessInputFunctionObject();
    this._ref_ip = this.Engine.AddProcessInputFunctionObject(ipfo);

    var fdfo = this._createForegroundDrawFunctionObject();
    this._ref_draw = this.Engine.AddForegroundDrawFunctionObject(fdfo);

    var upd = this._createUpdateFunctionObject();
    this._ref_upd = this.Engine.AddUpdateFunctionObject(upd);

    var mhand = this._createMouseHandlerObject();
    this._ref_mhan = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", mhand);

};
/**
 * Stops the presenter dialog - will be called by the class
 * @returns {undefined}
 */
Anibody.ui.Confirm.prototype.Stop = function () {
    this.Active = false;

    this.Engine.RemoveForegroundDrawFunctionObject(this._ref_draw);
    this._ref_draw = null;
    this.Engine.RemoveUpdateFunctionObject(this._ref_upd);
    this._ref_upd = null;
    this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick", this._ref_mhan);
    this._ref_mhan = null;
    this.Engine.RemoveProcessInputFunctionObject(this._ref_ip);
    this._ref_ip = null;
};