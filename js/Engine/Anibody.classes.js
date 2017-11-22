Anibody.SetPackage("Anibody", "classes");

/**
 * Every object used in the AniBody-Engine should derive from this class if it is used in the background
 * not visible to the user
 * @returns {EngineObject}
 */
Anibody.classes.EngineObject = function EngineObject(){
    this.EI = 0; // Engine Index (the index of the engine, to which this object belongs in the $.EngineArray!
    this.UniqueID = this._getUniqueID();
}
/**
 * @see README_DOKU.txt
 */
Anibody.classes.EngineObject.prototype.ProcessInput = function(){return false;};
/**
 * @see README_DOKU.txt
 */
Anibody.classes.EngineObject.prototype.Update = function(){return false;};

Anibody.classes.EngineObject.prototype.UniqueIDState = 0;
Anibody.classes.EngineObject.prototype._getUniqueID = function(){
    return Anibody.classes.EngineObject.prototype.UniqueIDState++;
};

// defining a default getter to the EngineObject constructor function
Object.defineProperty(Anibody.classes.EngineObject.prototype, "Engine", {get: function(){
        return $.AnibodyArray[this.EI];
}});

/**
 * Every object used in the AniBody-Engine should derive from this class if it is used in the foreground
 * visible to the user
 * @returns {Anibody.classes.ABO}
 */
Anibody.classes.ABO = function ABO(){ // AniBodyObject
    Anibody.classes.EngineObject.call(this);
    this.Name = "";
    this.X = 0;
    this.Y=0;
    this.Width = 0;
    this.Height = 0;
}

Anibody.classes.ABO.prototype = Object.create(Anibody.classes.EngineObject.prototype);
Anibody.classes.ABO.prototype.constructor = Anibody.classes.ABO;
/**
 * @see README_DOKU.txt
 */
Anibody.classes.ABO.prototype.Draw = function(){return false;};
/**
 * Returns an object that contains the needed value to create an rectangle at
 * the current position of the ABO-Object plus a given offset
 * @param {Number} off, offset to increase the area (in pixel)
 * @param {Number|string} rounding, the rounding of the rectangle in pixel | "circle"
 *  - the rounding transforms the rect to a circle if width and hight are the same 
 * @returns {area object x,y,width,height}
 */
Anibody.classes.ABO.prototype.GetArea = function(off, rounding){
    if(typeof off === "undefined")
        off = 0;
    
    if(typeof rounding === "undefined" || rounding < 0)
        rounding = 0;
    
    var area;
    
    if(rounding !== "circle")
        if(rounding === 0)
            area = {
                x : this.X - off,
                y : this.Y - off,
                width : this.Width + 2*off,
                height : this.Height + 2*off,
                type : "rect"
            };
        else
            area = {
                x : this.X - off,
                y : this.Y - off,
                width : this.Width + 2*off,
                height : this.Height + 2*off,
                rounding : rounding,
                type : "rrect"
            };
    else
        area = {
            x : this.X,
            y : this.Y,
            radius : this.Radius + off,
            type : "circle"
        };
    
    area.background = false;
    return area;
};

/**
 * Removes/deregisters all registered functions.
 * This function should be called if the instance won't be used anymore
 * @returns {undefined}
 */
Anibody.classes.ABO.prototype.Delete = function(){
    // TODO
    // automatic removing? - ref number need to be saved in every object
};

/**
 * ABOs that must not be added to the Anibody.Object-Queueu
 * the class can register ProcessInput(), Update() and Draw() by themself
 * - should be deregistered by user of the widget
 * @returns {Anibody.classes.ABO}
 */
Anibody.classes.Widget = function Widget(){ // Widget
    Anibody.classes.ABO.call(this);
    
    this._refIP = null;
    this._ipPriority = 1;
    this._refU = null;
    this._uPriority = 1;
    this._refD = null;
    this._dPriority = 1;
    
};

Anibody.classes.Widget.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.classes.Widget.prototype.constructor = Anibody.classes.Widget;

Anibody.classes.Widget.prototype.Register = function(){
    if(this._refIP === null)
        this._refIP = this.Engine.AddProcessInputFunctionObject({
            function : function(){
                this.ProcessInput();
            },
            that : this
        },this._ipPriority);
    
    if(this._refU === null)
        this._refU = this.Engine.AddUpdateFunctionObject({
            function : function(){
                this.Update();
            },
            that : this
        },this._uPriority);
    
    if(this._refD === null)
        this._refD = this.Engine.AddForegroundDrawFunctionObject({
            function : function(c){
                this.Draw(c);
            },
            that : this
        },this._dPriority);
};
Anibody.classes.Widget.prototype.Deregister = function(){
    if(this._refIP !== null){
        this.Engine.RemoveProcessInputFunctionObject(this._refIP);
        this._refIP = null;
    }
    
    if(this._refU !== null){
        this.Engine.RemoveUpdateFunctionObject(this._refU);
        this._refU = null;
    }
    
    if(this._refD !== null){
        this.Engine.RemoveForegroundDrawFunctionObject(this._refD);
        this._refD = null;
    }
};
/**
 * @see README_DOKU.txt
 */
Anibody.classes.Widget.prototype.ProcessInput = function(){return false;};
/**
 * @see README_DOKU.txt
 */
Anibody.classes.Widget.prototype.Update = function(){return false;};
/**
 * @see README_DOKU.txt
 */
Anibody.classes.Widget.prototype.Draw = function(c){return false;};

/**
 * Default Camera - used when the user's field of view is not bigger as the canvas
 * @returns {DefaultCamera}
 */
Anibody.classes.DefaultCamera = function DefaultCamera(){
    Anibody.classes.ABO.call(this);
}
Anibody.classes.DefaultCamera.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.classes.DefaultCamera.prototype.constructor = Anibody.classes.DefaultCamera;

/**
 * Represents the game environment and can hold the background image of the map
 * @param {string} img_code - codename of the background image (optional)
 * @returns {DefaultTerrain}
 */
Anibody.classes.DefaultTerrain = function DefaultTerrain(img_code) {
    Anibody.classes.ABO.call(this);
    this.Codename = img_code;
    this.NoImage = false;
    this.Initialize();
}
Anibody.classes.DefaultTerrain.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.classes.DefaultTerrain.prototype.constructor = Anibody.classes.DefaultTerrain;
/**
 * @see README_DOKU.txt
 */
Anibody.classes.DefaultTerrain.prototype.Initialize = function () {

    if (this.Codename) {
        this.Image = this.Engine.MediaManager.GetImage(this.Codename);
        this.Width = this.Image.width;
        this.Height = this.Image.height;
    } else {
        this.NoImage = true;
        this.Width = this.Engine.Canvas.width;
        this.Height = this.Engine.Canvas.height;
    }
};
/**
 * @see README_DOKU.txt
 */
Anibody.classes.DefaultTerrain.prototype.Draw = function (c) {

    if (!this.NoImage) {
        var cam = this.Engine.Camera.SelectedCamera;
        c.drawImage(this.Image, this.X - cam.X, this.Y - cam.Y);
    }
};