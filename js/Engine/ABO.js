
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

function ABO(){ // AniBodyObject
    EngineObject.call(this);
    this.Attributes = {};
    this.Points = [];
    this.Name = "";
}

ABO.prototype = Object.create(EngineObject.prototype);
ABO.prototype.constructor = ABO;

ABO.prototype.Draw = function(){return false;};