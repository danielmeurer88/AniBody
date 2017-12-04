Anibody.SetPackage("Anibody", "visual");

/**
 * Represents a bezier spline
 * @returns {Spline}
 */
Anibody.visual.Spline = function Spline() {
    Anibody.classes.ABO.call(this);

    this.Canvas = {
        width : this.Engine.Canvas.width,
        height : this.Engine.Canvas.height
    };

    this.Points = [];
    this._pointsStack = [];
    
    this.FirstControlPoints = false;
    this.SecondControlPoints = false;

    this.Color = "black";
    this.LineWidth = 3;
    
    this._useDashedLine = false;
    this._dashedLineValues = [0,0];
    this._close = false;

    this.DrawPoints = false;
    
    
    this.FilteredImage = false;

    this.Initialize();
};

Anibody.visual.Spline.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Spline.prototype.constructor = Anibody.visual.Spline;
/**
 * @see README_DOKU.txt
 */
Anibody.visual.Spline.prototype.Initialize = function () {

    // starting to calculate the control points of the spline with all points
};

/**
 * adds point to the spline
 * @param {object/number} porx
 * @param {number} y
 * @returns {undefined}
 */
Anibody.visual.Spline.prototype.AddPoint = function (porx, y) {
    
    var p;
    if(typeof porx === "number"){
        p = {x:porx, y:y};
    }else{
        p = porx;
    }
    
    this.Points.push(p);
    this._pointsStack.push(p);
    
    // update because of change
    this._updatePoints();
    
};

/**
 * Removes the last added point no matter the sorting
 * @returns {undefined}
 */
Anibody.visual.Spline.prototype.RemoveLastPoint = function () {
    
    if(this.Points.length===0)
        return;
    
    var rem = this._pointsStack.pop();
    // gets the index of the last set point
    var ind = this.Points.getIndex(rem);
    // deletes the last set point from the array of the sorted array 
    this.Points.delete(ind);
    // update because of change
    this._updatePoints();

};

/**
 * @see README_DOKU.txt
 */
Anibody.visual.Spline.prototype.Draw = function (c) {
    c.save();

    var p1, cp1, cp2, p2;
    
    if(this.Points.length >= 2){
    
        c.lineJoin = "round";

        if(this._useDashedLine)
            c.setLineDash(this._dashedLineValues);

        c.strokeStyle = this.Color;
        c.lineWidth = this.LineWidth;
        c.lineCap = "butt";

        // drawing the Spline
        for (var i = 0; i < this.Points.length-1; i++) {
            p1 = this.Points[i];
            cp1 = this.FirstControlPoints[i];
            cp2 = this.SecondControlPoints[i];
            p2 = this.Points[i + 1];
                
            c.beginPath();
            c.moveTo(p1.x, p1.y);
            c.bezierCurveTo(
                    cp1.x, cp1.y,
                    cp2.x, cp2.y,
                    p2.x, p2.y
                    );
            c.stroke();
        }
        
        if(this._close){
            var endi = this.Points.length - 1;
            p1 = this.Points[endi];
            cp1 = this.FirstControlPoints[endi];
            cp2 = this.SecondControlPoints[endi];
            p2 = this.Points[0];
                
            c.beginPath();
            c.moveTo(p1.x, p1.y);
            c.bezierCurveTo(
                    cp1.x, cp1.y,
                    cp2.x, cp2.y,
                    p2.x, p2.y
                    );
            c.stroke();
        }
        
    }
        
    // drawing the points if wished
    if (this.DrawPoints){
        c.strokeStyle = "black";
        c.lineWidth = 1.5;
        for (var i = 0; i < this.Points.length; i++){
            //this.Points[i].Draw(c);
            c.drawCross(this.Points[i].x, this.Points[i].y, 6);
        }
            
    }
    c.restore();
};

/**
 * @see README_DOKU.txt
 */
Anibody.visual.Spline.prototype.Update = function () {};

Anibody.visual.Spline.prototype.SetDash = function (active, length, space) {
    
    if(typeof active !== "boolean")
        active = false;
    if(isNaN(length))
        length = 10;
    if(isNaN(space))
        space = 6;
    
    this._useDashedLine = active;
    this._dashedLineValues = [length, space];
};

Anibody.visual.Spline.prototype._createImage = function(){
        
    
    // drawing the Spline's Highlighting background
    
    var can = document.createElement("CANVAS");
    can.width = this.Canvas.width;
    can.height = this.Canvas.height;
    var c = can.getContext("2d");
    
    // drawing onto the offscreen canvas
    var p1,cp1,cp2,p2;
    
    c.lineCap = "round";
    c.strokeStyle = getRGBA(this.Color, 1, 0.75);
    c.lineWidth = 8;
    c.filter = "blur(4px)";
    
    
    if(this.Points.length >= 2){
    
        c.lineJoin = "round";

        if(this._useDashedLine)
            c.setLineDash(this._dashedLineValues);

        // drawing the Spline
        for (var i = 0; i < this.Points.length-1; i++) {
            p1 = this.Points[i];
            cp1 = this.FirstControlPoints[i];
            cp2 = this.SecondControlPoints[i];
            p2 = this.Points[i + 1];
                
            c.beginPath();
            c.moveTo(p1.x, p1.y);
            c.bezierCurveTo(
                    cp1.x, cp1.y,
                    cp2.x, cp2.y,
                    p2.x, p2.y
                    );
            c.stroke();
        }
    }
        
    // end drawing and saving it as an image
    var url = can.toDataURL();
    this.FilteredImage = document.createElement("IMG");
    this.FilteredImage.src = url;
    
};

Anibody.visual.Spline.prototype.SetColor = function (color) {
    this.Color = color;
};

/**
 * Sorts the points of the Spline around a certain point
 * @param {object} base
 * @param {string} sortGap - is the Spline beginning/ending gap on the right, left, top or bottom side of the imaginary circle
 * @returns {undefined}
 */
Anibody.visual.Spline.prototype.CircularSort = function (base, sortGap) {
    
    if(typeof resultGap !== "string"){
        resultGap = "right";
    }
    
    for(var i=0; i<this.Points.length; i++){
        this.Points[i]._angleRadian = this._getAngle(base, this.Points[i], sortGap);
        this.Points[i]._angleDegree = (this.Points[i]._angle * 180/Math.PI);
    };
    
    // sort according to angles
    this.Points.sort(function (a, b) {
        return (a._angleRadian > b._angleRadian) ? 1 : -1;
    });
    
    this._updatePoints();
};

/**
 * calculates the needed control points for drawing the bezier curve.
 * needs to be called if anything has changed like adding, removing or sorting the points 
 * @returns {undefined}
 */
Anibody.visual.Spline.prototype._updatePoints = function () {
        
    this._calculateCurveControlPoints();
    //this._createImage();
};

/**
 * calculates the value of the angle between a base point and another certain point
 * @param {object} base - an object with x,y coordinates (in CircularSort it is the middle point, around which the points of the spline get sorted)
 * @param {object} p - an object with x,y coordinates 
 * @param {string} resultGap - [0,2*PI]-gap on the right, left, top or bottom side of the imaginary circle
 * @returns {Number} between 0 and 2*PI
 */
Anibody.visual.Spline.prototype._getAngle = function (base, p, resultGap) {

    var dx, dy, val;
    
    if(typeof resultGap !== "string"){
        resultGap = "right";
    }
    
    // radian gap: where the union circle ends and
    // atan2 result changes from -PI to +PI
    // from -3.14 to +3.14
   
   if(resultGap === "top" || resultGap === "bottom"){
        
        if(resultGap === "top"){
        // radian gap is on the top
            dx = base.x - p.x;
            dy = base.y - p.y;
        }

        if(resultGap === "bottom"){
        // radian gap is on the bottom
            dx = p.x - base.x;
            dy = p.y - base.y;
        }
        
        // dx should be first parameter, dy 2nd
        val = Math.atan2(dx, dy);
    }
    
    if(resultGap === "left" || resultGap === "right"){
        
        if(resultGap === "left"){
        // radian gap is on the right
            dx = base.x - p.x;
            dy = base.y - p.y;
        }

        if(resultGap === "right"){
        // radian gap is on the left
            dx = p.x - base.x;
            dy = p.y - base.y;
        }
        
        // dy should be first parameter, dx 2nd
        val = Math.atan2(dy, dx);
    }
    
    // return val;
    
    // changes [-PI, +PI] into [0,2*PI]
    var atan2_correction = function(atan2){
            return (atan2<0) ? (Math.PI + (Math.PI + atan2)) : atan2;
        };
                
    return atan2_correction(val);

};
/**
 * calculates the distance between base point and point p
 * @param {object} base - an object with x,y coordinates
 * @param {object} p - an object with x,y coordinates
 * @returns {Number}
 */
Anibody.visual.Spline.prototype._getDistance = function (base, p) {
    var dx = p.x - base.x;
    var dy = p.y - base.y;
    return Math.sqrt( (Math.pow(dx,2) + Math.pow(dy,2)) );
};

/**
 * Calculates the control points of the main points in the Points-Array
 * @returns {Boolean}
 */
Anibody.visual.Spline.prototype._calculateCurveControlPoints = function () {
    // no line if zero or only one point
    if(this.Points.length <= 1){
        return;
    }
    
    var firstControlPoints = [];
    var secondControlPoints = [];
    
    // if only 2 points -> straight line between the two points, which means the control points have the same value as the 2nd point
    if(this.Points.length === 2){
        
        firstControlPoints.push({x:this.Points[1].x,y:this.Points[1].y});
        secondControlPoints.push({x:this.Points[1].x,y:this.Points[1].y});
        
        this.FirstControlPoints = firstControlPoints;
        this.SecondControlPoints = secondControlPoints;
        return;
    }

    var knots = [];

    for (var i = 0; i < this.Points.length; i++) {
        knots.push({
            x: this.Points[i].x,
            y: this.Points[i].y
        });
    }
    if(this._close){
        knots.push({
            x: this.Points[0].x,
            y: this.Points[0].y
        });
    }

    var n = knots.length - 1;

    // Calculate first Bezier control points
    // Right hand side vector

    var rhs = [];

    for (var i = 1; i < n - 1; i++)
        rhs[i] = 4 * knots[i].x + 2 * knots[i + 1].x;

    rhs[0] = knots[0].x + 2 * knots[1].x;
    rhs[n - 1] = (8 * knots[n - 1].x + knots[n].x) / 2;

    // Get first control points X-values
    var x = this._getFirstControlPoints(rhs);

    // Set right hand side Y values
    for (var i = 1; i < n - 1; i++)
        rhs[i] = 4 * knots[i].y + 2 * knots[i + 1].y;

    rhs[0] = knots[0].y + 2 * knots[1].y;
    rhs[n - 1] = (8 * knots[n - 1].y + knots[n].y) / 2;
    // Get first control points Y-values
    var y = this._getFirstControlPoints(rhs);

    // Fill output arrays.

    for (var i = 0; i < n; i++) {
        // First control point
        firstControlPoints[i] = {x: x[i], y: y[i]};
        // Second control point
        if (i < n - 1)
            secondControlPoints[i] = {
                x: 2 * knots[i + 1].x - x[i + 1],
                y: 2 * knots[i + 1].y - y[i + 1]
            };
        else
            secondControlPoints[i] = {
                x: (knots[n].x + x[n - 1]) / 2,
                y: (knots[n].y + y[n - 1]) / 2
            };
    }

    this.FirstControlPoints = firstControlPoints;
    this.SecondControlPoints = secondControlPoints;
};
/**
 * offshore algorithm of _calculateCurveControlPoints
 * @param {Array} rhs
 * @returns {Array}
 */
Anibody.visual.Spline.prototype._getFirstControlPoints = function (rhs) {
    var n = rhs.length;
    var x = []; // Solution vector.
    var tmp = []; // Temp workspace.

    var b = 2;

    x[0] = rhs[0] / b;

    for (var i = 1; i < n; i++) {
        // Decomposition and forward substitution.
        tmp[i] = 1 / b;
        b = (i < n - 1 ? 4.0 : 3.5) - tmp[i];
        x[i] = (rhs[i] - x[i - 1]) / b;
    }
    for (var i = 1; i < n; i++)
        x[n - i - 1] -= tmp[n - i] * x[n - i]; // Backsubstitution.

    return x;
};

Anibody.visual.Spline.prototype.SetCloseSpline = function (state) {
    this._close = state;
};