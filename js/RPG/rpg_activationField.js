
function RPGActivationField(constant, parameter){
    this.DebugDraw = true;
    
    Anibody.classes.ABO.call(this);
    this.Constant = constant ? constant : false;
    this.FramesActivated = 0;
    this.Activator;
    
    this.Parameter = parameter;
    
    this.CurrentField;
    this.RangeX = 1;
    this.RangeY = 1;
    
    this.ActivationFunction = function(){};
}
RPGActivationField.prototype = Object.create(Anibody.classes.ABO.prototype);
RPGActivationField.prototype.constructor = RPGActivationField;

RPGActivationField.prototype.Update = function(){
    
    if(!this.Activator || !this.CurrentField) return false;
    
    var af = this.Activator.CurrentField; // activator field
    var curf = this.CurrentField; // current field
    
    var onit = false;
    
    if(af.ID.X >= curf.ID.X && af.ID.X <= curf.ID.X + this.RangeX-1)
        if(af.ID.Y >= curf.ID.Y && af.ID.Y <= curf.ID.Y + this.RangeY-1)
            onit = true;
    
    if(onit){
        if(this.Constant){
            this.ActivationFunction(this.Parameter);
        }else
            if(this.FramesActivated <= 0){
                this.ActivationFunction(this.Parameter);
            }
        this.FramesActivated++;
    }
        
};

RPGActivationField.prototype.SetRange = function(startField, x, y){
    
    this.CurrentField = startField;
    this.RangeX = x ? x : this.RangeX;
    this.RangeY = y ? y : this.RangeY;
    
};
RPGActivationField.prototype.SetActivator = function(activator){this.Activator = activator;};
RPGActivationField.prototype.Draw = function(c){
    if(!this.DebugDraw)
        return;
    
    c.save();
    var f;
    c.fillStyle = "rgba(255,0,0,0.2)";
    for(var i=0; i<this.RangeY; i++)
        for(var j=0; j<this.RangeX; j++){
            f = this.Engine.Terrain.GetField(this.CurrentField.ID.X+j, this.CurrentField.ID.Y+i);
            if(f)
                f.PaintField(c);
        }        
    c.restore();
    
};
RPGActivationField.prototype.AddParameter = function(){
    for(var i=0; i<arguments.length; i++)
        this.Parameter.push(arguments[i]);
};