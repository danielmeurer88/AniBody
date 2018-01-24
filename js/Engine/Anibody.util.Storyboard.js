Anibody.SetPackage("Anibody", "util");

/**
 * An instance of this class makes sure that added Callbackobjects are started at a given time 
 * @returns {Storyboard}
 */
Anibody.util.Storyboard = function Storyboard(){
    this._actions = [];
    this._refs = null;

};

Object.defineProperty(Anibody.util.Storyboard, "name", {value:"Storyboard"});

/**
 * Starts the storyboard process (stops any further processes of this instance)
 * @returns {undefined}
 */
Anibody.util.Storyboard.prototype.Start = function(){

    if(this._refs !== null){
        this.Stop();
    }

    this._refs = [];
    var self = this;
    var _time;
    
    var funcstart = Date.now();
    
    for(var i=0; i<this._actions.length; i++){

        _time = this._actions[i].startingTime - (Date.now() - funcstart);
        
        this._refs[i] = window.setTimeout(
            function(storyboard, index){
                Anibody.CallObject(storyboard._actions[index].cbo);
            },
            _time, this,  i
        );
    }
};

/**
 * Stops the storyboard process
 * @returns {undefined}
 */
Anibody.util.Storyboard.prototype.Stop = function(){
    if(this._refs === null) return;
    for(var i=0; i<this._refs.length; i++){
        window.clearTimeout(this._refs[i]);
    }
};

/**
 * Adds an action
 * @returns {undefined}
 */
Anibody.util.Storyboard.prototype.AddAction = function(startingTime, cbo){

    if(typeof cbo === "function"){
        cbo = cbo.getCallbackObject(window);
    }

    this._actions.push(
        {
            startingTime : startingTime,
            cbo : cbo
        }
    );
};