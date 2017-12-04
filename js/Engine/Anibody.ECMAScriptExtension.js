
Anibody.ECMAScriptExtended = false;

Anibody.ECMAScriptExtension = function () {
    
    if(Anibody.ECMAScriptExtended)
        return false;
    

    /**
     * increases every string with the possibility to easily use it as format string
     * this function searches for "{i}" and replaces this with the computed value of
     * the i-th parameter 
     * @returns {String}
     */
    String.prototype.format = function () {
        var str = this;
        var regEx;
        for (var i = 0; i < arguments.length; i++) {
            regEx = new RegExp("\\{" + i + "\\}", "gm");
            str = str.replace(regEx, arguments[i]);
        }
        return str;
    };

    /*
     https://www.w3schools.com/tags/ref_urlencode.asp
     
     "{ae} {oe} {ue} {Ae} {Oe} {Ue} {ss}".decodeURI()
     
     Ä = %C3%84
     Ö = %C3%96
     Ü = %C3%9C
     ä = %C3%A4
     ö = %C3%B6
     ü = %C3%BC
     ß = %C3%9F
     
     */
    /**
     * returns a string in which German special characters will be found if they are
     * in a certain format (like 'a-umlaut' is '{ae}'), decoded to an UTF-8
     * string and returned
     * @returns {string}
     */
    String.prototype.decodeURI = function () {
        var str = this;

        var regEx = new RegExp("\\{" + "ae" + "\\}", "gm");
        str = str.replace(regEx, "%C3%A4");

        regEx = new RegExp("\\{" + "oe" + "\\}", "gm");
        str = str.replace(regEx, "%C3%B6");

        regEx = new RegExp("\\{" + "ue" + "\\}", "gm");
        str = str.replace(regEx, "%C3%BC");

        regEx = new RegExp("\\{" + "Ae" + "\\}", "gm");
        str = str.replace(regEx, "%C3%84");

        regEx = new RegExp("\\{" + "Oe" + "\\}", "gm");
        str = str.replace(regEx, "%C3%96");

        regEx = new RegExp("\\{" + "Ue" + "\\}", "gm");
        str = str.replace(regEx, "%C3%9C");

        regEx = new RegExp("\\{" + "ss" + "\\}", "gm");
        str = str.replace(regEx, "%C3%9F");

        regEx = new RegExp("\\{" + "grad" + "\\}", "gm");
        str = str.replace(regEx, "%C2%B0");

        return decodeURI(str);
    };

    /**
     * special characters collection
     * @type object
     */
    String.UTF8 = {
        // http://www.utf8-zeichentabelle.de/unicode-utf8-table.pl
        // http://www.fileformat.info/info/charset/UTF-8/list.htm?start=1024
        // https://www.compart.com/de/unicode/U+2080
        Greek: {
            alpha: decodeURI("%CE%B1"),
            beta: decodeURI("%CE%B2"),
            gamma: decodeURI("%CE%B3"),
            delta: decodeURI("%CE%B4"),
            epsilon: decodeURI("%CE%B5"),
            theta: decodeURI("%CE%B8"),
            lamda: decodeURI("%CE%BB"),
            mu: decodeURI("%CE%BC"),
            pi: decodeURI("%CF%80"),
            rho: decodeURI("%CF%81"),
            sigma: decodeURI("%CF%83"),
            phi: decodeURI("%CF%86"),
            chi: decodeURI("%CF%87"),
            psi: decodeURI("%CF%88"),
            omega: decodeURI("%CF%89"),

            Gamma: decodeURI("%CE%93"),
            Delta: decodeURI("%CE%94"),
            Epsilon: decodeURI("%CE%95"),
            Theta: decodeURI("%CE%98"),
            Lamda: decodeURI("%CE%9B"),
            Pi: decodeURI("%CE%A0"),
            Sigma: decodeURI("%CE%A3"),
            Phi: decodeURI("%CE%A6"),
            Psi: decodeURI("%CE%A8"),
            Omega: decodeURI("%CE%A9")
        },
        German: {
            ae: decodeURI("%C3%A4"),
            oe: decodeURI("%C3%B6"),
            ue: decodeURI("%C3%BC"),
            Ae: decodeURI("%C3%84"),
            Oe: decodeURI("%C3%96"),
            Ue: decodeURI("%C3%9C"),
            ss: decodeURI("%C3%9F")
        },
        Math: {
            Division: decodeURI("%C3%B7"),
            PlusMinus: decodeURI("%C2%B1"),
            Degree: decodeURI("%C2%B0"),
            Not: decodeURI("%C2%AC")
        },
        Subscript: {
            Zero: decodeURI("%E2%82%80"),
            One: decodeURI("%E2%82%81"),
            Two: decodeURI("%E2%82%82"),
            Three: decodeURI("%E2%82%83"),
            Four: decodeURI("%E2%82%84"),
            Five: decodeURI("%E2%82%85"),
            Six: decodeURI("%E2%82%86"),
            Seven: decodeURI("%E2%82%87"),
            Eight: decodeURI("%E2%82%88"),
            Nine: decodeURI("%E2%82%89")
        },
        List: {
            CheckedBallot: decodeURI("%E2%98%91"),
            UncheckedBallot: decodeURI("%E2%98%90"),
            CancellationX: decodeURI("%F0%9F%97%99")
        },
        Random: {
            Unicorn: decodeURI("%F0%9F%A6%84")
        }

    };
    /**
     * downloads a list of all implemented special characters in the String.UTF8 object
     * @returns {undefined}
     */
    String._downloadUTF8Table = function () {

        // count entries

        var noa = 0; // number of attributes
        var ah = 18; // attribute height
        var apad = 4; // attribute padding
        var noe = 0; // number of entries
        var eh = 16; // entry height
        var epad = 2; // entry padding

        var attr, entry;
        for (attr in String.UTF8) {
            noa++;
            for (entry in String.UTF8[attr]) {
                noe++;
            }
        }
        var height = noe * eh + noe * epad + noa * ah + noa * apad + 20;

        var can = document.createElement("CANVAS");
        can.width = 300;
        can.height = height;
        var c = can.getContext("2d");

        var x = 5;
        var y = 0;

        var attrFont = "16px sans-serif";
        var entryFont = "14px sans-serif";

        c.textBaseline = "top";
        c.fillStyle = "white";
        c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        c.fillStyle = "black";

        // title
        c.font = "18px bold sans-serif";
        c.fillText("(object) String.UTF8", x, y);
        y += 24;

        for (attr in String.UTF8) {

            c.font = attrFont;
            c.fillText(attr, x, y);
            y += ah;

            c.font = entryFont;

            // entriy loop
            for (entry in String.UTF8[attr]) {
                c.fillText(entry + " : " + String.UTF8[attr][entry], x + 20, y);
                y += eh + epad;
            }
            y += apad;
        }

        var data = can.toDataURL();
        var fileName = "String_UTF8.png";

        var saveImg = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            return function (data, fileName) {
                var url = data;
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            };
        }());

        saveImg(data, fileName);

    };

    /*
     https://www.w3schools.com/tags/ref_urlencode.asp
     
     "{ae} {oe} {ue} {Ae} {Oe} {Ue} {ss}".decodeURI()
     
     Ä = %C3%84
     Ö = %C3%96
     Ü = %C3%9C
     ä = %C3%A4
     ö = %C3%B6
     ü = %C3%BC
     ß = %C3%9F
     
     */
    /**
     * returns a string ready to be implemented in to an html text node
     * @returns {String}
     */
    String.prototype.decodeHTML = function () {
        var str = this;

        var regEx = new RegExp("\\{" + "ae" + "\\}", "gm");
        str = str.replace(regEx, "&auml;");

        regEx = new RegExp("\\{" + "oe" + "\\}", "gm");
        str = str.replace(regEx, "&ouml;");

        regEx = new RegExp("\\{" + "ue" + "\\}", "gm");
        str = str.replace(regEx, "&uuml;");

        regEx = new RegExp("\\{" + "Ae" + "\\}", "gm");
        str = str.replace(regEx, "&Auml;");

        regEx = new RegExp("\\{" + "Oe" + "\\}", "gm");
        str = str.replace(regEx, "&Ouml;");

        regEx = new RegExp("\\{" + "Ue" + "\\}", "gm");
        str = str.replace(regEx, "&Uuml;");

        regEx = new RegExp("\\{" + "ss" + "\\}", "gm");
        str = str.replace(regEx, "&szlig;");

        return str;
    };

    /**
     * @description Returns the input as a string of the given KeyboardEvent
     * NOT needed in FF but currently in Chrome and other browsers
     * @version cannot identify every key but sufficent enough
     * @param {KeyboardEvent} the event that will be interpreted
     * @return {String} input as a string of the given KeyboardEvent
     */
    String.prototype.getKeyByEvent = String.getKeyByEvent = function (e) {

        var code = e.charCode || e.keyCode;
        // killing the modifier keys
        // 16 = shift, 17 = control, 18 = alt
        if (16 <= code && code <= 18) {
            return;
        }

        var str = "";
        var alt = e.altKey;
        var control = e.ctrlKey;
        var shift = e.shiftKey;

        var other = true;
        var lowercase = true;
        var number = false;
        var letter = false;

        if (48 <= code && code <= 57) {
            number = true;
            letter = false;
            other = false;
        }

        if (65 <= code && code <= 90) {
            number = false;
            letter = true;
            other = false;
        }

        if (97 <= code && code <= 122) {
            number = false;
            lowercase = true;
            other = false;
            letter = true;
        }

        if (!shift) {
            lowercase = true;
            if (letter)
                code += 32;
        }

        if (alt || control)
            other = true;

        if (!other)
            str = String.fromCharCode(code);

        console.log(
                "code: " + code,
                "alt: " + alt,
                "shift: " + shift,
                "control: " + control,
                "result: '" + str + "'",
                "letter: " + letter,
                "lowercase: " + lowercase,
                "number: " + number,
                "other: " + other);
        return str;
    };

    /**
     * Randomly order the elements of the array by swapping two element in every round
     * @param {Number} rounds
     * @returns {undefined}
     */
    Array.prototype.shuffle = function shuffle(rounds) {
        var tmp, in1, in2;
        var self = this;
        rounds = rounds || this.length * 5;

        var swap = function (a, b) {
            tmp = self[a];
            self[a] = self[b];
            self[b] = tmp;
        };

        var getRandomIndex = function () {
            return (Math.round(Math.random() * (self.length - 1))) % self.length;
        };

        for (var i = 0; i < rounds; i++) {
            in1 = getRandomIndex();
            in2 = getRandomIndex();
            swap(in1, in2);
        }

    };
    /**
     * Deletes the element of the specific index and returns it on success
     * inline-deleting: no new Array is created
     * @param {Number} index
     * @returns {Array-Element}
     */
    Array.prototype.delete = function deleteElement(index) {
        var ret;

        if (index >= this.length || index < 0 || isNaN(index))
            return;

        index = Math.floor(index);

        if (index + 1 === this.length)
            return this.pop();

        var ret = this[index];
        for (var i = index; i < this.length - 1; i++) {
            this[i] = this[i + 1];
        }
        // the last element with the same value as the element before needs to be popped
        this.pop();
        return ret;
    };
    /**
     * true if the given element is an element of the array
     * @param {object} el - element
     * @returns {Boolean}
     */
    Array.prototype.isElement = function isElement(el) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === el)
                return true;
        }
        return false;
    };
    /**
     * returns the index of a given element if it is in the array
     * otherwise function returns -1
     * @param {object} el - element
     * @returns {Number}
     */
    Array.prototype.getIndex = function getIndex(el) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === el)
                return i;
        }
        return -1;
    };

    /**
     * transforms the function into a callback-object and returns this object
     * @param {object} that
     * @param {object} parameter
     * @returns {object}
     */
    Function.prototype.getCallbackObject = function (that, parameter, useApply) {
        return {that: that, function: this, parameter: parameter, useApply: useApply};
    };

    /**
     * gets the RGBA-Value of the pixel x,y
     * @param {integer} x
     * @param {integer} y
     * @returns {red,green,blue,alpha}
     */
    window.ImageData.prototype.getPixel = function (x, y) {
        return {
            red: this.data[ 4 * (x + this.width * y) + 0 ],
            green: this.data[ 4 * (x + this.width * y) + 1 ],
            blue: this.data[ 4 * (x + this.width * y) + 2 ],
            alpha: this.data[ 4 * (x + this.width * y) + 3 ]
        };
    };
    /**
     * sets the RGBA-Value of the pixel x,y
     * @param {integer} x
     * @param {integer} y
     * @param {number} r - red
     * @param {number} g - green
     * @param {number} b - blue
     * @param {number} a - alpha
     * @returns {undefined}
     */
    window.ImageData.prototype.setPixel = function (x, y, r, g, b, a) {
        var p = 4 * (x + this.width * y);
        this.data[p + 0 ] = r;
        this.data[p + 1 ] = g;
        this.data[p + 2 ] = b;
        this.data[p + 3 ] = a;
    };

    /**
     * Adds an attribute called ImageData to all images
     * @type ImageData
     */
    HTMLImageElement.prototype.ImageData = "undefined";

    /**
     * gets the vertically flipped image of this image
     * @returns {Image}
     */
    HTMLImageElement.prototype.getVerticallyFlippedImage = function () {
        var can = document.createElement("canvas");
        can.width = this.width;
        can.height = this.height;
        var con = can.getContext("2d");

        con.translate(0, this.height);
        con.scale(1, -1);
        con.drawImage(this, 0, 0);

        var url = can.toDataURL();
        var img = document.createElement("IMG");
        img.src = url;

        return img;
    };

    /**
     * gets the horizontally flipped image of this image
     * @returns {Image}
     */
    HTMLImageElement.prototype.getHorizontallyFlippedImage = function () {
        var can = document.createElement("canvas");
        can.width = this.width;
        can.height = this.height;
        var con = can.getContext("2d");

        con.translate(can.width, 0);
        con.scale(-1, 1);
        con.drawImage(this, 0, 0);

        var url = can.toDataURL();
        var img = document.createElement("IMG");
        img.src = url;

        return img;
    };

    /**
     * gets the image data of image, saves it and returns it
     * @returns {ImageData}
     */
    HTMLImageElement.prototype.getImageData = function () {
        var can = document.createElement("canvas");
        can.width = this.width;
        can.height = this.height;
        var con = can.getContext("2d");
        con.drawImage(this, 0, 0);
        this.ImageData = con.getImageData(0, 0, can.width, can.height);
        return this.ImageData;
    };
    /**
     * gets the data url of an image
     * @returns {string}
     */
    HTMLImageElement.prototype.getDataURL = function () {
        var can = document.createElement("canvas");
        can.width = this.width;
        can.height = this.height;
        var con = can.getContext("2d");
        con.drawImage(this, 0, 0);
        this.DataURL = can.toDataURL();
        return this.DataURL;
    };

    /**
     * Creates a circle path with the radius r. The circle touches the axis of x and y if centroid is false
     * Is it true than x,y will be the centroid of the circle
     * @param {number} x
     * @param {number} y - 
     * @param {number} r - Radius
     * @param {boolean} centroid - true: x,y are the centroid of the circle
     *      false : circle will render like a quarter with length = 2*raduis 
     * @param {boolean} clockwise
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.circle = function (x, y, r, centroid, clockwise) {

        if (typeof centroid === "undefined" || centroid == null)
            centroid = true;

        if (typeof clockwise === "undefined" || clockwise == null)
            clockwise = true;

        if (!centroid) {
            x += r;
            y += r;
        }
        this.moveTo(x + r, y);
        if (clockwise) {
            this.arcTo(x + r, y + r, x, y + r, r);
            this.arcTo(x - r, y + r, x - r, y, r);
            this.arcTo(x - r, y - r, x, y - r, r);
            this.arcTo(x + r, y - r, x + r, y, r);
        } else {
            this.arcTo(x + r, y - r, x, y - r, r);
            this.arcTo(x - r, y - r, x - r, y, r);
            this.arcTo(x - r, y + r, x, y + r, r);
            this.arcTo(x + r, y + r, x + r, y, r);
        }

    };
    /**
     * Creates a path in the form of an arrow. From the point (x1/y1) to the point (x2/y2) with a given thickness
     * @param {number} x1 x-value of first point
     * @param {number} y1 y-value of first point
     * @param {number} x2 x-value of second point
     * @param {number} y2 y-value of second point
     * @param {number} th - (optional) thickness in pixel, default length/2
     * @param {number} hlr - (optional) head-to-length ration - how long is the head compared to the overall length, default = 0.2
     * @param {number} btr - (optional) body-to-thickness ration, how big is the body compared to the overall head/thickness, default = 0.5
     * @param {boolean} clockwise - (optional) creating the path clockwise or not, default = true
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.arrow2 = function (x1, y1, x2, y2, th, hlr, btr, clockwise) {

        if (typeof hlr === "undefined" || hlr === null)
            hlr = 0.2;

        if (typeof btr === "undefined" || btr === null)
            btr = 0.5;

        if (typeof clockwise === "undefined" || clockwise === null)
            clockwise = true;

        var b = (x2 - x1); // deltaX
        var a = (y2 - y1); // deltaY
        var len = Math.pow(Math.pow(a, 2) + Math.pow(b, 2), 0.5);

        if (typeof th === "undefined" || th === null)
            th = len * 0.25;
        else
            th /= 2;

        // body thickness
        var bth = th * btr;
        // head thicknes
        var hth = th;
        // body length
        var blen = len * (1 - hlr);

        var rad = Math.atan2(a, b);
        if (rad < 0)
            rad = (rad + 2 * Math.PI) % (2 * Math.PI);

//    var degree = rad * 180 / Math.PI;

        var leftAngle = rad - (Math.PI / 2);
        var rightAngle = rad + (Math.PI / 2);

        var p = [];
        p[0] = {x: x1, y: y1};

        // path from the start point to the arrow peak, going there from the left side
        p[1] = {x: Math.cos(leftAngle) * bth + p[0].x, y: Math.sin(leftAngle) * bth + p[0].y};
        p[2] = {x: p[1].x + Math.cos(rad) * blen, y: p[1].y + Math.sin(rad) * blen};
        p[3] = {x: p[2].x + Math.cos(leftAngle) * hth, y: p[2].y + Math.sin(leftAngle) * hth};

        p[4] = {x: x2, y: y2}; // arrow peak

        // path from the start point to the arrow peak, going there from the right side
        p[7] = {x: Math.cos(rightAngle) * bth + p[0].x, y: Math.sin(rightAngle) * bth + p[0].y};
        p[6] = {x: p[7].x + Math.cos(rad) * blen, y: p[7].y + Math.sin(rad) * blen};
        p[5] = {x: p[6].x + Math.cos(rightAngle) * hth, y: p[6].y + Math.sin(rightAngle) * hth};

        this.moveTo(p[0].x, p[0].y);

        if (clockwise)
            for (var i = 1; i < p.length; i++)
                this.lineTo(p[i].x, p[i].y);
        else
            for (var i = p.length - 1; i > 0; i--)
                this.lineTo(p[i].x, p[i].y);

        this.lineTo(p[0].x, p[0].y);
    };

    window.CanvasRenderingContext2D.prototype.arrow3 = function (x1, y1, x2, y2, th, hlr, btr, clockwise) {

        if (typeof hlr === "undefined" || hlr === null)
            hlr = 0.2;

        if (typeof btr === "undefined" || btr === null)
            btr = 0.5;

        if (typeof clockwise === "undefined" || clockwise === null)
            clockwise = true;

        var b = (x2 - x1); // deltaX
        var a = (y2 - y1); // deltaY
        var len = Math.pow(Math.pow(a, 2) + Math.pow(b, 2), 0.5);

        if (typeof th === "undefined" || th === null)
            th = len * 0.15;

        // body thickness
        var bth = th * btr;
        // head thicknes
        var hth = th - bth;
        // body length
        var blen = len * (1 - hlr);

        var rad = Math.atan2(a, b);
        if (rad < 0)
            rad = (rad + 2 * Math.PI) % (2 * Math.PI);

//    var degree = rad * 180 / Math.PI;

        var leftAngle = rad - (Math.PI / 2);
        var rightAngle = rad + (Math.PI / 2);

        var p = [];
        p[0] = {x: x1, y: y1};

        // path from the start point to the arrow peak, going there from the left side
        p[1] = {x: Math.cos(leftAngle) * bth + p[0].x, y: Math.sin(leftAngle) * bth + p[0].y};
        p[2] = {x: p[1].x + Math.cos(rad) * blen, y: p[1].y + Math.sin(rad) * blen};
        p[3] = {x: p[2].x + Math.cos(leftAngle) * hth, y: p[2].y + Math.sin(leftAngle) * hth};

        p[4] = {x: x2, y: y2}; // arrow peak

        // path from the start point to the arrow peak, going there from the right side
        p[7] = {x: Math.cos(rightAngle) * bth + p[0].x, y: Math.sin(rightAngle) * bth + p[0].y};
        p[6] = {x: p[7].x + Math.cos(rad) * blen, y: p[7].y + Math.sin(rad) * blen};
        p[5] = {x: p[6].x + Math.cos(rightAngle) * hth, y: p[6].y + Math.sin(rightAngle) * hth};

        this.moveTo(p[0].x, p[0].y);

        if (clockwise)
            for (var i = 1; i < p.length; i++)
                this.lineTo(p[i].x, p[i].y);
        else
            for (var i = p.length - 1; i > 0; i--)
                this.lineTo(p[i].x, p[i].y);

        this.lineTo(p[0].x, p[0].y);
    };

    /**
     * Draws a filled arrow. From the point (x1/y1) to the point (x2/y2) with a given thickness.
     * @param {number} x1 x-value of first point
     * @param {number} y1 y-value of first point
     * @param {number} x2 x-value of second point
     * @param {number} y2 y-value of second point
     * @param {number} th - (optional) overall thickness, default = 15% of length
     * @param {number} hlr - (optional) head-to-length ration - how long is the head compared to the overall length, default = 0.2
     * @param {number} btr - (optional) body-to-thickness ration, default = 0.5
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.fillArrow2 = function (x1, y1, x2, y2, th, hlr, btr) {
        this.beginPath();
        this.arrow2(x1, y1, x2, y2, th, hlr, btr);
        this.fill();
    };

    /**
     * Creates a path in the form of an arrow. From the point (x/y), with a certain length and an overall-thickness
     * A degree value can be specified. arrow 0 = points right, 90 = points down ... and so on.
     * @param {number} x - x-value
     * @param {number} y - y-value
     * @param {number} th - overall thickness (= thickness of the arrow head)
     * @param {number} len - overall length
     * @param {number} degree - number of degree
     * @param {number} hlr - (optional) head-length-ratio - length of the head relative to the overall length [0-1], default: 0.2
     * @param {number} bhr - (optional) body-head-ratio - thickness of the body relative to the overall thickness [0-1], default: 0.5
     * @param {boolean} clockwise - (optional) arrow path will be drawn clockwise or not. important with the fill-rule, default: true
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.arrow = function (x, y, th, len, degree, hlr, bhr, clockwise) {

        //head length ratio
        if (typeof hlr === "undefined" || hlr == null)
            hlr = 0.2;
        // body-head-ratio
        if (typeof bhr === "undefined" || bhr == null)
            bhr = 0.5;

        if (typeof clockwise === "undefined" || clockwise == null)
            clockwise = true;

        var rad = degree * Math.PI / 180;

        // th is the overall thickness and at the same time the head thickness
        // body thickness
        var bth = th * bhr;

        this.save();
        this.translate(x, y);
        this.rotate(rad);

        this.moveTo(0, 0);
        if (clockwise) {
            this.lineTo(0, -bth / 2);
            this.lineTo(len - len * hlr, -bth / 2);
            this.lineTo(len - len * hlr, -th / 2);
            this.lineTo(len, 0); // arrow peak
            this.lineTo(len - len * hlr, th / 2);
            this.lineTo(len - len * hlr, bth / 2);
            this.lineTo(0, bth / 2);
        } else {
            this.lineTo(0, bth / 2);
            this.lineTo(len - len * hlr, bth / 2);
            this.lineTo(len - len * hlr, th / 2);
            this.lineTo(len, 0); // arrow peak
            this.lineTo(len - len * hlr, -th / 2);
            this.lineTo(len - len * hlr, -bth / 2);
            this.lineTo(0, -bth / 2);
        }
        this.lineTo(0, 0);

        this.restore();

    };

    /**
     * Draws a filled arrow. From the point (x/y), with a certain length and an overall-thickness
     * A degree value can be specified. 0 = arrow points right, 90 = points down ... and so on.
     * @param {number} x - x-value
     * @param {number} y - y-value
     * @param {number} th - overall thickness (= thickness of the arrow head)
     * @param {number} len - overall length
     * @param {number} degree - number of degree
     * @param {number} hlr - (optional) head-length-ratio - length of the head relative to the overall length [0-1], default: 0.2
     * @param {number} bhr - (optional) body-head-ratio - thickness of the body relative to the overall thickness [0-1], default: 0.5
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.fillArrow = function (x, y, th, len, degree, hlr, bhr) {
        this.beginPath();
        this.arrow(x, y, th, len, degree, hlr, bhr);
        this.fill();
    };

    /**
     * Drows a stroked arrow. From the point (x/y), with a certain length and an overall-thickness
     * A degree value can be specified. 0 = arrow points right, 90 = points down ... and so on.
     * @param {number} x - x-value
     * @param {number} y - y-value
     * @param {number} th - overall thickness (= thickness of the arrow head)
     * @param {number} len - overall length
     * @param {number} degree - number of degree
     * @param {number} hlr - (optional) head-length-ratio - length of the head relative to the overall length [0-1], default: 0.2
     * @param {number} bhr - (optional) body-head-ratio - thickness of the body relative to the overall thickness [0-1], default: 0.5
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.strokeArrow = function (x, y, th, len, degree, hlr, bhr) {
        this.beginPath();
        this.arrow(x, y, th, len, degree, hlr, bhr);
        this.stroke();
    };

    /**
     * Creates a circle path with the radius r and fills it. The circle touches the axis of x and y if centroid is false
     * Is it true than x,y will be the centroid of the circle.
     * @param {type} x
     * @param {type} y
     * @param {type} r
     * @param {type} centroid
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.fillCircle = function (x, y, r, centroid) {
        this.beginPath();
        this.circle(x, y, r, centroid);
        this.fill();
        this.closePath();
    };

    /**
     * Creates a circle path with the radius r and fills it. The circle touches the axis of x and y if centroid is false
     * Is it true than x,y will be the centroid of the circle.
     * @param {type} x
     * @param {type} y
     * @param {type} r
     * @param {type} centroid
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.strokeCircle = function (x, y, r, centroid) {
        this.beginPath();
        this.circle(x, y, r, centroid);
        this.stroke();
        this.closePath();
    };

    /**
     * Creates a rectangle path with the given values with various roundings at the corner and fills it
     * @param {Number} x x-position of the rectangle
     * @param {Number} y y-position of the rectangle
     * @param {Number} width the width of the rectangle
     * @param {Number} height the height of the rectangle
     * @param {Number} rtl the rounding of the top-left edge
     * @param {Number} rtr the rounding of the top-right edge
     * @param {Number} rbr the rounding of the bottom-right edge
     * @param {Number} rbl the rounding of the bottom-left edge
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.variousRoundedRect = function (x, y, width, height, rtl, rtr, rbr, rbl) {
        //var args = arguments;

        if (arguments.length < 6)
            rtr = rtl;
        if (arguments.length < 7)
            rbr = rtl;
        if (arguments.length < 8)
            rbl = rtl;

        this.moveTo(x + rtl, y); //behind top-left edge
        this.lineTo(x + width - rtr, y);
        this.bezierCurveTo(x + width, y, x + width, y + rtr, x + width, y + rtr); //top-right
        this.lineTo(x + width, y + height - rbr);
        this.bezierCurveTo(x + width, y + height, x + width - rbr, y + height, x + width - rbr, y + height);  // bottom-right
        this.lineTo(x + rbl, y + height);
        this.bezierCurveTo(x, y + height, x, y + height - rbl, x, y + height - rbl); // bottom-left
        this.lineTo(x, y + rtl);
        this.bezierCurveTo(x, y, x + rtl, y, x + rtl, y); // top-left

    };

    /**
     * Creates a rectangle path with the given values with various roundings at the corner and fills it
     * @param {Number} x x-position of the rectangle
     * @param {Number} y y-position of the rectangle
     * @param {Number} width the width of the rectangle
     * @param {Number} height the height of the rectangle
     * @param {Number} rtl the rounding of the top-left edge
     * @param {Number} rtr the rounding of the top-right edge
     * @param {Number} rbr the rounding of the bottom-right edge
     * @param {Number} rbl the rounding of the bottom-left edge
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.fillVariousRoundedRect = function (x, y, width, height, rtl, rtr, rbr, rbl) {
        if (arguments.length < 6)
            rtr = rtl;
        if (arguments.length < 7)
            rbr = rtl;
        if (arguments.length < 8)
            rbl = rtl;

        this.beginPath();
        this.variousRoundedRect(x, y, width, height, rtl, rtr, rbr, rbl);
        this.fill();
        this.closePath();

    };
    /**
     * Creates a rectangle path with the given values with various roundings at the edges and strokes the lines
     * @param {Number} x x-position of the rectangle
     * @param {Number} y y-position of the rectangle
     * @param {Number} width the width of the rectangle
     * @param {Number} height the height of the rectangle
     * @param {Number} rtl the rounding of the top-left edge
     * @param {Number} rtr the rounding of the top-right edge
     * @param {Number} rbr the rounding of the bottom-right edge
     * @param {Number} rbl the rounding of the bottom-left edge
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.strokeVariousRoundedRect = function (x, y, width, height, rtl, rtr, rbr, rbl) {
        if (arguments.length < 6)
            rtr = rtl;
        if (arguments.length < 7)
            rbr = rtl;
        if (arguments.length < 8)
            rbl = rtl;

        this.beginPath();
        this.variousRoundedRect(x, y, width, height, rtl, rtr, rbr, rbl);
        this.stroke();
        this.closePath();
    };

    /**
     * draws an image to a certain position, with a specified width and height and rounded corners
     * @param {Image} img
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} r
     * @returns {object}
     */
    window.CanvasRenderingContext2D.prototype.drawRoundedImage = function (img, x, y, w, h, r) {
        this.save();
        this.beginPath();
        this.moveTo(x + r, y); //behind top-left edge
        this.lineTo(x + img.width - r, y);
        this.bezierCurveTo(x + w, y, x + w, y + r, x + w, y + r); //top-right
        this.lineTo(x + w, y + w - r);
        this.bezierCurveTo(x + w, y + h, x + h - r, y + h, x + w - r, y + h);  // bottom-right
        this.lineTo(x + r, y + h);
        this.bezierCurveTo(x, y + h, x, y + h - r, x, y + h - r); // bottom-left
        this.lineTo(x, y + r);
        this.bezierCurveTo(x, y, x + r, y, x + r, y); // top-left
        this.closePath();

        this.clip();
        this.drawImage(img, x, y, w, h);
        this.restore();

        return {x: x, y: y, width: w, height: h};
    };

    /**
     * Fills a certain text like the text is written on a piece of paper,
     * pinned on the canvas. Spinning the paper would render a circle, whose centroid is given.
     * @param {Number} mx x-value of the centroid of the circle
     * @param {Number} my y-value of the centroid
     * @param {String} text the text which will be rendered
     * @param {Number} degree [0-360] of which the paper will be spinned (0 and 360 means displayed as usual)
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.fillSpinnedText = function (mx, my, text, degree) {
        this.save();

        //var textlen = this.measureText(text).width;

        var rad = degree * Math.PI / 180;

        this.textAlign = "center";
        this.textBaseline = "middle";

        this.translate(mx, my);
        this.rotate(rad);

        this.fillText(text, 0, 0);
        this.restore();
    };

    /**
     * Strokes a certain text like the text is written on a piece of paper,
     * pinned on  a cirlce on the canvas. Spinning the paper would render a circle, whose centroid is given.
     * @param {Number} mx x-value of the centroid of the circle
     * @param {Number} my y-value of the centroid
     * @param {String} text the text which will be rendered
     * @param {Number} degree [0-360] of which the paper will be spinned (0 and 360 means displayed as usual)
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.strokeSpinnedText = function (mx, my, text, degree) {
        this.save();

        //var textlen = this.measureText(text).width;

        var rad = degree * Math.PI / 180;

        this.textAlign = "center";
        this.textBaseline = "middle";

        this.translate(mx, my);
        this.rotate(rad);

        this.strokeText(text, 0, 0);
        this.restore();
    };
    /**
     * draws a cross with two perpendicular stroked lines
     * @param {number} x - x of the center
     * @param {number} y - y of the center
     * @param {number} size - diagonal length
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.drawCross = function (x, y, size) {
        this.save();

        var s = size / 2;

        this.beginPath();
        //from top-left to bottom-right
        this.moveTo(x - s, y + s);
        this.lineTo(x + s, y - s);
        //from bottom-left to top-right
        this.moveTo(x - s, y - s);
        this.lineTo(x + s, y + s);

        this.stroke();
        this.restore();
    };
    /**
     * @see experimental
     * creates the path of two perpendicular rectangles 
     * @param {number} x - x of the center
     * @param {number} y - y of the center
     * @param {number} size - diagonal length
     * @param {number} th - thickness of the rectangles
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.cross = function (x, y, size, th) {
        this.save();

        if (typeof th === "undefined")
            th = Math.round(size / 5);

        var rad1 = (45) * Math.PI / 180;
        var rad2 = (90 + 180) * Math.PI / 180;

        this.translate(x, y);
        this.rotate(rad1);

        this.rect(-size / 2, -th / 2, size, th);
        this.rotate(rad2);

        this.rect(-size / 2, -th / 2, size, th);

        this.restore();
    };

    /**
     * Sets the font height of the canvas to the given value
     * @param {Number} val - height in pixel
     * @param {string} unit - unit of height, default:"px"
     * @returns {undefined}
     */
    window.CanvasRenderingContext2D.prototype.setFontHeight = function (val, unit) {
        if (typeof unit !== "string")
            unit = "px";
        this.font = this.font.replace(new RegExp("[0-9]+[a-z]{2}"), val + unit);
    };

    /**
     * Returns the rgba-Code of a given color (css color name/hex code/rgb/rgba) with an added alpha value
     * @param {string} color (css color name/hex code/rgb/rgba)
     * @param {Number} alpha [0-1]
     * @returns {String}
     */
    window.CanvasRenderingContext2D.prototype.getColor = function (color, alpha) {
        var rgbaCode;
        if (typeof color !== "string")
            return "rgba(0,0,0,0)";
        if (typeof alpha === "undefined" || alpha < 0 && alpha > 1)
            alpha = 1;

        var can = document.createElement("CANVAS");
        can.width = 1;
        can.height = 1;
        var c = can.getContext("2d");
        c.fillStyle = color;
        c.fillRect(0, 0, 1, 1);
        var imageData = c.getImageData(0, 0, 1, 1).data;

        rgbaCode = "rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + "," + alpha + ")";

        return rgbaCode;
    };

    /**
     * Sets the styles (fill and stroke) to given color (css color name/hex code/rgb/rgba)
     * with an added alpha value.
     * Function can also be used to quickly change the alpha canal of the already set color
     * @param {string} color (css color name/hex code/rgb/rgba)
     * @param {Number} alpha [0-1]
     * @param {boolean} fill will set this style if undefined or true
     * @param {boolean} stroke will set this style if undefined or true
     * @returns {String}
     */
    window.CanvasRenderingContext2D.prototype.setStyle = function (color, alpha, fill, stroke) {
        if (typeof fill === "undefined")
            fill = true;
        if (typeof stroke === "undefined")
            stroke = true;
        if (!color || color == null)
            if (fill)
                color = this.fillStyle;
            else
                color = this.strokeStyle;

        var rgbaCode = this.getColor(color, alpha);
        if (fill)
            this.fillStyle = rgbaCode;
        if (stroke)
            this.strokeStyle = rgbaCode;
        return rgbaCode;
    };


    Anibody.ECMAScriptExtended = true;
};