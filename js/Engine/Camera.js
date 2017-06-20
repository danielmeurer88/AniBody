
function DefaultCamera(){
    EngineObject.call(this);
    this.Type = "Camera";
    this.Name = "default";
}
DefaultCamera.prototype = Object.create(EngineObject.prototype);
DefaultCamera.prototype.constructor = DefaultCamera;


//function RPGCamera(){
//    EngineObject.call(this);
//    this.Type = "Camera";
//    this.Name = "OnSelectedField";
//
//    this.CenterHorizontal = true;
//    this.CenterVertical = true;
//
//    this.Update = function(){
//
//        var sObj = this.Engine.Objects.SelectedObject;
//        var fcenter = {
//            X : sObj.Center.X + (sObj.Width/2),
//            Y : sObj.Center.Y + (sObj.Height/2)
//        };
//        var w = this.Engine.Canvas.width;
//        var h = this.Engine.Canvas.height;
//
//        if(sObj){
//            if(this.CenterVertical){
//                this.X = fcenter.X - (w/2);
//
//                if(this.X < 0)
//                    this.X = 0;
//                 if(this.X > this.Engine.Terrain.Width - this.Engine.Canvas.width)
//                    this.X = this.Engine.Terrain.Width - this.Engine.Canvas.width;
//            }
//            if(this.CenterHorizontal){
//                this.Y = fcenter.Y - (h/2);
//
//                if(this.Y < 0)
//                    this.Y = 0;
//                 if(this.Y > this.Engine.Terrain.Height - this.Engine.Canvas.height)
//                    this.Y = this.Engine.Terrain.Height - this.Engine.Canvas.height;
//            }
//        }
//    };
//}
//RPGCamera.prototype = Object.create(EngineObject.prototype);
//RPGCamera.prototype.constructor = RPGCamera;