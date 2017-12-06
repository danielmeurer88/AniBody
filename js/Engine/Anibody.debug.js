Anibody.SetPackage("Anibody", "debug");

/**
 * creates a downloadable object dumb
 * @param {object} obj - the object, which to dumb
 * @param {string} name - the name of the object
 * @returns {Anibody.debug.ObjectDumb}
 */
Anibody.debug.ObjectDumb = function ObjectDumb(obj, name) {

    this.Object = obj;
    this._already = [];
    this._maxDepth = 5;

    if (typeof name === "undefined")
        name = "dumbedObject";

    this._name = name;

    this.Image = null;

    this._dObjContainer = {}; // dumbed object Container

    this.Width = 0;
    this.Height = 0;
    
    this.ColWidth = []; // 2-dim Array - [depth][widthOfAllNamesInThatCol]
    // later it is transformed into 1-dim Array with [max([widthOfAllNamesInThatCol])]
    
    this.DrawOrder = []; // the right order every item has to be drawn (top->bottom)

    this._tabulator = 80;
    this._fh = 30;
    this._margin = 2;

    this._dataURL = 0;

    this.Initialize();
};

Object.defineProperty(Anibody.debug.ObjectDumb, "name", {value:"ObjectDumb"});

Anibody.debug.ObjectDumb.prototype.Initialize = function () {

    this._dObjContainer = {
        type: this._getType(this.Object),
        name: this._name,
        element: this.Object,
        children: [],
        parent : null,
        depth: 0,
        leaf : false
    };

    this._analyze();

    this._createImage();
};

Anibody.debug.ObjectDumb.prototype._analyze = function () {

    // getting an offscreen canvas and its context to measure text width
    var off = document.createElement("CANVAS");
    off.width = 10;
    off.height = 10;
    var c = off.getContext("2d");
    c.setFontHeight(this._fh);

    // get real size needed for the canvas
    var i;
    
    /**
     * inner function, which will be called recursively to obtain the wanted treeview
     * @param {object} obj - currently regarded container
     * @returns {undefined}
     */
    var rec = function (obj) {
        
        var type;
        var analyzeDeeper = true;

        if (obj.depth > this._maxDepth) {
            analyzeDeeper = false;
        }
        
        if (typeof this.ColWidth[obj.depth] === "undefined") {
            this.ColWidth[obj.depth] = [];
        }
        
        var expectedText = obj.name + " (" + obj.type + ")";
        var expectedWidth = c.measureText(expectedText).width + 10;
        this.ColWidth[obj.depth].push(expectedWidth);

        if(analyzeDeeper)
            // looping through the children of the currently regarded element
            for (var attr in obj.element) {

                // get the type of the child
                type = this._getType(obj.element[attr]);
                // add it into a container (that containts further information)
                var childContainer = {parent : obj, type: type, element: obj.element[attr], name: attr, children: [], depth: obj.depth + 1, leaf : false};
                
                // if child is an object...
                if (["number", "boolean", "string", "null"].indexOf(type) < 0) {

                    // check if child was already analyzed
                    if (this._already.indexOf(obj.element[attr]) < 0) {
                        // hasn't been analyzed yet, therefore added to the already array
                        this._already.push(obj.element[attr]);
                        
                        // needs to be before the recursive call!!
                        // through the recursvise structure - objects are called the way so that they can be linear added to an array
                        // which will be the wanted order to draw them
                        this.DrawOrder.push(childContainer);
                        
                        rec.call(this, childContainer);
                    }else{
                        
                        // through the recursvise structure - objects are called the way so that they can be linear added to an array
                        // which will be the wanted order to draw them
                        this.DrawOrder.push(childContainer);
                        
                        childContainer.leaf = true;
                    }
                              
                }else{
                    // through the recursvise structure - objects are called the way so that they can be linear added to an array
                    // which will be the wanted order to draw them
                    this.DrawOrder.push(childContainer);
                    childContainer.leaf = true;
                }
                obj.children.push(childContainer);
                
            }
    };

    this.DrawOrder.push(this._dObjContainer);
    rec.call(this, this._dObjContainer);
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    this.Height = this._margin * 2; // margins top and down
    this.Width = this._margin * 2;
    // loop as often as there are columns
    for (var i = 0; i < this.ColWidth.length; i++) {
        // colWidth[i] is still an array with width values of the names of the items of the depth i
        this.ColWidth[i] = Math.max.apply({}, this.ColWidth[i]);
        // now, colWidth[i] is the width value, which it needs to be big enough for all items of the depth i
        this.Width += this.ColWidth[i];
    }
    
    var rowheight = this._fh + this._margin; // fontheight + 2x 1/2 margin between rows

    this.Height += this.DrawOrder.length * rowheight;
    
    console.log("width: " + this.Width + "\nheight: " + this.Height);
};

Anibody.debug.ObjectDumb.prototype._createImage = function () {

    // draw image

    var off = document.createElement("CANVAS");
    off.width = this.Width;
    off.height = this.Height;
    var c = off.getContext("2d");
    
    // white background
    c.fillStyle = "white";
    c.fillRect(0,0,this.Width, this.Height);
    c.fillStyle = "black";
    
    c.textAlign = "left";
    c.textBaseline = "top";
    c.setFontHeight(this._fh);
    
    var rowheight = this._fh + this._margin; // fontheight + 2x 1/2 margin between rows

    var x = this._margin;
    var y = this._margin;
    var w;
    var txt;
    var el;
    for (var i = 0; i < this.DrawOrder.length; i++) {
        el = this.DrawOrder[i];
        //w = getWidthForDepth.call(this,el.depth);
        w = this._tabulator*el.depth;
        txt = el.name + " (" + el.type + ")";
        c.fillText(txt, x + w, y);
        y += rowheight;
    }

    this._dataURL = off.toDataURL();
};

Anibody.debug.ObjectDumb.prototype.Download = function () {
    Anibody.prototype.Download("dump_" + this._name + ".png", this._dataURL);
};

Anibody.debug.ObjectDumb.prototype._getType = function (el) {

    if (el === null)
        return "null";

    var type = typeof el;

    if (type !== "object")
        return type;

    if (el.push)
        return "array";

    var con = el.constructor.toString();
    var ifunc = con.indexOf("function ");
    var ibracket = con.indexOf("(");
    if (ifunc === 0) {
        con = con.substr(9, ibracket - 9);
    }
    return con;
};

/**
 * uses the developer console to print the value of added attributes and constantly
 * refreshes the values
 * @returns {Anibody.debug.Consolero.Instance|Anibody.debug.Consolero}
 */
Anibody.debug.Consolero = function Consolero() {
    // only one instance is allowed
    if (Anibody.debug.Consolero.Instance !== null)
        return Anibody.debug.Consolero.Instance;
    Anibody.debug.Consolero.Instance = this;

    this._savelogf = console.log; // holds the original log-function
    this._intref = null; // ref integer of the interval
    this.MonitorArr = []; // Array for all the attributes that are monitored

    /**
     * cancels the console.log-function
     * @returns {undefined}
     */
    this._cancel = function () {
        console.log = function () {
            return false;
        };
    };
    /**
     * restores the console.log-function to its original function
     * @returns {undefined}
     */
    this._activate = function () {
        console.log = this._savelogf;
    };

    /**
     * starts the monitoring process in the developer console
     * other console.log-calls will be blocked
     * @returns {undefined}
     */
    this.Start = function () {

        if (this.MonitorArr.length <= 0) {
            console.log("Consolero is empty");
            return;
        }

        var f = function (that) {
            that._activate();
            console.clear();
            var m;
            for (var i = 0; i < that.MonitorArr.length; i++) {
                m = that.MonitorArr[i];
                console.log(m.label + " : " + m.object[m.attr]);
            }
            that._cancel();
        };
        this._intref = window.setInterval(f, 250, this);
    };
    /**
     * stops the monitoring process
     * other console.log-calls won't be blocked anymore
     * @returns {undefined}
     */
    this.Stop = function () {
        window.clearTimeout(this._intref);
        this._activate();
    };
    /**
     * adds an attribute, which will be monitored
     * @param {object} obj - the objects of the attribute
     * @param {string} attr - the in-code name of the attribute
     * @param {string} label - (optional) the name or a short description of the attribute
     * @returns {undefined}
     */
    this.AddAttribute = function (obj, attr, label) {
        if (typeof label !== "string")
            label = attr;
        this.MonitorArr.push({object: obj, attr: attr, label: label});
    };
};

Object.defineProperty(Anibody.debug.Consolero, "name", {value:"Consolero"});

Anibody.debug.Consolero.Instance = null; // saves the instance

/**
 * Collects and displays the current value of objects and their attributs in real time
 * It opens and extra popup window
 * @returns {DebugWindow}
 */
Anibody.debug.DebugWindow = function DebugWindow() {
    this.FontHeight = 14;
    this.Timestamp = Date.now();
    this.Window = null;
    this.Document;

    this.Variables = [];
    this.FormatStrings = [];

    this.Hide = false;
    this.MaxDepth = 2;

    this.Initialize();
};

Object.defineProperty(Anibody.debug.DebugWindow, "name", {value:"DebugWindow"});

/**
 * @see README_DOKU.txt
 */
Anibody.debug.DebugWindow.prototype.Initialize = function () {};
/**
 * "Draws" the current values of the monitored objects into the new window
 * while using a table for each object
 * @returns {undefined}
 */
Anibody.debug.DebugWindow.prototype.Draw = function () {

    if (!this.Window)
        return;

    $(this.Body).html("");

    var str = "<p>last refresh: " + Date.now() + "</p>";

    var v;
    for (var i = 0; i < this.Variables.length; i++) {
        v = this.Variables[i];
        str += this._getHTML(v.object, v.keys, i, v.name);
    }

    $(this.Body).html(str);

};
/**
 * Adds a new object to the monitored list, an array of attributes to focus on
 * and the name of the respective table
 * @param {Object} obj
 * @param {String-Array} attr
 * @param {String} name
 * @returns {undefined}
 */
Anibody.debug.DebugWindow.prototype.Add = function (obj, attr, name) {
    if (!attr) {
        attr = [];
        for (var key in obj) {
            attr.push(key);
        }
    }
    this.Variables.push({object: obj, keys: attr, name: name});
};
/**
 * Adds an object to the monitoring list and all sub-objects within a given depth
 * @param {Object} obj
 * @param {String} name
 * @param {Number} depth
 * @returns {Boolean}
 */
Anibody.debug.DebugWindow.prototype.RecursiveAdd = function (obj, name, depth) {

    this.Add(obj, false, name);

    if (depth <= 0)
        return true;

    for (var key in obj) {
        if (typeof obj[key] == "object") {
            this.RecursiveAdd(obj[key], name + "." + key, --depth)
        }
    }
};
/**
 * Opens the new window
 * @returns {Boolean}
 */
Anibody.debug.DebugWindow.prototype.Open = function () {

    if (this.IsOpen)
        return false;

    this.Window = window.open("", "Debug Winow", "width=460,height=650");
    this.Document = this.Window.document;

    this.Body = this.Document.body;
    this.IsOpen = true;
    this._setCSS();

};
/**
 * @see README_DOKU.txt
 */
Anibody.debug.DebugWindow.prototype.Update = function () {

    if (!this.Window)
        return false;

    this.IsOpen = !this.Window.closed;

};
/**
 * embeddeds the needed data of the monitored objects in a table and returns the html-code as a string
 * @param {type} obj
 * @param {type} keys
 * @param {type} nr
 * @param {type} name
 * @returns {String}
 */
Anibody.debug.DebugWindow.prototype._getHTML = function (obj, keys, nr, name) {

    var str = "<div class='objects' id='Object_" + nr + "'><p>" + name + "</p>\n\
                <table width=440>\n\
                    <tr>\n\
                        <th>Attr</th><th>Wert</th><th>Class</th>\n\
                    </tr>";

    for (var i = 0; i < keys.length; i++) {
        str += "<tr>\n\
                    <td>" + keys[i] + "</td><td>" + this._what(obj, keys[i]) + "</td><td>" + this._getClass(obj, keys[i]) + "</td>\n\
                </tr>";
    }

    return str + "</table></div>"
};
/**
 * Applies the wanted css rules to the new window
 * @returns {undefined}
 */
Anibody.debug.DebugWindow.prototype._setCSS = function () {

    var head = this.Document.head;

    var rule_body = "body { font-size : 16px }";
    var rule_objects = " .objects {margin: 5px; width:440px;} ";
    var rule_p = " p {width:100%; text-align: center; font-size : 20px}";
    var rule_table = " table { border-collapse: collapse;  } table, th, td {border: 1px solid black;} ";

    var css = "<style> " + rule_body + " " + rule_objects + " " + rule_p + " " + rule_table + " </style>"

    $(head).append(css);

};
/**
 * finds out the type of the monitored attribute
 * @param {type} obj the objects which owns the attribute
 * @param {type} key the name of the attribute
 * @returns {Object.prototype._what.str|String}
 */
Anibody.debug.DebugWindow.prototype._what = function (obj, key) {
    //var val = obj[key];

    var handeled = false;
    var str = "";

    if (key == "Engine" && !handeled) {
        str += "reference to Engine";
        handeled = true;
    }
    if (typeof obj[key] == "function" && !handeled) {
        str += "function( )";
        handeled = true;
    }
    if (typeof obj[key] == "object" && !handeled) {
        str += "object"
        handeled = true;
    }
    if (typeof obj[key] != "object" && !handeled) {
        str += "" + obj[key];
        handeled = true;
    }

    return str;
};
/**
 * returns the class or the type of an attribute
 * @param {type} obj
 * @param {type} key
 * @returns {String}
 */
Anibody.debug.DebugWindow.prototype._getClass = function (obj, key) {
    var object = obj[key];

    if (typeof object === "undefined") {
        return "undefined";
    }
    if (object === null) {
        return "null";
    }

    var con = object.constructor.toString();

    var ifunc = con.indexOf("function ");
    var ibracket = con.indexOf("(");

    if (ifunc == 0) {
        con = con.substr(9, ibracket - 9);
        return "CLASS::" + con;
    }
};


/**
 * Monitors the attribute of an object, triggers a callback object whenever the value changes
 * @param {object} obj Object
 * @param {string} attr
 * @param {object} cbo (optional)
 * @param {string} name (optional)
 * @returns {Monitor}
 */
Anibody.debug.Monitor = function Monitor(obj, attr, cbo, name) {
    Anibody.EngineObject.call(this);

    if (typeof name !== "undefined" && name !== false && name !== null)
        this.Name = name;
    else
        this.Name = "Monitor " + (++Monitor.Counter);

    this.Object = obj;
    this.Attribute = attr;
    this.Class = "";

    if (typeof cbo !== "undefined" && cbo !== false && cbo !== null)
        this.CallbackObject = cbo;
    else
        this.CallbackObject = {that: this, function(newv, oldv, startv, para) {
                console.log("'{0}' changed from '{1}' to '{2}' and began with '{3}'".format(this.Name, oldv, newv, startv));
            }, parameter: "default"};

    this.StartValue;
    this.OldValue;
    this.CurrentValue;

    this.Initialize();
};

Object.defineProperty(Anibody.debug.Monitor, "name", {value:"Monitor"});

Anibody.debug.Monitor.prototype = Object.create(Anibody.EngineObject.prototype);
Anibody.debug.Monitor.prototype.constructor = Anibody.debug.Monitor;
Anibody.debug.Monitor.Counter = 0;

/**
 * can be seen as an extension of the constructor function
 * @returns {undefined}
 */
Anibody.debug.Monitor.prototype.Initialize = function () {

    this.StartValue = this.Object[this.Attribute];
    this.OldValue = this.StartValue;
    this.CurrentValue = this.StartValue;

    this._getClass();
}

/**
 * Update
 * @returns {undefined}
 */
Anibody.debug.Monitor.prototype.Update = function () {
    this.CurrentValue = this.Object[this.Attribute];

    if (this._didAttrChange()) {
        var cbo = this.CallbackObject;
        cbo.function.call(cbo.that, this.CurrentValue, this.OldValue, this.StartValue, cbo.para);
    }

    this.OldValue = this.CurrentValue;
};

/**
 * Saves the constructor function name of the object
 * @param {anything} obj
 * @returns {String}
 */
Anibody.debug.Monitor.prototype._getClass = function () {
    var con = this.Object.constructor.toString();

    var ifunc = con.indexOf("function ");
    var ibracket = con.indexOf("(");

    if (ifunc == 0) {
        con = con.substr(9, ibracket - 9);
    }

    this.Class = con;
};

/**
 * returns true if value has changed
 * @returns {Boolean}
 */
Anibody.debug.Monitor.prototype._didAttrChange = function () {
    if (this.CurrentValue !== this.OldValue) {
        return true;
    } else {
        return false;
    }
};