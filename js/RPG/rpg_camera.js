function RPGCamera(){
    Anibody.ABO.call(this);
    this.Type = "Camera";
    this.Name = "OnSelectedField";

    this.CenterHorizontal = true;
    this.CenterVertical = true;

    this.Update = function(){
        var fcenter;
        var w = this.Engine.Canvas.width;
        var h = this.Engine.Canvas.height;
        
        var sObj = this.Engine.GetSelectedObject();
        if(sObj === null){
            fcenter = {
            X : (w/2),
            Y : (h/2)
        };
        }else{
            fcenter = {
            X : sObj.Center.X + (sObj.Width/2),
            Y : sObj.Center.Y + (sObj.Height/2)
        };
        }
        
        
        
        // if(sObj){
        //     if(this.CenterVertical){
        //         this.X = fcenter.X - (w/2);

        //         if(this.X < 0)
        //             this.X = 0;
        //          if(this.X > this.Engine.Terrain.Width - this.Engine.Canvas.width)
        //             this.X = this.Engine.Terrain.Width - this.Engine.Canvas.width;
        //     }
        //     if(this.CenterHorizontal){
        //         this.Y = fcenter.Y - (h/2);

        //         if(this.Y < 0)
        //             this.Y = 0;
        //          if(this.Y > this.Engine.Terrain.Height - this.Engine.Canvas.height)
        //             this.Y = this.Engine.Terrain.Height - this.Engine.Canvas.height;
        //     }
        // }
    };
}
RPGCamera.prototype = Object.create(Anibody.ABO.prototype);
RPGCamera.prototype.constructor = RPGCamera;