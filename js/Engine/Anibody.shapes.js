Anibody.SetPackage("Anibody", "shapes");

/**
 * Represents a visual and stylable polygone
 * @returns {Anibody.shapes.Shape}
 */
Anibody.shapes.Shape = function Shape() { // Base class
    Anibody.ABO.call(this);
    this._args = arguments;
    this.X = 0;
    this.Y = 0;
    this.Centroid = { x: 0, y: 0 };
    this.RotationPoint = { x: 0, y: 0 };

    this.Area = null; // px^2

    this.Points = [];
    this._pointsStack = [];
    Object.defineProperty(this, "_pointsStack", { enumerable: false });

    this.FillType = "color"; // none, color, image, linearGradient, radialGradient
    this.FillCode = "#666"; // none, colorCode, codename, stops-object
    this._fillStyle = null;
    
    this.LinearGradientRates = {
        x1 : 0.0, y1 : 0.0,
        x2 : 1.0, y2 : 1.0
    };
    
    this.RadialGradientRates = {
        x1 : 0.25, y1 : 0.25, r1 : 0.05,
        x2 : 0.25, y2 : 0.25, r2 : 0.25
    };
    
    this._generatedFillStyle = true;
    this._generatedBorderStyle = true;
    
    this.BorderWidth = 0;
    this.BorderType = "color"; //
    this.BorderCode = "#000";
    this._borderStyle = null;

    var self = this;
    Object.defineProperty(this, "FillType", {
        set: function (newValue) {
            self._private["FillType"] = newValue;
            self._updateFillStyle();
        },
        get: function () { return self._private["FillType"]; }
    });

    Object.defineProperty(this, "FillCode", {
        set: function (newValue) {
            self._private["FillCode"] = newValue;
            self._updateFillStyle();
        },
        get: function () { return self._private["FillCode"]; }
    });

    Object.defineProperty(this, "BorderType", {
        set: function (newValue) {
            self._private["BorderType"] = newValue;
            self._updateBorderStyle();
        },
        get: function () { return self._private["BorderType"]; }
    });

    Object.defineProperty(this, "BorderCode", {
        set: function (newValue) {
            self._private["BorderCode"] = newValue;
            self._updateBorderStyle();
        },
        get: function () { return self._private["BorderCode"]; }
    });

    this._private = {
        FillType: null, // none, color, image, linearGradient, radialGradient
        FillCode: null, // none, colorCode, codename, stops-object
        BorderWidth: null,
        BorderType: null, //
        BorderCode: null
    };
    Object.defineProperty(this, "_private", { enumerable: false });

    this.IsMouseOver = false;

    this._rotation = 0;

    this.VisualRotation = false; 

    this._drawPoints = false;
    this._drawCentroid = false;
    this._drawArea = false;
    this._drawSurroundingRectangle = false;

    this.Initialize();
};

Anibody.shapes.Shape.prototype = Object.create(Anibody.ABO.prototype);
Anibody.shapes.Shape.prototype.constructor = Anibody.shapes.Shape;

Object.defineProperty(Anibody.shapes.Shape, "name", { value: "Shape" });

/**
 * @see README_DOKU.txt
 */
Anibody.shapes.Shape.prototype.Initialize = function () {

    this.AddPoints.apply(this, this._args);

   this._pointsDataUpdate();

};
/**
 * updates the fill style of the Shape - triggered internally
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype._updateFillStyle = function () {

    if(!this._generatedFillStyle)
        return;
    
    if (this.FillType === "image") {
        if (typeof this.FillCode === "string") {
            this.FillCode = this.Engine.MediaManager.GetImage(this.FillCode);
            this._fillStyle = this.FillCode;
        }
        if (this.FillCode && this.FillCode.complete) {
            var repeat = "repeat"; // repeat, repeat-x, repeat-y, no-repeat
            this._fillStyle = this.Engine.Context.createPattern(this.FillCode, repeat);
        }
    }
    if (this.FillType === "color")
        this._fillStyle = this.FillCode;

    if (this.FillType === "none")
        this._fillStyle = "rgba(0,0,0,0)";

    if (this.FillType === "linearGradient") {
        var rates = this.LinearGradientRates;
        var offsetx = this.Width/2;
        var offsety = this.Height/2;
        var lg = this.Engine.Context.createLinearGradient(
                this.Width*rates.x1 - offsetx,
                this.Height*rates.y1 - offsety,
                this.Width*rates.x2 - offsetx, 
                this.Height*rates.y2 - offsety
        );
        var stops = this.FillCode;
        if(stops && stops.length)
            for (var i = 0; i < stops.length; i++) {
                lg.addColorStop(stops[i].stop, stops[i].color);
            }
        this._fillStyle = lg;
    }

    if (this.FillType === "radialGradient") {
        //top-left
        var c = this.Engine.Context;
        var rates = this.RadialGradientRates;
        var offsetx = this.Width/2;
        var offsety = this.Height/2;
        var rg = c.createRadialGradient(
            this.Width * rates.x1 - offsetx,
            this.Height * rates.y1 - offsety, 
            Math.min(this.Width, this.Height) * rates.r1,
            this.Width * rates.x2 - offsetx,
            this.Height * rates.y2 - offsety,
            Math.min(this.Width, this.Height) * rates.r2
        );
        var stops = this.FillCode;
        if(stops && stops.length)
            for (var i = 0; i < stops.length; i++) {
                rg.addColorStop(stops[i].stop, stops[i].color);
            }
        this._fillStyle = rg;
    }

};
/**
 * updates the border style of the Shape - triggered internally
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype._updateBorderStyle = function () {

    if(!this._generatedBorderStyle)
        return;
    
    if (this.BorderType === "image") {
        if (typeof this.BorderCode === "string") {
            this.BorderCode = this.Engine.MediaManager.GetImage(this.BorderCode);
            this._borderStyle = this.BorderCode;
        }
        if (this.BorderCode && this.BorderCode.complete) {
            var repeat = "repeat"; // repeat, repeat-x, repeat-y, no-repeat
            this._borderStyle = this.Engine.Context.createPattern(this.BorderCode, repeat);
        }
    }
    if (this.BorderType === "color")
        this._borderStyle = this.BorderCode;

    if (this.BorderType === "none")
        this._borderStyle = "rgba(0,0,0,0)";

    if (this.BorderType === "linearGradient") {
        var rates = this.LinearGradientRates;
        var offsetx = this.Width/2;
        var offsety = this.Height/2;
        var lg = this.Engine.Context.createLinearGradient(
                this.Width*rates.x1 - offsetx,
                this.Height*rates.y1 - offsety,
                this.Width*rates.x2 - offsetx, 
                this.Height*rates.y2 - offsety
        );
        var stops = this.FillCode;
        if(stops && stops.length)
            for (var i = 0; i < stops.length; i++) {
                lg.addColorStop(stops[i].stop, stops[i].color);
            }
        this._borderStyle = lg;
    }

    if (this.BorderType === "radialGradient") {
        //top-left
        var c = this.Engine.Context;
        var rates = this.RadialGradientRates;
        var offsetx = this.Width/2;
        var offsety = this.Height/2;
        var rg = c.createRadialGradient(
            this.Width * rates.x1 - offsetx,
            this.Height * rates.y1 - offsety, 
            Math.min(this.Width, this.Height) * rates.r1,
            this.Width * rates.x2 - offsetx,
            this.Height * rates.y2 - offsety,
            Math.min(this.Width, this.Height) * rates.r2
        );
        var stops = this.FillCode;
        if(stops && stops.length)
            for (var i = 0; i < stops.length; i++) {
                rg.addColorStop(stops[i].stop, stops[i].color);
            }
        this._borderStyle = rg;
    }

};
/**
 * Deactivates the automatically generated fillStyle of the Shape
 * Sets FillStyle manually
 * @param {CanvasContextFillStyle} fs
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype.SetFillStyle = function(fs){
    this._fillStyle=fs;
    this._generatedFillStyle = false;
};
/**
 * Clears the current fillstyle (sets it to none) and uses generated fillStyles again
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype.ClearFillStyle = function(){
    this._fillStyle=null;
    this.FillType = "none";
    this._generatedFillStyle = true;
    this._updateFillStyle();
};
/**
 * Deactivates the automatically generated borderStyle of the Shape
 * Sets BorderStyle manually
 * @param {CanvasContextStrokeStyle} bs
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype.SetBorderStyle = function(bs){
    this._borderStyle=bs;
    this._generatedBorderStyle = false;
};
/**
 * Clears the current BorderStyle (sets it to none) and uses generated BorderStyles again
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype.ClearBorderStyle = function(){
    this._borderStyle=null;
    this.BorderType = "none";
    this._generatedBorderStyle = true;
    this._updateBorderStyle();
};

/**
 * @see README_DOKU.txt
 */
Anibody.shapes.Shape.prototype.Draw = function (c) {


    c.save();
    var rp = this.Centroid;

    c.translate(rp.x, rp.y);

    if(this.VisualRotation){
        c.rotate(this._rotation);
    }

    if(this._drawSurroundingRectangle){
        c.strokeStyle = "#333";
        c.strokeRect(this.X - rp.x, this.Y - rp.y, this.Width, this.Height);
    }


    if (this.Points.length > 1) {
        // create Path

        c.beginPath();
        c.moveTo(this.Points[0].x - rp.x, this.Points[0].y - rp.y);
        for (var i = 1; i < this.Points.length; i++) {
            c.lineTo(this.Points[i].x - rp.x, this.Points[i].y - rp.y);
        }
        c.closePath();

        // FILL
        if (this._fillStyle === null || !this._fillStyle)
            this._updateFillStyle();

        c.fillStyle = this._fillStyle;
        c.fill();

        // STROKE

        c.lineWidth = this.BorderWidth;
        c.strokeStyle = this._borderStyle;

        c.stroke();
    }

    if (this._drawPoints) {
        c.strokeStyle = "red";
        for (var i = 0; i < this.Points.length; i++)
            c.drawCross(this.Points[i].x - rp.x, this.Points[i].y - rp.y, this.BorderWidth + 5);
    }
    if (this._drawCentroid && this.Centroid) {
        c.strokeStyle = "green";
        c.drawCross(0, 0, this.BorderWidth + 5);
    }

    if (this._drawArea && this.Centroid) {
        c.fillStyle = "green";
        c.fillText(this.Area.toString(), this.Centroid.x - rp.x + 8, this.Centroid.y - rp.y - 8);
    }
    

    c.restore();

};
/**
 * @see README_DOKU.txt
 */
Anibody.shapes.Shape.prototype.Update = function () {
    if (this.IsMouseOver)
        this.Engine.Input.Mouse.Cursor.pointer();
};
/**
 * @see README_DOKU.txt
 */
Anibody.shapes.Shape.prototype.ProcessInput = function () {
    var self = this;
    var area = {
        function: function (c) {
            c.beginPath();
            c.moveTo(self.Points[0].x, self.Points[0].y);
            for (var i = 1; i < self.Points.length; i++) {
                c.lineTo(self.Points[i].x, self.Points[i].y);
            }
            c.closePath();
        },
        type: "function"
    };

    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOver");
};
/**
 * Calculates the Centroid of the Shape (will be called internally)
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype._calculateCentroid = function () {
    if (this.Points.length < 1) return;
    // vertices = this.Points 

    var centroid = { x: 0, y: 0 };
    var signedArea = 0;
    var x0 = 0; // Current vertex X
    var y0 = 0; // Current vertex Y
    var x1 = 0; // Next vertex X
    var y1 = 0; // Next vertex Y
    var a = 0;  // Partial signed area

    // For all vertices except last
    var i = 0;
    for (i = 0; i < this.Points.length - 1; ++i) {
        x0 = this.Points[i].x;
        y0 = this.Points[i].y;
        x1 = this.Points[i + 1].x;
        y1 = this.Points[i + 1].y;
        a = x0 * y1 - x1 * y0;
        signedArea += a;
        centroid.x += (x0 + x1) * a;
        centroid.y += (y0 + y1) * a;
    }

    // Do last vertex separately to avoid performing an expensive
    // modulus operation in each iteration.
    x0 = this.Points[i].x;
    y0 = this.Points[i].y;
    x1 = this.Points[0].x;
    y1 = this.Points[0].y;
    a = x0 * y1 - x1 * y0;
    signedArea += a;
    centroid.x += (x0 + x1) * a;
    centroid.y += (y0 + y1) * a;

    signedArea *= 0.5;
    centroid.x /= (6.0 * signedArea);
    centroid.y /= (6.0 * signedArea);

    this.Centroid = centroid;

};
/**
 * Calculates the Area of the Shape (will be called internally)
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype._calculateArea = function () {

    var area = 0;
    var n = this.Points.length;

    for(var i=0; i<n; i++){
        area += this.Points[i%n].x * this.Points[(i+1)%n].y - this.Points[i%n].y * this.Points[(i+1)%n].x;
    }

    this.Area = Math.abs( area / 2 );


};
/**
 * Calculates the Surrounding Rectangle of the Shape (will be called internally)
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype._calculateSurroundingRectangle = function () {

    if (this.Points.length < 1) return;

    var x = this.Points[0].x;
    var max = this.Points[0].x;
    var y = this.Points[0].y;
    var maxy = this.Points[0].y;

    for (var i = 1; i < this.Points.length; i++) {
        x = Math.min(x, this.Points[i].x);
        y = Math.min(y, this.Points[i].y);
        max = Math.max(max, this.Points[i].x);
        maxy = Math.max(maxy, this.Points[i].y);
    }
    this.X = x;
    this.Y = y;
    this.Width = max - x;
    this.Height = maxy - y;
    this.RotationPoint = { x: this.X + this.Width/2, y: this.Y + this.Height/2 };
};
/**
 * Adds a new points to the Shape
 * @param {number} x
 * @param {number} y
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype.AddPoint = function (x, y) {
    var p = { x: x, y: y };
    this.Points.push(p);
    this._pointsStack.push(p);
    
    this._pointsDataUpdate();
};
/**
 * Adds several points at once to the shape
 * @args {numbers} odds: x-values, evens: y-values
 * @example shape.AddPoints(1,1,4,5,-2,3); // adds the three points (1,1), (4,5) and (-2,3)
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype.AddPoints = function () {

    var points = Math.floor(arguments.length / 2);
    var p;
    for (var i = 0; i < points; i++) {
        p = { x: arguments[2 * i], y: arguments[2 * i + 1] };
        this.Points.push(p);
        this._pointsStack.push(p);
    }

    this._pointsDataUpdate();
};
/**
 * Removes the last added point to the shape
 * @returns {Object}
 */
Anibody.shapes.Shape.prototype.RemoveLastPoint = function () {
    
    if(this.Points.length <= 0) return false;
    
    var rem = this._pointsStack.pop();

    var i = this.Points.indexOf(rem);

    if(i<0) return false;

    this.Points.delete(i)
    
    this._pointsDataUpdate();
    return rem;
};
/**
 * Removes all points within a given rectangle
 * @param {number} x - x-value of the rectangle
 * @param {number} y - y-value of the rectangle
 * @param {number} width - width of the rectangle
 * @param {number} height - height of the rectangle
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype.ClearArea = function (x, y, width, height) {

    if(arguments.length <= 0) return;

    if(arguments.length <= 2){
        width=0; height=0;
    }

    if(typeof x === "object" && !isNaN(x.x)){
        y = x.y;
        width = x.width ? x.width : 0;
        height = x.height ? x.height : 0;
        x = x.x;
    }

    var kill = [];
    var p;
    var in1, in2;
    for(var i=0; i<this._pointsStack.length; i++){
        p = this._pointsStack[i];
        if(p.x >= x && p.x <= x+width && p.y >= y && p.y <= y+height){
            kill.push(p);
        }
    }

    for(var i=0; i<kill.length; i++){
        in1 = this._pointsStack.indexOf(kill[i]);
        in2 = this.Points.indexOf(kill[i]);
        if(in1 >= 0 && in2 >= 0){
            this._pointsStack.delete(in1);
            this.Points.delete(in2);
        }
    }

    this._pointsDataUpdate();

};
/**
 * Rotates the Shape clockwise
 * @param {number} rad - rotation step in radiants (clockwise)
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype.Rotate = function (rad) {
    
    var rp = this.Centroid;
    var p;
    var d;
    
    this._rotation += rad;

    if(this.VisualRotation) return;

    for(var i=0; i<this.Points.length; i++){
        p = this.Points[i];
        // get distance
        d = Math.sqrt( Math.pow((p.x - rp.x),2) + Math.pow((p.y - rp.y),2) );
        
        p._angleRadian += rad;
        p._angleDegree = (p._angleRadian * 180 / Math.PI);

        p.x = rp.x + (d * Math.cos( p._angleRadian ));
        p.y = rp.y + (d * Math.sin( p._angleRadian ));

    }

    this._calculateSurroundingRectangle();

};

/**
 * Moves the Shape
 * @param {number} dx - horizontal in px
 * @param {type} dy - vertical in px
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype.Move = function (dx, dy) {
    this.Centroid.x += dx;
    this.Centroid.y += dy;

    this.RotationPoint.x += dx;
    this.RotationPoint.y += dy;

    for(var i=0; i<this.Points.length; i++){
        this.Points[i].x += dx;
        this.Points[i].y += dy;

        //pointsStack - no need to move them because they refer to the same object as Points
    }
    this._calculateSurroundingRectangle();

};

/**
 * Calculates and returns the angle from the point to the Centroid
 * (will be called internally)
 * @param {point-object} p
 * @returns {Number}
 */
Anibody.shapes.Shape.prototype._getAngle = function (p) {
    var dx, dy, val;

    // radian gap is on the left
    dx = p.x - this.Centroid.x;
    dy = p.y - this.Centroid.y;

    // dy should be first parameter, dx 2nd
    val = Math.atan2(dy, dx);

    // changes [-PI, +PI] into [0,2*PI]
    var atan2_correction = function (atan2) {
        return (atan2 < 0) ? (Math.PI + (Math.PI + atan2)) : atan2;
    };

    return atan2_correction(val);
};

/**
 * sort all points according to the angle to the centroid
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype._sortPoints = function () {

    for (var i = 0; i < this.Points.length; i++) {
        this.Points[i]._angleRadian = this._getAngle(this.Points[i]);
        this.Points[i]._angleDegree = (this.Points[i]._angleRadian * 180 / Math.PI);
    };

    // sort according to angles
    this.Points.sort(function (a, b) {
        return (a._angleRadian > b._angleRadian) ? 1 : -1;
    });

};

/**
 * a collection of necessary functions when the data of at least one point or more has changed
 * @returns {undefined}
 */
Anibody.shapes.Shape.prototype._pointsDataUpdate = function () {
    this._sortPoints();
    this._calculateCentroid();
    //this._sortPoints(); // sort again if you rely on the angle values being correct for the current centroid
    this._calculateSurroundingRectangle();
    this._calculateArea();
    this._updateFillStyle();
    this._updateBorderStyle();
};

/**
 * Returns an item, which can be used for FillCoder or BorderCode when the shape
 * is set to render linear or radial Gradients
 * @args {Strings} color codes
 * @example  shape.FillCode = Anibody.shapes.GetGradientCode("white", "#eb5", "rgb(0,75, 150)", "rgba(60,40,20,0.2)");
 * @returns {Array}
 */
Anibody.shapes.GetGradientCode = function (/*strings of color-codes*/) {

   
    var len = arguments.length;
        
    if(len <= 0) return [];
    if(len===1) return [{ stop: 1, color: arguments[0] }];

    
    var step = 1 / (len-1);
    var stops = [0];
    var i;
    for(i=1; i<len-1; i++){
        stops.push(step*i);
    }
    stops.push(1);

    for(i=0; i<len;i++){
        stops[i] = { stop: stops[i], color: arguments[i] };
    }

    return stops;
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
Anibody.shapes.Rectangle = function Rectangle(x, y, width, height) { // Rectangle class
    Anibody.shapes.Shape.call(this, 
        x, y,
        x + width, y, 
        x + width, y + height,
        x, y + height
    );
};

Anibody.shapes.Rectangle.prototype = Object.create(Anibody.shapes.Shape.prototype);
Anibody.shapes.Rectangle.prototype.constructor = Anibody.shapes.Rectangle;

Object.defineProperty(Anibody.shapes.Rectangle, "name", { value: "Rectangle" });