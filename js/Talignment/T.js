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

    // s._drawPoints = true;
    // s._drawCentroid = true;
    // s._drawArea = true;
    s._drawSurroundingRectangle = true;

    s.VisualRotation = false;

    this.Shape = s;
    
};

T.prototype.ProcessInput = function () {this.Shape.ProcessInput();};
T.prototype.Update = function () {this.Shape.Update();};
T.prototype.Draw = function (c) {this.Shape.Draw(c);};

T.prototype.IsCollidingWith = function (arr) {
    
    var can = document.createElement("canvas");

    var x = this.Shape.X;
    var y = this.Shape.Y;
    var width = this.Shape.Width;
    var height = this.Shape.Height;

    var imageData;
    var otherImageData = [];
    var s;

    can.width = width;
    can.height = height;
    var c = can.getContext("2d");

    var i,j, k;
    var r,b;

    // get image data of this T
    
    if (this.Shape.Points.length > 1) {
        // create Path

        c.beginPath();
        c.moveTo(this.Shape.Points[0].x - x, this.Shape.Points[0].y - y);
        for (i = 1; i < this.Shape.Points.length; i++) {
            c.lineTo(this.Shape.Points[i].x - x, this.Shape.Points[i].y - y);
        }
        c.closePath();

        // FILL
        c.fillStyle = "rgba(255,0,0,1)";
        c.fill();

        // STROKE
        c.lineWidth = this.Shape.BorderWidth;
        c.strokeStyle = "rgba(255,0,0,1)";
        c.stroke();
    }

    // get the easy T shape and saves it
    var imageData = c.getImageData(0,0,width, height);

    //clear the canvas
    c.clearRect(0,0,width,height);

    // get image data of all shapes in the array
    for(i=0; i<arr.length; i++){

        s = arr[i];

        if (s.Shape.Points.length > 1) {
            // create Path

            c.beginPath();
            c.moveTo(s.Shape.Points[0].x - x, s.Shape.Points[0].y - y);
            for (j = 1; j < s.Shape.Points.length; j++) {
                c.lineTo(s.Shape.Points[j].x - x, s.Shape.Points[j].y - y);
            }
            c.closePath();

            // FILL
            c.fillStyle = "rgba(0,0,255,1)";
            c.fill();

            // STROKE
            c.lineWidth = s.Shape.BorderWidth;
            c.strokeStyle = "rgba(0,0,255,1)";
            c.stroke();
        }
        otherImageData.push(c.getImageData(0,0,width,height));
        c.clearRect(0,0,width,height);
    }

    // search if there are any drawn pixel - if yes: they collide
    // TODO

    // loop through it
    // where a red pixel (red above 250) is, there should be no blue pixel in all of the other image datas
    
    for(j=0; j<height; j++){
        for(i=0; i<width; i++){

            r = imageData.data[ 4 * (i + width * j) + 0 ]; // red value of pixel (i,j)

            if(r > 250){

                for(k=0; k < otherImageData.length; k++){
                    b = otherImageData[k].data[ 4 * (i + width * j) + 2 ]; // blue value of pixel (i,j)

                    if(b > 250){
                        return true;
                    } // if b > 250
                } // for k
            } // if r > 250
        } // for i
    } // for j
    return false;
};

T.prototype.Move = function (dx,dy) {
    this.Shape.Move(dx,dy);
};