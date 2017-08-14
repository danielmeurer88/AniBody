/**
 * abstract class
 * represents a terrain on which a game is played
 * holds information about the gaming environment
 * - it is a necessary object for the AniBody-Engine and if the software does not need a
 * game environment than a DefaultTerrain is used
 * @returns {Terrain}
 */
function Terrain() {
    ABO.call(this);
}
Terrain.prototype = Object.create(ABO.prototype);
Terrain.prototype.constructor = Terrain;

/**
 * Represents the game environment and can hold the background image of the map
 * @param {string} img_code - codename of the background image (optional)
 * @returns {DefaultTerrain}
 */
function DefaultTerrain(img_code) {
    Terrain.call(this);
    
    this.Name = "default";
    this.Codename = img_code;

    this.NoImage = false;

    this.Type = "Terrain";
    
    this.Initialize();
}
DefaultTerrain.prototype = Object.create(Terrain.prototype);
DefaultTerrain.prototype.constructor = DefaultTerrain;
/**
 * @see README_DOKU.txt
 */
DefaultTerrain.prototype.Initialize = function () {

    if (this.Codename) {
        this.Image = this.Engine.MediaManager.GetImage(this.Codename);
        this.Width = this.Image.width;
        this.Height = this.Image.height;
    } else {
        this.NoImage = true;
        this.Width = this.Engine.Canvas.width;
        this.Height = this.Engine.Canvas.height;
    }
};
/**
 * @see README_DOKU.txt
 */
DefaultTerrain.prototype.Draw = function (c) {

    if (!this.NoImage) {
        var cam = this.Engine.Camera.SelectedCamera;
        c.drawImage(this.Image, this.X - cam.X, this.Y - cam.Y);
    }
};