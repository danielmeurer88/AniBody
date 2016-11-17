function MediaManager() {
    EngineObject.call(this);

    this.Images = [];
    this.Sounds = [];
    this.Strings = [];

    this.Pack = [];
    this.SortedPack = false;

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

        var center = {x: this.Engine.Canvas.width / 2, y: this.Engine.Canvas.height / 2};
        var bar = {
            x: center.x / 2,
            width: center.x,
            y: center.y - center.y / 20,
            height: center.y / 10
        };
        var r = 5;
        var cent = bar.width / 100;

        // drawing the progress bar current progress
        c.fillStyle = "green";
        c.fillVariousRoundedRect(bar.x, bar.y, this.Progress * cent, bar.height, r);
        // drawing the progress bar border
        c.strokeStyle = "blue";
        c.strokeVariousRoundedRect(bar.x, bar.y, bar.width, bar.height, r);


        c.fillText("Loading: {0}%".format(parseInt(this.Progress)), bar.x, bar.y + bar.height + 10);
    }
    c.restore();
};

MediaManager.prototype.Update = function () {
};

MediaManager.prototype.AddString = function (txt, codename) {
    this.Strings.push({string: txt, codename: codename});
};

MediaManager.prototype.GetString = function (codename) {
    for (var i = 0; i < this.Strings.length; i++)
        if (this.Strings[i].Codename == codename)
            return this.Strings[i].Data;
    return "Error 404 : String.Not.Found";
};

MediaManager.prototype.GetImage = function (codename) {
    for (var i = 0; i < this.Images.length; i++)
        if (this.Images[i].Codename == codename)
            return this.Images[i].Data;
    return false;
};

MediaManager.prototype.GetSound = function (codename) {
    for (var i = 0; i < this.Sounds.length; i++)
        if (this.Sounds[i].Codename == codename)
            return this.Sounds[i].Data;
    return false;
};



/**
 * Load all media, saved in an array (pack), and orders them to the representive Property (Images, Sounds, Strings)
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
            mm.Images.push(curpct);
            curpct.Load(of, {
                co: co,
                of: of,
                mm: mm
            });
            return;
        }

        if (curpct instanceof Sound) {
            mm.Sounds.push(curpct);
            curpct.Load(of, {
                co: co,
                of: of,
                mm: mm
            });
            return;

        }

        if (curpct instanceof Text) {
            // in case of a Text, path is the text
            mm.AddString(curpct.Path, curpct.Codename);
            var obj = {
                Parameters: {
                    co: co,
                    of: of,
                    mm: mm
                }
            };
            // strings a not asynchronally saved so we call the onload function directly
            of.call(obj);
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
        this.Images.push(curpct);
        curpct.Load(of, {
            co: co,
            of: of,
            mm: this // a reference to the MediaManager is needed because the onload function does not know it
        });
        return;
    }

    if (curpct instanceof Sound) {
        this.Sounds.push(curpct);
        curpct.Load(of, {
            co: co,
            of: of,
            mm: this // a reference to the MediaManager is needed because the onload function does not know it
        });
        return;

    }

    if (curpct instanceof Text) {
        // in case of a Text, path is the text
        this.AddString(curpct.Path, curpct.Codename);
        var obj = {
            Parameters: {
                co: co,
                of: of,
                mm: this // a reference to the MediaManager is needed because the onload function does not know it
            }
        };
        // strings a not asynchronally saved so we call the onload function directly
        of.call(obj);
        return;
    }

}


/**
 * Sets mediapack of the manager, loads all "always" media and triggers the CO (callback objects)
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

MediaManager.prototype.SortPack = function () {
    
    this.Pack = this.Pack.sort(function(a,b){
        return (a<b) ? 1 : -1;       
    });
    this.SortedPack = true;
}

/**
 * Searches through the current mediapack in the Manager and loads all of a certain group
 * @param {type} cname
 * @param {type} co
 * @param {type} withnogroup
 * @returns {undefined}
 */
MediaManager.prototype.Require = function (group, co, loadMediaWithNoGroupToo) {

    var req = [], unreq = [], m;
    for (var i = 0; i < this.Pack.length; i++) {
        m = this.Pack[i];
        if (m.IsGroupOf(group) || (loadMediaWithNoGroupToo && m.HasNoGroup))
            req.push(m);
        else
            unreq.push(m);
    }
    console.log(req.length + " data required: group." + group + " ## " + unreq.length + " not required" );
    this.Pack = unreq;
    
    this.LoadMedia(req, co);
};

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

Media.prototype.IsGroupOf = function (group) {
    for (var i = 0; i < this.Group.length; i++)
        if (this.Group[i] == group)
            return true;
    return false;
};

Media.prototype.AddGroup = function (alias) {
    this.Group.push(alias);
};

function Image() {
    Media.call(this, arguments[0], arguments[1], arguments[2]);
}
Image.prototype = Object.create(Media.prototype);
Image.prototype.constructor = Image;

Image.prototype.Load = function (onload, paras) {
    this.Data = document.createElement("IMG");
    this.Data.onload = onload;
    this.Data.Parameters = paras;
    this.Data.src = this.Path;
    this.DataLoaded = true;
};

function Sound() {
    Media.call(this, arguments[0], arguments[1], arguments[2]);
}
Sound.prototype = Object.create(Media.prototype);
Sound.prototype.constructor = Sound;

Sound.prototype.Load = function (onload, paras) {
    this.Data = document.createElement("AUDIO");
    this.Data.oncanplay = onload;
    this.Data.preload = true;

    this.Data.Parameters = paras

    this.Data.src = this.Path;
    this.DataLoaded = true;
};

function Text() {
    Media.call(this, arguments[0], arguments[1], arguments[2]);
}
Text.prototype = Object.create(Media.prototype);
Text.prototype.constructor = Text;