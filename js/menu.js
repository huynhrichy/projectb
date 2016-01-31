var menuState = {
    create: function() {
        //game.add.image(0, 0, 'sky');
        
        var startLabel = game.add.text(game.world.centerX, -50, 'OOGA BOOGA press up to play', 
                                       { font: '25px Arial', fill: '#ffffff'});
        
        game.add.tween(startLabel).to({y: game.world.centerY}, 750).start();
        
        startLabel.anchor.setTo(0.5, 0.5);
        
        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        
        upKey.onDown.addOnce(this.start, this);
    }, 
    
    start: function() {
        game.state.start('play');
    }
};