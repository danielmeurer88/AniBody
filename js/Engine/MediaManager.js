/**
 * is responsible to load images and sounds and to understand the relationship with the
 * media and choosen codenames
 * @returns {MediaManager}
 */
function MediaManager() {
    EngineObject.call(this);

    this.Images = new HashTable();
    this.Sounds = new HashTable();
    this.Strings = new HashTable();

    this.Pack = [];
    this.SortedPack = false;

    this.Unloaded = [];
    this.Progress = 0;
    this.ProgressStep = 0;

    this.Loading = false;

}
MediaManager.prototype = Object.create(EngineObject.prototype);
MediaManager.prototype.constructor = MediaManager;

MediaManager.prototype.DefaultBarColor = "green";
MediaManager.prototype.DefaultBarBorderColor = "black";
MediaManager.prototype.DefaultFontColor = "black";

/**
 * empties the MediaManager
 * @returns {undefined}
 */
MediaManager.prototype.Flush = function () {
    //this.Images = [];
    //this.Sounds = [];
};
/**
 * draws a progess bar while loading files
 * @param {type} c
 * @returns {undefined}
 */
MediaManager.prototype.Draw = function (c) {
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
        c.fillStyle = MediaManager.prototype.DefaultBarColor;
        c.fillVariousRoundedRect(bar.x, bar.y, this.Progress * cent, bar.height, r);
        // drawing the progress bar border
        c.strokeStyle = MediaManager.prototype.DefaultBarBorderColor;
        c.strokeVariousRoundedRect(bar.x, bar.y, bar.width, bar.height, r);

        c.textAlign = "left";
        c.textBaseline = "top";
        c.fillStyle = MediaManager.prototype.DefaultFontColor;
        c.fillText("Loading: {0}%".format(parseInt(this.Progress)), bar.x, bar.y + bar.height + 10);
    }
    c.restore();
};
/**
 * no need for update
 * @returns {undefined}
 */
MediaManager.prototype.Update = function () {
};

/**
 * returns the first images whose codename matches the searched string
 * @param {string} codename
 * @returns {image/false}
 */
MediaManager.prototype.GetImage = function (codename) {
    try{
        return this.Images.Get(codename).Data;
    }catch(e){
        return false;
    }
};
/**
 * returns the first audio whose codename matches the searched string
 * @param {string} codename
 * @returns {audio/false}
 */
MediaManager.prototype.GetSound = function (codename) {
    try{
        return this.Images.Get(codename).Data;
    }catch(e){
        return false;
    }
};


/**
 * Load all media, saved in an array (pack), and saves them to the representive Property (Images, Sounds)
 * When all media are loaded, the callback-object will be called
 * @param {type} pack
 * @param {type} co (callback object)
 * @returns {undefined|Boolean}
 */
MediaManager.prototype.LoadMedia = function (pack, co) {

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
            co.Call();
            return true;
        }

        var of = this.Parameters.of;
        var curpct = pack.pop(); // curpct = current element of the processed mediapack
        mm.Progress += mm.ProgressStep; // progress progresses one step further - needed for the animation

        if (curpct instanceof Image) {
            mm.Images.Set(curpct.Codename,curpct);
            curpct.Load(of, {
                co: co,
                of: of,
                mm: mm
            });
            return;
        }

        if (curpct instanceof Sound) {
            mm.Sounds.Set(curpct.Codename,curpct);
            curpct.Load(of, {
                co: co,
                of: of,
                mm: mm
            });
            return;

        }

    }; // END of of - the anonym onload function, which is called at the end of the anonym onload function of every Image and Sound

    // call the callback-object if pack is empty
    if (!pack || pack.length <= 0) {
        this.Loading = false;
        this.Progress = 100;
        if (co && co.function)
            co.Call();
        return true;
    }
    var curpct = pack.pop();
    this.Progress += this.ProgressStep;

    if (curpct instanceof Image) {
        this.Images.Set(curpct.Codename, curpct);
        curpct.Load(of, {
            co: co,
            of: of,
            mm: this // a reference to the MediaManager is needed because the onload function does not know it
        });
        return;
    }

    if (curpct instanceof Sound) {
        this.Sounds.Set(curpct.Codename, curpct);
        curpct.Load(of, {
            co: co,
            of: of,
            mm: this // a reference to the MediaManager is needed because the onload function does not know it
        });
        return;

    }


}

/**
 * Sets (overwrite existing) mediapack of the manager, loads all "always" media and triggers the CO (callback objects)
 * @param {type} pack
 * @param {type} co
 * @returns {undefined}
 */
MediaManager.prototype.SetMediaPack = function (pack, co) {
    this.Pack = pack;
    this.SortPack();
    this.Require("always", co, true);
};
/**
 * Extends the current mediapack of the manager, loads all "always" media and triggers the CO (callback objects)
 * @param {type} pack
 * @param {type} co
 * @returns {undefined}
 */
MediaManager.prototype.ExtendMediaPack = function (pack, co) {
    
    this.Pack = this.Pack.concat(pack);
    this.SortPack();
    this.Require("always", co, true);
}

/**
 * @deprecated sorting category doesn't make sense
 * @returns {undefined}
 */
MediaManager.prototype.SortPack = function () {
    
    this.Pack = this.Pack.sort(function(a,b){
        return (a<b) ? 1 : -1;       
    });
    this.SortedPack = true;
}

/**
 * Searches through the current mediapack in the Manager and loads all of a certain group
 * @param {string} group group name, which is supposed to be loaded
 * @param {object} co
 * @param {boolean} loadMediaWithNoGroupToo
 * @returns {undefined}
 */
MediaManager.prototype.Require = function (group, co, loadMediaWithNoGroupToo) {

    var req = [], unreq = [], m;
    
    if(!co){
        co = new Callback(this.Engine, function(){}, false);
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
function Media(path, codename, group) {

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
}
/**
 * Returns true if media is of the given group
 * @param {string} group
 * @returns {Boolean}
 */
Media.prototype.IsGroupOf = function (group) {
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
Media.prototype.AddGroup = function (alias) {
    this.Group.push(alias);
};

/**
 * Media sup type: capsulates an html-image
 * @returns {Image}
 */
function Image() {
    Media.call(this, arguments[0], arguments[1], arguments[2]);
}
Image.prototype = Object.create(Media.prototype);
Image.prototype.constructor = Image;

/**
 * Adds the onload-function and needed parameters from the MediaManager to the image
 * @param {function} onload
 * @param {type} paras
 * @returns {undefined}
 */
Image.prototype.Load = function (onload, paras) {
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
Image.prototype.GetDataURL = function () {
    var offcan = document.createElement("CANVAS");
    offcan.width = this.Data.width;
    offcan.height = this.Data.height;
    var c = offcan.getContext("2d");
    c.drawImage(this.Data, 0, 0);
    return offcan.toDataURL();
};
/**
 * Media sup type: capsulates an html-audio
 * @returns {Sound}
 */
function Sound() {
    Media.call(this, arguments[0], arguments[1], arguments[2]);
}
Sound.prototype = Object.create(Media.prototype);
Sound.prototype.constructor = Sound;
/**
 * Adds the onload-function and needed parameters from the MediaManager to the Sound
 * @param {function} onload
 * @param {type} paras
 * @returns {undefined}
 */
Sound.prototype.Load = function (onload, paras) {
    this.Data = document.createElement("AUDIO");
    this.Data.oncanplay = onload;
    this.Data.preload = true;

    this.Data.Parameters = paras;

    this.Data.src = this.Path;
    this.DataLoaded = true;
};