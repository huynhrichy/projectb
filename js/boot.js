var bootState = {
    preload: function() {
        game.load.image('progressBar', 'assets/actual/progressBar.png');
    },
    
    create: function() {
        game.stage.backgroundColor = '#2E0854';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.state.start('load');
    }
};