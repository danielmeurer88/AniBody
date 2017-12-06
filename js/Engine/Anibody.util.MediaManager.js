
Anibody.SetPackage("Anibody", "util"); // checks if the object Anibody.util exists and if not creates it

/**
 * is responsible to load images and sounds and to understand the relationship with the
 * media and choosen codenames
 * @returns {MediaManager}
 */
Anibody.util.MediaManager = function MediaManager() {
    Anibody.ABO.call(this);

    this.Pictures = new Map();
    this.Sounds = new Map();
    this.Strings = new Map();

    this.Pack = [];
    this.SortedPack = false;

    this.Unloaded = [];
    this.Progress = 0;
    this.ProgressStep = 0;

    this.Loading = false;

}
Anibody.util.MediaManager.prototype = Object.create(Anibody.ABO.prototype);
Anibody.util.MediaManager.prototype.constructor = Anibody.util.MediaManager;

Object.defineProperty(Anibody.util.MediaManager, "name", {value:"MediaManager"});

Anibody.util.MediaManager.prototype.DefaultBarColor = "green";
Anibody.util.MediaManager.prototype.DefaultBarBorderColor = "black";
Anibody.util.MediaManager.prototype.DefaultFontColor = "black";

/**
 * empties the MediaManager
 * @returns {undefined}
 */
Anibody.util.MediaManager.prototype.Flush = function () {
    //this.Pictures = [];
    //this.Sounds = [];
};
/**
 * draws a progess bar while loading files
 * @param {type} c
 * @returns {undefined}
 */
Anibody.util.MediaManager.prototype.Draw = function (c) {
    c.save();

    if (this.Loading) {

        var center = {x: this.Engine.Canvas.width / 2, y: this.Engine.Canvas.height / 2};
        var bar = {
            x: center.x / 2,
            width: center.x,
            y: center.y - center.y / 20,
            height: center.y / 10
        };
        var r = 5;
        var cent = bar.width / 100;

        c.fillStyle = "white";
        c.fillRect(0,0,c.canvas.width, c.canvas.height);

        // drawing the progress bar current progress
        c.fillStyle = Anibody.util.MediaManager.prototype.DefaultBarColor;
        c.fillVariousRoundedRect(bar.x, bar.y, this.Progress * cent, bar.height, r);
        // drawing the progress bar border
        c.strokeStyle = Anibody.util.MediaManager.prototype.DefaultBarBorderColor;
        c.strokeVariousRoundedRect(bar.x, bar.y, bar.width, bar.height, r);

        c.textAlign = "left";
        c.textBaseline = "top";
        c.fillStyle = Anibody.util.MediaManager.prototype.DefaultFontColor;
        c.fillText("Loading: {0}%".format(parseInt(this.Progress)), bar.x, bar.y + bar.height + 10);
    }
    c.restore();
};

/**
 * returns the first image whose codename matches the searched string
 * @param {string} codename
 * @returns {image/false}
 */
Anibody.util.MediaManager.prototype.GetPicture = function (codename) {
    try{
        if(typeof codename === "string")
            return this.Pictures.get(codename).Data;
        else
            return codename;
    }catch(e){
        return false;
    }
};
/**
 * returns the first picture whose codename matches the searched string
 * @param {string} codename
 * @deprecated the Class' name is Picture, therefore the name of this method should be GetPicture
 * @returns {image/false}
 */
Anibody.util.MediaManager.prototype.GetImage = function (codename) {return this.GetPicture(codename);};
/**
 * returns the first audio whose codename matches the searched string
 * @param {string} codename
 * @returns {audio/false}
 */
Anibody.util.MediaManager.prototype.GetSound = function (codename) {
    try{
        return this.Pictures.get(codename).Data;
    }catch(e){
        return false;
    }
};


/**
 * Load all media, saved in an array (pack), and saves them to the respective Property (Pictures, Sounds)
 * When all media are loaded, the callback-object will be called
 * @param {type} pack
 * @param {type} co (callback object)
 * @returns {undefined|Boolean}
 */
Anibody.util.MediaManager.prototype.LoadMedia = function (pack, co) {

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

        // if-statement if the pack is empty then trigger callback object
        if (!pack || pack.length <= 0) {
            mm.Loading = false;
            mm.Progress = 100; // drawing will stop when Loading is false - command not needed
            Anibody.CallObject(co);
            return true;
        }

        var of = this.Parameters.of;
        var curpct = pack.pop(); // curpct = current element of the processed mediapack
        mm.Progress += mm.ProgressStep; // progress progresses one step further - needed for the animation

        if (curpct instanceof Anibody.util.Picture) {
            mm.Pictures.set(curpct.Codename,curpct);
            curpct.Load(of, {
                co: co,
                of: of,
                mm: mm
            });
            return;
        }

        if (curpct instanceof Anibody.util.Sound) {
            mm.Sounds.set(curpct.Codename,curpct);
            curpct.Load(of, {
                co: co,
                of: of,
                mm: mm
            });
            return;

        }

    }; // END of of - the anonym onload function, which is called at the end of the anonym onload function of every Picture and Sound

    // call the callback-object if pack is empty
    if (!pack || pack.length <= 0) {
        this.Loading = false;
        this.Progress = 100;
        Anibody.CallObject(co);
        return true;
    }
    var curpct = pack.pop();
    this.Progress += this.ProgressStep;

    if (curpct instanceof Anibody.util.Picture) {
        this.Pictures.set(curpct.Codename, curpct);
        curpct.Load(of, {
            co: co,
            of: of,
            mm: this // a reference to the MediaManager is needed because the onload function does not know it
        });
        return;
    }

    if (curpct instanceof Anibody.util.Sound) {
        this.Sounds.set(curpct.Codename, curpct);
        curpct.Load(of, {
            co: co,
            of: of,
            mm: this // a reference to the MediaManager is needed because the onload function does not know it
        });
        return;

    }


};

/**
 * Sets (overwrite existing) mediapack of the manager, loads all "always" media and triggers the CO (callback objects)
 * @param {array} pack - an array of media files
 * @param {object} co - callback object, which will be called afterwards
 * @returns {undefined}
 */
Anibody.util.MediaManager.prototype.SetMediaPack = function (pack, co) {
    this.Pack = pack;
    this.SortPack();
    this.Require("always", co, true);
};
/**
 * Extends the current mediapack of the manager, loads all "always" media and triggers the CO (callback objects)
 * @param {array} pack - an array of media files
 * @param {object} co - callback object, which will be called afterwards
 * @returns {undefined}
 */
Anibody.util.MediaManager.prototype.ExtendMediaPack = function (pack, co) {
    
    this.Pack = this.Pack.concat(pack);
    this.SortPack();
    this.Require("always", co, true);
}

/**
 * @deprecated sorting category doesn't make sense
 * @returns {undefined}
 */
Anibody.util.MediaManager.prototype.SortPack = function () {
    
    this.Pack = this.Pack.sort(function(a,b){
        return (a<b) ? 1 : -1;       
    });
    this.SortedPack = true;
}

/**
 * Searches through the current mediapack in the Manager and loads all of a certain group
 * @param {string} group group name, which is supposed to be loaded
 * @param {object} co - callbach, which will be called afterwarsd
 * @param {boolean} loadMediaWithNoGroupToo - includes to load media which has no group
 * @returns {undefined}
 */
Anibody.util.MediaManager.prototype.Require = function (group, co, loadMediaWithNoGroupToo) {

    var req = [], unreq = [], m;
    
    if(!co){
        co = function(){}.getCallbackObject(this.Engine, "default");
    }
    
    for (var i = 0; i < this.Pack.length; i++) {
        m = this.Pack[i];
        if (m.IsGroupOf(group) || (loadMediaWithNoGroupToo && m.HasNoGroup))
            req.push(m);
        else
            unreq.push(m);
    }
    //console.log(req.length + " data required from group '" + group + "' ## " + unreq.length + " data left" );
    this.Pack = unreq;
    
    this.LoadMedia(req, co);
};

/**
 * Represents the super class of the media files (images, sounds) and is strongly
 * used by the MediaManager
 * @param {string|object} path file path | file source | URI or Object
 * @param {string} codename
 * @param {string} group
 * @returns {Media}
 */
Anibody.util.Media = function Media(path, codename, group) {

    if (typeof path == "object") {
        codename = path.codename;
        group = path.group;
        path = path.path;
    }

    this.Path = path;
    this.Codename = codename;
    this.HasNoGroup = (group) ? false : true;
    // the value of group/path.group can be "undefined" (it will be "always" then)
    // it can be a string or an array of strings

    this.Group = [];
    if (typeof group == "object")
        this.Group = this.Group.concat(group);
    else
        this.Group = [group || "always"];
    
    this.Data;
    this.DataLoaded = false;
};

/**
 * Returns true if media is of the given group
 * @param {string} group
 * @returns {Boolean}
 */
Anibody.util.Media.prototype.IsGroupOf = function (group) {
    for (var i = 0; i < this.Group.length; i++)
        if (this.Group[i] == group)
            return true;
    return false;
};

/**
 * Adds a group to a media file
 * @param {string} alias
 * @returns {undefined}
 */
Anibody.util.Media.prototype.AddGroup = function (alias) {
    this.Group.push(alias);
};

/**
 * Media sup type: capsulates an html-image
 * @returns {Picture}
 */
Anibody.util.Picture = function Picture() {
    Anibody.util.Media.apply(this, arguments);
}
Anibody.util.Picture.prototype = Object.create(Anibody.util.Media.prototype);
Anibody.util.Picture.prototype.constructor = Anibody.util.Picture;

Object.defineProperty(Anibody.util.Picture, "name", {value:"Picture"});

/**
 * Adds the onload-function and needed parameters from the MediaManager to the image
 * @param {function} onload
 * @param {type} paras
 * @returns {undefined}
 */
Anibody.util.Picture.prototype.Load = function (onload, paras) {
    this.Data = document.createElement("IMG");
    this.Data.onload = onload;
    this.Data.Parameters = paras;
    this.Data.src = this.Path;
    this.DataLoaded = true;
};
/**
 * Returns the DataURL from the image
 * @returns {unresolved}
 */
Anibody.util.Picture.prototype.GetDataURL = function () {
    var offcan = document.createElement("CANVAS");
    offcan.width = this.Data.width;
    offcan.height = this.Data.height;
    var c = offcan.getContext("2d");
    c.drawPicture(this.Data, 0, 0);
    return offcan.toDataURL();
};
/**
 * Media sup type: capsulates an html-audio
 * @returns {Sound}
 */
Anibody.util.Sound = function Sound() {
    Anibody.util.Media.apply(this, arguments);
}
Anibody.util.Sound.prototype = Object.create(Anibody.util.Media.prototype);
Anibody.util.Sound.prototype.constructor = Anibody.util.Sound;

Object.defineProperty(Anibody.util.Sound, "name", {value:"Sound"});

/**
 * Adds the onload-function and needed parameters from the MediaManager to the Sound
 * @param {function} onload
 * @param {type} paras
 * @returns {undefined}
 */
Anibody.util.Sound.prototype.Load = function (onload, paras) {
    this.Data = document.createElement("AUDIO");
    this.Data.oncanplay = onload;
    this.Data.preload = true;

    this.Data.Parameters = paras;

    this.Data.src = this.Path;
    this.DataLoaded = true;
};