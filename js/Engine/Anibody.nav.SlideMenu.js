Anibody.SetPackage("Anibody", "nav");

/**
 * A SlideMenu arrays an amount of Tabs, attached on a certain side of the canvas
 * @param {String} attto the side, to which it attaches the Tabs
 *      - at the moment, only "left" is implemented - "top", "right", "bottom" are following
 * @param {Number} dist the distance between the first Tab and the next Nullpoint of the opposite axis
 * @returns {SlideMenu}
 */
Anibody.nav.SlideMenu = function SlideMenu(attto, dist) {
    Anibody.classes.ABO.call(this);
    
    this.Tabs = [];
    this.OpenTab = null;
    
    this.AttachedSide = attto;
    this.DistanceToCanvasNullpoint = dist;
    this.MarginBetweenTabs = 5;
    
    // overall needed depth, which will be regarded by all tabs
    this.NeededDepth = 0;
};
Anibody.nav.SlideMenu.prototype = Object.create(Anibody.classes.ABO.prototype);
Anibody.nav.SlideMenu.prototype.constructor = Anibody.nav.SlideMenu;

/**
 * SlideMenu is drawn
 * NOTICE : Tabs are not objects in the Object Loop. They will be drawn here
 * @param {type} c Engine's canvas
 * @returns {undefined}
 */
Anibody.nav.SlideMenu.prototype.Draw = function(c){
    c.save();

    for(var i=0; i<this.Tabs.length; i++){
        this.Tabs[i].Draw(c);
    }
    c.restore();
};

/**
 * SlideMenu is updated
 * NOTICE : Tabs are not objects in the Object Loop. They will be updated here
 * @param {type} c Engine's canvas
 * @returns {undefined}
 */
Anibody.nav.SlideMenu.prototype.Update = function(){
    
    var mouse = this.Engine.Input.Mouse;
    for(var i=0; i<this.Tabs.length; i++){
        this.Tabs[i].Update(mouse);
    }
};

/**
 * SlideMenu is updated
 * NOTICE : Tabs are not objects in the Object Loop. They will be updated here
 * @param {type} c Engine's canvas
 * @returns {undefined}
 */
Anibody.nav.SlideMenu.prototype.ProcessInput = function(){
    
    for(var i=0; i<this.Tabs.length; i++){
        this.Tabs[i].ProcessInput();
    }
};

/**
 * Creates a new instance of a Tab and adds it to the SlideMenu
 * @param {String} label Tab's label
 * @returns {Tab}
 */
Anibody.nav.SlideMenu.prototype.AddTab = function(label){
    var tab = new Tab(label, this);
    
    var p = {x : 0, y: 0};
    
    if(this.AttachedSide == "left")
        p.y += this.DistanceToCanvasNullpoint;
    
    for(var i=0; i<this.Tabs.length; i++){
        p.y += this.Tabs[i].Height + this.MarginBetweenTabs;
    }
    
    tab.Y = p.y;
    
    this.Tabs.push(tab);
    return tab;
};
/**
 * closes all tabs, quickly (direktly) or with a closing animation
 * @param {Boolean} quick
 * @returns {undefined}
 */
Anibody.nav.SlideMenu.prototype.CloseAllTabs = function(quick){
    if(this.OpenTab!==null)
    if(quick){
        this.OpenTab.QuickClose();
    }else{
        this.OpenTab.Close();
    }
    
};
/**
 * Returns an array with all tabs of the given name
 * @param {string} name
 * @returns {Array}
 */
Anibody.nav.SlideMenu.prototype.GetTabsByName = function(name){
    
    var arr = [];
    
    for(var i=0; i<this.Tabs.length; i++){
        if(this.Tabs[i].Label === name)
            arr.push(this.Tabs[i]);
    }
    return arr;
};
/**
 * removes all necessary handlers so that this slidemenu can be ignored/deleted
 * @returns {undefined}
 */
Anibody.nav.SlideMenu.prototype.Delete = function(){
    
    for(var i=0; i<this.Tabs.length; i++){
        this.Tabs[i].RemoveMouseHandler();
    }
};

