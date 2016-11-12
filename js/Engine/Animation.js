/**
 * @description Animation wraps a Sprite and provides further functionalities
 * @param {Number} x x-pos
 * @param {Number} y y-pos
 * @param {Number} width
 * @param {Number} height
 * @param {Number} fbj frames (that has to pass) before the jump to the next image
 * @param {Boolean} infinite flag if Animation goes on forever or loops once
 * @param {Number} scale optional integer - default = 1
 * @returns {Animation}
 */
function Animation(x, y, width, height, fbj, infinite, scale){
    ABO.call(this);
    this.Type = "Animation";
    this.Initialized = false;
    
    this.X = x;
    this.Y = y;
    
    this.Image; // contents codename until constructor()
    this.Width = width;
    this.Height = height;
    
    this.FramesBeforeJump = fbj;
    this.Scale = scale ? scale : 1;
    
    this.Sprite = {};
    this.SpriteWidth = 0;
    this.SpriteHeight = 0;
    this.Codename;
    this.Active = false;
    this.Infinite = infinite ? infinite : false;
    
    this.Attributes = {
        Collidable : false,
        Selectable : false,
        Selected : false,
        Drawable : true,
        Hidden : false
    };
    
    this.InitializeSprite = function(codename, numy){
        this.Initialized = true;
        var ob = new Array();
        this.Codename = codename;
        
        for(var i=0; i<numy*2; i=i+2){
            ob.push( { Row : (i/2) , Pictures : arguments[2 + i], Description : arguments[2 + i + 1] } );
        }
        this.Sprite = {
            Image : this.Engine.MediaManager.GetImage(codename),
            Order : ob,
            Index : 0,
            Current : { 
                Clipping : {
                    X:0,
                    Y:0
                },
                Row : 0 }
        };
        
        // register to the Engine Counter, so that 
        // the Sprite.Index increases one in every x frames, where x is specified in this.FramesBeforeJump
        var f = function(e){
            if(e.Active){
                e.Sprite.Index++;
                
                if(!e.Infinite && e.Sprite.Index % e.Sprite.Order[e.Sprite.Current.Row].Pictures == 0)
                    e.Stop();
            }
        };
        this.Engine.Counter.AddCounterFunction({
            parameter : this,
            function : f,
            every : this.FramesBeforeJump
        });
        
        // register to the Engine Update Functions, so that in the end of the day
        // the following function is called in every frame and the current clipping of the sprite
        // depends on the this.Sprite.Index
        f = function(){
            if(this.Sprite.Current){
                this.Sprite.Current.Row = 0;
                this.Sprite.Current.Clipping.X = this.Width * ( this.Sprite.Index % this.Sprite.Order[this.Sprite.Current.Row].Pictures );
                this.Sprite.Current.Clipping.Y = this.Sprite.Order[this.Sprite.Current.Row].Row * this.Height;
            }
        };
        this.Engine.AddUpdateFunction({function : f, parameter : this, that : this});
        
    };
    
    this.Draw = function(c){
        var cam = this.Engine.Camera.SelectedCamera;
        
        if(!this.Sprite.Image)
            this.Engine.MediaManager.GetImage(this.Codename);
        
        if(!this.Sprite.Image)
            this.Initialized = false;
        else
            this.Initialized = true;
            
        if(this.Initialized)
            c.drawImage(this.Sprite.Image, /* sprite img */
                            this.Sprite.Current.Clipping.X,this.Sprite.Current.Clipping.Y, /* where on the sprite to start clipping (x, y) */
                            this.Width, this.Height, /* where on the sprite to start clipping (width, height) */
                            this.X - cam.X, this.Y - cam.Y, this.Width*this.Scale, this.Height*this.Scale /* where on the canvas (x, y, width, height) */
                        );
    };
    this.Start = function(){this.Active=true;};
    this.Stop = function(){this.Active=false;};
}
Animation.prototype = Object.create(ABO.prototype);
Animation.prototype.constructor = Animation;

/**
 * @description A still image
 * @param {type} codename String of the MediaManager codename
 * @param {type} x x position
 * @param {type} y y position
 * @returns {ImageObject}
 */
function ImageObject(codename,x,y/* (optional), scale*/){
    ABO.call(this);
    this.X = x;
    this.Y = y;
    this.Image = this.Engine.MediaManager.GetImage(codename);
    this.Width = this.Image.width;
    this.Height = this.Image.height;
    
    if(arguments.length>3)
        this.Scale = arguments[3];
    else
        this.Scale = 1;

    // flag, true: Image is part of the terrain (game)
    // false: Image position is solid, player (camera) position is not considered
    this.TerrainImage = true;
    
    this.Draw = function(c){
        var cam = this.Engine.Camera.SelectedCamera;
        if(this.TerrainImage)
            c.drawImage(this.Image, this.X-cam.X, this.Y-cam.Y, this.Image.width*this.Scale, this.Image.height*this.Scale);
        else
            c.drawImage(this.Image, this.X, this.Y, this.Image.width*this.Scale, this.Image.height*this.Scale);
    };
}
ImageObject.prototype = Object.create(ABO.prototype);
ImageObject.prototype.constructor = ImageObject;