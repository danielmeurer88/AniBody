Anibody.SetPackage("Anibody", "shapes");

/**
 * 
 * @returns {Anibody.shapes.Shape}
 */
Anibody.shapes.Shape = function Shape(x,y){ // Base class
    Anibody.ABO.call(this);
    this.X=x;
    this.Y=y;
    this.Centroid = {x:x,y:y};
    this.Points = [{x:x,y:y}];
    
    this.FillType = "color"; // none, color, image, linearGradient, radialGradient
    this.FillCode = "#666"; // none, colorCode, codename, stops-object
    this._fillStyle = null;
    this.BorderWidth = 0;
    this.BorderType = "color"; //
    this.BorderCode = "#000";
    
    this._rotation = 0;
    
this.Initialize();
};

Anibody.shapes.Shape.prototype = Object.create(Anibody.ABO.prototype);
Anibody.shapes.Shape.prototype.constructor = Anibody.shapes.Shape;

Object.defineProperty(Anibody.shapes.Shape, "name", {value:"Shape"});

Anibody.shapes.Shape.prototype.Initialize = function(){
    this._calculateCentroid();
    this._calculateSurroundingRectangle();
    this._updateFillStyle();
    
};

Anibody.shapes.Shape.prototype._updateFillStyle = function(){

    if (this.FillType === "image") {
        if (typeof this.FillCode === "string"){
            this.FillCode = this.Engine.MediaManager.GetPicture(this.FillCode);
            this._fillStyle = this.FillCode;
        }
        if (this.FillCode && this.FillCode.complete) {
            var repeat = "repeat"; // repeat, repeat-x, repeat-y, no-repeat
            this._fillStyle = c.createPattern(this.FillCode, repeat);
        }
    }
    if (this.FillType === "color")
        this._fillStyle = this.FillCode;
    
    if (this.FillType === "none")
        this._fillStyle = "rgba(0,0,0,0)";

    if (this.FillType === "linearGradient") {
        var c = this.Engine.Context;
        var lg = c.createLinearGradient(this.X, this.Y, this.X + this.Width, this.Y + this.Width);
        var stops = [{stop: 0, color: "rgba(90,90,90,1)"}, {stop: 1, color: "rgba(30,30,30,1)"}];
        for (var i = 0; i < stops.length; i++) {
            lg.addColorStop(stops[i].stop, stops[i].color);
        }
        this._fillStyle = lg;
    }

    if (this.FillType === "radialGradient") {
        //top-left
        var c = this.Engine.Context;
        var rg = c.createRadialGradient(
                this.X + this.Width * 0.2, this.Y + this.Height * 0.2, Math.min(this.Width, this.Height) * 0.2,
                this.X + this.Width * 0.2, this.Y + this.Height * 0.2, Math.min(this.Width, this.Height) * 0.4
                );
        var stops = [{stop: 0, color: "rgba(90,90,90,1)"}, {stop: 1, color: "rgba(30,30,30,1)"}];
        for (var i = 0; i < stops.length; i++) {
            lg.addColorStop(stops[i].stop, stops[i].color);
        }
        this._fillStyle= rg;
    }
    
};

Anibody.shapes.Shape.prototype.Draw = function(c){
  if(this.Points.length < 2) return;
  
  c.save();
  
  // create Path
  
  c.beginPath();
  c.moveTo(this.Points[0].x, this.Points[0].y);
  for(var i=1; i<this.Points.length; i++){
      c.lineTo(this.Points[i].x, this.Points[i].y);
  }
  
  // FILL
  if(this._fillStyle === null || !this._fillStyle)
      this._updateFillStyle();
  
  c.fillStyle = this._fillStyle;
  c.fill();
  
  // STROKE
  
};

Anibody.shapes.Shape.prototype._calculateCentroid= function(){
    
    // vertices = this.Points 
    
    var centroid = {x:0, y:0};
    var signedArea = 0;
    var x0 = 0; // Current vertex X
    var y0 = 0; // Current vertex Y
    var x1 = 0; // Next vertex X
    var y1 = 0; // Next vertex Y
    var a = 0;  // Partial signed area

    // For all vertices except last
    var i=0;
    for (i=0; i<this.Points.length-1; ++i)
    {
        x0 = this.Points[i].x;
        y0 = this.Points[i].y;
        x1 = this.Points[i+1].x;
        y1 = this.Points[i+1].y;
        a = x0*y1 - x1*y0;
        signedArea += a;
        centroid.x += (x0 + x1)*a;
        centroid.y += (y0 + y1)*a;
    }

    // Do last vertex separately to avoid performing an expensive
    // modulus operation in each iteration.
    x0 = this.Points[i].x;
    y0 = this.Points[i].y;
    x1 = this.Points[0].x;
    y1 = this.Points[0].y;
    a = x0*y1 - x1*y0;
    signedArea += a;
    centroid.x += (x0 + x1)*a;
    centroid.y += (y0 + y1)*a;

    signedArea *= 0.5;
    centroid.x /= (6.0*signedArea);
    centroid.y /= (6.0*signedArea);
    
    this.Centroid = centroid;
    
};

Anibody.shapes.Shape.prototype._calculateSurroundingRectangle = function(){
    var x = this.Points[0].x;
    var max = this.Points[0].x;
    var y = this.Points[0].y;
    var maxy = this.Points[0].y;
    
    for(var i=1; i<this.Points.length; i++){
        x = Math.min(x, this.Points[i].x);
        y = Math.min(y, this.Points[i].y);
        max = Math.max(max, this.Points[i].x);
        maxy = Math.max(maxy, this.Points[i].y);
    }
    this.X = x;
    this.Y = y;
    this.Width = max - x;
    this.Height = maxy - y;
};

Anibody.shapes.Shape.prototype.AddPoint = function(x,y){
    this.Points.push({x:x,y:y});
    this._calculateCentroid();
    this._sortPoints();
    this._calculateSurroundingRectangle();
};

Anibody.shapes.Shape.prototype.Rotate = function(x,y){
    if(isNaN(x)) x = this.Centroid.x;
    if(isNaN(y)) y = this.Centroid.y;
};

Anibody.shapes.Shape.prototype._getAngle = function(p){
    var dx, dy, val;
    
    // radian gap is on the left
    dx = p.x - this.Centroid.x;
    dy = p.y - this.Centroid.y;

    // dy should be first parameter, dx 2nd
    val = Math.atan2(dy, dx);
    
    // changes [-PI, +PI] into [0,2*PI]
    var atan2_correction = function(atan2){
        return (atan2<0) ? (Math.PI + (Math.PI + atan2)) : atan2;
    };
                
    return atan2_correction(val);
};

Anibody.shapes.Shape.prototype._sortPoints = function(){
    
    for(var i=0; i<this.Points.length; i++){
        this.Points[i]._angleRadian = this._getAngle(this.Points[i]);
        this.Points[i]._angleDegree = (this.Points[i]._angle * 180/Math.PI);
    };
    
    // sort according to angles
    this.Points.sort(function (a, b) {
        return (a._angleRadian > b._angleRadian) ? 1 : -1;
    });
    
};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/*
 * 
 * @param {type} x
 * @param {type} y
 * @param {type} width
 * @param {type} height
 * @returns {Anibody.Rectangle}
 */
Anibody.shapes.Rectangle = function Rectangle(x,y,width,height){ // Rectangle class
    Anibody.Shape.call(this);
    this.X=x;
    this.Y=y;
    this.Width = width;
    this.Height = height;
    this.Centroid = {x:x+width/2,y:y+height/2};
    this.Points = [{x:x,y:y},{x:x+width,y:y},{x:x+width,y:y+height},{x:x,y:y+height}];
    
this.Initialize();
};

Anibody.shapes.Rectangle.prototype = Object.create(Anibody.shapes.Shape.prototype);
Anibody.shapes.Rectangle.prototype.constructor = Anibody.shapes.Rectangle;

Object.defineProperty(Anibody.shapes.Rectangle, "name", {value:"Rectangle"});

Anibody.shapes.Rectangle.prototype.Initialize = function(){
  this._calculateCentroid(); // TODO
};

Anibody.shapes.Rectangle.prototype._calculateCentroid= function(){
     this.Centroid = {x:this.X+this.Width/2,y:this.Y+this.Height/2};
};