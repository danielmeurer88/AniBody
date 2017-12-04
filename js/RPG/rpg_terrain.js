function Field(idx, idy, size, type){
    Anibody.ABO.call(this);
    
    this.ID = {X: idx, Y: idy};
    this.Size = size;
    this.X = idx*size;
    this.Y = idy*size;
    this.StringID = idx + "," + idy; 
    this.Type = type;
    this.User = false;
}
Field.prototype = Object.create(Anibody.ABO.prototype);
Field.prototype.constructor = Field;

Field.prototype.Types = {
    
    Free : 0,
    Blocked : 1,
    Object : 2,
    NPC : 3,
    Portal : 4
    
};
Field.prototype.HasUser = function(){
    return this.User;
};
Field.prototype.PaintField = function(c){
    var cam = this.Engine.Camera.SelectedCamera;
    c.fillRect(this.X - cam.X, this.Y - cam.Y, this.Size, this.Size);
};

function RPGTerrain(req, img_code, str_code, fieldsize, tname){
    Anibody.ABO.call(this);
    
    this.Required = req;
    this.DebugFields = false;
    this.Attributes = { hidden: false};
    
    this.ImageCodename = img_code;
    this.StructureCodename = str_code;
    
    this.RPGMouse;
    
    this.Width=0;
    this.Height=0;
    this.Center=0;
    
    this.X = 0;
    this.Y = 0;
        
    this.NoImage = false;
    
    this.Field = fieldsize; // pixel size of a field quarter
    this.Fields = [];
    this.FieldDimension = {X:50, Y:50};
        
    this.TerrainName =  tname || "main";
    this.ParentTerrain;
    this.RootTerrain = this;
    
    this.ChildrenTerrains = [];
    this.TerrainStandardEntry = {X:2,Y:2};
    
    this.ViewableRange = {
        X : {From: 0, To:20},
        Y : {From: 0, To:16}
    };
    
    this.SideQ = new Anibody.util.PriorityQueue();
    this.SideQHandled = false;
    this.MoveCounter = 0;
    
this.Initialize();
}
RPGTerrain.prototype = Object.create(Anibody.ABO.prototype);
RPGTerrain.prototype.constructor = RPGTerrain;

RPGTerrain.prototype.Initialize = function(){
        
        if(this.ImageCodename){
            this.Image = this.Engine.MediaManager.GetImage(this.ImageCodename);
            this.Width = this.Image.width;
            this.Height = this.Image.height;
        }
        else{
            this.NoImage = true;
            this.Width = this.Engine.Canvas.width;
            this.Height = this.Engine.Canvas.height;
        }
        
        if(this.TerrainName == "main")
            this.RPGMouse = new RPGMouse();
        
        var str_img;
        var p;
        for(var i=0; i<this.FieldDimension.X; i++)
            this.Fields[i] = [];
        
        if(this.StructureCodename){
           str_img = this.Engine.MediaManager.GetImage(this.StructureCodename);
           str_img.getImageData();
           this.FieldDimension = {X:str_img.width, Y:str_img.height};
           for(var j=0; j<this.FieldDimension.Y; j++)
               for(var i=0; i<this.FieldDimension.X; i++){
                   p = str_img.ImageData.getPixel(i,j);
                   if(p.red <= 33 && p.green <= 33 && p.blue <= 33){
                       // it's a black pixel
                       this.Fields[i][j] = new Field(i, j, this.Field, Field.prototype.Types.Blocked);
                   }else{
                       // it's not
                       this.Fields[i][j] = new Field(i, j, this.Field, Field.prototype.Types.Free);
                   }
               }
           
       }
       
    };
RPGTerrain.prototype.Draw = function(c){
    c.save();
    var cam = this.Engine.Camera.SelectedCamera;
    this.GetViewableRange(2);
    
    this.Image = this.Engine.MediaManager.GetImage(this.ImageCodename);
    
    if(this.Image != false){

        c.drawImage(this.Image,this.X - cam.X,this.Y - cam.Y);
    }
    
    if(this.DebugFields){
        for(var j=this.ViewableRange.Y.From; j<=this.ViewableRange.Y.To; j++)
           for(var i=this.ViewableRange.X.From; i<=this.ViewableRange.X.To; i++){
               
               c.strokeRect(this.Fields[i][j].X - cam.X, this.Fields[i][j].Y - cam.Y, this.Fields[i][j].Size, this.Fields[i][j].Size);
               
               if(this.Fields[i][j].Type == 0){
                   // it's a black field
                   c.fillStyle = "black";
               }else{
                   // it's not
                   c.fillStyle = "#999";
               }
               c.fillText("X:" + this.Fields[i][j].ID.X +",Y:"  + this.Fields[i][j].ID.Y,
               this.Fields[i][j].X - cam.X + 5,
               this.Fields[i][j].Y - cam.Y + (this.Fields[i][j].Size*0.9));
           }
    }
    
    if(this.RPGMouse)
        this.RPGMouse.Draw(c);
    
    c.restore();
};
RPGTerrain.prototype.Update = function(){
        
        if(!this.SideQHandled)
            this.FillObjQ();
        
        if(this.RPGMouse)
            this.RPGMouse.Update();
        
    };
RPGTerrain.prototype.GetField = function(x,y){ return this.Fields[x][y];};

/**
 * Returns the field, which lays in specified direction of delta from cf
 * @param {type} cf the specified field of the terrain
 * @param {type} delta the specified direction {X: Number, Y:Number} where Number is element of {-1, 0, 1}
 * @returns {Field}
 */
RPGTerrain.prototype.GetFieldNeighbour = function(cf, delta/* X:0,Y:-1 for upper neighbour and so on*/){
    if(delta.X == 0){
        if(delta.Y == 1){
            if(cf.ID.Y + 1 < this.FieldDimension.Y){
                return this.Fields[cf.ID.X][cf.ID.Y + 1];
            }
        }else{
            if(cf.ID.Y - 1 >= 0){
                return this.Fields[cf.ID.X][cf.ID.Y - 1];
            }
        }
    }
    else{
        if(delta.X == 1){
            if(cf.ID.X + 1 < this.FieldDimension.X){
                return this.Fields[cf.ID.X+1][cf.ID.Y];
            }
        }
        else{
            if(cf.ID.X - 1 >= 0){
                return this.Fields[cf.ID.X-1][cf.ID.Y];
            }
        }
    }
    
    return this.Fields[cf.ID.X][cf.ID.Y];
};
/**
 * Returns all 4 neighbours if they are within the dimensions
 * @param {type} cf
 * @returns {Object: { Field : Field-Object, Delta: Object, Direction: String }}
 */
RPGTerrain.prototype.GetFieldNeighboursXY = function(x,y, fonly){
    
    var arr = [];
    
    if(arguments.length <= 1)
        fonly = false;
    
    if(this.CoordinatsAreWithinDimensions(x, y+1)){
        if(fonly)
            arr.push(this.Fields[x][y + 1]);
        else
            arr.push({
                Field: this.Fields[x][y + 1],
                Delta: { X:0, Y:1},
                Direction : "down"
            });
    }
    
    if(this.CoordinatsAreWithinDimensions(x, y-1)){
        if(fonly)
            arr.push(this.Fields[x][y - 1]);
        else
            arr.push({
                Field: this.Fields[x][y - 1],
                Delta: { X:0, Y:-1},
                Direction : "up"
            });
    }
    
    if(this.CoordinatsAreWithinDimensions(x+1, y)){
        if(fonly)
            arr.push(this.Fields[x + 1][y]);
        else
            arr.push({
                Field: this.Fields[x + 1][y],
                Delta: { X:1, Y:0},
                Direction : "right"
            });
    }
    
    if(this.CoordinatsAreWithinDimensions(x-1, y)){
        if(fonly)
            arr.push(this.Fields[x-1][y]);
        else
            arr.push({
                Field: this.Fields[x - 1][y],
                Delta: { X:-1, Y:0},
                Direction : "left"
            });
    }
    
    return arr;
};
/**
 * Returns all 4 neighbours if they are within the dimensions
 * @param {type} cf
 * @returns {Object: { Field : Field-Object, Delta: Object, Direction: String }}
 */
RPGTerrain.prototype.GetFieldNeighbours = function(cf, fonly){
    
    var arr = [];
    var x = cf.ID.X;
    var y = cf.ID.Y;
    
    if(arguments.length <= 1)
        fonly = false;
    
    if(this.CoordinatsAreWithinDimensions(x, y+1)){
        if(fonly)
            arr.push(this.Fields[cf.ID.X][cf.ID.Y + 1]);
        else
            arr.push({
                Field: this.Fields[cf.ID.X][cf.ID.Y + 1],
                Delta: { X:0, Y:1},
                Direction : "down"
            });
    }
    
    if(this.CoordinatsAreWithinDimensions(x, y-1)){
        if(fonly)
            arr.push(this.Fields[cf.ID.X][cf.ID.Y - 1]);
        else
            arr.push({
                Field: this.Fields[cf.ID.X][cf.ID.Y - 1],
                Delta: { X:0, Y:-1},
                Direction : "up"
            });
    }
    
    if(this.CoordinatsAreWithinDimensions(x+1, y)){
        if(fonly)
            arr.push(this.Fields[cf.ID.X + 1][cf.ID.Y]);
        else
            arr.push({
                Field: this.Fields[cf.ID.X + 1][cf.ID.Y],
                Delta: { X:1, Y:0},
                Direction : "right"
            });
    }
    
    if(this.CoordinatsAreWithinDimensions(x-1, y)){
        if(fonly)
            arr.push(this.Fields[cf.ID.X-1][cf.ID.Y]);
        else
            arr.push({
                Field: this.Fields[cf.ID.X - 1][cf.ID.Y],
                Delta: { X:-1, Y:0},
                Direction : "left"
            });
    }
    
    return arr;
};
RPGTerrain.prototype.CoordinatsAreWithinDimensions = function(x,y){
    if(0<=x && x<this.FieldDimension.X && 0<=y && y<this.FieldDimension.Y)
        return true;
    else
        return false;
};
RPGTerrain.prototype.GetViewableRange = function(extra){
    var cam = this.Engine.Camera.SelectedCamera;
    var can = this.Engine.Canvas;
    
    if(!extra) extra = 1;
    
    var xfrom = parseInt((cam.X / this.Field)-extra);
    var yfrom = parseInt((cam.Y / this.Field)-extra);
    var width = parseInt((can.width / this.Field)+extra);
    var height = parseInt((can.height / this.Field)+extra);
    
    if(xfrom < 0) xfrom = 0;
    if(yfrom < 0) yfrom = 0;
    if(xfrom + width >= this.FieldDimension.X) width = this.FieldDimension.X - xfrom - 1;
    if(yfrom + height >= this.FieldDimension.Y) height = this.FieldDimension.Y - yfrom - 1;
    
    this.ViewableRange = {
        X : {From: xfrom, To:xfrom + width},
        Y : {From: yfrom, To:yfrom + height}
    };
    
    return this.ViewableRange;
};
RPGTerrain.prototype.AddChildTerrain = function(req, img_code, str_code, tname){
    var ct = new RPGTerrain(req, img_code, str_code, this.Field, tname);
    ct.RPGMouse = this.RPGMouse;
    // ... 
    ct.EI = this.EI;
    this.ChildrenTerrains.push(ct);
    ct.ParentTerrain = this;
    ct.RootTerrain = this.RootTerrain;
    return ct;
};
RPGTerrain.prototype.EnterChildTerrainByName = function(name){
    var ct;
    for(var i=0; i<this.ChildrenTerrains.length;i++)
        if(this.ChildrenTerrains[i].TerrainName == name)
            ct = this.ChildrenTerrains[i];
    if(ct){
        this.Engine.Terrain.CleanObjectLoop();
        this.SetTerrain(ct);
        return ct;
    }
    return this.Engine.Terrain;    
};
RPGTerrain.prototype.EnterParentTerrain = function(){
        this.Engine.Terrain.CleanObjectLoop();
        this.SetTerrain(this.Engine.Terrain.ParentTerrain);
        return this.Engine.Terrain;
};
RPGTerrain.prototype.SetStandardEntry = function(x,y){this.TerrainStandardEntry={X:x,Y:y};};
RPGTerrain.prototype.AddObjectToSideQ = function(obj, pr){
    obj.EI = this.EI;
    obj.OnTerrain = this;
    return this.SideQ.Enqueue(obj, pr);
};
RPGTerrain.prototype.FillObjQ = function(){
    this.Engine.Objects.Queue.Merge(this.SideQ);
    this.Engine.Objects.length = this.Engine.Objects.Queue.heap.length;
    this.SideQHandled = true;
    this.Engine.Objects.Queue.Sort();
};
RPGTerrain.prototype.CleanObjectQ = function(){
    this.Engine.Objects.Queue.DeleteMergedElements();
    //this.SideQHandled = false;
};
RPGTerrain.prototype.SetTerrain = function(newt){
    newt.MoveCounter = this.Engine.Terrain.MoveCounter;
    this.Engine.SetTerrain(newt);
    this.Engine.Terrain.SideQHandled = false;
};