function RPGPortal(from, fx, fy, to, tx, ty){
    ABO.call(this);
    this.FromTerrain = from;
    this.FromPos = {X:fx, Y:fy};
    this.FromField;
    this.FromFieldActive = true;
    
    this.ToTerrain = to;
    this.ToPos = {X:tx, Y:ty};
    this.ToField;
    this.ToFieldActive = true;

    this.Traveler;
    this.OldMoveCounter = 0;
    
this.Initialize();
}
RPGPortal.prototype = Object.create(ABO.prototype);
RPGPortal.prototype.constructor = RPGPortal;

RPGPortal.prototype.Initialize = function(){
    this.Traveler = this.Engine.Objects.SelectedObject;
    this.FromField = this.FromTerrain.GetField(this.FromPos.X, this.FromPos.Y);
    this.ToField = this.ToTerrain.GetField(this.ToPos.X, this.ToPos.Y);
    
};
RPGPortal.prototype.Draw = function(c){
    if(!this.Traveler) return;
    c.save();
    c.fillStyle = "rgba(255,0,0,0.2)";
    
    if(this.Engine.Terrain == this.FromTerrain){
        if(this.FromFieldActive){
            c.fillStyle = "rgba(0,255,0,0.2)";
        }else{
            c.fillStyle = "rgba(255,0,0,0.2)";
        }
        this.FromField.PaintField(c);
    }
    if(this.Engine.Terrain == this.ToTerrain){
        if(this.ToFieldActive){
            c.fillStyle = "rgba(0,255,0,0.2)";
        }else{
            c.fillStyle = "rgba(255,0,0,0.2)";
        }
        this.ToField.PaintField(c);
    }
    c.restore();    
};
RPGPortal.prototype.Update = function(){
    
    if(!this.Traveler) return;
    
    var tf = this.Traveler.CurrentField; // activator field
    var portal;
    var found = false;
    
    if(this.FromFieldActive && this.Engine.Terrain == this.FromTerrain){
        portal = this.FromField;
        if(tf.ID.X == portal.ID.X && tf.ID.Y == portal.ID.Y)
            found = true;
        
        if(found && this.OldMoveCounter < this.Engine.Terrain.MoveCounter){
            // go to ToTerrain
            // if you go to a new terrain - you need to check if all images are loaded for it
            var req = this.ToTerrain.Required;
            var mm = this.Engine.MediaManager;
            this.OldMoveCounter = this.Engine.Terrain.MoveCounter;
            
            mm.Require(req, new Callback(this,function(){
                
                this.Engine.Terrain.CleanObjectQ();
                this.Engine.Terrain.SetTerrain(this.ToTerrain);
                this.Traveler.SetCurrentField(this.ToField);
                
            },this));
            
            
        }
    }
    
    if(!found && this.ToFieldActive && this.Engine.Terrain == this.ToTerrain){
        portal = this.ToField;
        if(tf.ID.X == portal.ID.X && tf.ID.Y == portal.ID.Y)
            found = true;
        
        if(found && this.OldMoveCounter < this.Engine.Terrain.MoveCounter){
            // go to FromTerrain
            this.Engine.Terrain.CleanObjectQ();
            this.Engine.Terrain.SetTerrain(this.FromTerrain);
            this.OldMoveCounter = this.Engine.Terrain.MoveCounter;
            this.Traveler.SetCurrentField(this.FromField);
        }
    }
};

RPGPortal.prototype.Activate = function(){
    this.ToFieldActive = true;
    this.FromFieldActive = true;
};

RPGPortal.prototype.Deactivate = function(){
    this.ToFieldActive = false;
    this.FromFieldActive = false;
};