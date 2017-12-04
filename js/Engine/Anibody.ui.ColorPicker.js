Anibody.SetPackage("Anibody", "ui");

/**
 * A class which opens a dialog box that allows the user to select a certain color
 * @param {type} x the amount of pixels from the canvas nullpoint to the dialog box 
 * @param {type} y the amount of pixels from the canvas nullpoint to the dialog box 
 * @param {type} width the width of the dialog box, which will be the height too
 * @param {type} cpcbo a Callback-Object, which contents the function, which will be trigged when the user selects a color and presses ok
 * @returns {ColorPicker}
 */
Anibody.ui.ColorPicker = function ColorPicker(x,y,width, cpcbo){
    Anibody.Widget.call(this);
    
    this.ColorPickedCallbackObject = cpcbo;
    
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = width;
    
    this.BasicColor = "black"; // the currently selected color of the strip
    this.PickedColor = "black"; // the currently selected color of the picker
    // which will be the color the user wants to use
    
    // FLAGS
    this.IsMouseOverPicker = false;
    this.IsMouseOverBox = false;
    this.IsMouseOverStrip = false;
    this.IsMouseOverPreview = false;
    
    this.Padding = 10; // the space among the boxes and the outside frame
    
    // the coords of the 3 main areas
    this.Box = {
        x : x + this.Padding ,
        y : y + this.Padding,
        width : this.Height*0.7,
        height : this.Height*0.7 - this.Padding
    };
    this.Strip = {
        x : this.Box.x + this.Box.width + this.Padding ,
        y : y + this.Padding,
        width : width - this.Box.width - 3*this.Padding,
        height : this.Height - 2*this.Padding
    };
    
    this.Preview = {
        x : x + this.Padding ,
        y : y + this.Padding + this.Height*0.7,
        width : this.Box.width,
        height : this.Height*0.3 - this.Padding*2
    };
    
    // the canvas gradients, which will be used to display the range of colors
    this.StripGradient = false;
    this.WhiteGradient = false;
    this.BlackGradient = false;
    
    // the opacity of the color picker - used to blend it in and out instead of
    // instantly opening and closing it
    this.Opacity = 0;
    
    // the reference number of the left mouse click-handler
    this._ref;
    
this.Initialize();
}
Anibody.ui.ColorPicker.prototype = Object.create(Anibody.Widget.prototype);
Anibody.ui.ColorPicker.prototype.constructor = Anibody.ui.ColorPicker;

/**
 * @see README_DOKU.txt
 */
Anibody.ui.ColorPicker.prototype.Initialize = function () {
    
    var c = this.Engine.Context;
    this.StripGradient = c.createLinearGradient(
                        this.Strip.x, this.Strip.y,
                        this.Strip.x, this.Strip.y + this.Strip.height-1);
    this.StripGradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
    this.StripGradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
    this.StripGradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
    this.StripGradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
    this.StripGradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
    this.StripGradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
    this.StripGradient.addColorStop(1, 'rgba(255, 0, 0, 1)');
    
    this.WhiteGradient = c.createLinearGradient(this.Box.x+1, this.Box.y, this.Box.x + this.Box.width -2, this.Box.y);
    this.WhiteGradient.addColorStop(0, 'rgba(255,255,255,1)');
    this.WhiteGradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    this.BlackGradient = c.createLinearGradient(this.Box.x, this.Box.y+1, this.Box.x, this.Box.y+this.Box.height-2);
    this.BlackGradient.addColorStop(0, 'rgba(0,0,0,0)');
    this.BlackGradient.addColorStop(1, 'rgba(0,0,0,1)');
};

/**
 * draws the current state of the color picker
 * @param {type} c the context of the canvas the color picker belongs to
 * @returns {undefined}
 */
Anibody.ui.ColorPicker.prototype.Draw = function(c, noborder){

    if(this.Opacity == 0) return;
    
    c.save();
    
    if(typeof noborder==="undefined")
        noborder = false;
    
    // PICKER
    c.strokeRect(this.X, this.Y, this.Width, this.Height);
    c.fillStyle = "#999";
    c.fillRect(this.X, this.Y, this.Width, this.Height);
    
    // COLOR BOX
    c.fillStyle = this.BasicColor;
    c.fillRect(this.Box.x, this.Box.y, this.Box.width, this.Box.height);

    c.fillStyle = this.WhiteGradient;
    c.fillRect(this.Box.x, this.Box.y, this.Box.width, this.Box.height);
    c.fillStyle = this.BlackGradient
    c.fillRect(this.Box.x, this.Box.y, this.Box.width, this.Box.height);
    
    if(!noborder){
        c.strokeStyle = "black";
        c.strokeRect(this.Box.x, this.Box.y, this.Box.width, this.Box.height);
    }
    
    // STRIP
    c.fillStyle = this.StripGradient;
    c.fillRect(this.Strip.x, this.Strip.y, this.Strip.width, this.Strip.height);
    
    if(!noborder){
        c.strokeStyle = "black";
        c.strokeRect(this.Strip.x, this.Strip.y, this.Strip.width, this.Strip.height);
    }
    
    // PREVIEW
    var pr = this.Preview;
    // - background
    c.fillStyle = this.PickedColor;
    c.fillRect(pr.x, pr.y, pr.width, pr.height);
    // - OK
    c.font = "bold " + pr.height*2/3 + "px sans-serif";
    c.fillStyle = "white";
    c.fillSpinnedText(pr.x + pr.width/2, pr.y + pr.height/2, "OK", 0);
    c.strokeStyle = "black";
    c.lineWidth = pr.height / 25;
    c.strokeSpinnedText(pr.x + pr.width/2, pr.y + pr.height/2, "OK", 0);
    // - frame
    c.strokeStyle = "black";
    c.lineWidth = 1;
    c.strokeRect(pr.x, pr.y, pr.width, pr.height);
    
    c.restore();
};

/**
 * Register the needed behaviour to the left mouse click and saves the reference number
 * Function is used when the color picker is showed to the user
 * @returns {undefined}
 */
Anibody.ui.ColorPicker.prototype.AddMouseHandler = function(){

    this._ref = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", {
        parameter: this.Engine,
        that: this,
        function: function (e, engine) {
            
            if(!this.IsMouseOverPicker) this.Hide();
            
            var mpos = this.Engine.Input.Mouse.Position.Relative;
            var x,y;
            x = mpos.X;
            y = mpos.Y;
            
            if (this.IsMouseOverStrip) {
                e.Handled = true;
                this.ClickOnStrip(x,y);
            }

            if (this.IsMouseOverBox) {
                e.Handled = true;
                this.ClickOnBox(x,y);
            }
            
            if (this.IsMouseOverPreview) {
                e.Handled = true;
                this.ClickOnPreview();
            }
        }
    }, 1001);

};

/**
 * deregister the behaviour which refers to the given number.
 * Function is used when color picker is hidden
 * @returns {undefined}
 */
Anibody.ui.ColorPicker.prototype.RemoveMouseHandler = function(){this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref);};
/**
 * @see README_DOKU.txt
 */
Anibody.ui.ColorPicker.prototype.Update = function(){
    // no need for updating if the color picker is not being shown
    if(this.Opacity == 0) return;
    
    // changes to the specific cursor appearance according to the position
    if(this.IsMouseOverBox || this.IsMouseOverStrip)
        this.Engine.Input.Mouse.Cursor.Set("crosshair");
    
    if(this.IsMouseOverPreview)
        this.Engine.Input.Mouse.Cursor.Set("pointer");
    
};
/**
 * @see README_DOKU.txt
 */
Anibody.ui.ColorPicker.prototype.ProcessInput = function(){
    // no need for updating if the color picker is not being shown
    if(this.Opacity == 0) return;
    
    // requesting a true-value if the mouse over the color picker...
    var area = this.GetArea();
    // ...regardless if the picker is the highest area or not ( it can also be in the background)
    area.background = true;
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverPicker");
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    area = {
        x: this.Preview.x, 
        y: this.Preview.y,
        width : this.Preview.width,
        height : this.Preview.height,
        type : "rect"
    };
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverPreview");
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
     area = {
        x: this.Box.x +1, 
        y: this.Box.y +1,
        width : this.Box.width -2,
        height : this.Box.height -2,
        type : "rect"
    };
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverBox");
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
     area = {
        x: this.Strip.x +1, 
        y: this.Strip.y +1,
        width : this.Strip.width -2,
        height : this.Strip.height -2,
        type : "rect"
    };
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverStrip");
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
};
/**
 * @see README_DOKU.txt
 */
Anibody.ui.ColorPicker.prototype.Show = function(){
    
    this.Register(); // Widget.Register()
    new Anibody.util.Flow(this, "Opacity", 1, 1000, {that:this, function:function(){
            this.AddMouseHandler();
    }}).Start();
};
/**
 * @see README_DOKU.txt
 */
Anibody.ui.ColorPicker.prototype.Hide = function(){
    this.Opacity = 0;
    this.RemoveMouseHandler();
    this.Deregister(); // Widget.Deregister()
};
/**
 * the user clicked on the strip and on a color which will be displayed in the box in more shades
 * @param {type} x the x-position of the click
 * @param {type} y the y-position of the click
 * @returns {undefined}
 */
Anibody.ui.ColorPicker.prototype.ClickOnStrip = function(x,y){
    
    var c = this.Engine.Context;
    this.Draw(c, true); // drawing without borders, which could ruin the selection
    var imageData = c.getImageData(x, y, 1, 1).data;
    var rgbCode = "rgb(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + ")";
    this.PickedColor = rgbCode;
    this.BasicColor = rgbCode;
};
/**
 * the user clicked on the box and on a color which will be the background of the preview button
 * @param {type} x the x-position of the click
 * @param {type} y the y-position of the click
 * @returns {undefined}
 */
Anibody.ui.ColorPicker.prototype.ClickOnBox = function(x,y){
    var c = this.Engine.Context;
    this.Draw(c, true); // drawing without borders, which could ruin the selection
    var imageData = c.getImageData(x, y, 1, 1).data;
    var rgbCode = "rgb(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + ")";
    this.PickedColor = rgbCode;
};
/**
 * the user clicked on the previes / ok - button.
 * the color picker will be closed and the callback function will be called
 * @returns {undefined}
 */
Anibody.ui.ColorPicker.prototype.ClickOnPreview = function(){
    var cb = this.ColorPickedCallbackObject;
    this.Hide();
    if(cb){
        cb.function.call(cb.that, this.PickedColor, cb.parameter);
    }
};
/**
 * saves a callback-function object, which consists of a function, which is called when the user
 * successfully chooses a color
 * @param {type} cbo callback-function object
 * @returns {undefined}
 */
Anibody.ui.ColorPicker.prototype.SetColorPickedCallbackObject = function(cbo){
    this.ColorPickedCallbackObject = cbo;
};