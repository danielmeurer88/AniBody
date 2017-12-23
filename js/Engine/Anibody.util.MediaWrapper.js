
Anibody.SetPackage("Anibody", "util"); // checks if the object Anibody.util exists and if not creates it

/**
 * wrapps an image element and provides extra features
 * @returns {ImageWrapper}
 */
Anibody.util.ImageWrapper = function ImageWrapper(img) {
    this.Image = img;

    this._defaultImage = img;
    Object.defineProperty(this,"_defaultImage", {enumerable:false});

}

Object.defineProperty(Anibody.util.MediaManager, "name", {value:"ImageWrapper"});

Anibody.util.ImageWrapper.prototype.FlipVertically = function(){
    this.Image = this.Image.getVerticallyFlippedImage();
};

Anibody.util.ImageWrapper.prototype.FlipHorizontally = function(){
    this.Image = this.Image.getHorizontallyFlippedImage();
};

Anibody.util.ImageWrapper.prototype.Brighten = function(factor){
    // TODO
    var imgdata = this.Image.getImageData();
    var w = this.Image.width;
    var h = this.Image.height;

    var i,j;
    var r,g,b,inc;

    for(j=0; j<h; j++)
        for(i=0; i<w; i++){

            r = imgdata.data[ 4 * (i + w * j) + 0 ];
            g = imgdata.data[ 4 * (i + w * j) + 1 ];
            b = imgdata.data[ 4 * (i + w * j) + 2 ];
            //a = imgdata.data[ 4 * (i + w * j) + 3 ];

            inc = parseInt( 256 * factor );

            r = (r + inc);
            g = (g + inc);
            b = (b + inc);

            imgdata.data[ 4 * (i + w * j) + 0 ] = r;
            imgdata.data[ 4 * (i + w * j) + 1 ] = g;
            imgdata.data[ 4 * (i + w * j) + 2 ] = b;

        }
    this.Image = imgdata.getImage();

};

Anibody.util.ImageWrapper.prototype.Darken = function(factor){
    this.Brighten((-1)*factor);
};

/**
 * wrapps an audio element and provides extra features
 * @returns {SoundWrapper}
 */
Anibody.util.SoundWrapper = function SoundWrapper(a) {
    this.Audio = a;
    this.Loop = false;
    var self = this;
    Object.defineProperty(this, "Loop", {
        set: function (newValue) {
            self.Audio.loop = newValue;
        },
        get: function () { return self.Audio.loop; }
    });
    Object.defineProperty(this, "Duration", {
        set: function (newValue) {
            self.Audio.duration = newValue / 1000;
        },
        get: function () { return self.Audio.duration * 1000; }
    });
}

Object.defineProperty(Anibody.util.MediaManager, "name", {value:"SoundWrapper"});

Anibody.util.SoundWrapper.prototype.Play = function(useropt){

    var options = {
        offsetStart : 0,
        offsetEnd : 0,
        duration : "complete", // "complete" or miliseconds
        fadeIn : 0, //miliseconds
        fadeOut : 0, // milliseconds
        volume : 1,
        // ....

    };

    Anibody.mergeOptionObject(options, useropt)


    this.Audio.volume = options.volume;

    if(options.duration === "complete"){
        options.duration = this.Duration - options.offsetStart - options.offsetEnd;
    }

    this.Audio.onplay = function(){

        var self = this;

        if(options.fadeIn > 0){
            self.volume = 0;
            new Anibody.util.Flow(self, "volume", options.volume, options.fadeIn).Start();
        }

        if(options.fadeOut > 0){
            
            var f = function(){
                self.volume = options.volume;
                new Anibody.util.Flow(self, "volume", 0, options.fadeOut).Start();
            };
            
            window.setTimeout(f, options.duration - options.fadeOut);
        }

        if (options.offsetStart > 0) {
            var time = options.offsetStart / 1000;    
            this.currentTime = time;
        } 

    };

    this.Audio.onplaying = function(){
        console.log("onplaying: " + this.volume);
    };
    this.Audio.play();
};

Anibody.util.SoundWrapper.prototype.Pause = function(){
    this.Audio.pause();
};

Anibody.util.SoundWrapper.prototype.Stop = function(){
    
};

Anibody.util.SoundWrapper.prototype.SetLoop = function(state){
    
};