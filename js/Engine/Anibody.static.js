/**
 * a class that provides random numbers
 * @type static class
 */
Anibody.static.Random = function Random(){};
/**
 * Returns a number between a minimum and a maximum - both inclusivly
 * @param {number} min
 * @param {number} max
 * @param {number} decimals
 * @returns {Number}
 */
Anibody.static.Random.GetNumberOld = function(min, max, decimals){
    
    // Testing needed
    
    if(isNaN(min))
    min = 0;
    if(isNaN(max))
        if(Number && Number.MAX_SAFE_INTEGER)
            max = Number.MAX_SAFE_INTEGER;
        else
            max = Math.pow(2, 53) - 1;
        
    if(isNaN(decimals))
        decimals = 0;
    
    var ran = Math.random() * Math.pow(10, decimals+6);
    min *= Math.pow(10, decimals);
    max *= Math.pow(10, decimals);
    ran = ran % (max - min + 1) + min;
    return (Math.round(ran)/Math.pow(10, decimals));
};

Anibody.static.Random.GetNumber = function(min, max, decimals){
    if(window.crypto || window.crypto.getRandomValues){
        return Random.GetNumberOld(min, max, decimals);
    }
    
    if(isNaN(min))
    min = 0;
    if(isNaN(max))
        if(Number && Number.MAX_SAFE_INTEGER)
            max = Number.MAX_SAFE_INTEGER;
        else
            max = Math.pow(2, 53) - 1;
        
    if(typeof decimals === "undefined" || isNaN(decimals))
        decimals = 0;
    
    var array = new Uint32Array(3);
    window.crypto.getRandomValues(array);
    
    var num = array[0] + array[1] + array[2];
    max *= Math.pow(10, decimals);
    min *= Math.pow(10, decimals);
    num = num % (max - min + 1) + min;
    num /= Math.pow(10, decimals);
    return num;
};
/**
 * Returns a timestamp from now minus a random timespan
 * @param {number} min minimum
 * @param {number} max maximum
 * @param {string} time unit (ms|s|min|h|d|w|y) leapyear not included in calculation
 * @returns {Number}
 */
Anibody.static.Random.GetTimestamp = function(min, max, unit){
    if(typeof unit === "undefined")
        unit = "s";
    var num = Random.GetNumber(min, max);
    
    var lim = Date.now();
    if(unit === "ms" || unit === "mil")
        lim -= num;
    
    if(unit === "s")
        lim -= num * 1000;
    
    if(unit === "min")
        lim -= num * 1000 * 60;
    
    if(unit === "h")
        lim -= num * 1000 * 60 * 60;
    
    if(unit === "d")
        lim -= num * 1000 * 60 * 60 * 24;
    
    if(unit === "w")
        lim -= num * 1000 * 60 * 60 * 24 * 7;
    
    if(unit === "y")
        lim -= num * 1000 * 60 * 60 * 24 * 365;
    
    return lim;
    
};
/**
 * Figuratively speaking: Drawing 1 lot from a bowl. How many lots of a kind exists in the bowl can be different
 * @example Random.DrawLot(["A","B"],[8, 2]) --> the bowl has 8+2 lots in it.
 * 8x "A" and 2x "B". The call will draw 1 lot and return it
 * @param {object-array} lots
 * @param {number-array} lotschance
 * @returns {object}
 */
Anibody.static.Random.DrawLot = function(lots, lotsChances){
    
    if(arguments.length < 1) throw "ArgumentException: Too less arguments";
    
    if(isNaN(lots.length) || isNaN(lotsChances.length))
        throw "ArgumentException: Arguments need to be arrays";
    
    if(lots.length !== lotsChances.length)
        throw "ArgumentException: Arrays need to be the same size";
    
    var i;
    // find out how many decimals are after the dot
    var getDecimals = function(num){
        var str = num.toString();
        var i = str.indexOf(".");
        if(i < 0) return 0;
        str = str.substr(i+1);
        return str.length;
    };
    
    var decimals = 0;
    for(i=0; i<lotsChances.length; i++){
        decimals = Math.max(decimals,getDecimals(lotsChances[i]));
    }
    
    var chanceSum = 0;
    for(i=0; i<lotsChances.length; i++)
        chanceSum += lotsChances[i];
    
    var rnd = Random.GetNumber(0, chanceSum, decimals);
    var classmin = 0;
    var classmax = 0;
    for(i=0; i<lots.length; i++){
        classmax += lotsChances[i];
        if(rnd >= classmin && rnd < classmax)
            return lots[i];
        classmin = classmax;
    }
    return lots[lots.length-1];
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
Anibody.static.createImageWithNN = function createImageWithNN(ctx, by, w, h){
    
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
};

/**
 * @description Takes the current composed grafics of a Canvas element and transformed them to an image
 * "by" the factor. Simple - Nearest Neighbour Algorithmn
 * @param {HTMLCanvasElement} can Canvas, which containts the composed grafics which will be converted to an image
 * @param {Number} by - zoom factor (needs to be a positive integer)
 * @returns {Image}
 */
Anibody.static.createImageNN = function createImageNN(can, by){
    
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
};

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
Anibody.static.createImageWithFittedText = function createImageWithFittedText(width, height, texts, startfontheight, padding, rowspace, color, cfont){
    
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
Anibody.static.getClass = function getClass(obj){
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
Anibody.static.getRGBA = function getRGBA(color, alpha, inc_quot){
    
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
Anibody.static.buttonLayout = function buttonLayout(box, depth, stops){
    
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

/**
 * Makes sure that an attribute of an object is within a given range
 * @param {object} obj - Object of the attribute, which will be forced into a range
 * @param {string} attr - name of the attribute
 * @param {number} min value of the range: default is 0
 * @param {number} max value of the range: default is 100
 * @returns undefined
 */
Anibody.static.forceRange = function forceRange(obj, attr, min, max){
    if(arguments.length < 2) throw "No attribute defined as argument";
    
    if(isNaN(min)) min = 0;
    if(isNaN(max)) max = 100;
    
    if(obj[attr] < min) obj[attr] = min;
    if(obj[attr] > max) obj[attr] = max;
}
