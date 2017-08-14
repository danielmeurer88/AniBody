/**
 * gets the RGBA-Value of the pixel x,y
 * @param {integer} x
 * @param {integer} y
 * @returns {red,green,blue,alpha}
 */
window.ImageData.prototype.getPixel = function(x,y){
        return {
            red : this.data[ 4* ( x + this.width * y ) + 0 ],
            green : this.data[ 4* ( x + this.width * y ) + 1 ],
            blue : this.data[ 4* ( x + this.width * y ) + 2 ],
            alpha : this.data[ 4* ( x + this.width * y ) + 3 ]
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
window.ImageData.prototype.setPixel = function(x,y,r,g,b,a){
    var p =  4* ( x + this.width * y );
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
 * gets the image data of image, saves it and returns it
 * @returns {ImageData}
 */
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
 * gets the data url of an image
 * @returns {string}
 */
HTMLImageElement.prototype.getDataURL = function(){
    var can = document.createElement("canvas");
    can.width = this.width;
    can.height = this.height;
    var con = can.getContext("2d");
    con.drawImage(this,0,0);
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
window.CanvasRenderingContext2D.prototype.circle = function(x,y,r,centroid, clockwise){
        
    if(typeof centroid === "undefined" || centroid == null)
        centroid = true;
    
    if(typeof clockwise === "undefined" || clockwise == null)
        clockwise = true;
    
    if(!centroid){
        x+=r; y+=r;
    }
    this.moveTo(x+r, y);
    if(clockwise){
        this.arcTo(x+r,y+r, x, y+r, r);
        this.arcTo(x-r, y+r, x-r, y, r);
        this.arcTo(x-r, y-r, x, y-r, r);
        this.arcTo(x+r,y-r, x+r, y, r);
    }else{
        this.arcTo(x+r,y-r, x, y-r, r);
        this.arcTo(x-r, y-r, x-r, y, r);
        this.arcTo(x-r, y+r, x, y+r, r);
        this.arcTo(x+r,y+r, x+r, y, r);
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
window.CanvasRenderingContext2D.prototype.arrow2 = function(x1,y1,x2,y2,th,hlr, btr, clockwise){
    
    if(typeof hlr === "undefined" || hlr === null)
        hlr = 0.2;
    
    if(typeof btr === "undefined" || btr === null)
        btr = 0.5;
    
    if(typeof clockwise === "undefined" || clockwise === null)
        clockwise = true;
    
    var b = (x2-x1); // deltaX
    var a = (y2-y1); // deltaY
    var len = Math.pow( Math.pow(a, 2) + Math.pow(b, 2), 0.5 );
    
    if(typeof th === "undefined" || th === null)
        th = len*0.25;
    else
        th /= 2;
    
    // body thickness
    var bth = th*btr;
    // head thicknes
    var hth = th;
    // body length
    var blen = len*(1-hlr);
    
    var rad = Math.atan2(a, b);
    if(rad < 0)
        rad = (rad + 2*Math.PI) % (2*Math.PI);
    
//    var degree = rad * 180 / Math.PI;

    var leftAngle = rad - (Math.PI/2);
    var rightAngle = rad + (Math.PI/2);
    
    var p = [];
    p[0] = {x:x1,y:y1};
    
    // path from the start point to the arrow peak, going there from the left side
    p[1] = {x : Math.cos(leftAngle)*bth + p[0].x, y: Math.sin(leftAngle)*bth + p[0].y};
    p[2] = { x : p[1].x + Math.cos(rad)*blen, y: p[1].y + Math.sin(rad)*blen };
    p[3] = { x : p[2].x + Math.cos(leftAngle)*hth, y: p[2].y + Math.sin(leftAngle)*hth };
    
    p[4] = { x : x2, y: y2 }; // arrow peak
    
    // path from the start point to the arrow peak, going there from the right side
    p[7] = {x : Math.cos(rightAngle)*bth + p[0].x, y: Math.sin(rightAngle)*bth + p[0].y};
    p[6] = { x : p[7].x + Math.cos(rad)*blen, y: p[7].y + Math.sin(rad)*blen };
    p[5] = {x : p[6].x + Math.cos(rightAngle)*hth, y: p[6].y + Math.sin(rightAngle)*hth};
    
    this.moveTo(p[0].x,p[0].y);
    
    if(clockwise)
        for(var i=1; i<p.length; i++)
            this.lineTo(p[i].x, p[i].y);
    else
        for(var i=p.length-1; i>0; i--)
            this.lineTo(p[i].x, p[i].y);
    
    this.lineTo(p[0].x,p[0].y);
};

window.CanvasRenderingContext2D.prototype.arrow3 = function(x1,y1,x2,y2,th,hlr, btr, clockwise){
    
    if(typeof hlr === "undefined" || hlr === null)
        hlr = 0.2;
    
    if(typeof btr === "undefined" || btr === null)
        btr = 0.5;
    
    if(typeof clockwise === "undefined" || clockwise === null)
        clockwise = true;
    
    var b = (x2-x1); // deltaX
    var a = (y2-y1); // deltaY
    var len = Math.pow( Math.pow(a, 2) + Math.pow(b, 2), 0.5 );
    
    if(typeof th === "undefined" || th === null)
        th = len * 0.15;
    
    // body thickness
    var bth = th*btr;
    // head thicknes
    var hth = th-bth;
    // body length
    var blen = len*(1-hlr);
    
    var rad = Math.atan2(a, b);
    if(rad < 0)
        rad = (rad + 2*Math.PI) % (2*Math.PI);
    
//    var degree = rad * 180 / Math.PI;

    var leftAngle = rad - (Math.PI/2);
    var rightAngle = rad + (Math.PI/2);
    
    var p = [];
    p[0] = {x:x1,y:y1};
    
    // path from the start point to the arrow peak, going there from the left side
    p[1] = {x : Math.cos(leftAngle)*bth + p[0].x, y: Math.sin(leftAngle)*bth + p[0].y};
    p[2] = { x : p[1].x + Math.cos(rad)*blen, y: p[1].y + Math.sin(rad)*blen };
    p[3] = { x : p[2].x + Math.cos(leftAngle)*hth, y: p[2].y + Math.sin(leftAngle)*hth };
    
    p[4] = { x : x2, y: y2 }; // arrow peak
    
    // path from the start point to the arrow peak, going there from the right side
    p[7] = {x : Math.cos(rightAngle)*bth + p[0].x, y: Math.sin(rightAngle)*bth + p[0].y};
    p[6] = { x : p[7].x + Math.cos(rad)*blen, y: p[7].y + Math.sin(rad)*blen };
    p[5] = {x : p[6].x + Math.cos(rightAngle)*hth, y: p[6].y + Math.sin(rightAngle)*hth};
    
    this.moveTo(p[0].x,p[0].y);
    
    if(clockwise)
        for(var i=1; i<p.length; i++)
            this.lineTo(p[i].x, p[i].y);
    else
        for(var i=p.length-1; i>0; i--)
            this.lineTo(p[i].x, p[i].y);
    
    this.lineTo(p[0].x,p[0].y);
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
window.CanvasRenderingContext2D.prototype.fillArrow2 = function(x1, y1, x2, y2, th, hlr, btr){
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
window.CanvasRenderingContext2D.prototype.arrow = function(x, y, th, len, degree, hlr, bhr, clockwise){

    //head length ratio
    if(typeof hlr === "undefined" || hlr == null) hlr = 0.2;
    // body-head-ratio
    if(typeof bhr === "undefined" || bhr == null) bhr = 0.5;
    
    if(typeof clockwise === "undefined" || clockwise == null) clockwise = true;
    
    var rad = degree * Math.PI / 180;
    
    // th is the overall thickness and at the same time the head thickness
    // body thickness
    var bth = th*bhr;
    
    this.save();
    this.translate(x, y);
    this.rotate(rad);
    
    this.moveTo(0,0);
    if(clockwise){
        this.lineTo(0, -bth/2 );
        this.lineTo(len-len*hlr, -bth/2);
        this.lineTo(len-len*hlr, -th/2);
        this.lineTo(len, 0); // arrow peak
        this.lineTo(len-len*hlr, th/2);
        this.lineTo(len-len*hlr, bth/2);
        this.lineTo(0, bth/2 );
    }else{
        this.lineTo(0, bth/2 );
        this.lineTo(len-len*hlr, bth/2);
        this.lineTo(len-len*hlr, th/2);
        this.lineTo(len, 0); // arrow peak
        this.lineTo(len-len*hlr, -th/2);
        this.lineTo(len-len*hlr, -bth/2);
        this.lineTo(0, -bth/2 );
    }
    this.lineTo(0,0);
    
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
window.CanvasRenderingContext2D.prototype.fillArrow = function(x, y, th, len, degree, hlr, bhr){
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
window.CanvasRenderingContext2D.prototype.strokeArrow = function(x, y, th, len, degree, hlr, bhr){
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
window.CanvasRenderingContext2D.prototype.fillCircle = function(x,y,r,centroid){
    this.beginPath();
    this.circle(x,y,r,centroid);
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
window.CanvasRenderingContext2D.prototype.strokeCircle = function(x,y,r,centroid){
    this.beginPath();
    this.circle(x,y,r,centroid);
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
window.CanvasRenderingContext2D.prototype.variousRoundedRect = function(x,y,width,height,rtl, rtr, rbr, rbl){
    //var args = arguments;
    
    if(arguments.length < 6)
        rtr = rtl;
    if(arguments.length < 7)
        rbr = rtl;
    if(arguments.length < 8)
        rbl = rtl;
    
    this.moveTo(x+rtl,y); //behind top-left edge
    this.lineTo(x+width-rtr,y);
    this.bezierCurveTo(x+width,y, x+width, y+rtr, x+width, y+rtr); //top-right
    this.lineTo(x+width, y+height-rbr);
    this.bezierCurveTo(x+width,y+height, x+width-rbr, y+height, x+width-rbr, y+height);  // bottom-right
    this.lineTo(x+rbl, y+height);
    this.bezierCurveTo(x,y+height, x, y+height-rbl, x, y+height-rbl); // bottom-left
    this.lineTo(x, y+rtl);
    this.bezierCurveTo(x,y, x+rtl, y, x+rtl, y); // top-left
    
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
window.CanvasRenderingContext2D.prototype.fillVariousRoundedRect = function(x,y,width,height,rtl, rtr, rbr, rbl){
    if(arguments.length < 6)
        rtr = rtl;
    if(arguments.length < 7)
        rbr = rtl;
    if(arguments.length < 8)
        rbl = rtl;
    
    this.beginPath();
    this.variousRoundedRect(x,y,width,height,rtl, rtr, rbr, rbl);
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
window.CanvasRenderingContext2D.prototype.strokeVariousRoundedRect = function(x,y,width,height,rtl, rtr, rbr, rbl){
    if(arguments.length < 6)
        rtr = rtl;
    if(arguments.length < 7)
        rbr = rtl;
    if(arguments.length < 8)
        rbl = rtl;
    
    this.beginPath();
    this.variousRoundedRect(x,y,width,height,rtl, rtr, rbr, rbl);
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
window.CanvasRenderingContext2D.prototype.drawRoundedImage = function(img, x, y, w, h, r){
    this.save();
    this.beginPath();
    this.moveTo(x+r,y); //behind top-left edge
    this.lineTo(x+img.width-r,y);
    this.bezierCurveTo(x+w,y, x+w, y+r, x+w, y+r); //top-right
    this.lineTo(x+w, y+w-r);
    this.bezierCurveTo(x+w,y+h, x+h-r, y+h, x+w-r, y+h);  // bottom-right
    this.lineTo(x+r, y+h);
    this.bezierCurveTo(x,y+h, x, y+h-r, x, y+h-r); // bottom-left
    this.lineTo(x, y+r);
    this.bezierCurveTo(x,y, x+r, y, x+r, y); // top-left
    this.closePath();
    
    this.clip();
    this.drawImage(img, x,y, w, h);
    this.restore();
    
    return {x : x,y : y,width : w,height : h};
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

/**
 * Strokes a certain text like the text is written on a piece of paper,
 * pinned on  a cirlce on the canvas. Spinning the paper would render a circle, whose centroid is given.
 * @param {Number} mx x-value of the centroid of the circle
 * @param {Number} my y-value of the centroid
 * @param {String} text the text which will be rendered
 * @param {Number} degree [0-360] of which the paper will be spinned (0 and 360 means displayed as usual)
 * @returns {undefined}
 */
window.CanvasRenderingContext2D.prototype.strokeSpinnedText = function(mx, my, text, degree){
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
window.CanvasRenderingContext2D.prototype.drawCross = function(x, y, size){
    this.save();
        
    var s = size/2;
    
    this.beginPath();
    //from top-left to bottom-right
    this.moveTo(x-s,y+s); 
    this.lineTo(x+s,y-s);
    //from bottom-left to top-right
    this.moveTo(x-s,y-s); 
    this.lineTo(x+s,y+s);
    
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
window.CanvasRenderingContext2D.prototype.cross = function(x, y, size, th){
    this.save();
    
    if(typeof th === "undefined")
        th = Math.round(size/5);
    
    var rad1 = (45) * Math.PI / 180;
    var rad2 = (90+180) * Math.PI / 180;
    
    this.translate(x,y);
    this.rotate(rad1);
    
    this.rect(-size/2, -th/2, size, th);
    this.rotate(rad2);
    
    this.rect(-size/2, -th/2, size, th);
    
    this.restore();
};

/**
 * Sets the font height of the canvas to the given value
 * @param {Number} val - height in pixel
 * @param {string} unit - unit of height, default:"px"
 * @returns {undefined}
 */
window.CanvasRenderingContext2D.prototype.setFontHeight = function(val, unit){
    if(typeof unit !== "string") unit = "px";
    this.font = this.font.replace(new RegExp("[0-9]+[a-z]{2}"), val+unit);
};

/**
 * Returns the rgba-Code of a given color (css color name/hex code/rgb/rgba) with an added alpha value
 * @param {string} color (css color name/hex code/rgb/rgba)
 * @param {Number} alpha [0-1]
 * @returns {String}
 */
window.CanvasRenderingContext2D.prototype.getColor = function(color, alpha){
    var rgbaCode;
    if(typeof color !== "string")return "rgba(0,0,0,0)";
    if(typeof alpha === "undefined" || alpha < 0 && alpha > 1)alpha = 1;
     
    var can = document.createElement("CANVAS");
    can.width = 1;
    can.height = 1;
    var c = can.getContext("2d");
    c.fillStyle = color;
    c.fillRect(0,0,1,1);
    var imageData = c.getImageData(0, 0, 1, 1).data;
    
    rgbaCode = "rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + "," +alpha+")";
    
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
window.CanvasRenderingContext2D.prototype.setStyle = function(color, alpha, fill, stroke){
    if(typeof fill === "undefined") fill = true;
    if(typeof stroke === "undefined") stroke = true;
    if(!color||color==null)
        if(fill)
            color = this.fillStyle;
        else
            color = this.strokeStyle;
        
    var rgbaCode = this.getColor(color, alpha);
    if(fill) this.fillStyle = rgbaCode;
    if(stroke) this.strokeStyle = rgbaCode;
    return rgbaCode;
};

/**
 * increases every string with the possibility to easily use it as format string
 * this function searches for "{i}" and replaces this with the computed value of
 * the i-th parameter 
 * @returns {String}
 */
String.prototype.format = function(){
    var str = this;
    var regEx;
    for (var i = 0; i < arguments.length; i++){
        regEx = new RegExp("\\{" + i + "\\}", "gm");
        str = str.replace(regEx, arguments[i]);
    }return str;
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
String.prototype.decodeURI = function(){
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
    Greek : {
        alpha : decodeURI("%CE%B1"),
        beta : decodeURI("%CE%B2"),
        gamma : decodeURI("%CE%B3"),
        delta : decodeURI("%CE%B4"),
        epsilon : decodeURI("%CE%B5"),
        theta : decodeURI("%CE%B8"),
        lamda : decodeURI("%CE%BB"),
        mu : decodeURI("%CE%BC"),
        pi : decodeURI("%CF%80"),
        rho : decodeURI("%CF%81"),
        sigma : decodeURI("%CF%83"),
        phi : decodeURI("%CF%86"),
        chi : decodeURI("%CF%87"),
        psi : decodeURI("%CF%88"),
        omega : decodeURI("%CF%89"),
        
        Gamma : decodeURI("%CE%93"),
        Delta : decodeURI("%CE%94"),
        Epsilon : decodeURI("%CE%95"),
        Theta : decodeURI("%CE%98"),
        Lamda : decodeURI("%CE%9B"),
        Pi : decodeURI("%CE%A0"),
        Sigma : decodeURI("%CE%A3"),
        Phi : decodeURI("%CE%A6"),
        Psi : decodeURI("%CE%A8"),
        Omega : decodeURI("%CE%A9")
    },
    German : {
        ae : decodeURI("%C3%A4"),
        oe : decodeURI("%C3%B6"),
        ue : decodeURI("%C3%BC"),
        Ae : decodeURI("%C3%84"),
        Oe : decodeURI("%C3%96"),
        Ue : decodeURI("%C3%9C"),
        ss : decodeURI("%C3%9F")
    },
    Math : {
        Division : decodeURI("%C3%B7"),
        PlusMinus : decodeURI("%C2%B1"),
        Degree : decodeURI("%C2%B0"),
        Not : decodeURI("%C2%AC")
    },
    Subscript : {
        Zero : decodeURI("%E2%82%80"),
        One : decodeURI("%E2%82%81"),
        Two : decodeURI("%E2%82%82"),
        Three : decodeURI("%E2%82%83"),
        Four : decodeURI("%E2%82%84"),
        Five : decodeURI("%E2%82%85"),
        Six : decodeURI("%E2%82%86"),
        Seven : decodeURI("%E2%82%87"),
        Eight : decodeURI("%E2%82%88"),
        Nine : decodeURI("%E2%82%89")
    },
    List : {
        CheckedBallot : decodeURI("%E2%98%91"),
        UncheckedBallot : decodeURI("%E2%98%90"),
        CancellationX : decodeURI("%F0%9F%97%99")
    },
    Random : {
        Unicorn : decodeURI("%F0%9F%A6%84")
    }
    
};
/**
 * downloads a list of all implemented special characters in the String.UTF8 object
 * @returns {undefined}
 */
String._downloadUTF8Table = function(){
    
    // count entries
    
    var noa = 0; // number of attributes
    var ah = 18; // attribute height
    var apad = 4; // attribute padding
    var noe = 0; // number of entries
    var eh = 16; // entry height
    var epad = 2; // entry padding
    
    var attr, entry;
    for(attr in String.UTF8){
        noa++;
        for(entry in String.UTF8[attr]){
            noe++;
        }
    }
    var height = noe*eh + noe*epad + noa*ah + noa*apad + 20;
    
    var can = document.createElement("CANVAS");
    can.width = 300;
    can.height = height;
    var c = can.getContext("2d");
    
    var x = 5;
    var y = 0;
    
    var attrFont = "16px sans-serif";
    var entryFont = "14px sans-serif";
    
    c.textBaseline = "top";
    c.fillStyle="white";
    c.fillRect(0,0,c.canvas.width, c.canvas.height);
    c.fillStyle="black";
    
    // title
    c.font = "18px bold sans-serif";
    c.fillText("(object) String.UTF8", x, y);
    y+=24;
    
    for(attr in String.UTF8){
        
        c.font = attrFont;
        c.fillText(attr, x, y);
        y+=ah;
  
        c.font = entryFont;
        
        // entriy loop
        for(entry in String.UTF8[attr]){
            c.fillText(entry + " : " + String.UTF8[attr][entry], x+20, y);
            y+=eh+epad;
        }
        y+=apad;
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
String.prototype.decodeHTML = function(){
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
 * Randomly order the elements of the array by swapping two element in every round
 * @param {Number} rounds
 * @returns {undefined}
 */
Array.prototype.shuffle = function(rounds){
    var tmp, in1, in2;
    var self = this;
    rounds = rounds || this.length * 5;
    
    var swap = function(a,b){
        tmp = self[a];
        self[a] = self[b];
        self[b] = tmp;
    };
    
    var getRandomIndex = function(){
        return (Math.round(Math.random() * (self.length - 1))) % self.length;
    };
    
    for(var i=0; i<rounds; i++){
        in1 = getRandomIndex();
        in2 = getRandomIndex();
        swap(in1, in2);
    }
    
};
/**
 * Deletes the element of the specific index and returns it on success
 * @param {Number} index
 * @returns {Array-Element}
 */
Array.prototype.delete = function(index){
    var ret;
    
    if(index >= this.length || index < 0 || isNaN(index))
        return;
    
    index = Math.floor(index);
    
    if(index+1 === this.length)
        return this.pop();
    
    var ret = this[index];
    for(var i=index; i<this.length-1; i++){
        this[i] = this[i+1];
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
Array.prototype.isElement = function(el){
    for(var i=0; i<this.length; i++){
        if(this[i] === el)
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
Array.prototype.getIndex = function(el){
    for(var i=0; i<this.length; i++){
        if(this[i] === el)
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
Function.prototype.getCallbackObject = function(that, parameter){
    return {that:that, function:this, parameter:parameter};
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

/**
 * Returns an image, in which the specified text or text-lines are fitted
 * @param {Number} width - max width of the returned image in pixel
 * @param {Number} height - max height in pixel
 * @param {string|string-Array} texts - text written in the image
 * @param {Number} startfontheight - the fontheight, with which the algorithmen is going to start
 * @param {Number} padding - gap between the text and the border of the image
 * @param {Number} rowspace - gap between the rows
 * @param {string} color - color of the text
 * @param {string} cfont - the HTML5-Canvas text format
 * @returns {Image-Element}
 */
function createImageWithFittedText(width, height, texts, startfontheight, padding, rowspace, color, cfont){
    
    // making sure that the 1 parameter is an array of strings
    if(typeof texts === "string")
        texts = [texts];
    
    color = color || "black";
    var fontheight = startfontheight + 1 || 25;
    cfont = cfont || "10px sans-serif";
    
    if(typeof padding === "undefined")
        padding = 5; // the distance between the the border of the image and the text
    if(typeof rowspace === "undefined")
        rowspace = 3; // the distance between the text rows
    
    // creating an offscreen canvas with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = width;
    off.height = height;
    var c = off.getContext("2d");
    
    c.font = cfont; 
    c.setFontHeight(fontheight);
    
    var allwords = [];
    
    var temp;
    // loops through all elements of the string array
    for(var i=0; i<texts.length; i++){
        // splits them into single elements (words)
        temp = texts[i].split(" ");
        // and loops through them
        for(var j=0; j<temp.length; j++){
            allwords.push(temp[j]);
        }
        // at the end of every string element of the array will be a "\n"
        // * if it is not the last element of the array
        if(i < texts.length-1){
            allwords.push("\\n");
        }
    }
    
    // gets the length of all words
    
    var neededheight = height + 1;
    
    while(neededheight > height){
        
        fontheight--;
        
        c.setFontHeight(fontheight); // setting the font height - needed for correct calculations
        var spacelen = c.measureText(" ").width; // measures the length of the " "-symbol
        var alllengths = [];
        
        for(var i=0; i<allwords.length; i++){
            if(allwords[i] !== "\\n")
                alllengths.push( c.measureText(allwords[i]).width );
            else
                alllengths.push(0);
        }

        var rows = [];
        var rowlengths = [];
        rows.push("");
        rowlengths.push(0);

        for(var i=0; i<allwords.length; i++){

            if(allwords[i] === "\\n"){
                i++;
                rows.push(allwords[i] + " ");
                rowlengths.push(0 + alllengths[i] + spacelen);
            }else{
                // true if the current word won't exceed the width+padding of the box
                if(rowlengths[rows.length-1] + alllengths[i] + spacelen < width-2*padding){
                    // adds the word + " " to the current row
                    rows[rows.length-1] += allwords[i] + " ";
                    rowlengths[rows.length-1] += alllengths[i] + spacelen;
                }else{
                    // removes the last " "-symbol of the current row
                    rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);
                    rowlengths[rows.length-1] -= spacelen;
                    // begins a new row and adds the current word + " " to it
                    rows.push(allwords[i] + " ");
                    rowlengths.push(alllengths[i] + spacelen);
                }
            }
        }
        // removes the last " "-symbol of the last row
        rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);
        // now that we know how many rows there are, we can calculate the height
        neededheight = 2*padding + fontheight*rows.length + rowspace*rows.length-1;
    }// while
    
    // finding the maximum length among the rows...
    var maxw = 0;
    for(var i=0; i<rows.length; i++){
        if(rowlengths[i] > maxw)
            maxw = rowlengths[i];
    }
    // and resize the width
    
    var off = document.createElement("CANVAS");
    off.width = maxw  + 2*padding;
    off.height = neededheight;
    var c = off.getContext("2d");
    c.setFontHeight(fontheight);
    
    c.textAlign = "left";
    c.textBaseline = "top";
    c.fillStyle= color;
    
    var x = padding;
    var y = padding;
    
    for(var i=0; i< rows.length; i++){
        c.fillText(rows[i], x,y);
        y += fontheight + rowspace;
    }
    
    // saving the drawing as an image
    var url = off.toDataURL();
    var img = document.createElement("IMG");
    img.src = url;

    return img;
}

/**
 * Returns the class of a variable with the prefix 'CLASS::'
 * @param {anything} obj
 * @returns {String}
 */
function getClass(obj){
    var con = obj.constructor.toString();
    var ifunc = con.indexOf("function ");
    var ibracket = con.indexOf("(");
    if(ifunc == 0){
        con = con.substr(9, ibracket - 9);
    }
    return "CLASS::"+con;
}

/**
 * Returns the rgba-Code of a given color (css color name/hex code/rgb/rgba) with an added alpha value
 * @param {string} color (css color name/hex code/rgb/rgba)
 * @param {Number} alpha [0,1]
 * @param {Number} inc_quot [-1,-1] quotient of how much the color value shall increase, default=0 -> no change
 * @returns {String}
 */
function getRGBA(color, alpha, inc_quot){
    
    var rgbaCode;
    
    if(typeof color !== "string"){
        return false;
    }
    
    if(typeof alpha === "undefined" || alpha < 0 && alpha > 1){
        alpha = 1;
    }
    
    if(typeof inc_quot === "undefined" && isNaN(inc_quot)){
        inc_quot = 0;
    }
    
//    // if color is already rgb
//    if(color.indexOf("rgb(")>=0){
//        var tmp = color.split(",");
//        // tmp[0] = "rgb(XXX" -> "rgb(" should be removed
//        tmp[0] = tmp[0].substr(4);
//        // tmp[2] = "XXX)" -> ")" should be removed
//        tmp[2] = tmp[2].substr(0, tmp[2].length-1);
//        // ["rgba(r", "g", "b" , "a)"];
//        rgbaCode = "rgba(" + tmp[0] + "," + tmp[1] + "," + tmp[2] + ","+ alpha +")";
//        return rgbaCode;
//    }
    
    var can = document.createElement("CANVAS");
    can.width = 1;
    can.height = 1;
    var c = can.getContext("2d");
    c.fillStyle = color;
    c.fillRect(0,0,1,1);
    var imageData = c.getImageData(0, 0, 1, 1).data;
    
    imageData[0] += 255*inc_quot;
    if(imageData[0] > 255) imageData[0] = 255;
    if(imageData[0] < 0) imageData[0] = 0;
    
    imageData[1] += 255*inc_quot;
    if(imageData[1] > 255) imageData[1] = 255;
    if(imageData[1] < 0) imageData[1] = 0;
    
    imageData[2] += 255*inc_quot;
    if(imageData[2] > 255) imageData[2] = 255;
    if(imageData[2] < 0) imageData[2] = 0;
    
    rgbaCode = "rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + "," +alpha+")";
    
    return rgbaCode;
}

/**
 * 
 * @param {Object} box Object that contents of the rectangle props Object {width:Number, height:Number, rounding:Number}
 * @param {Number} depth the inline gradient depth in pixel
 * @param {Array} stops Array of gradient stops = Object {stop:Number[0-1], color:string}
 * @returns {Image}
 */
function buttonLayout(box, depth, stops){
    
    // create 9 (imaginary) boxes according to the values in the arguments (box, depth)
    // tl = top-left, top, tr = top-right
    // left, m = middle, right
    // bl = bottom-left, bottom, br = bottom-right
    var r = box.rounding;
    if(typeof r === "undefined")
        r=0;
    var w = box.width;
    var h = box.height;
    
    if(typeof stops === "undefined" || stops.length <= 0)
        stops = [{stop:1, color:"black"}];
    
    // top row
    var y = 0;
    var tl = {x:0, y:0, width: depth + r, height: depth + r};
    var top = {x:depth + r, y:0, width: w - 2*(depth+r), height: depth};
    var tr = {x:top.x+top.width, y:0, width: depth+r, height: depth+r};
    // middle row
    var left = {x:0, y:depth + r, width: depth, height: h - 2*(depth+r)};
    var m = {x:depth+r, y:top.y + top.height, width: w - 2*(depth+r), height: h - 2*top.height};
    var right = {x: w - depth, y:depth + r, width: depth, height: h - 2*(depth+r)};
    // bottom row
    var bl = {x:0, y:h - depth - r, width: depth + r, height: depth + r};
    var bottom = {x:depth + r, y: h - depth, width: w - 2*(depth+r), height: depth};
    var br = {x:bottom.x+bottom.width, y: h - depth - r, width: depth+r, height: depth+r};
    
    var ratio = top.height / tl.height; // radial gradient correction ratio
    
    //stops sort
    stops = stops.sort(function(a,b){
        if(a.stop > b.stop) return 1; else return -1;
    });
    
    var can = document.createElement("CANVAS");
    can.width = w;
    can.height = h;
    var c = can.getContext("2d");
    
    var lcolor = stops[stops.length-1].color;
    c.fillStyle = lcolor;
    c.fillRect(m.x, m.y, m.width, m.height);
    c.fillRect(left.x+left.width, left.y, depth, depth);
    c.fillRect(m.x+m.width, left.y, depth, depth);
    
    //+++++++++++++
    // TOP
    var ling = c.createLinearGradient(top.x,top.y,top.x,top.height);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(top.x, top.y, top.width, top.height);
    
    //+++++++++++++
    // BOTTOM
    ling = c.createLinearGradient(bottom.x,bottom.y+bottom.height,bottom.x,bottom.y);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(bottom.x, bottom.y, bottom.width, bottom.height);
    
    //+++++++++++++
    // LEFT
    ling = c.createLinearGradient(left.x,left.y,left.x+left.width,left.y);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(left.x, left.y, left.width, left.height);
    
    //+++++++++++++
    // Right
    ling = c.createLinearGradient(right.x+right.width,right.y,right.x,right.y);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(right.x, right.y, right.width, right.height);
    
    //++++++++++
    // TOP-LEFT
    var radg = c.createRadialGradient(
            tl.x+tl.width, tl.y+tl.height,depth+r,
            tl.x+tl.width, tl.y+tl.height,0
    );
    for(var i=0; i<stops.length ;i++){
        radg.addColorStop(stops[i].stop*ratio /* mit einen Wert [0-1] multi */, stops[i].color);
    }
    c.fillStyle = radg;
    c.beginPath();
    // centroid
    c.moveTo(tl.x+tl.width, tl.y+tl.height);
    c.lineTo(tl.x, tl.y+tl.height);
    //c.lineTo(tl.x+tl.width, tl.y);
    c.arcTo(
            tl.x, tl.y,
            tl.x+tl.width, tl.y,
            tl.width);
    c.closePath();
    c.fill();
    
    //++++++++++
    // TOP-RIGHT
    var radg = c.createRadialGradient(
            tr.x, tr.y+tr.height,depth+r,
            tr.x, tr.y+tr.height,0
    );
    for(var i=0; i<stops.length ;i++){
        radg.addColorStop(stops[i].stop*ratio, stops[i].color);
    }
    c.fillStyle = radg;
    c.beginPath();
    // centroid
    c.moveTo(tr.x, tr.y+tr.height);
    c.lineTo(tr.x+tr.width, tr.y+tr.height);
    //c.lineTo(tr.x+tr.width, tr.y);
    c.arcTo(
            tr.x+tr.width, tr.y,
            tr.x, tr.y,
            tr.width);
    c.closePath();
    c.fill();
    
    //++++++++++
    // BOTTOM-LEFT
    var radg = c.createRadialGradient(
            bl.x+bl.width, bl.y,depth+r,
            bl.x+bl.width, bl.y,0
    );
    for(var i=0; i<stops.length ;i++){
        radg.addColorStop(stops[i].stop*ratio /* mit einen Wert [0-1] multi */, stops[i].color);
    }
    c.fillStyle = radg;
    c.beginPath();
    // centroid
    c.moveTo(bl.x+bl.width, bl.y);
    c.lineTo(bl.x, bl.y);
    //c.lineTo(bl.x+bl.width, bl.y);
    c.arcTo(
            bl.x, bl.y+bl.height,
            bl.x+bl.width, bl.y+bl.height,
            bl.width);
    c.closePath();
    c.fill();
    
    //++++++++++
    // Bottom-RIGHT
    var radg = c.createRadialGradient(
            br.x, br.y,depth+r,
            br.x, br.y,0
    );
    for(var i=0; i<stops.length ;i++){
        radg.addColorStop(stops[i].stop*ratio, stops[i].color);
    }
    c.fillStyle = radg;
    c.beginPath();
    // cenbroid
    c.moveTo(br.x, br.y);
    c.lineTo(br.x+br.width, br.y);
    //c.lineTo(br.x+br.width, br.y);
    c.arcTo(
            br.x+br.width, br.y+br.height,
            br.x, br.y+br.height,
            br.width);
    c.closePath();
    c.fill();
    
    // saving the drawing as an image
    var url = can.toDataURL();
    var img = document.createElement("IMG");
    img.src = url;
    
    return img;
    
}
