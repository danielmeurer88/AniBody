Anibody.SetPackage("Anibody", "cam");

/**
 * Default Camera - used when the user's field of view is not bigger as the canvas
 * @returns {FollowingCamera}
 */
Anibody.cam.FollowingCamera = function FollowingCamera(abo){
    Anibody.ABO.call(this);


    this._offsetX = 0;
    this._offsetY = 0;
    this._x = 0;
    this._y = 0;

    Object.defineProperty(this, "X", {
        set: function (x) {this._x=x;},
        get: function () {return this._x + this._offsetX;}}
    );

    Object.defineProperty(this, "Y", {
        set: function (y) {this._y=y;},
        get: function () {return this._y + this._offsetY;}}
    );

    this.Width = this.Engine.Canvas.width;
    this.Height = this.Engine.Canvas.height;

    this._followed = {
        X : this.Engine.Canvas.width/2,
        Y : this.Engine.Canvas.height/2,
        Width : 0,
        Height : 0
    };

    this._oldX = this._followed.X;
    this._oldY = this._followed.Y;

    Object.defineProperty(this, "Followed", {
        set: function (abo) {
            if(abo instanceof Anibody.ABO)
                this._followed = abo;
        },
        get: function () { 
            return this._followed;
        }
    });

    this.Followed = abo;
}
Anibody.cam.FollowingCamera.prototype = Object.create(Anibody.ABO.prototype);
Anibody.cam.FollowingCamera.prototype.constructor = Anibody.cam.FollowingCamera;

Object.defineProperty(Anibody.cam.FollowingCamera, "name", {value:"FollowingCamera"});

Anibody.cam.FollowingCamera.prototype.Update = function(){
    
    // check if the followed object has moved?
    if(this._oldX !== this.Followed.X || this._oldY !== this.Followed.Y){
        this._oldX = this.Followed.X;
        this._oldY = this.Followed.Y;

        this.X = (this.Followed.X + this.Followed.Width/2) - this.Engine.Canvas.width/2;
        this.Y = (this.Followed.Y + this.Followed.Height/2) - this.Engine.Canvas.height/2
    }

};

Anibody.cam.FollowingCamera.prototype.SetFollowed = function(abo){
    this.Followed = abo;
};

Anibody.cam.FollowingCamera.prototype.Follow = function(abo){
    this.Followed = abo;
};

Anibody.cam.FollowingCamera.prototype.SetOffset = function(x,y){
    if(!isNaN(x)) this._offsetX = x;
    if(!isNaN(y)) this._offsetY = y;
    
    
};