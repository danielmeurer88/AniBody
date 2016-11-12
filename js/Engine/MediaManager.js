function MediaManager() {
    EngineObject.call(this);

    this.Images = [];
    this.Sounds = [];
    this.Strings = [];
    
    this.Pack = [];

    this.Unloaded = [];
    this.Progress = 0;
    this.ProgressStep = 0;

    this.Loading = false;


}
MediaManager.prototype = Object.create(EngineObject.prototype);
MediaManager.prototype.constructor = MediaManager;

MediaManager.prototype.Flush = function () {
    //this.Images = [];
    //this.Sounds = [];
    //this.Strings = [];
};

MediaManager.prototype.Draw = function (c) {
    c.save();
    
    if (this.Loading) {
    
        var center = {x:this.Engine.Canvas.width/2, y:this.Engine.Canvas.height/2};
        var bar = {
            x : center.x / 2,
            width : center.x,
            y : center.y - center.y/20,
            height: center.y/10
        };
        var r = 5;
        var cent = bar.width / 100;
    
        // drawing the progress bar current progress
        c.fillStyle = "green";
        c.fillVariousRoundedRect(bar.x, bar.y, this.Progress*cent, bar.height, r);
        // drawing the progress bar border
        c.strokeStyle = "blue";
        c.strokeVariousRoundedRect(bar.x, bar.y, bar.width, bar.height, r);
        
    
        c.fillText("Loading: {0}%".format(parseInt(this.Progress)), bar.x, bar.y+bar.height+10);
    }
    c.restore();
};

MediaManager.prototype.Update = function () {
};

/*
 this.AddImages(
 //path/codename-pair array
 [ {path: "./images/test1.jpg", codename: "test1", width: 400, height: 300}, {path: "./images/test2.jpg", codename: "test2"} ],
 //callback-object
 { function : callback, parameter: parameterOfCallback }
 );
 */
/*
MediaManager.prototype.AddImages = function () {
    if (arguments.length == 0)
        return false;

    this.Loading = true;

    var pcpa = arguments[0]; // path/codename-pair-array = {path: String, codename: String}
    var co = arguments[1]; // Callback Object = {function:function, parameter:object}
    var nof = function () { // current onload function

        if (this.ImagesParameter != "undefined") {
            var pcpa = this.ImagesParameter.pcpa; // path/codename-pair-array = {path: String, codename: String}
            var co = this.ImagesParameter.co; // Callback Object = {function:function, parameter:object}
            var nof = this.ImagesParameter.nof; // next onload function
            var mm = this.ImagesParameter.mm;
        } else {
            return false;
        }

        // check if pcpa.length == 0 is. If it is 0 then the callback object is used
        if (pcpa.length == 0) {
            if (co) {
                mm.Loading = false;
                co.function.call(co.that, co.parameter);
            }
            return true;
        }

        var pcpe = pcpa.pop(); // current path/codename-pair-element of the array
        // create image
        var img = document.createElement("IMG");
        if (pcpe.width && pcpe.height) {
            img.width = pcpe.width;
            img.height = pcpe.height;
        }
        img.onload = nof;
        img.ImagesParameter = {
            pcpa: pcpa,
            co: co,
            nof: nof,
            mm: mm
        };
        img.codename = pcpe.codename;
        img.src = pcpe.path;

        // add to the MediaManager image array
        mm.Images.push(img);


    };

    //if no array or an empty array was given
    // pcpa gets shorter every time
    if (!pcpa || pcpa.length == 0) {
        if (co) {
            // before the callback, setting Loading = false causes that that objects will be drawen when loaded
            this.Loading = false;
            co.function.call(co.that, co.parameter);

        }
        return true;
    }

    // 1st element is popped out and saved in "pcpe"
    var pcpe = pcpa.pop(); // current path/codename-pair-element of the array

    // create a new image
    var img = document.createElement("IMG");
    // the image gets the correct width and height - maybe not needed (?)
    if (pcpe.width && pcpe.height) {
        img.width = pcpe.width;
        img.height = pcpe.height;
    }
    // the image receives the onload function "nof", which follows the same principle as the rest of the algorithm
    img.onload = nof;
    // these Parameters are needed in the "nof"
    img.ImagesParameter = {
        pcpa: pcpa,
        co: co,
        nof: nof,
        mm: this
    };
    // the image receives a codename so it can be found later in getImage()
    img.codename = pcpe.codename;
    // it receives a image source - now it will be loaded and when it finishes "nof" will be triggered
    img.src = pcpe.path;

    // add to the MediaManager image array
    this.Images.push(img);

    // the nof will be started soon and it will start a chain reaction until all images are loaded
    // the last image loaded that way will call the callback function 
};
*/

MediaManager.prototype.AddString = function (txt, codename) {
    this.Strings.push({string: txt, codename: codename});
};

MediaManager.prototype.GetString = function (codename) {
    for (var i = 0; i < this.Strings.length; i++)
        if (this.Strings[i].codename == codename)
            return this.Strings[i].string;
    return "Error 404 : String.Not.Found";
};

MediaManager.prototype.GetImage = function (codename) {
    for (var i = 0; i < this.Images.length; i++)
        if (this.Images[i].codename == codename)
            return this.Images[i];
    return false;
};

MediaManager.prototype.GetSound = function (codename) {
    for (var i = 0; i < this.Sounds.length; i++)
        if (this.Sounds[i].codename == codename)
            return this.Sounds[i];
    return false;
};



// pack = Array of path-codename-type-Objects
MediaManager.prototype.AddMedia = function (pack, co) {

    //
    var aom = pack.length;
    this.Progress = 0;
    this.ProgressStep = 100 / aom;


    this.Loading = true;
    this.Unloaded = pack;
    var of; // onload function
    // almost a copy of the following algorithmen
    of = function () {
        var co = this.Parameters.co;
        var mm = this.Parameters.mm;
        var pack = mm.Unloaded;

        if (!pack || pack.length <= 0) {
            mm.Loading = false;
            mm.Progress = 100; // drawing will stop when Loading is false - command not needed
            co.function.call(co.that, co.parameter);
            return true;
        }

        var of = this.Parameters.of;
        var curpct = pack.pop();
        mm.Progress += mm.ProgressStep;

        if (curpct.type == MediaManager.prototype.Types.Image) {
            var img = document.createElement("IMG");
            img.onload = of;
            img.codename = curpct.codename;

            img.Parameters = {
                co: co,
                of: of,
                mm: mm
            };

            img.src = curpct.path;

            mm.Images.push(img);
            return;
        }

        if (curpct.type == MediaManager.prototype.Types.Sound) {
            var snd = document.createElement("AUDIO");
            snd.oncanplay = of;
            snd.codename = curpct.codename;
            snd.preload = true;

            snd.Parameters = {
                co: co,
                of: of,
                mm: mm
            };

            snd.src = curpct.path;

            mm.Sounds.push(snd);
            return;
        }

        if (curpct.type == MediaManager.prototype.Types.String) {
            mm.AddString(curpct.path, curpct.codename);
            var obj = {
                Parameters: {
                    co: co,
                    of: of,
                    mm: mm
                }
            };

            of.call(obj);
            return;
        }
    };

    // call the callback-object if pack is empty
    if (!pack || pack.length <= 0) {
        this.Loading = false;
        this.Progress = 100;
        if(co && co.function)
            co.function.call(co.that, co.parameter);
        return true;
    }
    var curpct = pack.pop();
    this.Progress += this.ProgressStep;

    if (curpct.type == MediaManager.prototype.Types.Image) {
        var img = document.createElement("IMG");
        img.onload = of;
        img.codename = curpct.codename;

        img.Parameters = {
            co: co,
            of: of,
            mm: this
        };

        img.src = curpct.path;
        this.Images.push(img);

        return;
    }

    if (curpct.type == MediaManager.prototype.Types.Sound) {
        var snd = document.createElement("AUDIO");
        snd.oncanplay = of;
        snd.codename = curpct.codename;
        snd.preload = true;

        snd.Parameters = {
            co: co,
            of: of,
            mm: this
        };

        snd.src = curpct.path;
        this.Sounds.push(snd);

        return;
    }

    if (curpct.type == MediaManager.prototype.Types.String) {
        this.AddString(curpct.path, curpct.codename);
        var obj = {
            Parameters: {
                co: co,
                of: of,
                mm: this
            }
        };

        of.call(obj);
        return;
    }
};

MediaManager.prototype.Init = function(pack, co){
    this.Pack = pack;
    this.Require("now", co, true);
};

MediaManager.prototype.ExtendInit = function(pack, co){
    this.Pack = this.Pack.concat(pack);
    this.Require("now", co, true);
}

MediaManager.prototype.Require = function(cname, co, withnogroup){
    
    var cnpack = [], p;
    for(var i=0; i<this.Pack.length;i++){
        p = this.Pack[i];
        if(p.group == cname || withnogroup && !p.group)
            cnpack.push(p);
    }
    this.AddMedia(cnpack, co);
};
  

MediaManager.prototype.Types = {
    Image: 1,
    Sound: 2,
    String: 3
};
