Anibody.SetPackage("Anibody", "svg");

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
    this._updateElement();
};


Anibody.svg.SVGTest.prototype._updateElement = function () {

    this._svgReady = false;

    var svgtext;

    if(!this._containsHTML){
        svgtext = '<svg xmlns="http://www.w3.org/2000/svg" width="'+this.Width+'" height="'+this.Height+'">' + this.InnerHTML + '</svg>';
    }else{

        // var doc = document.implementation.createHTMLDocument('');
        // doc.write(this.InnerHTML);
        // doc.documentElement.setAttribute('xmlns', doc.documentElement.namespaceURI);
        // var html = (new XMLSerializer()).serializeToString(doc);

        var svgtext = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="'+this.Width+'" height="'+this.Height+'">' +
            '<foreignObject width="100%" height="100%">' +
                '<body style="padding:0; margin:0;" xmlns="http://www.w3.org/1999/xhtml">' +
                    this.InnerHTML +
                '</body>' +
            '</foreignObject>' +
        '</svg>';
    }

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

    if(this._svgReady){
        c.drawImage(this._image, this.X, this.Y);
    }

    c.restore();
};

/**
 * @see README_DOKU.txt
 */
Anibody.svg.SVGTest.prototype.Update = function () {};
