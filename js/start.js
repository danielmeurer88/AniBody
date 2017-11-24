
$(document).ready(function () {

    var engine = new Anibody("PlayDiv");
    
    Anibody.import(Anibody.util.Picture);

    var waterglass = new Picture({path: "./img_rpg/water_glass.jpg", codename: "water_glass", group:"room3"});
    waterglass.AddGroup("room1");

    var mediapack = [
        new Picture("./img_rpg/logo.png", "logo"),
        new Picture("./img_rpg/button_0.png", "button_state_0"),
        new Picture("./img_rpg/button_1.png", "button_state_1"),
        new Picture("./img_rpg/button_2.png", "button_state_2"),
        new Picture({path: "./img_rpg/rpg_img2.png", codename: "rpg_img", group: ["room1", "beginning"]}),
        new Picture({path: "./img_rpg/rpg_structure2.png", codename: "rpg_structure"}),
        new Picture({path: "./img_rpg/rpg_subimg2.jpg", codename: "rpg_subimg", group:"room2"}),
        new Picture({path: "./img_rpg/rpg_substructure.png", codename: "rpg_substructure"}),
        new Picture({path: "./img_rpg/grey_sprite_3x4.png", codename: "rpg_testsprite" }),
        new Picture({path: "./img_rpg/tresure_closed.png", codename: "tresure_closed"}),
        new Picture({path: "./img_rpg/tresure_opened.png", codename: "tresure_opened"}),
        new Picture({path: "./img_rpg/girl.png", codename: "girl", group:"room2"}),
        new Picture({path: "./img_rpg/da_racoon.jpg", codename: "da_racoon", group:"room2"}),
        new Picture({path: "./img_rpg/crate.png", codename: "crate", group:"room2"}),
        new Picture({path: "./img_rpg/crate_pad.png", codename: "pad", group:"room2"}),
        new Picture({path: "./img_rpg/fire_sprite.png", codename: "bonfire", group:"room1"}),
        new Picture({path: "./img_rpg/fire_out.png", codename: "bonfire_out", group:"room1"}),
        waterglass,
        new Picture({path: "./img_rpg/litte_click_sprite.png", codename: "little_click_sprite", group:"room1"}),
        new Anibody.util.Sound({path: "./music/portal_activate.mp3", codename: "portal_activate", group:"room1"}),
        new Anibody.util.Sound({path: "./music/alongway.mp3", codename: "girl_background", group:"room2"})
    ];
    
    engine.MediaManager.SetMediaPack(  mediapack, menu_callback.getCallbackObject(engine,engine));

    
});

function menu_callback(engine){
    
    // ------------------------------------------------ adding objects to the engine
    /* BUTTON RPG */
    
    Anibody.import(Anibody.ui.Button);

    var b1 = new Button({
        X:"center", Y: 120, Width:250, Height:60,
        DisplayType : "image",
        Codename : ["button_state_0", "button_state_1", "button_state_2"],
        Label : "Start",
        TextColor: "white", FontHeight: 18,
        TriggerCallbackObject : function (engine) {
                level_rpg(engine);
            }.getCallbackObject(engine, engine),
        HoverText : "Startet das Spiel"
    });
    b1.AddButtonEffect();
    engine.AddObject(b1, 2);

    // input Area
    Anibody.import(Anibody.ui.InputField);
    var ia = new InputField(10, 10, 300);
    engine.AddObject(ia);

    /* BUTTON HELP */
    var b2 = new Button({
        X:"center", Y: 220, Width:250, Height:60,
        DisplayType : "image",
        Codename : ["button_state_0", "button_state_1", "button_state_2"],
        Label : "Test Button",
        TextColor: "white", FontHeight: 18,
        TriggerCallbackObject : function (engine) {
                start_test(engine);
            }.getCallbackObject(engine, engine),
        HoverText : "Startet das Spiel"
    });
    b2.AddButtonEffect();
    
    engine.AddObject(b2, 1);
        
    engine.Start();

    $("#fs_btn").click(function(){
           engine.RequestFullscreen();

           var f = function(en){
                en.ExitFullscreen();
           };

           window.setTimeout(f, 3000, engine);

    });
    
    //testSpline(engine);
    
    var w = new Anibody.classes.Widget();
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
    
    var cbo = function(){
        new Anibody.ui.Alert("... ein CBO am Ende des Testens.").Start();
    }.getCallbackObject(engine);
    
    Anibody.import(Anibody.visual.ABText);
    var x = 50;
    var y = 300;
    var t1 = new ABText("Test 1", x, y);
    t1.Color = "red";
    var t2 = new ABText("Test 22", x + 50, y + 50);
    t2.Underline = true;
    t2.FlowMove(x + 220, y + 200, 2500);
    var t3 = new ABText("xx333xx Test", x + 110, y + 100);
    t3.FlowResize(45, 2000);
    t3.Color = "rgba(0,0,255,0.5)";
    
    engine.AddObject(t1);
    engine.AddObject(t2);
    engine.AddObject(t3);
    
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
