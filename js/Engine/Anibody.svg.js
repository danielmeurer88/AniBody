Anibody.SetPackage("Anibody", "svg");

Anibody.svg.TransformHTML2Image = function(){

    // static dom element structure
    // for testing purposes
    var htmltitle = "Das ist eine Titel";
    var htmltext = "Das ist der Text, der zum Titel dieser Box passen sollte und hier angezeigt wird. Du musst dies einfach einmal so hinnehmen.";
    var htmlbutton = "OK";

    var width = 220;

    var htmlcode = "" +
    "<div style='background-color:grey; padding:4px; width:"+width+"px'>" +
        "<div style='height:18px;font-size:16px;'>"+htmltitle+"</div>" +
        "<div style='font-size:14px;margin-top:5px;'>"+htmltext+"</div>" +
        "<div style='height:18px;font-size:14px;margin-top:5px;'><div>"+htmlbutton+"</div></div>" +
    "</div>";

    // Test structure end

    // beginning of the real function

    var div = document.createElement("div");
    div.innerHTML = htmlcode;
    var element = div.childNodes[0];

    // append the new element to the body.
    // the browser will now render the sizes
    document.body.appendChild(element);

    var height = element.clientHeight;
    width = element.clientWidth;

    // remove the element from the body
    document.body.removeChild(element);

    var svgtext = '' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'">' +
        '<foreignObject width="100%" height="100%">' +
            '<body xmlns="http://www.w3.org/1999/xhtml">' +
                htmlcode +
            '</body>' +
        '</foreignObject>' +
    '</svg>';

    var domURL = window.URL || window.webkitURL || window;
    var blob = new Blob([svgtext], {type: 'image/svg+xml'});
    var url = domURL.createObjectURL(blob);

    var image = document.createElement("img");
    image.width = width;
    image.height = height;

    image.revokeObjectURL = function(){
        var domURL = window.URL || window.webkitURL || window;
        domURL.revokeObjectURL(this.src);
    };

    image.src = url;

    return image;
};


/**
 * 
 * @returns {SVGTest}
 */
Anibody.svg.SVGTest = function SVGTest(x, y, width, height) {
    Anibody.ABO.call(this);

    if(isNaN(x)) x = 0;
    if(isNaN(y)) y = 0;
    if(isNaN(width)) width = 100;
    if(isNaN(height)) height = 100;

    this.X = x;
    this.Y = y;
    this._svgReady = false;

    this._containsHTML = false;

    this._innerHTML = "";
    var self = this;
    Object.defineProperty(this, "InnerHTML", {
        set: function (newValue) {
            self._innerHTML = newValue;
            self._updateElement();
        },
        get: function () { return self._innerHTML; }
    });

    this._element = null;
    this._blob = null;
    this._url = null;
    this._image = null;

    this._width = width;
    Object.defineProperty(this, "Width", {
        set: function (newValue) {
            self._width = newValue;
            self._updateElement();
        },
        get: function () { return self._width; }
    });

    this._height = height;
    Object.defineProperty(this, "Height", {
        set: function (newValue) {
            self._height = newValue;
            self._updateElement();
        },
        get: function () { return self._height; }
    });
   
    this.Initialize();
};

Anibody.svg.SVGTest.prototype = Object.create(Anibody.ABO.prototype);
Anibody.svg.SVGTest.prototype.constructor = Anibody.svg.SVGTest;

Object.defineProperty(Anibody.svg.SVGTest, "name", {value:"Spline"});

/**
 * @see README_DOKU.txt
 */
Anibody.svg.SVGTest.prototype.Initialize = function () {
    this._image = document.createElement("img");
    this._updateElement();
};


Anibody.svg.SVGTest.prototype._updateElement = function () {

    this._svgReady = false;

    var div = document.createElement("div");
    var svgtext;

    if(!this._containsHTML){
        svgtext = '<svg xmlns="http://www.w3.org/2000/svg" width="'+this.Width+'" height="'+this.Height+'">' + this.InnerHTML + '</svg>';
    }else{

        // var doc = document.implementation.createHTMLDocument('');
        // doc.write(this.InnerHTML);
        // doc.documentElement.setAttribute('xmlns', doc.documentElement.namespaceURI);
        // var html = (new XMLSerializer()).serializeToString(doc);

        svgtext = '<svg xmlns="http://www.w3.org/2000/svg" width="'+this.Width+'" height="'+this.Height+'">' +
           '<foreignObject width="100%" height="100%">' +
           '<body xmlns="http://www.w3.org/1999/xhtml">' +
             this.InnerHTML +
           '</body>' +
           '</foreignObject>' +
           '</svg>';
    }

    div.innerHTML = svgtext;
    this._element = div.childNodes[0];

    var domURL = window.URL || window.webkitURL || window;

    if(this._url !== null){
        domURL.revokeObjectURL(this._url);
    }
    this._blob = new Blob([svgtext], {type: 'image/svg+xml'});
    this._url = domURL.createObjectURL(this._blob);

    this._image = document.createElement("img");
    this._image.width = this.Width;
    this._image.height = this.Height;

    var self = this;
    this._image.onload = function(e){
        console.log("SVG loaded");
        self._svgReady = true;
    };

    this._image.src = this._url;

};

/**
 * @see README_DOKU.txt
 */
Anibody.svg.SVGTest.prototype.ProcessInput = function () {};

/**
 * @see README_DOKU.txt
 */
Anibody.svg.SVGTest.prototype.Draw = function (c) {
    c.save();

    var cam = this.Engine.GetCamera();

    if(this._image && this._image.complete && this._svgReady){
        c.drawImage(this._image, this.X, this.Y);
    }

    c.restore();
};

/**
 * @see README_DOKU.txt
 */
Anibody.svg.SVGTest.prototype.Update = function () {};
