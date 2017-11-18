/**
 * Represents a Slider, which can be dragged within the
 * length (from x to x+width) by the user. 
 * @param {type} x the x value of the Slider line 
 * @param {type} y the y value of the Slider line 
 * @param {type} width - the length of the slider line
 * @param {type} height the height of the handle
 * @returns {Slider}
 */
function Slider(x,y,width,height){
    Anibody.classes.ABO.call(this);
    
    this.X = x;
    this.Y = y
    this.Width = width;
    this.Height = height;
    
    this.OnValueChangeCBO = false;
    
    this.Handle = {
        x : x,
        width : 10,
        height : height
    };
    
    this._oldValue;
    this.Value = 0;
    this.ValueLimits = [0.2, 2];
    
    this.DecimalDigits = 1;
    
    this._dragging = false;
    
    this.IsMouseOverSliderHandle = false;
    this.IsMouseOver = false;
    
    this._ref = null;
    this._ref_mh = null;
    
    this._noValueChange = false;
    
    this.Color = Slider.prototype.DefaultColor;
    
this.Initialize();
}
Slider.prototype = Object.create(Anibody.classes.ABO.prototype);
Slider.prototype.constructor = Slider;

Slider.prototype.DefaultColor = "rgba(100,100,120,1)";
/**
 * @see README_DOKU.txt
 */
Slider.prototype.Initialize = function(){
    this.AddProcessInputFunction();
    this.AddMouseHandler();
};
/**
 * adds the process input function that enables the dragging the handler
 * @returns {undefined}
 */
Slider.prototype.AddProcessInputFunction = function(){

    this._ref = this.Engine.AddProcessInputFunction({
        parameter: this.Engine,
        that: this,
        function: function (engine) {
                        
            var mouse = engine.Input.Mouse;
            
            if(this.IsMouseOverSliderHandle && mouse.Left.Down){
                this._dragging = true;
            }
            
            if(mouse.Left.Up)
                this._dragging = false;
            
        }
    }, 2);

};
/**
 * Removes process input function
 * @returns {undefined}
 */
Slider.prototype.RemoveProcessInputFunction = function(){this.Engine.RemoveProcessInputFunction(this._ref);};

/**
 * @see README_DOKU.txt
 * fulfills the user expectations - when user clicks on the slide bar the handler jumps to the mouse and changes to the correct value
 */
Slider.prototype.AddMouseHandler = function(){
    this._ref_mh = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", {
        parameter: this.Engine,
        that: this,
        function: function (e, engine) {

            if (this.IsMouseOver && !this.IsMouseOverSliderHandle) {
                e.GoThrough = false;
                // x value of the click
                var x = e.Mouse.Position.Camera.X - this.X;
                // x value of the slider bar in percent
                var quotient = Math.round( x / this.Width * 100) / 100; 
                
                var value = (quotient * (this.ValueLimits[1] - this.ValueLimits[0])) + this.ValueLimits[0];
                
                this.SetValue(value);
            }
            
        }
    }, 4);
};
/**
 * @see README_DOKU.txt
 */
Slider.prototype.RemoveMouseHandler = function(){this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref_mh);};

/**
 * Only needed if the user is dragging the handler. Calculates the position of
 * the handle on the slider as a procentual value and calculates the actual
 * value regarding the limits
 * @returns {undefined}
 */
Slider.prototype.Update = function(){
    
    var m = this.Engine.Input.Mouse.Position;
    
    if(this._dragging){
        var md = m.Delta;
        this.Handle.x += md.X;
        
        if(this.Handle.x < this.X)
            this.Handle.x = this.X;
        
        if(this.Handle.x > this.X + this.Width)
            this.Handle.x = this.X + this.Width;
        
        var quotient = (this.Handle.x - this.X) / this.Width;
        
        this.Value = (this.ValueLimits[1] - this.ValueLimits[0])*quotient + this.ValueLimits[0];
        
        if(this.DecimalDigits > 0)
            this.Value = Math.round(this.Value * Math.pow(10,this.DecimalDigits)) / Math.pow(10,this.DecimalDigits);
        else
            this.Value = Math.round(this.Value);
        
        if(this.OnValueChangeCBO){
            if(this._noValueChange)
                this.ResetValue();
            var o = this.OnValueChangeCBO;
            o.function.call(o.that, this.Value);
        }
    }

    if(this.IsMouseOverSliderHandle)
        if(this._noValueChange){
            this.Engine.Input.Mouse.Cursor.not_allowed();
        }
        else{
            this.Engine.Input.Mouse.Cursor.pointer();
        }
        
    this._oldValue = this.Value;
};
/**
 * @see README_DOKU.txt
 */
Slider.prototype.ProcessInput = function(){
    
    var area = {
        x: this.X,
        y: this.Y - this.Handle.height/2,
        width : this.Width,
        height : this.Handle.height,
        type : "rect"
    };
    
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOver");
    
    var area = {
        x: this.Handle.x - this.Handle.width / 2,
        y: this.Y - this.Handle.height / 2,
        width : this.Handle.width,
        height : this.Handle.height,
        rounding : 2,
        type : "rrect"
    };
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverSliderHandle");
    
};

/**
 * Draws the slider
 * TODO: a possibility to externally change the appearance of the slider
 * @param {type} c context of the canvas
 * @returns {undefined}
 */
Slider.prototype.Draw = function(c){
    c.save();
    
    // Slider
    c.fillStyle = this.Color;
    c.beginPath();
    c.moveTo(this.X, this.Y);
    c.lineTo(this.X + this.Width, this.Y);
    c.closePath();
    c.stroke();
    // Handle
    var x = this.Handle.x - this.Handle.width / 2;
    var y = this.Y - this.Handle.height / 2;
    c.fillVariousRoundedRect(x, y, this.Handle.width, this.Handle.height, 2);
    c.strokeVariousRoundedRect(x, y, this.Handle.width, this.Handle.height, 2);
    
    c.restore();
};

/**
 * Returns the calculated value
 * @returns {Number}
 */
Slider.prototype.GetValue = function(){
    return this.Value;
};

/**
 * Sets a new value for the class and also changes the handle's position accordingly 
 * @param {Number} v - new value
 * @returns {boolean} true if successful
 */
Slider.prototype.SetValue = function(v){
    
    if(v < this.ValueLimits[0] || v > this.ValueLimits[1])
        return false;
    
    this.Value = v;
    if(this.DecimalDigits > 0)
            this.Value = Math.round(this.Value * Math.pow(10,this.DecimalDigits)) / Math.pow(10,this.DecimalDigits);
        else
            this.Value = Math.round(this.Value);
    
    // quotient
    var quotient = (this.Value - this.ValueLimits[0]) / (this.ValueLimits[1] - this.ValueLimits[0]);
        
    this.Handle.x = quotient * this.Width + this.X;
    
    if(this.OnValueChangeCBO){
        var o = this.OnValueChangeCBO;
        o.function.call(o.that, this.Value);
    }
    return true;
};

/**
 * Sets the lowest and highest possible value the slider is able to calculate
 * and sets the current value to the lowest limit
 * @param {Number} low
 * @param {Number} high
 * @returns {undefined}
 */
Slider.prototype.SetLimits = function(low, high){
    this.ValueLimits = [low, high];
    this.Value = low;
    this.Handle.x = this.X;
    
    if(this.OnValueChangeCBO){
        var o = this.OnValueChangeCBO;
        o.function.call(o.that, this.Value);
    }
};

/**
 * Sets old value
 * @returns {undefined}
 */
Slider.prototype.ResetValue = function(){
    this.SetValue(this._oldValue);
};