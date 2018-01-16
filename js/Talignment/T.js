/**
 * Represents a T puzzle piece
 * @returns {T}
 */
function T(color, dx, dy) { // Base class
    Anibody.ABO.call(this);

    if(typeof color !== "string")
        this._color = "rgba(0,0,0,1)";
    else
        this._color = color;

    // start points
    this._dx = dx; // delta x
    this._dy = dy; // delta y 

    this.Shape = null;

    var self = this;
    Object.defineProperty(this, "X", {
        set: function (newValue) {},
        get: function () { return self.Shape.X; }
    });
    Object.defineProperty(this, "Y", {
        set: function (newValue) {},
        get: function () { return self.Shape.Y; }
    });

    Object.defineProperty(this, "Width", {
        set: function (newValue) {},
        get: function () { return self.Shape.Width; }
    });
    Object.defineProperty(this, "Height", {
        set: function (newValue) {},
        get: function () { return self.Shape.Height; }
    });
    Object.defineProperty(this, "IsMouseOver", {
        set: function (newValue) {},
        get: function () { return self.Shape.IsMouseOver; }
    });
    Object.defineProperty(this, "Selected", {
        set: function (newValue) {},
        get: function () { return self.Shape.Selected; }
    });

    this.SquareSize = 50;

    this.Initialize();
};

T.prototype = Object.create(Anibody.ABO.prototype);
T.prototype.constructor = T;

/**
 * @see README_DOKU.txt
 */
T.prototype.Initialize = function () {

    var sz = this.SquareSize;

    var p = [
        sz*0,sz*0,
        sz*5, sz*0,
        sz*5, sz*1,
        sz*3, sz*1,
        sz*3, sz*6,
        sz*2, sz*6,
        sz*2, sz*1,
        sz*0, sz*1
    ];

    var s = new Anibody.shapes.Shape();

    s.AutoSort = false;
    s.AddPoints.apply(s,p);
    s.Move(this._dx, this._dy);

    s.FillCode = this._color; // none, colorCode, codename, stops-object

    // s._drawPoints = true;
    // s._drawCentroid = true;
    // s._drawArea = true;
    // s._drawSurroundingRectangle = true;

    s.VisualRotation = false;

    this.Shape = s;
    
};

T.prototype.ProcessInput = function () {this.Shape.ProcessInput();};
T.prototype.Update = function () {this.Shape.Update();};
T.prototype.Draw = function (c) {this.Shape.Draw(c);};

T.prototype.IsThereCollision = function (arr) {
    
    var i,j, k;
    var r;

    var can = document.createElement("canvas");

    var x = 0;
    var y = 0;
    var width = this.Engine.Canvas.width;
    var height = this.Engine.Canvas.height;

    arr.push(this);
    
    imgData = [];
    var s;

    can.width = width;
    can.height = height;
    var c = can.getContext("2d");

    // get image data of all shapes in the array
    for(i=0; i<arr.length; i++){

        s = arr[i].Shape;

        if (s.Points.length > 1) {
            // create Path

            c.beginPath();
            c.moveTo(s.Points[0].x, s.Points[0].y);
            for (j = 1; j < s.Points.length; j++) {
                c.lineTo(s.Points[j].x, s.Points[j].y);
            }
            c.closePath();

            // FILL
            c.fillStyle = "rgba(255,0,0,1)";
            c.fill();

            // STROKE
            c.lineWidth = s.BorderWidth;
            c.strokeStyle = "rgba(255,0,0,1)";
            c.stroke();
        }
        imgData.push(c.getImageData(0,0,width,height));
        //c.download();
        c.clearRect(0,0,width,height);
    }

    // loop through it
    // where a red pixel (red above 250) is, there should be no blue pixel in all of the other image datas
    
    var nomorethan1 = 0;
    for(j=0; j<height; j++){
        for(i=0; i<width; i++){
            nomorethan1 = 0;
            r = 4 * (i + (width) * j) + 0;

            for(k=0; k<imgData.length; k++){
                if(imgData[k].data[r] > 250)
                    nomorethan1++;
            }
            
            if(nomorethan1 > 1)
                return true;

        } // for i
    } // for j
    return false;
};

T.prototype.Move = function (dx,dy) {
    this.Shape.Move(dx,dy);
};

T.prototype.IsPointInT = function (x,y) {
    return this.Shape.IsPointInShape(x,y);
};
