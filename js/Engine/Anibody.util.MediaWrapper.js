
Anibody.SetPackage("Anibody", "util"); // checks if the object Anibody.util exists and if not creates it

/**
 * wrapps an image element and provides extra features
 * @returns {ImageWrapper}
 */
Anibody.util.ImageWrapper = function ImageWrapper(img) {
    this.Image = img;

    this.Option = "default"; // default, vertical, horizontal

    this._defaultImage = img;

}

Object.defineProperty(Anibody.util.MediaManager, "name", {value:"ImageWrapper"});

Anibody.util.ImageWrapper.prototype._provideHorizontallyFlippedImage = function(){

};

Anibody.util.ImageWrapper.prototype._provideVerticallyFlippedImage = function(){
    
};



/**
 * wrapps an audio element and provides extra features
 * @returns {SoundWrapper}
 */
Anibody.util.SoundWrapper = function SoundWrapper(a) {
    this.Audio = a;
    this.Loop = false;
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

};

Anibody.util.SoundWrapper.prototype.Pause = function(){
    
};

Anibody.util.SoundWrapper.prototype.Stop = function(){
    
};

Anibody.util.SoundWrapper.prototype.SetLoop = function(state){
    
};

