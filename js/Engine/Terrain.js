
function Terrain(){
    EngineObject.call(this);
}
Terrain.prototype = Object.create(EngineObject.prototype);
Terrain.prototype.constructor = Terrain;

function getTerrain(type, para1, para2, para3){
    if(!type || type === "default"){
        return new DefaultTerrain(para1, para2);
    }
    
    //if(type === "easy"){return new EasyTerrain(para1, para2);}if(type === "complex"){return new ComplexTerrain(para1, para2);}
    
    if(type === "rpg"){
        return new RPGTerrain(para1, para2, para3);
    }
    
}

function DefaultTerrain(img_code, bottom_height){
    ABO.call(this);
    this.Attributes = { hidden: false};
    this.Width=0;
    this.Height=0;
    this.X = 0;
    this.Y = 0;
    this.Structure = null;
    this.NoImage = false;
    
    this.BottomHeight = (bottom_height) ? bottom_height : 100;
    
    this.Type = "Terrain";
    this.Name = "default";
    
    this.Structure = {};
    this.Structure.Terrain = new Array();
    
    this.Constructor = function(){
        
        if(img_code){
            this.Image = this.Engine.MediaManager.GetImage(img_code);
            this.Width = this.Image.width;
            this.Height = this.Image.height;
        }
        else{
            this.NoImage = true;
            this.Width = this.Engine.Canvas.width;
            this.Height = this.Engine.Canvas.height;
        }
        
        this.Structure.Terrain.push({Type: "bottom",X:0, Y:this.Height-this.BottomHeight}); // first point
        this.Structure.Terrain.push({Type: "bottom",X:this.Width, Y:this.Height-this.BottomHeight}); // last point
    };
        
    this.Draw = function(c){
        
        if(!this.NoImage){
            var cam = this.Engine.Camera.SelectedCamera;
            c.drawImage(this.Image,this.X - cam.X,this.Y - cam.Y);
        }
    };
    
    this.Update = function(){
        
    };
    
    this.GetY = function(x){
        return this.Height-this.BottomHeight;
    };
    
    this.WriteStructurNode = function(){
        return false;
    };
    
this.Constructor();
}
DefaultTerrain.prototype = Object.create(Terrain.prototype);
DefaultTerrain.prototype.constructor = DefaultTerrain;