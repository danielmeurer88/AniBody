
$(document).ready(function () {

    var engine = new Anibody("PlayDiv");
    
    Anibody.import(Anibody.util.Picture, "Pic");

    var waterglass = new Pic({path: "./img_rpg/water_glass.jpg", codename: "water_glass", group:"room3"});
    waterglass.AddGroup("room1");

    var mediapack = [
        new Pic("./img_rpg/logo.png", "logo"),
        new Pic("./img_rpg/button_0.png", "button_state_0"),
        new Pic("./img_rpg/button_1.png", "button_state_1"),
        new Pic("./img_rpg/button_2.png", "button_state_2"),
        new Pic("./img_rpg/sprite_test.png", "sprite_test"),
        new Pic({path: "./img_rpg/rpg_img2.png", codename: "rpg_img", group: ["room1", "beginning"]}),
        new Pic({path: "./img_rpg/rpg_structure2.png", codename: "rpg_structure"}),
        new Pic({path: "./img_rpg/rpg_subimg2.jpg", codename: "rpg_subimg", group:"room2"}),
        new Pic({path: "./img_rpg/rpg_substructure.png", codename: "rpg_substructure"}),
        new Pic({path: "./img_rpg/grey_sprite_3x4.png", codename: "rpg_testsprite" }),
        new Pic({path: "./img_rpg/tresure_closed.png", codename: "tresure_closed"}),
        new Pic({path: "./img_rpg/tresure_opened.png", codename: "tresure_opened"}),
        new Pic({path: "./img_rpg/girl.png", codename: "girl", group:"room2"}),
        new Pic({path: "./img_rpg/da_racoon.jpg", codename: "da_racoon", group:"room2"}),
        new Pic({path: "./img_rpg/crate.png", codename: "crate", group:"room2"}),
        new Pic({path: "./img_rpg/crate_pad.png", codename: "pad", group:"room2"}),
        new Pic({path: "./img_rpg/fire_sprite.png", codename: "bonfire", group:"room1"}),
        waterglass,
        new Pic({path: "./img_rpg/litte_click_sprite.png", codename: "little_click_sprite", group:"room1"}),
        new Anibody.util.Sound({path: "./music/portal_activate.mp3", codename: "portal_activate", group:"room1"}),
        new Anibody.util.Sound({path: "./music/alongway.mp3", codename: "girl_background", group:"room2"})
    ];
    
    engine.MediaManager.SetMediaPack(  mediapack, menu_callback.getCallbackObject(engine,engine));

    
});

function menu_callback(engine){
    
    // ------------------------------------------------ adding objects to the engine
    /* BUTTON RPG */
    
    Anibody.import(Anibody.ui.Button);

    // there will be two buttons in this screen so
    // the button template will be modified to set the common values
    Anibody.ui.Button.SetTemplateByObject({
        Width:250, Height:60,
        Codename : ["button_state_0", "button_state_1", "button_state_2"],
        TextColor: "white", FontHeight: 18, DisplayType : "image"
    });

    var b1 = new Button("center", 120, {
        Label : "Start",
        TriggerCallbackObject : function (engine) {
            level_rpg(engine);
        }.getCallbackObject(engine, engine),
        HoverText : "Startet das Spiel"
    });
    
    b1.AddButtonEffect();
    engine.AddObject(b1);

    // input field
    Anibody.import(Anibody.ui.InputField);
    var infi = new InputField(10, 10, 300);
    engine.AddObject(infi);

    /* BUTTON HELP */
    var b2 = new Button("center", 220, 
    {
        Label : "Test Button",
        TriggerCallbackObject : function (engine) {
                start_test(engine);
            }.getCallbackObject(engine, engine),
        HoverText : "Wird zum Testen unterschiedlicher Dinge benutzt."
    });
    b2.AddButtonEffect();
    
    engine.AddObject(b2);
    
    /* BUTTON HELP2 */
    var b3 = new Button("center", 320, 
    {
        Label : "Test Button 2",
        TriggerCallbackObject : function (engine) {
                start_test2(engine);
            }.getCallbackObject(engine, engine),
        HoverText : "Wird auch zum Testen unterschiedlicher Dinge benutzt."
    });
    b3.AddButtonEffect();
    
    engine.AddObject(b3);
        
    engine.Start();

    $("#fs_btn").click(function(){
       engine.RequestFullscreen();
       var f = function(en){
            en.ExitFullscreen();
       };
       window.setTimeout(f, 3000, engine);
    });
    
    //testSpline(engine);
    
    var w = new Anibody.Widget();
    w.TestImg = engine.MediaManager.GetImage("logo");
    w.TestImgV = w.TestImg.getVerticallyFlippedImage();
    w.TestImgH = w.TestImg.getHorizontallyFlippedImage();
    w.Draw = function(c){
        c.drawImage(this.TestImgV, 10, 500);
        c.drawImage(this.TestImg, 10, 500- this.TestImg.height-5);
        c.drawImage(this.TestImgH, 10 + this.TestImg.width + 5, 500);
    };
    
    w.Register();
    window.setTimeout(function(w){w.Deregister();}, 2500, w);
}

function start_test(engine){
    
    var width = 85.33;
    var height = 85.375;
    var getOrigin = function(w,h){
        return {x:width*w, y:height*h};
    };
    
    var bowser = new Anibody.visual.Sprite("sprite_test", 300, 400, width, height);
    bowser.SetTemplateAttribute("FPS", 6);
    
    //value by reference
    var templ = bowser.GetTemplate();
    templ.NumberOfClips = 3;
    templ.PlayMode = "loop";
    
    bowser.AddClippings(
        {Origin:{x:0,y:0}, FlagNames:["walking", "down"]},
        {Origin:{x:0,y:height*1}, FlagNames:["walking", "left"]},
        {Origin:{x:0,y:height*2}, FlagNames:["walking", "right"]},
        {Origin:{x:width*9,y:height*7}, FlagNames:["walking", "up"]}
    );
    
    templ.NumberOfClips = 1;
    
    bowser.AddClippings(
        {Origin:getOrigin(1,0), FlagNames:["down"]},
        {Origin:getOrigin(1,1), FlagNames:["left"]},
        {Origin:getOrigin(9,2), FlagNames:["right"]},
        {Origin:getOrigin(9,7), FlagNames:["up"]}
    );
    
    bowser.AddRadioConstraint("left", "right", "down", "up");
    
    bowser.SetDefaultClipping(
            {Origin:getOrigin(1,0)}
            );
    
    engine.AddObject(bowser);
        
    var cbo = function(){
        var area = {
            x: Anibody.static.Random.GetNumber(20,this.Canvas.width - 20),
            y: Anibody.static.Random.GetNumber(20,this.Canvas.height - 20),
            width:20, height:20
        };
        new Anibody.visual.Spotting(area, 2000).Start();
        
    }.getCallbackObject(engine);
    
    engine.testobj = Anibody.static.Random.SetRandomInterval(cbo, 300, 1300);
    
    window.setTimeout(function(engine){
        engine.testobj.clearInterval();
    }, 10000, engine);
    
    Anibody.import(Anibody.Widget);
    var w = new Widget();
    
    w.ProcessInput = function(){
        
        var keys = this.Engine.Input.Keys;
        var speed = 2;
                
        if(keys.A.FramesPressed > 4 || keys.D.FramesPressed > 4 || keys.W.FramesPressed > 4 || keys.S.FramesPressed > 4){
            bowser.SetFlag("walking", true);
        }else{
            bowser.SetFlag("walking", false);
        }
        
        if(keys.A.FramesPressed > 4){
            bowser.SetFlag("left", true);
            bowser.X -= speed;
        }
        
        if(keys.D.FramesPressed > 4){
            bowser.SetFlag("right", true);
            bowser.X += speed;
        }
        
        if(keys.W.FramesPressed > 4){
            bowser.SetFlag("up", true);
            bowser.Y -= speed;
        }
        
        if(keys.S.FramesPressed > 4){
            bowser.SetFlag("down", true);
            bowser.Y += speed;
        }
        
    };
    w.Register();
    
}

function start_test2(engine){
    
    function Klasse(){
        this.AttrStr = "AttrString";
        this.AttrNum = -42;
        this.AttrFunc = function(){return "quick";};
    }
    
    var obj = {
        zahl : 42,
        object : {
            innerObject : {}
        },
        instance : new Klasse(),
        arr1 : [1000, 2000, {string1: "EinString"}]
    };
        
    var od = new Anibody.debug.ObjectDumb(obj, "testObject");
    od.Download();
}

function testSpline(engine){
    
    var w = engine.Canvas.width;
    var h = engine.Canvas.height;
    var sp = new Spline();
    
    sp.SetColor("red");
    sp.DrawPoints = true;
    
    sp.SetCloseSpline(true);
    
    sp.AddPoint({x:w*0.65, y:h*0.99});
    sp.AddPoint({x:w*0.15, y:h*0.7});
    sp.AddPoint({x:w*0.63, y:h*0.55});
    
    engine.AddObject(sp);
}
