
/**
 * Represents a Cartesian coordinate system
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} opt - objects, which contents ob key-value pairs, key=class attribute and their value
 * @returns {CoordinateSystem}
 */
Anibody.visual.CoordinateSystem = function CoordinateSystem(x, y, w, h, opt) {
    Anibody.classes.ABO.call(this);

    /* Standard Attributes */
    this.X = x;
    this.Y = y;
    this.Width = w;
    this.Height = h;
    this.Options = opt;

    /* Special Attributes */
    this.Nullpoint = {x: 20, y: this.Height - 20};
    this.Mouse = {x: 0, y: 0};
    this.SI = {x: 0, y: 0};
    this.IsMouseOver = false;

    this.OnClickCBO = {function: function () {}, parameter: {}, that: this};

    this.PixelPerScale = 15;
    
    // the limits are used so that the line length is shortened to a minimum what the user is able to see
    // hence saving processor power
    this._drawLimit = {
        Xpos: 500,
        Xneg: 500,
        Ypos: 500,
        Yneg: 500
    };
    // the limits are used so that the number of marks is shortened to a minimum what the user is able to see
    // hence saving processor power
    this._markLimit = {
        Xpos: 25,
        Xneg: 25,
        Ypos: 20,
        Yneg: 20
    };

    /* FLAGS */
    this._drawAxis = true;
    this._drawScaleMarks = true;
    this._drawScaleLines = true;

    /* Appearance of the border*/
    this.BorderColor = "#000000";
    this.BorderThickness = 1;

    /* Appearance of the marks*/
    this.ScaleMarkLength = [6, 12, 14]; // ["regular one", "5th", "10th"]
    this.ScaleMarkThickness = [1, 1.25, 1.5]; // ["regular one", "5th", "10th"]
    this.ScaleMarkColor = ["#666", "#444", "#222"]; // ["regular one", "5th", "10th"]

    /* Appearance of the helplines*/
    this.ScaleLineColor = "rgba(73,73,73,0.3)";

    this.OldFramesDown = 0;

    this.Initialize();
}
Anibody.visual.CoordinateSystem.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.CoordinateSystem.prototype.constructor = Anibody.visual.CoordinateSystem;
/**
 * @see README_DOKU.txt
 */
Anibody.visual.CoordinateSystem.prototype.Initialize = function () {

    this.AddMouseHandler();

    var opt = this.Options;
    // TODO: applaying options and test them
    if (opt != "undefined")
        for (var key in opt) {
            if (this[key] != "undefined")
                this[key] = opt[key];
        }
};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.CoordinateSystem.prototype.AddMouseHandler = function(){
    this._ref = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", {
        parameter: this.Engine,
        that: this,
        function: function (e, engine) {

            if (this.IsMouseOver) {
                e.Handled = true;
                var c = this.OnClickCBO;
                c.function.call(c.that, c.parameter);
            }
        }
    }, 10);
};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.CoordinateSystem.prototype.RemoveMouseHandler = function(){this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref);};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.CoordinateSystem.prototype.Draw = function (c) {

    c.save();
    // clear the canvas only where the CoordinateSystem will be drawn opon
    //c.clearRect(this.X, this.Y, this.Width, this.Height);

    // if the Border is set then it will be drawn
    if (this.BorderThickness > 0) {
        c.strokeStyle = this.BorderColor;
        c.lineWidth = this.BorderThickness;
        c.strokeRect(this.X, this.Y, this.Width, this.Height);
    }

    this.Clip(c);

    // get the current nullpoint
    var curnp = {// current nullpoint
        x: this.X + this.Nullpoint.x,
        y: this.Y + this.Nullpoint.y
    };

    if (this._drawAxis) {
        // drawing the ordinate (y-axis)
        c.beginPath();
        c.moveTo(curnp.x, curnp.y - this._drawLimit.Ypos);
        c.lineTo(curnp.x, curnp.y + this._drawLimit.Yneg);
        c.stroke();
        c.closePath();

        // drawing the abscissa (x-axis)
        c.beginPath();
        c.moveTo(curnp.x - this._drawLimit.Xneg, curnp.y);
        c.lineTo(curnp.x + this._drawLimit.Xpos, curnp.y);
        c.stroke();
        c.closePath();
    }

    if (this._drawScaleMarks) {
        var linestart;
        var marknr;

        // *******************************************************
        // drawing the Scale marks of positive abscissa
        // *******************************************************
        for (var i = 1; i <= this._markLimit.Xpos; i++) {

            marknr = 0;
            if (i % 5 == 0) {
                marknr = 1;
                if (i % 10 == 0)
                    marknr = 2;
            }

            c.lineWidth = this.ScaleMarkThickness[marknr];
            c.strokeStyle = this.ScaleMarkColor[marknr];


            linestart = curnp.x + (i * this.PixelPerScale);
            c.beginPath();
            c.moveTo(linestart, curnp.y);
            c.lineTo(linestart, curnp.y - this.ScaleMarkLength[marknr]);
            c.stroke();
            c.closePath();

        }
        // *******************************************************
        // drawing the Scale marks of the negative abscissa
        // *******************************************************
        for (var i = 1; i <= this._markLimit.Xneg; i++) {

            marknr = 0;
            if (i % 5 == 0) {
                marknr = 1;
                if (i % 10 == 0)
                    marknr = 2;
            }

            c.lineWidth = this.ScaleMarkThickness[marknr];
            c.strokeStyle = this.ScaleMarkColor[marknr];

            linestart = curnp.x - (i * this.PixelPerScale);
            c.beginPath();
            c.moveTo(linestart, curnp.y);
            c.lineTo(linestart, curnp.y - this.ScaleMarkLength[marknr]);
            c.stroke();
            c.closePath();

        }
        // *******************************************************
        // drawing the Scale lines of the positive ordinate
        // *******************************************************
        for (var i = 1; i <= this._markLimit.Ypos; i++) {

            marknr = 0;
            if (i % 5 == 0) {
                marknr = 1;
                if (i % 10 == 0)
                    marknr = 2;
            }

            c.lineWidth = this.ScaleMarkThickness[marknr];
            c.strokeStyle = this.ScaleMarkColor[marknr];


            linestart = curnp.y - (i * this.PixelPerScale);
            c.beginPath();
            c.moveTo(curnp.x, linestart);
            c.lineTo(curnp.x + this.ScaleMarkLength[marknr], linestart);
            c.stroke();
            c.closePath();

        }
        // *******************************************************
        // drawing the Scale lines of the negative ordinate
        // *******************************************************
        for (var i = 1; i <= this._markLimit.Yneg; i++) {

            marknr = 0;
            if (i % 5 == 0) {
                marknr = 1;
                if (i % 10 == 0)
                    marknr = 2;
            }

            c.lineWidth = this.ScaleMarkThickness[marknr];
            c.strokeStyle = this.ScaleMarkColor[marknr];


            linestart = curnp.y + (i * this.PixelPerScale);
            c.beginPath();
            c.moveTo(curnp.x, linestart);
            c.lineTo(curnp.x + this.ScaleMarkLength[marknr], linestart);
            c.stroke();
            c.closePath();
        }
    }

    if (this._drawScaleLines) {
        var linestart;
        var marknr;
        var istart = (this._drawAxis) ? 1 : 0;
        
        
        // *******************************************************
        // the vertical Scale lines from the nullpoint of the abscissa (x-axis) to the right border
        // *******************************************************
        for (var i = istart; i <= this._markLimit.Xpos; i++) {


            linestart = curnp.x + (i * this.PixelPerScale);
            c.lineWidth = 1;
            c.strokeStyle = this.ScaleLineColor;

            c.beginPath();
            c.moveTo(linestart, curnp.y - this._drawLimit.Ypos);
            c.lineTo(linestart, curnp.y + this._drawLimit.Yneg);
            c.stroke();
            c.closePath();

        }
        // *******************************************************
        // the vertical Scale lines from the nullpoint of the abscissa (x-axis) to the left border
        // *******************************************************
        for (var i = 1; i <= this._markLimit.Xneg; i++) {

            c.lineWidth = 1;
            c.strokeStyle = this.ScaleLineColor;

            linestart = curnp.x - (i * this.PixelPerScale);
            c.beginPath();
            c.moveTo(linestart, curnp.y - this._drawLimit.Ypos);
            c.lineTo(linestart, curnp.y + this._drawLimit.Yneg);
            c.stroke();
            c.closePath();
        }
        // *******************************************************
        // the horizontal Scale lines from the nullpoint of the ordinate (y-axis) to the top border
        // *******************************************************
        for (var i = istart; i <= this._markLimit.Ypos; i++) {


            c.lineWidth = 1;
            c.strokeStyle = this.ScaleLineColor;

            linestart = curnp.y - (i * this.PixelPerScale);
            c.beginPath();
            c.moveTo(curnp.x - this._drawLimit.Xneg, linestart);
            c.lineTo(curnp.x + this._drawLimit.Xpos, linestart);
            c.stroke();
            c.closePath();

        }
        // *******************************************************
        // the horizontal Scale lines from the nullpoint of the ordinate (y-axis) to the bottom border
        // *******************************************************
        for (var i = 1; i <= this._markLimit.Yneg; i++) {


            c.lineWidth = 1;
            c.strokeStyle = this.ScaleLineColor;

            linestart = curnp.y + (i * this.PixelPerScale);
            c.beginPath();
            c.moveTo(curnp.x - this._drawLimit.Xneg, linestart);
            c.lineTo(curnp.x + this._drawLimit.Xpos, linestart);
            c.stroke();
            c.closePath();
        }
    }

    c.restore();


};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.CoordinateSystem.prototype.Update = function () {

    var mpos = this.Engine.Input.Mouse.Position.Relative; // the Nullpoint for this position is the canvas not the absolute nullpoint of the document
    var np = this.Nullpoint;
    var ppmm = this.PixelPerScale;

    this.Mouse.x = mpos.X - (np.x + this.X);
    this.Mouse.y = (-1) * (mpos.Y - (np.y + this.Y));

    this.SI.x = (Math.round((this.Mouse.x / ppmm) * 100) / 100);
    this.SI.y = (Math.round((this.Mouse.y / ppmm) * 100) / 100);

};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.CoordinateSystem.prototype.ProcessInput = function () {

    var area = this.GetArea();
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOver");

};
/**
 * Moves the null point of the coordination system
 * @param {number} dx
 * @param {number} dy
 * @returns {undefined}
 */
Anibody.visual.CoordinateSystem.prototype.Move = function (dx, dy) {
    this.Nullpoint.x += dx;
    this.Nullpoint.y += dy;
    this.UpdateLimit();
};
/**
 * Moves the null point to the center of the coordination system
 * @returns {undefined}
 */
Anibody.visual.CoordinateSystem.prototype.Center = function () {
    this.Nullpoint = {
        x: this.Width / 2,
        y: this.Height / 2
    };
    this.UpdateLimit();
};
/**
 * Return current SI values as an object {x:x, y:y}
 * @returns {object}
 */
Anibody.visual.CoordinateSystem.prototype.GetSI = function () {
    return {x: this.SI.x, y: this.SI.y};
};
/**
 * Return current Mouse position in pixel
 * @returns {object}
 */
Anibody.visual.CoordinateSystem.prototype.GetCoords = function () {
    return {x: this.Mouse.x, y: this.Mouse.y};
};
/**
 * updates the limits according to the current null point position and the scale size
 * @returns {undefined}
 */
Anibody.visual.CoordinateSystem.prototype.UpdateLimit = function () {

    // 1-Dimensional distance, (one coordinate is the same in both points and does not need to be considered in the formular)
    var dis1D = function (v1, v2) {
        return Math.sqrt(Math.pow(v2 - v1, 2));
    };

    var ppmm = this.PixelPerScale;
    var np = this.Nullpoint;
    var xnegnp, xposnp, ynegnp, yposnp; // distance between the nullpoint (np) of the coordsystem and farest point (Pxpo) viewable on the respective line

    xnegnp = dis1D(this.X, this.X + np.x);
    var xneg = Math.floor(xnegnp / ppmm);

    yposnp = dis1D(this.Y, this.Y + np.y);
    var ypos = Math.floor(yposnp / ppmm);

    xposnp = dis1D(this.X + np.x, this.X + this.Width);
    var xpos = Math.floor(xposnp / ppmm);

    ynegnp = dis1D(this.Y + np.y, this.Y + this.Height);
    var yneg = Math.floor(ynegnp / ppmm);

    this._drawLimit = {
        Xpos: xposnp,
        Xneg: xnegnp,
        Ypos: yposnp,
        Yneg: ynegnp
    };

    this._markLimit = {
        Xpos: xpos,
        Xneg: xneg,
        Ypos: ypos,
        Yneg: yneg
    };

};
/**
 * clips the borders. Used in Draw()
 * @param {type} c
 * @returns {undefined}
 */
Anibody.visual.CoordinateSystem.prototype.Clip = function (c) {
    c.beginPath();
    // nothing beyond this two commands will cause the canvas to draw over the coord-sys
    c.rect(this.X, this.Y, this.Width, this.Height);
    c.closePath();
    c.clip();

};
/**
 * Sets the callback-object, that will be called when the user clicks on the coordination system
 * @param {callback-object/function} that - will be seen as the callback-object when SetOnClick is called with only 1 arguments otherwise it's the this-object
 * @param {function} f - the function that will be triggered
 * @param {object} para - the first argument the function will have
 * @returns {undefined}
 */
Anibody.visual.CoordinateSystem.prototype.SetOnClick = function (that, f, para) {
    if (arguments.length > 1) {
        this.OnClickCBO = {
            that: that,
            function: f,
            parameter: para || true
        };
    } else {
        this.OnClickCBO = that;
    }
};
/**
 * sets the null point to a certain position
 * @param {type} x
 * @param {type} y
 * @returns {undefined}
 */
Anibody.visual.CoordinateSystem.prototype.SetNullpoint = function (x, y) {
    this.Nullpoint.x = x;
    this.Nullpoint.y = y;
    this.UpdateLimit();
};