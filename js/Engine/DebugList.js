
function DebugList(){
    ABO.call(this);
    this.Checking = "array";
    // todo: use enums for position
    this.Position = DebugList.prototype.Positions.TopLeft;
    this.Margin = 5;
    this.RowSpacing = 4;
    
    this.DebugObject = [];
    this.ValuesNumber = 0;
    
    this.X = this.Margin;
    this.Y = this.Margin;
    this.FontHeight = 14;
    
    this.Timestamp = Date.now();
    
    this.Draw = function(c){
        
        if(this.ValuesNumber <= 0) return false;
        
        c.save();
        
        var widest = 0;
        var curw = 0;
        var margin = 5;
        
        if(this.Checking == "array"){
            var x = this.X, y = this.Y;
            var dif = this.FontHeight + this.RowSpacing;
            c.textBaseline = "top";
            //this.Engine.Font.setContextFontString(c, this.Font.Style.normal, 14, this.Font.Variant.small_caps);
            
            c.font = this.FontHeight + "px black arial";
            widest = c.measureText("Timestamp: " + this.Timestamp).width + 2*margin;
            
            for(var i=0; i<this.ValuesNumber; i++){
                curw = c.measureText(this.DebugObject[i]).width + 2*margin;
                if(widest < curw)
                    widest = curw;
            }
            c.fillStyle = "grey";
            c.fillRect(x,y, x + widest + 2*margin, y + 2*margin + (this.ValuesNumber+1)*dif);
            
            
            c.fillStyle = "black";
            c.fillText("Timestamp: " + this.Timestamp, x+margin, y+margin);
            for(var i=0; i<this.ValuesNumber; i++){
                c.fillText(this.DebugObject[i], x+margin, y + margin + dif * (i+1));
            }
            
        }
        c.restore();
    };
    
    this.SetDebugArray = function(arr){
        this.Checking = "array";
        this.DebugObject = arr;
        this.ValuesNumber = arr.length;
        this.Timestamp = Date.now();
    };
    
    this.SetObject = function(obj){
        this.Checking = "array";
        
        var arr = [];
        for(var i in obj){
            if(typeof obj[i] == "function")
                arr.push("'" +i+ "': 'function()'");
            else
                arr.push("'" +i+ "': '"+obj[i]+"'");
        }
        this.DebugObject = arr;
        this.ValuesNumber = arr.length;
        this.Timestamp = Date.now();
    };
    
    this.SetPosition = function(pos){
        if(pos)
            this.Position = pos;
            
        if(this.Position == DebugList.prototype.Positions.BottomLeft){
            this.X = this.Margin;
            var canvasHeight = this.Engine.Canvas.height;
            this.Y = canvasHeight - ((this.ValuesNumber+1) * this.FontHeight) - ((this.ValuesNumber) * this.RowSpacing) - this.Margin;
        }
        if(this.Position == DebugList.prototype.Positions.TopLeft){
            this.X = this.Margin;
            this.Y = this.Margin;
        }
        if(this.Position == DebugList.prototype.Positions.TopRight){

        }
        if(this.Position == DebugList.prototype.Positions.BottomRight){

        }
    };
}
DebugList.prototype = Object.create(ABO.prototype);
DebugList.prototype.constructor = DebugList;

DebugList.prototype.Positions = {
    TopLeft : 0,
    TopRight : 1,
    BottomLeft : 2,
    BottomRight : 3
};