Anibody.SetPackage("Anibody", "svg");

/**
 * Represents a bezier spline
 * @returns {Spline}
 */
Anibody.svg.SVGTest = function SVGTest(x, y, width, height) {
    Anibody.ABO.call(this);

    if(isNaN(x)) x = 0;
    if(isNaN(y)) y = 0;
    if(isNaN(width)) width = 100;
    if(isNaN(height)) height = 100;

    this._innerText = "";
    var self = this;
    Object.defineProperty(this, "InnerText", {
        set: function (newValue) {
            self._innerText = newValue;
            self._updateElement();
        },
        get: function () { return self._innerText; }
    });

    this._element = null;
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

};

/**
 * @see README_DOKU.txt
 */
Anibody.svg.SVGTest.prototype._updateElement = function () {

    var div = document.createElement("div");
    div.innerHTML = "<svg width='"+"' height='"+"'>" + this.innerHTML + "<svg>";
    this._element = div.childNodes[0];

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



    c.restore();
};

/**
 * @see README_DOKU.txt
 */
Anibody.svg.SVGTest.prototype.Update = function () {};
