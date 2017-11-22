
/**
 * Creates circles narrowing to the spot (area)
 * @param {Object} area - object of rectangle or circle
 * @param {Number} ms - time of the spotting in milliseconds
 * @returns {Spotting}
 */
Anibody.visual.Spotting = function Spotting(area, ms){
    Anibody.classes.Widget.call(this);
    
    this.Area = area;
    
    this.X=0;
    this.Y=0;
    this.Width=0;
    this.Height=0;

    this.Following = false;
    this._instance = null;
    this._attr = null;

    this.Radius= [];
    this.MinRadius = 0;
    
    this.Color = Anibody.visual.Spotting.prototype.DefaultColor;
            
    this.Milliseconds = ms;
    
    this.NumberCircles = 3;
    
    this._ref_dfo = null;

this.Initialize();
};

Anibody.visual.Spotting.prototype = Object.create(Anibody.classes.Widget.prototype);
Anibody.visual.Spotting.prototype.constructor = Anibody.visual.Spotting;

Anibody.visual.Spotting.prototype.DefaultColor = "red";
/**
 * @see README_DOKU.txt
 */
Anibody.visual.Spotting.prototype.Initialize = function () {
    this._getSpot(this.Area);
    
    // finding the starting radius of the inner circle
    var startR = Math.max(
            this.X, this.Y, this.Engine.Canvas.width - this.X, this.Engine.Canvas.height - this.Y
            );
    
    // setting the Radii of all circles
    for(var i=0; i<this.NumberCircles; i++){
        this.Radius[i] = startR + (i*40);
    }
    
    
    
};

/**
 * get the center (spot) of the area
 * @param {type} a
 * @returns {undefined}
 */
Anibody.visual.Spotting.prototype._getSpot = function (a) {

    // finding the centroid of the area
    if(a.type === "circle"){
        this.X = a.x;
        this.Y = a.y;
        this.MinRadius = a.radius;
    }else{
        this.X = (a.x + a.width/2);
        this.Y = (a.y + a.height/2);
        this.MinRadius = (a.width + a.height) / 4;
    }
    
};

/**
 * Starts the process (register a draw function) and ends it automatically (deregister)
 * @returns {undefined}
 */
Anibody.visual.Spotting.prototype.Start = function(cbo){

    this.Register(); // Widget-Method
    
    var endf= function(that,cbo){
        that.Deregister(); // Widget-Method
        Anibody.CallObject(cbo);
    };
    
    new Anibody.util.MultiFlow(
            [this.Radius,this.Radius,this.Radius],
            ["0", "1", "2"],
            [this.MinRadius, this.MinRadius, this.MinRadius],
            this.Milliseconds
    ).Start();
        
    window.setTimeout(endf, this.Milliseconds+100, this,cbo);
};

/**
 * Creates a ForegroundDrawFunctionObject, which consists mainly of a drawing function, that will be used by the Engine
 * @returns {Anibody.visual.Spotting.prototype._createForegroundDrawFunctionObject.SpottingAnonym$1}
 */
Anibody.visual.Spotting.prototype.Draw = function(c){
    c.save();

    c.strokeStyle = this.Color;
    c.lineWidth = 2.5;

    c.beginPath();
    for(var i=0; i<this.NumberCircles; i++){
        c.circle(this.X, this.Y, this.Radius[i], true);
    }
    c.stroke();

    c.restore();
};
