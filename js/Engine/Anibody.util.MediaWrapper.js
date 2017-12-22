
Anibody.SetPackage("Anibody", "util"); // checks if the object Anibody.util exists and if not creates it

/**
 * wrapps an image element and provides extra features
 * @returns {ImageWrapper}
 */
Anibody.util.ImageWrapper = function ImageWrapper(img) {
    this.Image = img;

    this.Option = "default"; // default, vertical, horizontal
    this._option = "default";
    Object.defineProperty(this,"_option", {enumerable:false});

    var self = this;

    Object.defineProperty(this, "Option", {
        set: function (newValue) {
            self._option = newValue;
            //default
            if(self._option === "default"){ self.Image = self._defaultImage; }
            // vertical
            if(self._option === "vertical"){ self._provideHorizontallyFlippedImage(); }
            // horizontal
            if(self._option === "horizontal"){ self._provideVerticallyFlippedImage(); }
        },
        get: function () { return self._option; }
    });

    this._defaultImage = img;
    Object.defineProperty(this,"_defaultImage", {enumerable:false});

}

Object.defineProperty(Anibody.util.MediaManager, "name", {value:"ImageWrapper"});

Anibody.util.ImageWrapper.prototype._provideHorizontallyFlippedImage = function(){
    this.Image = this._defaultImage.getHorizontallyFlippedImage();
};

Anibody.util.ImageWrapper.prototype._provideVerticallyFlippedImage = function(){
    this.Image = this._defaultImage.getVerticallyFlippedImage();
};

Anibody.util.ImageWrapper.prototype.Brighten = function(factor){
    // TODO
    var imgdata = this.Image.getImageData();
    var w = this.Image.width;
    var h = this.Image.height;

    var i,j;
    var r,g,b,a;

    for(j=0; j<h; j++)
        for(i=0; i<w; i++){

            r = imgdata.data[ 4 * (i + w * j) + 0 ];
            g = imgdata.data[ 4 * (i + w * j) + 1 ];
            b = imgdata.data[ 4 * (i + w * j) + 2 ];
            //a = imgdata.data[ 4 * (i + w * j) + 3 ];

            r = (r + r*factor) % 256;
            g = (g + g*factor) % 256;
            b = (b + b*factor) % 256;
            //a = (a + a*factor);

            imgdata.data[ 4 * (i + w * j) + 0 ] = r;
            imgdata.data[ 4 * (i + w * j) + 1 ] = g;
            imgdata.data[ 4 * (i + w * j) + 2 ] = b;

        }

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
}

Object.defineProperty(Anibody.util.MediaManager, "name", {value:"SoundWrapper"});

Anibody.util.SoundWrapper.prototype.Play = function(opt){

    var options = {
        offsetStart : 0,
        offsetEnd : 0,
        duration : "complete", // "complete" or miliseconds
        fadeIn : 0, //miliseconds
        fadeOut : 0, // milliseconds
        volumn : 1,
        // ....

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