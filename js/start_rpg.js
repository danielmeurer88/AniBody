
function level_rpg(engine){
        
    engine.FlushObjects();
    
    Anibody.importAll(Anibody.static);
    Anibody.import(Anibody.visual.Sprite);
    
    engine.MediaManager.Require("room1", rpg_callback.getCallbackObject(engine, engine));
}

function rpg_callback(engine){
    
    // adding a causality manager
    engine.CausalityManager = new RPGCausalityManager();
    
    // creating a starting terrain
    //var topterr = createTerrain("rpg", "room1", "rpg_img", "rpg_structure", 60);
    var topterr = new RPGTerrain("room1", "rpg_img", "rpg_structure", 60);
    // creating a rpg camera
    this.SetCamera(new RPGCamera());
    // setting the terrain as the active terrain
    this.SetTerrain(topterr);
    
    // creating a sub terrain, which is a child ob the first 
    var subterr = topterr.AddChildTerrain("room2" ,"rpg_subimg", "rpg_substructure", "sub");
    //subterr.SetStandardEntry(3,3);
    
    //OBJECTS
    
    var prarr = {
        player : 10000,
        chest : 6,
        girl : 6,
        actField : 500,
        portal : 500,
        buttonPortalActivator : 500,
        crate : 499,
        pad : 500,
        bonfire : 500
    };
    
    // RPGObject - the treasure chest
    {
        var obj = new RPGObject(RPGObject.prototype.ObjectIDs.chest, 60,70, 1);
        obj.SetStillImages("tresure_closed" ,"tresure_opened");
        obj.SetCurrentField(topterr.GetField(4,2));
        obj.SetInteractabillity("nowhere", "6");

        obj.InteractionFunction = {function:function(who, whom, para, from){
            var obj = this;

            if(!who.Dialog.Active){
                who.Dialog.Reset();
                who.Dialog.AddBasicText("You open a chest and you find...");
                who.Dialog.AddPopupImage("water_glass", 3);
                who.Dialog.AddBasicText("a glass of water. Ehm, well...", "How dissapointing :(");
                who.Dialog.AddPolarQuestion("Do you want to take it with you?", "Sure", "No, thanks");
                who.Dialog.AddInputFunctions(
                            function(obj){
                                this.AddCallbackFunction(function(obj){
                                    obj.Interactable = false;
                                }, this,obj);
                            },

                            function(obj){
                                this.AddBasicText("Alright, maybe you get thirsty later.");
                            },
                            obj
                        );
            }

            who.Dialog.Interact();
        }, that:obj, parameter: false};

        // adding object to the side queue of the specific terrain (top terrain)
        topterr.AddObjectToSideQ(obj,prarr.chest);
        }
    
    // RPGObject - the girl
    {
        var obj2 = new RPGObject(RPGObject.prototype.ObjectIDs.girl,60,70, 1);
        obj2.SetStillImages("girl" ,"girl");
        obj2.SetCurrentField(subterr.GetField(4,1));
        obj2.SetInteractabillity("nowhere", "6");

        obj2.InteractionFunction = {function: function(who, whom, para, from){
            var obj = this;

            // when the interaction functions is called before the dialog displays anything
            // then the dialog is not Active - the right time to add texts, questions and images
            if(!who.Dialog.Active){
                who.Dialog.Reset();
                who.Dialog.AddBasicText("Hi you!","Nice to see you...");
                who.Dialog.AddPolarQuestion("ehm ... Are you okay?", "Yeah", "Nope");
                who.Dialog.AddInputFunctions(
                            function(){
                                this.AddBasicText("Ok, great.","Talk to you soon.");
                            },

                            function(){
                                this.AddBasicText("Maybe an image of a strange racoon will cheer you up.");
                                this.AddPopupImage("da_racoon");
                                this.AddBasicText("It has a moustache... how silly :)");
                            }
                        );
            }

            // interacting in order to progress further
            who.Dialog.Interact();
        }, that:obj2, parameter: false};

        // adding object to the side queue of the specific terrain (top terrain)
        subterr.AddObjectToSideQ(obj2,prarr.girl);
    }
    
    // PLAYER
    {
        // setting up the sprite
        var psprite = new Sprite("rpg_testsprite",0,0,60,70);
        psprite.SetTemplateAttribute("NumberOfClips", 1);
        psprite.AddClippings(
            {Origin:{x:0,y:0},FlagNames:["down","stopped"]},
            {Origin:{x:0,y:70},FlagNames:["up","stopped"]},
            {Origin:{x:0,y:140},FlagNames:["right","stopped"]},
            {Origin:{x:0,y:210},FlagNames:["left","stopped"]}
        );
        psprite.SetTemplateAttribute("NumberOfClips", 2);
        psprite.AddClippings(
            {Origin:{x:60,y:0},FlagNames:["down","walking"]},
            {Origin:{x:60,y:70},FlagNames:["up","walking"]}, 
            {Origin:{x:60,y:140},FlagNames:["right","walking"]}, 
            {Origin:{x:60,y:210},FlagNames:["left","walking"]} 
        );

        psprite.AddOppositeConstraint("walking", "stopped");
        psprite.AddRadioConstraint("left", "right", "down", "up");
        
        var player = new RPGPlayer(60, 70, psprite);
        var start = engine.Terrain.GetField(4,3);
        player.SetCurrentField(start);
        engine.Objects.SelectedObject = player;
        
        // adding the player to the overall object loop because it is used on all terrains at all times
        engine.AddObject(player, prarr.player);
    }
    
    
    
    // Portal --
    {
        var pts = new RPGPortal(topterr, 9, 8, subterr, 1, 2);
        pts.Deactivate();
        // !!!!!!!!!!!!!!!!!!!!!! needs to be in the sideQ of both terrains (from and to terrain)
        topterr.AddObjectToSideQ(pts, prarr.portal); 
        subterr.AddObjectToSideQ(pts, prarr.portal);
    }
    
    // ActivationField
    {
        var acF = new RPGActivationField(false, pts);
        acF.SetActivator(player);
        acF.SetRange(engine.Terrain.GetField(1,4), 2, 2);
        acF.ActivationFunction = function(portal){
            console.log("You are in the Zone");
            
            var area = portal.FromField.GetArea(0);
            var s = new Anibody.visual.Spotting(area, 1000);
            s.Start();
            
            portal.Activate();
        };
        topterr.AddObjectToSideQ(acF, prarr.actField);
    }
    
    
    // Crate
    {
        var crate = new RPGObject(RPGObject.prototype.ObjectIDs.crate, 60,70, 1);
        crate.SetStillImages( "crate", "crate");
        crate.SetCurrentField(subterr.GetField(15,3));
        crate.SetUpdateFunction(function(target){

            // checks every frame if the current field of the crate object is the same as the target field
            if(!this.Interacted && this.CurrentField.ID.X == target.ID.X && this.CurrentField.ID.Y == target.ID.Y){
                this.Pushable = false;
                this.Interacted = true;
                //
                new Anibody.ui.Alert("target reached").Start();
            }
        }, subterr.GetField(20,3));
        subterr.AddObjectToSideQ(crate, prarr.crate);
    }
    
    // pad - rpg image object
    {
        var pad = new RPGImageObject("pad", subterr.GetField(20,3));
        subterr.AddObjectToSideQ(pad, prarr.pad);
    }
    
    // bon fire object
    {
        var bonfire = new RPGObject(RPGObject.prototype.ObjectIDs.bonfire, 60, 70, 1);
        bonfire.Pushable = false;
        bonfire.PushFailFunction = {function:function(){}, that: engine, parameter: bonfire};
        bonfire.ActivateSprite();
        
        var sp = new Sprite("bonfire",0,0,60,70);

        sp.AddClippings(
            {Origin:{x:0,y:0}, NumberOfClips:3,FPS:3, FlagNames:["on"]},
            {Origin:{x:180,y:0}, NumberOfClips:1, FlagNames:["off"]}
        );
        sp.AddOppositeConstraint("on", "off");
        sp.SetFlag("on", true);

        bonfire.Sprite = sp;
        
        bonfire.SetCurrentField(topterr.GetField(3,3));
        
        topterr.AddObjectToSideQ(bonfire, prarr.bonfire);
    }
    
    // adding some items to the player
    {
        // TEST Items {

        var tools = player.ItemBag.AddChildItemBag("Toolbox");

        var apple = new ConsumableItem(RPGItem.prototype.ItemIDs.apple, "Apple", 2);
        var water = new ConsumableItem(RPGItem.prototype.ItemIDs.water, "Gl. Water", 1);
        var banana = new ConsumableItem(RPGItem.prototype.ItemIDs.banana, "Banana", 10);
        var chocolate = new ConsumableItem(RPGItem.prototype.ItemIDs.chocolate, "Chocolate", 2);

        player.ItemBag.AddItems(apple, water, banana, chocolate);

        // testing - water does not belong to the tools item bag
        tools.AddItem(water);

        var lighter = new RPGItem(RPGItem.prototype.ItemIDs.lighter, "Lighter", 0);
        tools.AddItem(lighter);
        //  } Test Items
    }
    
    // adding causalities:
    // engine.CausalityManager.AddCauser(item)
    // engine.CausalityManager.AddCausality(itemid, sub, causality, label)
    {
        // Basically saying that all water items have the effect, specificed in the function
        // on all bonfires and we call this causality "water_on_bonfire"
        engine.CausalityManager.AddCausality(water.ItemID, bonfire.ObjectID, function(a,b,c){
            // this = the Engine
            // a = ItemID (of the Gl. water)
            // b = RPGObject (the actual bonfire,infront of which the player stands
            // c = the label
            //var siz = this.Engine.MediaManager.GetSound("fire_sizzle");
            b.Sprite.SetFlag("off", true);
//            if(siz)
//                siz.play();
        });
        
        engine.CausalityManager.AddCausality(lighter.ItemID, bonfire.ObjectID,
            function(itemid, object){
                object.ActivateSprite();
//                var lighting = this.MediaManager.GetSound("lighter");
//                if(lighting)
//                    lighting.play();
            }
        );
    }
        
}