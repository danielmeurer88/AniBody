Anibody.SetPackage("Anibody", "visual");

/**
 * Presents an ABO-Instance as a widget
 * @param {type} abo
 * @returns {ABOPresenter}
 */
Anibody.visual.ABOPresenter = function ABOPresenter(abo){
    Anibody.classes.Widget.call(this);
    
    this.X=0;
    this.Y=0;
    this.Width;
    this.Height;
    
    if(abo instanceof Anibody.classes.ABO){
        this.ABO = abo;
        this._ready = true;
    }else
        this._ready = false;
    
    this.ContentBox = {
        x:0,
        y:0,
        width:0,
        height:0
    };
    
    this.Rounding = Anibody.visual.ABOPresenter.prototype.DefaultRounding;
    
    this.OKBox = {
        x:0,
        y:0,
        width:120,
        height:40
    };
    
    this.IsMouseOverOK = false;
    this.IsMouseOverContent = false;
    
    // a function-object, that is called before the start of the presenter (the this-variable relates to the ABO-Object)
    this.StartFunction = false;
    // a function-object, that is called before the stop of the presenter (the this-variable relates to the ABO-Object)
    this.StopFunction = false;
    
    this.Opacity = 0;
    
    this._ref_mhan = null;
    
this.Initialize();
};

Anibody.visual.ABOPresenter.prototype = Object.create(Anibody.classes.Widget.prototype);
Anibody.visual.ABOPresenter.prototype.constructor = Anibody.visual.ABOPresenter;

Anibody.visual.ABOPresenter.prototype.ContentBoxColor = "#999";
Anibody.visual.ABOPresenter.prototype.BoxBorderColor = "black";
Anibody.visual.ABOPresenter.prototype.OKBoxColor = "#ccc";
Anibody.visual.ABOPresenter.prototype.OKBoxFontColor = "#fff";
Anibody.visual.ABOPresenter.prototype.OutsideColor = "rgba(0,0,0,0.8)";
Anibody.visual.ABOPresenter.prototype.DefaultRounding = 10;
Anibody.visual.ABOPresenter.prototype.DefaultFontHeight = 18;

/**
 * @see README_DOKU.txt
 */
Anibody.visual.ABOPresenter.prototype.Initialize = function () {
    
    if(!this._ready) return;
    
    this._recalculateSizes();
    
};
/**
 * recalculate the necessary size of the Presenter. It is possible that the ABO-instance
 * @returns {undefined}
 */
Anibody.visual.ABOPresenter.prototype._recalculateSizes = function () {
    
    var margin = 5;    
    var can = this.Engine.Canvas;
    
    this.Width = can.width;
    this.Height = can.height;

    this.ContentBox.width = this.ABO.Width;
    this.ContentBox.height = this.ABO.Height + this.OKBox.height + 2*margin;
    
    this.ContentBox.x = can.width/2 - this.ContentBox.width/2;
    this.ABO.X = this.ContentBox.x;
    this.ContentBox.y = can.height/2 - this.ContentBox.height/2;
    this.ABO.Y = this.ContentBox.y;
    
    // 
    this.OKBox.x = this.ContentBox.x+(this.ContentBox.width/2) - this.OKBox.width/2;
    this.OKBox.y = this.ContentBox.y+this.ContentBox.height - this.OKBox.height - margin;
    
};
/**
 * creates a foreground draw function object, that is ready to be registered
 * @returns {object}
 */
Anibody.visual.ABOPresenter.prototype.Draw = function(c){
    
        c.save();

        c.globalAlpha = this.Opacity;
        c.fillStyle = this.OutsideColor;
        c.fillRect(0,0,c.canvas.width, c.canvas.height);
        
        
        var box = this.ContentBox;
        c.beginPath();
        c.variousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding);
        c.clip();
        
        c.fillStyle = this.ContentBoxColor;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, 0);

        this.ABO.Draw(c);

        c.restore();
        c.save();

        var box = this.OKBox;
        c.fillStyle = this.OKBoxColor;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding/3*2);
        c.setFontHeight(box.height*0.5);
        c.fillStyle = this.OKBoxFontColor;
        c.fillSpinnedText(box.x + box.width/2, box.y + box.height/2,"Verstanden",0);
        c.restore();
        
        c.save();
        c.strokeStyle = this.BoxBorderColor;
        c.lineWidth = 5;
        
        var box = this.ContentBox;
        c.strokeVariousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding);
        c.restore();
        
};
/**
 * creates a process input function object, that is ready to be registered
 * @returns {object}
 */
Anibody.visual.ABOPresenter.prototype.ProcessInput = function(){
    
        this.ABO.ProcessInput();
        
        var box = this.ContentBox;
        var area = {
            x:box.x, y:box.y, width:box.width, height:box.height, rounding:0,
            type:"rrect",
            background:true
        };
        
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverContent");
        
        box = this.OKBox;
        area = {
            x:box.x, y:box.y, width:box.width, height:box.height, rounding:0,
            type:"rrect"
        };
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverOK");

};
/**
 * creates a update function object, that is ready to be registered
 * @returns {object}
 */
Anibody.visual.ABOPresenter.prototype.Update = function(){
        this.ABO.Update();
        this._recalculateSizes();
                
        if(this.IsMouseOverOK)
            this.Engine.Input.Mouse.Cursor.Set("pointer");
        
};
/**
 * creates a Mouse handler object, that is ready to be registered
 * @returns {object}
 */
Anibody.visual.ABOPresenter.prototype._createMouseHandlerObject = function(){
    
    var f = function(e){
        
        e.Handled = true;
        
        if(this.IsMouseOverOK){
            this.Stop();
        }
        
        if(!this.IsMouseOverContent){
            this.Stop();
        }
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};

/**
 * Starts/Opens the Presenter dialog box
 * @param {Callback-Object} abostartfunc - sets the start function (optional)
 * @param {Callback-Object} abostopfunc - sets the stop function (optional)
 * @returns {undefined}
 */
Anibody.visual.ABOPresenter.prototype.Start = function (abostartfunc, abostopfunc) {
    this.Active = true;
    var found =false;
    
    var abo = this.ABO;
    
    if(typeof abostartfunc !== "undefined"){
        this.StartFunction = abostartfunc;
        Anibody.CallObject(abostartfunc);
        found=true;
    }
    if(!found && this.StartFunction){
        Anibody.CallObject(this.StartFunction);
    }
    
    if(typeof abostopfunc !== "undefined")
        this.StopFunction = abostopfunc;
    
    new Anibody.util.Flow(this, "Opacity", 1, 600,{
        that:this, parameter:true, function: function(p){}
    }).Start();
    
    this.Register(); // Widget-Methode
    
    var mhand = this._createMouseHandlerObject();
    this._ref_mhan = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick",mhand);
    
};
/**
 * Stops the presenter dialog - will be called by the class
 * @returns {undefined}
 */
Anibody.visual.ABOPresenter.prototype.Stop = function () {
    this.Active = false;
    
    if(this.StopFunction)
       Anibody.CallObject(this.StopFunction);
    
    this.Deregister(); // Widget-Methode
    
    this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref_mhan);
    this._ref_mhan = null;

};
/**
 * Sets the StartFunction (a function, that is called before the stop of the presenter
 * @param {Callback-Object} startcbo
 * @returns {undefined}
 */
Anibody.visual.ABOPresenter.prototype.SetStartFunction = function (startcbo) {
    this.StartFunction = startcbo;
};
/**
 * Sets the StopFunction (a function, that is called before the stop of the presenter
 * @param {Callback-Object} stopcbo
 * @returns {undefined}
 */
Anibody.visual.ABOPresenter.prototype.SetStopFunction = function (stopcbo) {
    this.StopFunction = stopcbo;
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/**
 * renders an animation by using a sprite image ( an image that consists of many
 * single images in a row )
 * @param {number} x
 * @param {Number} y
 * @param {string} codename - the codename of the sprite image
 * @param {Number} numpics - how many single images exist
 * @param {Number} jumpevery - how many frames will pass until this class jumps to the next single image
 * @returns {Animation}
 */
Anibody.visual.Animation = function Animation(x, y, codename, numpics, jumpms, reverseAfter) {
    Anibody.classes.ABO.call(this);
    this.Type = "Animation";

    if(typeof reverseAfter === "undefined")
        reverseAfter = false;

    this.Direction = "left"; // "down" should also be possible later
    this.ReverseAfter = reverseAfter;
    this._countingUp = true;

    this.Active = false;

    this.X = x;
    this.Y = y;

    this.FullImage;
    this.Width = 0;
    this.Height = 0;

    this.Images = [];
    this.ImageIndex = 0;
    this.NumberOfPictures = numpics;

    this.MS = jumpms;
    this.Scale = 1;

    this.Codename = codename;
    this.Active = false;
    this.Infinite = true;
    this.Iterations = 0;
    
    this.CallbackObject = {that:this,function:function(p){},parameter:"default"};
    
    this.MaxIterations = false;
    
    this._ref = null;

this.Initialize();
};

Anibody.visual.Animation.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.Animation.prototype.constructor = Anibody.visual.Animation;

/**
 * @description Getter
 */
Object.defineProperty(Anibody.visual.Animation.prototype, "Image", {get: function () {
        return this.Images[this.ImageIndex = 0];
}});
/**
 * @see README_DOKU.txt
 */
Anibody.visual.Animation.prototype.Initialize = function () {
    
    this.FullImage = this.Engine.MediaManager.GetImage(this.Codename);
    if (this.FullImage) {

        if (this.Direction == "left") {

            this.Height = this.FullImage.height;
            this.Width = this.FullImage.width / this.NumberOfPictures;

            // creating an offscreen canvas with the specific width and height
            var can = document.createElement("CANVAS");
            can.width = this.Width;
            can.height = this.Height;
            var c = can.getContext("2d");
            var url;
            
            for(var i=0; i<this.NumberOfPictures; i++){
                c.clearRect(0,0,can.width,can.height);
                c.drawImage(this.FullImage,
                    can.width*i, 0, can.width, can.height,
                    0,0,can.width, can.height      
                );
        
                url = can.toDataURL();
                this.Images[i] = document.createElement("IMG");
                this.Images[i].src = url;
            }
        }
    }
};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.Animation.prototype.Draw = function (c) {
    if(!this.FullImage || !this.Active)
        return;
    c.drawImage(this.Images[this.ImageIndex], this.X, this.Y, this.Width, this.Height);
};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.Animation.prototype.Update = function () {
    if(!this.FullImage)
        this.Initialize();
    
    if(!this.Infinite && this.Iterations >= this.MaxIterations){
        this.Stop();
    }
};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.Animation.prototype.Start = function () {
    this.Active = true;
    this.ImageIndex = 0;
    this.SetIntervalFunction();
};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.Animation.prototype.Stop = function () {
    this.Active = false;
    this.ClearIntervalFunction();
    Anibody.CallObject(this.CallbackObject);
};

Anibody.visual.Animation.prototype.SetCallbackObject = function (cbo) {
    this.CallbackObject = cbo;
};

/**
 * Adds a counter function, that makes sure that the animation jumps to the next picture in the row
 * everytime x frames passes. (x = this.JumpEvery)
 * @returns {undefined}
 */
Anibody.visual.Animation.prototype.SetIntervalFunction = function () {
    // register to the Engine Counter, so that 
    // the Sprite.Index increases one in every x frames, where x is specified in this.FramesBeforeJump
    var f = function (that) {
        if(that._countingUp)
            that.ImageIndex++;
        else
            that.ImageIndex--;
        
        if(that.ImageIndex >= (that.NumberOfPictures-1)){
            if(that.ReverseAfter){
                that._countingUp = false;
            }else{
                that.Iterations++;
                that.ImageIndex = 0;
            }
        }
        
        if(that.ImageIndex <= 0 && !that._countingUp){
                that.Iterations++;
                that.ImageIndex = 0;
                that._countingUp = true;
        }
    };
    this._ref = window.setInterval(f, this.MS, this);
    
};
/**
 * Removes the counter function
 * @returns {undefined}
 */
Anibody.visual.Animation.prototype.ClearIntervalFunction = function () {
    window.clearInterval(this._ref);
};

Anibody.visual.Animation.prototype.SetMaxIterations = function (i) {
    this.MaxIterations = i;
    this.Infinite = false;
};

/**
 * @description A still image, but position is based on the selected cam
 * @param {string} codename - String of the MediaManager codename
 * @param {number} x - x position
 * @param {number} y - y position
 * @returns {ImageObject}
 */
Anibody.visual.ImageObject = function ImageObject(codename, x, y/* (optional), scale*/) {
    Anibody.classes.ABO.call(this);
    this.X = x;
    this.Y = y;
    this.Codename = codename;
    this.Image = false;
    this.Width = 0;
    this.Height = 0;

    if (arguments.length > 3)
        this.Scale = arguments[3];
    else
        this.Scale = 1;

this.Initialize();    
};

Anibody.visual.ImageObject.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.ImageObject.prototype.constructor = Anibody.visual.ImageObject;
/**
 * @see README_DOKU.txt
 */
Anibody.visual.ImageObject.prototype.Initialize = function () {
        
    if(typeof this.Codename === "string"){
        this.Image = this.Engine.MediaManager.GetImage(this.Codename);
    }
    else
        this.Image = this.Codename;
    
    this.Width = this.Image.width;
    this.Height = this.Image.height;
};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.ImageObject.prototype.Draw = function (c) {
    var cam = this.Engine.Camera.SelectedCamera;
    
    if (this.Image)
        c.drawImage(this.Image, this.X - cam.X, this.Y - cam.Y, this.Image.width * this.Scale, this.Image.height * this.Scale);
    else
        c.fillRect(this.X - cam.X, this.Y - cam.Y, this.Image.width * this.Scale, this.Image.height * this.Scale);
};
/**
 * @see README_DOKU.txt
 */
Anibody.visual.ImageObject.prototype.Update = function () {
    if(this.Width === 0 || this.Height === 0){
        this.Width = this.Image.width;
        this.Height = this.Image.height;
    }
};

Anibody.visual.ImageObject.prototype.FlowScale = function (to) {
    // TODO
};

Anibody.visual.ImageObject.prototype.FlowMove = function (tox, toy) {
    // TODO
};

/**
 * Represents a string
 * @param {string} txt
 * @param {number} x 
 * @param {number} y
 * @param {number} fh
 * @returns {ABText}
 */
Anibody.visual.ABText = function ABText(txt, x, y, fh) {
    Anibody.classes.ABO.call(this);
    this.X = x;
    this.Y = y;
    this.Width = false;
    this.Height = false;
    this.Text = txt;
    this.TextWidth = 0;
    this.FontHeight = fh || 20;

    this.Underline = false;
    this.TextAlign = "left";
    this.TextBaseline = "top";

    this.Color = ABText.prototype.DefaultFontColor;

    this.Initialize();
};
Anibody.visual.ABText.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.visual.ABText.prototype.constructor = Anibody.visual.ABText;

Anibody.visual.ABText.prototype.DefaultFontColor = "black";

/**
 * @see README_DOKU.txt
 */
Anibody.visual.ABText.prototype.Initialize = function () {
    this.Resize();
};

/**
 * Calculates the values for the new text
 * @returns {undefined}
 */
Anibody.visual.ABText.prototype.Resize = function () {
    this.Height = this.FontHeight;
    var c = this.Engine.Context;
    c.save();
    c.setFontHeight(this.FontHeight);
    this.TextWidth = c.measureText(this.Text).width;
    this.Width = this.TextWidth;
    c.restore();
};

/**
 * @see README_DOKU.txt
 */
Anibody.visual.ABText.prototype.Draw = function (c) {

    c.save();
    c.setFontHeight(this.FontHeight);
    c.textAlign = this.TextAlign;
    c.textBaseline = this.TextBaseline;

    c.fillStyle = this.Color;
    c.fillText(this.Text, this.X, this.Y);

    if (this.Underline) {
        var offx = 0;
        var offy = 0;
                
        if(this.TextBaseline === "middle"){
            offy -= this.Height/2;
        }
        
        if(this.TextBaseline === "bottom"){
            offy -= this.Height;
        }
                
        if(this.TextAlign === "center"){
            offx = 0 - this.Width/2;
        }
        
        if(this.TextAlign === "right"){
            offx = 0 - this.Width;
        }
        
        c.lineWidth = this.FontHeight / 15;
        c.strokeStyle = this.Color;
        c.beginPath();
        c.moveTo(this.X + offx, this.Y + this.Height + offy);
        c.lineTo(this.X + this.Width + offx, this.Y + this.Height + offy);
        c.stroke();
        c.closePath();
    }

    c.restore();
};
/**
 * Sets the text
 * @param {string} txt
 * @returns {undefined}
 */
Anibody.visual.ABText.prototype.SetText = function (txt) {
    this.Text = txt;
    this.Resize();
};

Anibody.visual.ABText.prototype.FlowResize = function (to, ms, cbo) {
    // TODO
    new Anibody.util.Flow(this, "FontHeight", to, ms, cbo, function(){
        this.Resize();
    }.getCallbackObject(this)).Start();
};

Anibody.visual.ABText.prototype.FlowMove = function (tox, toy, ms, cbo) {
    // TODO
    new Anibody.util.MultiFlow(
            [this, this],
            ["X", "Y"],
            [tox, toy],
            ms, cbo
        ).Start();
};