

/**
 * Collects and displays the current value of objects and their attributs in real time
 * It opens and extra popup window
 * @returns {DebugWindow}
 */
function DebugWindow(){
    this.FontHeight = 14;
    this.Timestamp = Date.now();
    this.Window = null;
    this.Document;
    
    this.Variables = [];
    this.FormatStrings = [];
    
    this.Hide = false;
    this.MaxDepth = 2;
    
this.Initialize();
}

DebugWindow.prototype.Initialize = function(){};

/**
 * "Draws" the current values of the monitored objects into the new window
 * while using a table for each object
 * @returns {undefined}
 */
DebugWindow.prototype.Draw = function(){
    
    if(!this.Window) return;
    
    $(this.Body).html("");
    
    var str = "<p>last refresh: " + Date.now() +"</p>";
    
    var v;
    for(var i=0; i<this.Variables.length; i++){
        v = this.Variables[i];
        str += this._getHTML(v.object, v.keys, i, v.name);
    }
    
    $(this.Body).html(str);
    
};

/**
 * Adds a new object to the monitored list, an array of attributes to focus on and the name of the representiv table
 * @param {Object} obj
 * @param {String-Array} attr
 * @param {String} name
 * @returns {undefined}
 */
DebugWindow.prototype.Add = function(obj, attr, name){
    if(!attr){
        attr = [];
        for(var key in obj){
            attr.push(key);
        }
    }
    this.Variables.push({object : obj, keys : attr, name : name});    
};

/**
 * Adds an object to the monitoring list and all sub-objects within a given depth
 * @param {Object} obj
 * @param {String} name
 * @param {Number} depth
 * @returns {Boolean}
 */
DebugWindow.prototype.RecursiveAdd = function(obj, name, depth){
    
    this.Add(obj, false, name);
    
    if(depth <= 0)
        return true;
    
    for(var key in obj){
        if(typeof obj[key] == "object"){
            this.RecursiveAdd(obj[key], name+"."+key, --depth)
        }
    }
};

/**
 * Opens the new window
 * @returns {Boolean}
 */
DebugWindow.prototype.Open = function(){
    
    if(this.IsOpen) return false;
    
    this.Window = window.open("", "Debug Winow", "width=460,height=650");
    this.Document = this.Window.document;
    
    this.Body = this.Document.body;
    this.IsOpen = true;
    this._setCSS();
    
};

/**
 * 
 * @returns {Boolean}
 */
DebugWindow.prototype.Update = function(){
    
    if(!this.Window) return false;
    
    this.IsOpen = !this.Window.closed;
    
//    if(this.Window.closed && !this.Hide){
//        if(this.Variables.length)
//            this.Open();
//    }
    
};

/**
 * embeddeds the needed data of the monitored objects in a table and returns the html-code as a string
 * @param {type} obj
 * @param {type} keys
 * @param {type} nr
 * @param {type} name
 * @returns {String}
 */
DebugWindow.prototype._getHTML = function(obj, keys, nr, name){
    
    var str = "<div class='objects' id='Object_"+nr+"'><p>"+name+"</p>\n\
                <table width=440>\n\
                    <tr>\n\
                        <th>Attr</th><th>Wert</th><th>Class</th>\n\
                    </tr>";
    
    for(var i=0; i<keys.length; i++){
        str += "<tr>\n\
                    <td>"+keys[i]+"</td><td>"+ this._what(obj, keys[i]) +"</td><td>"+ this._getClass(obj, keys[i]) +"</td>\n\
                </tr>";
    }
    
    return str + "</table></div>"
};

/**
 * Applies the wanted css rules to the new window
 * @returns {undefined}
 */
DebugWindow.prototype._setCSS = function(){
    
    var head = this.Document.head;
    
    var rule_body = "body { font-size : 16px }";
    var rule_objects = " .objects {margin: 5px; width:440px;} ";
    var rule_p = " p {width:100%; text-align: center; font-size : 20px}";
    var rule_table = " table { border-collapse: collapse;  } table, th, td {border: 1px solid black;} ";
    
    var css = "<style> "+rule_body+" "+rule_objects+" "+rule_p+" "+rule_table+ " </style>"
    
    $(head).append(css);
    
};

/**
 * finds out the type of the monitored attribute
 * @param {type} obj the objects which owns the attribute
 * @param {type} key the name of the attribute
 * @returns {Object.prototype._what.str|String}
 */
DebugWindow.prototype._what = function(obj, key){
    //var val = obj[key];
    
    var handeled = false;
    var str = "";
    
    if(key == "Engine" && !handeled){
        str += "reference to Engine";
        handeled = true;
    }
    if(typeof obj[key] == "function" && !handeled){
        str += "function( )";
        handeled = true;
    }
    if(typeof obj[key] == "object" && !handeled){
        str += "object"
        handeled = true;
    }
    if(typeof obj[key] != "object" && !handeled){
        str += ""+obj[key];
        handeled = true;
    }
    
    return str;
};

DebugWindow.prototype._getClass = function(obj, key){
    var object = obj[key];
    
    if(object == "undefined"){
        return "undefined";
    }
    if(object == null){
        return "null";
    }
    
    var con = object.constructor.toString();
     
    var ifunc = con.indexOf("function ");
    var ibracket = con.indexOf("(");
    
    if(ifunc == 0){
        con = con.substr(9, ibracket - 9);
        return "CLASS::"+con
    }
    ;    
};