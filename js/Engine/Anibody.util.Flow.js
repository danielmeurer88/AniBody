Anibody.SetPackage("Anibody", "util");

/**
 * a class that ensures the constant and steady change of multiply attributes of objects to targeted values.
 * After every step and after the whole process two seperate functions can be called
 * @param {Object-Array} object
 * @param {String-Array} attr
 * @param {Number-Array} targetvalue
 * @param {Number} duration
 * @param {Object} callbackobject {that,parameter,function}
 * @param {Object} aftereveryframeobject {that,parameter,function}
 * @returns {Flow}
 */
Anibody.util.MultiFlow = function MultiFlow(object, attr, targetvalue, duration,callbackobject, aftereveryframeobject){
    this.Object = object;
    this.AttributeString = attr;
    this.TargetValue = targetvalue;
    this.Duration = duration;
    
    this.CallbackObject = callbackobject;
    this.AfterEveryFrameObject = aftereveryframeobject;
    
    this.FPS = 25;
    this.Frames = 0;
    this.StartValue = [];
    this.Difference = [];
    this.Step = [];
    
    this.ref = null;
    
    this.TargetIsSmaller = [];
    
    this.TargetReached = [];
    
};

Object.defineProperty(Anibody.util.MultiFlow, "name", {value:"MultiFlow"});

/**
 * Starts the flow process
 * @returns {undefined}
 */
Anibody.util.MultiFlow.prototype.Start = function(){
    
    // calculate in how many frames the Flow needs to be ready
    var framesWhenReady = this.FPS * (this.Duration/1000);
    var obj, attr;
    
    for(var i=0; i<this.Object.length; i++){
        obj = this.Object[i];
        attr = this.AttributeString[i];
        this.StartValue[i] = obj[attr];
        this.Difference[i] = this.TargetValue[i] - this.StartValue[i];

        if(this.Difference[i] < 0)
            this.TargetIsSmaller[i] = true;
        else
            this.TargetIsSmaller[i] = false;
        
        // the needed difference divided by the estimated amount of needed frames
        this.Step[i] = this.Difference[i] / framesWhenReady;
        this.TargetReached[i] = false;
    }

    var f = function(self){
        var obj, attr;
        var aef = self.AfterEveryFrameObject;
        var cbo = self.CallbackObject;
        var _temp;
        
        for(var i=0; i<self.Object.length; i++){
            obj = self.Object[i];
            attr = self.AttributeString[i];
            
            // before writing the new value into the actual object,
            // write it into a temp variable and test it
            _temp = obj[attr] + self.Step[i];

            // now check if it is bigger or smaller than the target value
            if(self.TargetIsSmaller[i]){
                if(_temp <= self.TargetValue[i])
                    _temp = self.TargetValue[i];
            }else{
                if(_temp >= self.TargetValue[i])
                    _temp = self.TargetValue[i];
            }

            obj[attr] = _temp;
        
            if(aef)
                aef.function.call(aef.that, aef.parameter)

            // checks if the target attribute of the object already hit the target value
            if(self.TargetIsSmaller[i]){

                if(obj[attr] <= self.TargetValue[i]){
                    obj[attr] = self.TargetValue[i];
                    self.TargetReached[i] = true;
                    

                }
            }else{
                if(obj[attr] >= self.TargetValue[i]){
                    obj[attr] = self.TargetValue[i];
                    self.TargetReached[i] = true;
                }
            }
            
        }
        
        if(self._allReached()){
            clearInterval(self.ref);
            if(typeof cbo !== "undefined" && typeof cbo.function === "function")
                cbo.function.call(cbo.that, cbo.parameter);
        }
    };
    
    this.ref = setInterval(f, (1000/this.FPS), this);
    
};
/**
 * returns true if all attributes reached their target value
 * @returns {Boolean}
 */
Anibody.util.MultiFlow.prototype._allReached = function(){
    for(var i=0; i<this.Object.length; i++){
        if(!this.TargetReached[i])
            return false;
    }
    return true;
};

/**
 * a class that ensures the constant and steady change of an object's attribute to a targeted value.
 * After every step and after the whole process two seperate functions can be called
 * @param {Object} object
 * @param {String} attr
 * @param {Number} targetvalue
 * @param {Number} duration
 * @param {Object} callbackobject {that,parameter,function}
 * @param {Object} aftereveryframeobject {that,parameter,function}
 * @returns {Flow}
 */
Anibody.util.Flow = function Flow(object, attr, targetvalue, duration,callbackobject, aftereveryframeobject){
    this.Object = object;
    this.AttributeString = attr;
    this.TargetValue = targetvalue;
    this.Duration = duration;
    
    this.CallbackObject = callbackobject;
    this.AfterEveryFrameObject = aftereveryframeobject;
    
    this.FPS = 25;
    this.Frames = 0;
    this.StartValue;
    this.Difference;
    
    this.ref = null;
    
    this.TargetIsSmaller = false;
    
};

Object.defineProperty(Anibody.util.Flow, "name", {value:"Flow"});

/**
 * Starts the change process
 * @returns {undefined}
 */
Anibody.util.Flow.prototype.Start = function(){
    
    this.StartValue = this.Object[this.AttributeString];
    this.Difference = this.TargetValue - this.StartValue;
    
    if(this.Difference < 0)
        this.TargetIsSmaller = true;

    // calculate in how many frames the Flow needs to be ready
    var framesWhenReady = this.FPS * (this.Duration/1000);
    // the needed difference divided by the estimated amount of needed frames
    this.Step = this.Difference / framesWhenReady;
    var _preval;

    var f = function(obj, key, step, self){
        // save the new value into a temporary variable (_preval)
        _preval = obj[key] + step;
        //console.log(_preval);
        
        // then checking before overwriting  actual
        // so that the actual target won't be overwritten with a too small or too big value 
        if(self.TargetIsSmaller){
            if(_preval <= self.TargetValue)
                _preval = self.TargetValue;
        }else{
            if(_preval >= self.TargetValue)
                _preval = self.TargetValue;
        }

        // now it is save to overwrite the actual object
        obj[key] = _preval;

        // now invoke the CBO after every step
        var aef = self.AfterEveryFrameObject;
        if(aef){
            Anibody.CallObject(aef);
        }
        
        // checks if the target attribute of the object already hit the target value
        // if so - end the process and invoke end-CBO
        if(self.TargetIsSmaller){
            
            if(obj[key] <= self.TargetValue){
                obj[key] = self.TargetValue;
                clearInterval(self.ref);
                var cbo = self.CallbackObject;
                if(typeof cbo !== "undefined" && typeof cbo.function === "function")
                    Anibody.CallObject(cbo);
                    
            }
        }else{
            if(obj[key] >= self.TargetValue){
                obj[key] = self.TargetValue;
                clearInterval(self.ref);
                var cbo = self.CallbackObject;
                if(typeof cbo !== "undefined" && typeof cbo.function === "function")
                    Anibody.CallObject(cbo);
            }
        }
        
    };
    
    this.ref = setInterval(f, (1000/this.FPS), this.Object, this.AttributeString, this.Step, this);
    
};