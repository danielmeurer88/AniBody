/**
 * Monitors the attribute of an object triggers a callback object whenever the value changes
 * @param {object} obj Object
 * @param {string} attr
 * @param {object} cbo (optional)
 * @param {string} name (optional)
 * @returns {Monitor}
 */
function Monitor(obj, attr, cbo, name){
    EngineObject.call(this);
    
    if(typeof name !== "undefined" && name!==false && name !== null)
        this.Name = name;
    else
        this.Name = "Monitor " + (++Monitor.Counter);
    
    this.Object = obj;
    this.Attribute = attr;
    this.Class = "";
    
    if(typeof cbo !== "undefined" && cbo!==false && cbo !== null)
        this.CallbackObject = cbo;
    else
        this.CallbackObject = {that: this, function(newv, oldv, startv, para){
                console.log("'{0}' changed from '{1}' to '{2}' and began with '{3}'".format(this.Name, oldv, newv, startv));
        }, parameter:"default"};
    
    this.StartValue;
    this.OldValue;
    this.CurrentValue;

this.Initialize();
}
Monitor.prototype = Object.create(EngineObject.prototype);
Monitor.prototype.constructor = Monitor;
Monitor.Counter = 0;

/**
 * can be seen as an extension of the constructor function
 * @returns {undefined}
 */
Monitor.prototype.Initialize = function(){
    
    this.StartValue = this.Object[this.Attribute];
    this.OldValue = this.StartValue;
    this.CurrentValue = this.StartValue;
    
    this._getClass();
}

/**
 * Update
 * @returns {undefined}
 */
Monitor.prototype.Update = function(){
    this.CurrentValue = this.Object[this.Attribute];
    
    if(this._didAttrChange()){
        var cbo = this.CallbackObject;
        cbo.function.call(cbo.that,this.CurrentValue, this.OldValue, this.StartValue, cbo.para);
    }
    
    this.OldValue = this.CurrentValue;
};

/**
 * Saves the constructor function name of the object
 * @param {anything} obj
 * @returns {String}
 */
Monitor.prototype._getClass = function(){
    var con = this.Object.constructor.toString();
    
    var ifunc = con.indexOf("function ");
    var ibracket = con.indexOf("(");
    
    if(ifunc == 0){
        con = con.substr(9, ibracket - 9);
    }
    
    this.Class = con;
};

/**
 * returns true if value has changed
 * @returns {Boolean}
 */
Monitor.prototype._didAttrChange = function(){
    if(this.CurrentValue !== this.OldValue){
        return true;
    }else{
        return false;
    }
};