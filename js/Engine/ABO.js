
function EngineObject(){
    this.EI = 0; // Engine Index (the index of the engine, to which this object belongs in the $.EngineArray!
    this.UniqueID = this._getUniqueID();
    this.X = 0;
    this.Y = 0;
    this.Type = "Object";
    this.OnTerrain = false;
}

EngineObject.prototype.Update = function(){return false;};

EngineObject.prototype.UniqueIDState = 0;
EngineObject.prototype._getUniqueID = function(){
    return EngineObject.prototype.UniqueIDState++;
};

// defining a default getter to the EngineObject constructor function
Object.defineProperty(EngineObject.prototype, "Engine", {get: function(){
        return $.EngineArray[this.EI];
}});

/**
 * 
 * @returns {ABO}
 */
function ABO(){ // AniBodyObject
    EngineObject.call(this);
    this.Attributes = {};
    this.Name = "";
    this.Width = 0;
    this.Height = 0;
}

ABO.prototype = Object.create(EngineObject.prototype);
ABO.prototype.constructor = ABO;

ABO.prototype.Draw = function(){return false;};

ABO.prototype.ProcessInput = function(){return false;};

/**
 * Returns an object that contains the needed value to create an rectangle at
 * the current position of the ABO-Object plus a given offset
 * @param {Number} off, offset to increase the area (in pixel)
 * @param {Number|string} rounding, the rounding of the rectangle in pixel | "circle"
 *  - the rounding transforms the rect to a circle if width and hight are the same 
 * @returns {ABO.prototype.GetArea.area}
 */
ABO.prototype.GetArea = function(off, rounding){
    if(typeof off === "undefined")
        off = 0;
    
    if(typeof rounding === "undefined" || rounding < 0)
        rounding = 0;
    
    var area;
    
    if(rounding !== "circle")
        if(rounding == 0)
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