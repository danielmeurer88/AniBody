




window.ImageData.prototype.getPixel = function(x,y){
        return {
            red : this.data[ 4* ( x + this.width * y ) + 0 ],
            green : this.data[ 4* ( x + this.width * y ) + 1 ],
            blue : this.data[ 4* ( x + this.width * y ) + 2 ],
            alpha : this.data[ 4* ( x + this.width * y ) + 3 ]
        };
    };
    
window.ImageData.prototype.setPixel = function(x,y,r,g,b,a){
    var p =  4* ( x + this.width * y );
    this.data[p + 0 ] = r;
    this.data[p + 1 ] = g;
    this.data[p + 2 ] = b;
    this.data[p + 3 ] = a;
};

HTMLImageElement.prototype.ImageData = "undefined";

HTMLImageElement.prototype.getImageData = function(){
    var can = document.createElement("canvas");
    can.width = this.width;
    can.height = this.height;
    var con = can.getContext("2d");
    con.drawImage(this,0,0);
    this.ImageData = con.getImageData(0,0,can.width, can.height);
    return this.ImageData;
};

/**
 * Creates a circle path with the radius r. The circle touches the axis of x and y if centroid is false
 * Is it true than x,y will be the centroid of the circle
 * @param {type} x
 * @param {type} y
 * @param {type} r
 * @param {type} centroid
 * @returns {undefined}
 */
window.CanvasRenderingContext2D.prototype.circle = function(x,y,r,centroid){
        
    if(arguments.length < 4)
        centroid = false;
    
    if(!centroid){x += r; y += r}
    
    this.beginPath();
    this.arc(x, y, r, 0, 2 * Math.PI, false);
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
window.CanvasRenderingContext2D.prototype.fillCircle = function(x,y,r,centroid){
    this.circle(x,y,r,centroid);
    this.fill();
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
window.CanvasRenderingContext2D.prototype.strokeCircle = function(x,y,r,centroid){
    this.circle(x,y,r,centroid);
    this.stroke();
};

/**
 * Creates a rectangle path with the given values with various roundings at the edges and fills it
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
window.CanvasRenderingContext2D.prototype.fillVariousRoundedRect = function(x,y,width,height,rtl, rtr, rbr, rbl){
    //var args = arguments;
    
    if(arguments.length < 6)
        rtr = rtl;
    if(arguments.length < 7)
        rbr = rtl;
    if(arguments.length < 8)
        rbl = rtl;
    
    this.beginPath();
    this.moveTo(x+rtl,y); //behind top-left edge
    this.lineTo(x+width-rtr,y);
    this.bezierCurveTo(x+width,y, x+width, y+rtr, x+width, y+rtr); //top-right
    this.lineTo(x+width, y+height-rbr);
    this.bezierCurveTo(x+width,y+height, x+width-rbr, y+height, x+width-rbr, y+height);  // bottom-right
    this.lineTo(x+rbl, y+height);
    this.bezierCurveTo(x,y+height, x, y+height-rbl, x, y+height-rbl); // bottom-left
    this.lineTo(x, y+rtl);
    this.bezierCurveTo(x,y, x+rtl, y, x+rtl, y); // top-left
    this.closePath();
    this.fill();
    
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
window.CanvasRenderingContext2D.prototype.strokeVariousRoundedRect = function(x,y,width,height,rtl, rtr, rbr, rbl){
    //var args = arguments;
    
    if(arguments.length < 6)
        rtr = rtl;
    if(arguments.length < 7)
        rbr = rtl;
    if(arguments.length < 8)
        rbl = rtl;
    
    this.beginPath();
    this.moveTo(x+rtl,y); //behind top-left edge
    this.lineTo(x+width-rtr,y);
    this.bezierCurveTo(x+width,y, x+width, y+rtr, x+width, y+rtr); //top-right
    this.lineTo(x+width, y+height-rbr);
    this.bezierCurveTo(x+width,y+height, x+width-rbr, y+height, x+width-rbr, y+height);  // bottom-right
    this.lineTo(x+rbl, y+height);
    this.bezierCurveTo(x,y+height, x, y+height-rbl, x, y+height-rbl); // bottom-left
    this.lineTo(x, y+rtl);
    this.bezierCurveTo(x,y, x+rtl, y, x+rtl, y); // top-left
    this.closePath();
    this.stroke();
    
};

window.CanvasRenderingContext2D.prototype.drawRoundedImage = function(img,r){
    this.save();
    var can = this.canvas;
    
    var x = (can.width / 2) - (img.width / 2);
    var y = (can.height / 2) - (img.height / 2);
    
    this.beginPath();
    this.moveTo(x+r,y); //behind top-left edge
    this.lineTo(x+img.width-r,y);
    this.bezierCurveTo(x+img.width,y, x+img.width, y+r, x+img.width, y+r); //top-right
    this.lineTo(x+img.width, y+img.height-r);
    this.bezierCurveTo(x+img.width,y+img.height, x+img.width-r, y+img.height, x+img.width-r, y+img.height);  // bottom-right
    this.lineTo(x+r, y+img.height);
    this.bezierCurveTo(x,y+img.height, x, y+img.height-r, x, y+img.height-r); // bottom-left
    this.lineTo(x, y+r);
    this.bezierCurveTo(x,y, x+r, y, x+r, y); // top-left
    this.closePath();
    
    this.clip();
    this.drawImage(img, x,y, img.width, img.height);
    this.restore();
    
    return {
        X : x,
        Y : y,
        Width : img.width,
        Height : img.height
    };
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
window.CanvasRenderingContext2D.prototype.fillSpinnedText = function(mx, my, text, degree){
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

String.prototype.format = function(){
    var str = this;
    var regEx;
    for (var i = 0; i < arguments.length; i++){
        regEx = new RegExp("\\{" + i + "\\}", "gm");
        str = str.replace(regEx, arguments[i]);
    }return str;
};

/**
 * @description Returns the input as a string of the given KeyboardEvent
 * @version not completely correct
 * @param {KeyboardEvent} the event that will be interpreted
 * @return {String} input as a string of the given KeyboardEvent
 */
String.prototype.getKeyByEvent = String.getKeyByEvent = function(e){
    
    var code = e.charCode || e.keyCode;
    // killing the modifier keys
    // 16 = shift, 17 = control, 18 = alt
    if(16 <= code && code <= 18){
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

    if(48 <= code && code <= 57){
        number = true;
        letter = false;
        other = false;
    }

    if(65 <= code && code <= 90){
        number = false;
        letter = true;
        other = false;
    }
    
    if(97 <= code && code <= 122){
        number = false;
        lowercase = true;
        other = false;
        letter = true;
    }
    
    if(!shift){
        lowercase = true;
        if(letter)
            code += 32;
    }
    
    if(alt || control)
        other = true;
    
    if(!other)
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
 * @description Increases the imageData on a given CanvasContext by the factor
 * of "by". Simple - Nearest Neighbour Algorithmn
 * @param {CanvasContext} ctx - context that contains the image
 * @param {Number} by - zoom factor (needs to be a positive integer)
 * @param {Number} w - width of the context
 * @param {Number} h - height of the context
 * @returns {Image}
 */
function createImageWithNN(ctx, by, w, h){
    
    // if the zoom factor is negative, zero or undefined - it will be 2 by default
    by = by > 0 ? by : 2;
    
    // getting image data
    var imgData = ctx.getImageData(0,0,w,h);

    // creating an off-screen canvas 
    var canoff = document.createElement('CANVAS');
    canoff.width = w * by;
    canoff.height = h * by;
    // ... and its context
    var off = canoff.getContext('2d');
    // ... and its imageData
    var offImgData = off.getImageData(0,0,w*by,h*by);

    var i,r,g,b,a, j;
    var x, xx, y, yy;
    var newx, newy;
    var neww = w*by;
    
    for (x=0;x<w;++x){
      for (y=0;y<h;++y){
        i = (y*w + x)*4;
        r = imgData.data[i+0];
        g = imgData.data[i+1];
        b = imgData.data[i+2];
        a = imgData.data[i+3];

        for(xx=0; xx<by; xx++){
            for(yy=0; yy<by; yy++){
                newx = x*by + xx;
                newy = y*by + yy;
                j = (newy*neww + newx)*4;
                offImgData.data[j+0] = r;
                offImgData.data[j+1] = g;
                offImgData.data[j+2] = b;
                offImgData.data[j+3] = a;
            }
        }
      }
    }
    
    off.putImageData(offImgData, 0,0);
    var url = canoff.toDataURL();
    var newimg = document.createElement("IMG");
    newimg.src = url;

    return newimg;
}

/**
 * @description Takes the current composed grafics of a Canvas element and transformed them to an image
 * "by" the factor. Simple - Nearest Neighbour Algorithmn
 * @param {HTMLCanvasElement} can Canvas, which containts the composed grafics which will be converted to an image
 * @param {Number} by - zoom factor (needs to be a positive integer)
 * @returns {Image}
 */
function createImageNN(can, by){
    
    // if the zoom factor is negative, zero or undefined - it will be 2 by default
    by = by > 0 ? parseInt(by) : 2;
    
    var ctx = can.getContext("2d");
    var w = can.width;
    var h = can.height;
    
    // getting image data
    var imgData = ctx.getImageData(0,0,w,h);

    // creating an off-screen canvas 
    var canoff = document.createElement('CANVAS');
    canoff.width = w * by;
    canoff.height = h * by;
    // ... and its context
    var off = canoff.getContext('2d');
    // ... and its imageData
    var offImgData = off.getImageData(0,0,w*by,h*by);

    var i,r,g,b,a, j;
    var x, xx, y, yy;
    var newx, newy;
    var neww = w*by;
    
    for (x=0;x<w;++x){
      for (y=0;y<h;++y){
        i = (y*w + x)*4;
        r = imgData.data[i+0];
        g = imgData.data[i+1];
        b = imgData.data[i+2];
        a = imgData.data[i+3];

        for(xx=0; xx<by; xx++){
            for(yy=0; yy<by; yy++){
                newx = x*by + xx;
                newy = y*by + yy;
                j = (newy*neww + newx)*4;
                offImgData.data[j+0] = r;
                offImgData.data[j+1] = g;
                offImgData.data[j+2] = b;
                offImgData.data[j+3] = a;
            }
        }
      }
    }
    
    off.putImageData(offImgData, 0,0);
    var url = canoff.toDataURL();
    var newimg = document.createElement("IMG");
    newimg.src = url;

    return newimg;
}

// shim if needed
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}