/**
 * Represents a T puzzle piece
 * @returns {T}
 */
function T(color, dx, dy) { // Base class
    Anibody.ABO.call(this);

    if(typeof color !== "string")
        this._color = "black";
    else
        this._color = color;

    // start points
    this._dx = dx; // delta x
    this._dy = dy; // delta y 

    this.X = 0;
    this.Y = 0;

    this.Shape = null;

    // var self = this;
    // Object.defineProperty(this, "xyz", {
    //     set: function (newValue) {
    //         self.xyz = newValue;
    //     },
    //     get: function () { return false; }
    // });

    // this.xyz = 0;
    // Object.defineProperty(this, "xyz", { enumerable: false });

    this.Initialize();
};

T.prototype = Object.create(Anibody.ABO.prototype);
T.prototype.constructor = T;

/**
 * @see README_DOKU.txt
 */
T.prototype.Initialize = function () {

    var p = [
        0,0,
        250, 0,
        250, 50,
        150, 50,
        150, 250,
        100,250,
        100, 50,
        0, 50
    ];

    var s = new Anibody.shapes.Shape();

    s.AutoSort = false;
    s.AddPoints.apply(s,p);
    s.Move(this._dx, this._dy);

    s.FillCode = this._color; // none, colorCode, codename, stops-object

    s._drawPoints = true;
    s._drawCentroid = true;
    s._drawArea = true;
    s._drawSurroundingRectangle = true;

    s.VisualRotation = false;

    this.Shape = s;
    
};

T.prototype.ProcessInput = function () {this.Shape.ProcessInput();};
T.prototype.Update = function () {this.Shape.Update();};
T.prototype.Draw = function (c) {this.Shape.Draw(c);};

T.prototype.IsCollidingWith = function (s) {
    
    var can = document.createElement("canvas");
    can.width = this.Engine.Canvas.width;
    can.height = this.Engine.Canvas.height;
    var c = can.getContext("2d");

    // fill this shape
    this.Shape.EasyDraw(c);
    // source-in
    c.globalCompositeOperation = "source-in";

    // fill other shape
    s.Shape.EasyDraw(c);

    // TESTING - Download result
    // var data = can.toDataURL();
    // this.Engine.Download("CollisionTest", data);

    c.download();

    // search if there are any drawn pixel - if yes: they collide
    // TODO
};