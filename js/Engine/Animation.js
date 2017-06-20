/**
 * Presents an ABO-Instance as a dialog
 * @param {type} abo
 * @returns {ABOPresenter}
 */
function ABOPresenter(abo){
    ABO.call(this);
    
    this.X=0;
    this.Y=0;
    this.Width;
    this.Height;
    
    if(abo instanceof ABO){
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
    
    this.Rounding = ABOPresenter.prototype.DefaultRounding;
    
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
    
    this._ref_ip = null;
    this._ref_draw = null;
    this._ref_upd = null;
    this._ref_mhan = null;
    
this.Initialize();
}
ABOPresenter.prototype = Object.create(ABO.prototype);
ABOPresenter.prototype.constructor = ABOPresenter;

ABOPresenter.prototype.ContentBoxColor = "#999";
ABOPresenter.prototype.BoxBorderColor = "black";
ABOPresenter.prototype.OKBoxColor = "#ccc";
ABOPresenter.prototype.OKBoxFontColor = "#fff";
ABOPresenter.prototype.OutsideColor = "rgba(0,0,0,0.8)";
ABOPresenter.prototype.DefaultRounding = 10;
ABOPresenter.prototype.DefaultFontHeight = 18;

/**
 * Can be seen as an extension of the constructor function
 * @returns {undefined}
 */
ABOPresenter.prototype.Initialize = function () {
    
    if(!this._ready) return;
    
    this._recalculateSizes();
    
};
/**
 * recalculate the necessary size of the Presenter. It is possible that the ABO-instance
 * @returns {undefined}
 */
ABOPresenter.prototype._recalculateSizes = function () {
    
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
ABOPresenter.prototype._createForegroundDrawFunctionObject = function(){
    
    var f = function(c){
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
    
    return {that:this, function:f, parameter: this.Engine.Context};
};
/**
 * creates a process input function object, that is ready to be registered
 * @returns {object}
 */
ABOPresenter.prototype._createProcessInputFunctionObject = function(){
    
    var f = function(en){
        
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
    
    return {that:this, function:f, parameter: this.Engine};
};
/**
 * creates a update function object, that is ready to be registered
 * @returns {object}
 */
ABOPresenter.prototype._createUpdateFunctionObject = function(){
    
    var f = function(en){
        
        this.ABO.Update();
        this._recalculateSizes();
                
        if(this.IsMouseOverOK)
            this.Engine.Input.Mouse.Cursor.Set("pointer");
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};
/**
 * creates a Mouse handler object, that is ready to be registered
 * @returns {object}
 */
ABOPresenter.prototype._createMouseHandlerObject = function(){
    
    var f = function(e){
        
        e.GoThrough = false;
        
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
 * @returns {undefined}
 */
ABOPresenter.prototype.Start = function (abostartfunc, abostopfunc) {
    this.Active = true;
    var found =false;
    
    var abo = this.ABO;
    
    if(typeof abostartfunc !== "undefined"){
        this.StartFunction = abostartfunc;
        Callback.CallObject(abostartfunc);
        found=true;
    }
    if(!found && this.StartFunction){
        Callback.CallObject(this.StartFunction);
    }
    if(typeof abostopfunc !== "undefined")
        this.StopFunction = abostopfunc;
    
    new Flow(this, "Opacity", 1, 600,{
        that:this, parameter:true, function: function(p){}
    }).Start();
    
    var ipfo = this._createProcessInputFunctionObject();
    this._ref_ip = this.Engine.AddProcessInputFunction(ipfo);
    
    var fdfo = this._createForegroundDrawFunctionObject();
    this._ref_draw = this.Engine.AddForegroundDrawFunctionObject(fdfo);
    
    var upd = this._createUpdateFunctionObject();
    this._ref_upd = this.Engine.AddUpdateFunctionObject(upd);
    
    var mhand = this._createMouseHandlerObject();
    this._ref_mhan = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick",mhand);
    
};
/**
 * Stops the presenter dialog - will be called by the class
 * @returns {undefined}
 */
ABOPresenter.prototype.Stop = function () {
    this.Active = false;
    
    if(this.StopFunction)
       Callback.CallObject(this.StopFunction);
    
    this.Engine.RemoveForegroundDrawFunctionObject(this._ref_draw);
    this._ref_draw = null;
    this.Engine.RemoveUpdateFunctionObject(this._ref_upd);
    this._ref_upd = null;
    this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref_mhan);
    this._ref_mhan = null;
    this.Engine.RemoveProcessInputFunction(this._ref_ip);
    this._ref_ip = null;
};
/**
 * Sets the StopFunction (a function, that is called before the start of the presenter
 * (the this-variable relates to the ABO-Object)
 * @param {Callback-Object} f
 * @returns {undefined}
 */
ABOPresenter.prototype.SetStartFunction = function (f) {
    this.StartFunction = f;
};
/**
 * Sets the StartFunction (a function, that is called before the stop of the presenter
 * (the this-variable relates to the ABO-Object)
 * @param {Callback-Object} f
 * @returns {undefined}
 */
ABOPresenter.prototype.SetStopFunction = function (f) {
    this.StopFunction = f;
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
function Animation(x, y, codename, numpics, jumpevery, reverseAfter) {
    ABO.call(this);
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

    this.JumpEvery = jumpevery;
    this.Scale = 1;

    this.Codename = codename;
    this.Active = false;
    this.Infinite = true;
    this.Iterations = 0;
    
    this.CallbackObject = {that:this,function:function(p){},parameter:"default"};
    
    this.MaxIterations = false;
    
    this._ref = null;

this.Initialize();
}
Animation.prototype = Object.create(ABO.prototype);
Animation.prototype.constructor = Animation;

/**
 * @description Getter
 */
Object.defineProperty(Animation.prototype, "Image", {get: function () {
        return this.Images[this.ImageIndex = 0];
}});

Animation.prototype.Initialize = function () {
    
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

Animation.prototype.Draw = function (c) {
    if(!this.FullImage || !this.Active)
        return;
    c.drawImage(this.Images[this.ImageIndex], this.X, this.Y, this.Width, this.Height);
};

Animation.prototype.Update = function () {
    if(!this.FullImage)
        this.Initialize();
    
    if(!this.Infinite && this.Iterations >= this.MaxIterations){
        this.Stop();
    }
};

Animation.prototype.Start = function () {
    this.Active = true;
    this.ImageIndex = 0;
    this.AddCounterFunction();
};
Animation.prototype.Stop = function () {
    this.Active = false;
    this.RemoveCounterFunction();
    var cbo = this.CallbackObject;
    cbo.function.call(cbo.that,cbo.parameter);
};

Animation.prototype.SetCallbackObject = function (cbo) {
    this.CallbackObject = cbo;
};

/**
 * Adds a counter function, that makes sure that the animation jumps to the next picture in the row
 * everytime x frames passes. (x = this.JumpEvery)
 * @returns {undefined}
 */
Animation.prototype.AddCounterFunction = function () {
    // register to the Engine Counter, so that 
    // the Sprite.Index increases one in every x frames, where x is specified in this.FramesBeforeJump
    var f = function (en) {
        if(this._countingUp)
            this.ImageIndex++;
        else
            this.ImageIndex--;
        
        if(this.ImageIndex >= (this.NumberOfPictures-1)){
            if(this.ReverseAfter){
                this._countingUp = false;
            }else{
                this.Iterations++;
                this.ImageIndex = 0;
            }
        }
        
        if(this.ImageIndex <= 0 && !this._countingUp){
                this.Iterations++;
                this.ImageIndex = 0;
                this._countingUp = true;
        }
    };
    this._ref = this.Engine.Counter.AddCounterFunction({
        that : this,
        parameter: this.Engine,
        function: f,
        every: this.JumpEvery
    });
};
/**
 * Removes the counter function
 * @returns {undefined}
 */
Animation.prototype.RemoveCounterFunction = function () {
    this.Engine.Counter.RemoveCounterFunction(this._ref);
};

Animation.prototype.SetMaxIterations = function (i) {
    this.MaxIterations = i;
    this.Infinite = false;
};

/**
 * @description A still image
 * @param {number} codename String of the MediaManager codename
 * @param {number} x x position
 * @param {number} y y position
 * @returns {ImageObject}
 */
function ImageObject(codename, x, y/* (optional), scale*/) {
    ABO.call(this);
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

    // flag, true: Image is part of the terrain (game)
    // false: Image position is solid, player (camera) position is not considered
    this.TerrainImage = true;

this.Initialize();    
}
ImageObject.prototype = Object.create(ABO.prototype);
ImageObject.prototype.constructor = ImageObject;
/**
 * can be seen as an extension of the constructor function
 * @returns {undefined}
 */
ImageObject.prototype.Initialize = function () {
        
    if(typeof this.Codename === "string"){
        this.Image = this.Engine.MediaManager.GetImage(this.Codename);
    }
    else
        this.Image = this.Codename;
    
    this.Width = this.Image.width;
    this.Height = this.Image.height;
};
/**
 * Draw
 * @param {2DCanvasContex} c
 * @returns {undefined}
 */
ImageObject.prototype.Draw = function (c) {
    var cam = this.Engine.Camera.SelectedCamera;
    
    if (this.Image)
        c.drawImage(this.Image, this.X - cam.X, this.Y - cam.Y, this.Image.width * this.Scale, this.Image.height * this.Scale);
    else
        c.fillRect(this.X - cam.X, this.Y - cam.Y, this.Image.width * this.Scale, this.Image.height * this.Scale);
};
/**
 * Update
 * @returns {undefined}
 */
ImageObject.prototype.Update = function () {
    if(this.Width === 0 || this.Height === 0){
        this.Width = this.Image.width;
        this.Height = this.Image.height;
    }
};
/**
 * Represents a string
 * @param {type} x
 * @param {type} y
 * @param {type} txt
 * @param {type} fh
 * @returns {ABText}
 */
function ABText(x, y, txt, fh) {
    ABO.call(this);
    this.X = x;
    this.Y = y;
    this.Width = false;
    this.Height = false;
    this.Text = txt;
    this.TextWidth = 0;
    this.FontHeight = fh || 20;

    this.Underline = false;

    this.Color = ABText.prototype.DefaultFontColor;

    this.Initialize();
}
ABText.prototype = Object.create(ABO.prototype);
ABText.prototype.constructor = ABText;

ABText.prototype.DefaultFontColor = "black";

/**
 * can be seen as an extension of the constructor function
 * @returns {undefined}
 */
ABText.prototype.Initialize = function () {
    this.Resize();
};

/**
 * Calculates the values for the new text
 * @returns {undefined}
 */
ABText.prototype.Resize = function () {
    this.Height = this.FontHeight;
    var c = this.Engine.Context;
    c.save();
    c.setFontHeight(this.FontHeight);
    this.TextWidth = c.measureText(this.Text).width;
    this.Width = this.TextWidth;
    c.restore();
};

/**
 * Draw
 * @param {2dCanvasContext} c
 * @returns {undefined}
 */
ABText.prototype.Draw = function (c) {

    c.save();
    c.setFontHeight(this.FontHeight);
    c.textAlign = "left";
    c.textBaseline = "top";

    c.fillStyle = this.Color;
    c.fillText(this.Text, this.X, this.Y);

    if (this.Underline) {
        var offset = this.FontHeight / 15;
        c.lineWidth = offset;
        c.strokeStyle = this.Color;
        c.beginPath();
        c.moveTo(this.X, this.Y + this.Height + offset);
        c.lineTo(this.X + this.Width, this.Y + this.Height + offset);
        c.stroke();
        c.closePath();
    }

    c.restore();
};

ABText.prototype.Update = function () {};
/**
 * Sets the text
 * @param {type} txt
 * @returns {undefined}
 */
ABText.prototype.SetText = function (txt) {
    this.Text = txt;
    this.Resize();
};