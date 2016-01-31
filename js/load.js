var loadState = {
    preload: function() {
        var progressBar = game.add.sprite(game.world.centerX, game.world.centerY, 'progressBar');
        
        // Center the anchor so it shows up in the middle of the screen
        progressBar.anchor.setTo(0.5, 0.5);
        
        // Shows a loading bar as game preloading happens
        game.load.setPreloadSprite(progressBar);

        game.load.image('playertile', 'assets/playertile.png');
        game.load.image('enemytile', 'assets/enemytile.png');
        game.load.image('enemytile2', 'assets/enemytile2.png');
        game.load.image('tileset', 'assets/tilesetcolours.png');
        game.load.image('wintile', 'assets/wintile.png');
        game.load.audio('beat', 'assets/beat.wav');

        game.load.image('fire2', 'assets/actual/fire2.png');
        game.load.image('sky', 'assets/actual/sky.png');
        game.load.image('earth', 'assets/actual/earth.png');
        
        game.load.image('discoball1', 'assets/actual/disco-ball.png');
        game.load.image('discoball2', 'assets/actual/disco-ball2.png');
        
        game.load.audio('win', 'assets/actual/win.ogg');
        game.load.audio('die', 'assets/actual/die.wav');
        game.load.audio('jump', 'assets/actual/jump.ogg');

        game.load.tilemap('tilemap', 'assets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);

        game.load.spritesheet('player', 'assets/actual/player-walking.png', 43, 64);
        game.load.spritesheet('enemy', 'assets/actual/pear-dancing-monster.png', 105, 128);
        game.load.spritesheet('enemy2', 'assets/actual/pear-flyer-dancing-monster.png', 105, 128);
        game.load.spritesheet('fire', 'assets/actual/wood-fire.png', 51, 64);
    },
    
    create: function() {
        game.state.start('menu');
    }
};