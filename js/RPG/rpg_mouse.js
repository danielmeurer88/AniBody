
function RPGMouse(){
    Anibody.classes.ABO.call(this);
    this.Mouse = this.Engine.Input.Mouse;
    
    this.LeftClickFunctions = [];
    this.RegisterCode = -1;
    
    this.Field;
    
    this.Terrain;
this.Initialize();    
}
RPGMouse.prototype = Object.create(Anibody.classes.ABO.prototype);
RPGMouse.prototype.constructor = RPGMouse;

RPGMouse.prototype.Initialize = function(){
    
    // path calculation
    var gotof = function(){
        this.Engine.Objects.SelectedObject.FindPath(this.Field);
    };
    this.RegisterLeftClickFunction(gotof, this);
};
RPGMouse.prototype.Update = function(){

    // if no mouse on canvas - return
    if(!this.Engine.Input.Canvas.MouseOn) return;
    
    // if no rpg terrain - return
    if(this.Engine.Terrain.Name != "rpg") return;
    
    var t = this.Engine.Terrain;
    var ap = this.Mouse.Position.Camera; // (absolute) position related on the map of the terrain field
    var vr = t.GetViewableRange(); // viewable Range of the fields;
    
    var searching = true;
    
    //this.Field = "undefined";
    
    var i,j, fp; // field position
    for(i=vr.X.From;searching && i<=vr.X.To;i++)
        for(j=vr.Y.From;searching && j<=vr.Y.To; j++){
            fp = t.GetField(i,j);
            if(fp.X <= ap.X && ap.X <= fp.X+fp.Size && fp.Y <= ap.Y && ap.Y <= fp.Y + fp.Size){
                // on this field fp
                this.Field = fp;
                searching = false;
            }
        }
    
    if(this.Field && this.Mouse.Left.FramesDown == 1){
        this.LeftClick();
    }
};
RPGMouse.prototype.Draw = function(c){
    if(this.Field && this.Field != "undefined"){
        c.save();
        c.fillStyle = "rgba(80, 255, 140, 0.3)";
        this.Field.PaintField(c);
        c.restore();
    }
};
RPGMouse.prototype.RegisterLeftClickFunction = function(f, that){
    this.RegisterCode++;
    this.LeftClickFunctions.push({function:f, RegisterCode:this.RegisterCode, that:that});
    return this.RegisterCode;
};
RPGMouse.prototype.LeftClick = function(){
    var that;
    for(var i=0; i<this.LeftClickFunctions.length;i++){
        that = this.LeftClickFunctions[i].that ? this.LeftClickFunctions[i].that : this;
        this.LeftClickFunctions[i].function.call(that);
    }
};
RPGMouse.prototype.RemoveLeftClickFunction = function(code){
    var arr = [];
    var rem = false;
    for(var i=0; i<this.LeftClickFunctions.length;i++){
        if(this.LeftClickFunctions[i].RegisterCode != code)
            arr.push(this.LeftClickFunctions[i]);
        else
            rem = true;
    }
    this.LeftClickFunctions = arr;
    return rem;
};