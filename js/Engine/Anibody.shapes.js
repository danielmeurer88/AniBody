Anibody.SetPackage("Anibody", "shapes");

/**
 * 
 * @returns {Anibody.shapes.Shape}
 */
Anibody.classes.Shape = function Shape(){ // Base class
    Anibody.classes.ABO.call(this);
    this.X=0;
    this.Y=0;
    this.Centroid = {x:0,y:0};
    this.Points = [];
    
    this.FillType = "color"; // none, color, image, linearGradient, radialGradient
    this.FillCode = "#666"; // none, colorCode, codename, stops-object
    this.BorderWidth = 0;
    this.BorderType = "color"; //
    this.BorderCode = "#000";
    
this.Initialize();
};

Anibody.classes.Shape.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.classes.Shape.prototype.constructor = Anibody.classes.Shape;

Anibody.classes.Shape.prototype.Initialize = function(){
};

Anibody.classes.Shape.prototype.Draw = function(){
  if(this.Points.length < 2) return;
  // ...
};

Anibody.classes.Shape.prototype._calculateCentroid= function(){
};

Anibody.classes.Shape.prototype.AddPoint = function(x,y){
};

Anibody.classes.Rectangle = function Rectangle(x,y,width,height){ // Rectangle class
    Anibody.classes.Shape.call(this);
    this.X=x;
    this.Y=y;
    this.Width = width;
    this.Height = height;
    this.Centroid = {x:x+width/2,y:y+height/2};
    this.Points = [{x:x,y:y},{x:x+width,y:y},{x:x+width,y:y+height},{x:x,y:y+height}];
    
this.Initialize();
};

Anibody.classes.Shape.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.classes.Shape.prototype.constructor = Anibody.classes.Shape;

Anibody.classes.Shape.prototype.Initialize = function(){
  this._calculateCentroid(); // TODO
};
