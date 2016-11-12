function RPGImageObject(codename,cf/* (optional), scale*/){
    ABO.call(this);
    
    this.Image = this.Engine.MediaManager.GetImage(codename);
    this.Width = this.Image.width;
    this.Height = this.Image.height;
    
    this.CurrentField = cf;
    this.X = cf.X;
    this.Y = cf.Y + cf.Size - this.Height;
    this.Image = this.Engine.MediaManager.GetImage(codename);
    this.Width = this.Image.width;
    this.Height = this.Image.height;
    
    if(arguments.length>2)
        this.Scale = arguments[2];
    else
        this.Scale = 1;

    this.TerrainImage = true;
    
}
RPGImageObject.prototype = Object.create(ABO.prototype);
RPGImageObject.prototype.constructor = RPGImageObject;

RPGImageObject.prototype.Draw = function(c){
    var cam = this.Engine.Camera.SelectedCamera;
    c.drawImage(this.Image, this.X - cam.X, this.Y - cam.Y, this.Image.width*this.Scale, this.Image.height*this.Scale);
};