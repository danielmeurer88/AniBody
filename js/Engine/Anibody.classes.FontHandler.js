Anibody.SetPackage("Anibody", "classes");
/**
 * Is going to be attached to the context
 * @param {Canvas2DContext} context
 * @returns {Anibody.classes.FontHandler}
 */
Anibody.classes.FontHandler = function FontHandler(context){   
    this.Context = context;
    context.FontHandler = this;
    
    this.Color = "rgba(0,0,0,1)";
    
    this.Height = 10;
    this.Unit = "px"; // "px", "pt"
    
    this.TextBaseline = "top"; // "top", "middle", "bottom"
    this.TextAlign = "left"; // "left", "middle", "right"
    
    this.Style = "normal"; // "normal","italic", "oblique"
    this.Variant = "normal"; // "normal", "small-caps"
    this.Weight = 400; // normal: "normal", "bold","bolder", "lighter", 100,200,300, ..., 900
    this.Family = "sans-serif"; // "Arial","Calibri","Verdana","Times New Roman","Courier New","serif","sans-serif",
};

Anibody.classes.FontHandler.prototype._syncContext = function(){
    var str = "{0} {1} {2} {3}{4} {5}".format(
            this.Style, this.Variant, this.Weight, this.Height, this.Unit, this.Family 
            );
    this.Context.font = str;
    this.Context.fillStyle = this.Color;
    this.Context.textBaseline = this.TextBaseline;
    this.Context.textAlign = this.TextAlign;
};

Anibody.classes.FontHandler.prototype.SetFontHeight = function(fh, unit){
    if(typeof unit === "undefined")
        unit = "px";
    this.Height = fh;
    this.Unit = unit;
    this._syncContext();
};

Anibody.classes.FontHandler.prototype.SetFontStyle = function(style){
    this.Style = style;
    this._syncContext();
};

Anibody.classes.FontHandler.prototype.SetFontVariant = function(variant){
    this.Variant = variant;
    this._syncContext();
};

Anibody.classes.FontHandler.prototype.SetFontWeight = function(w){
    this.Weight = w;
    this._syncContext();
};

Anibody.classes.FontHandler.prototype.SetFontFamily = function(fam){
    this.Family = fam;
    this._syncContext();
};

Anibody.classes.FontHandler.prototype.SetTextBaseline = function(bl){
    this.TextBaseline = bl;
    this._syncContext();
};

Anibody.classes.FontHandler.prototype.SetTextAlign = function(al){
    this.TextAlign = al;
    this._syncContext();
};

Anibody.classes.FontHandler.prototype.SetFontColor = function(co){
    this.Color = co;
    this._syncContext();
};