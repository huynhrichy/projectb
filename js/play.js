//var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update, render: render});

var player, enemies, fires, objective, tilemap, backgroundLayer, worldLayer, objectLayer, cursors, music, discoball, discoBallFrame, jumpSound, dieSound, winSound;

var playState = {
    preload: function() {
    /*
        game.load.image('playertile', 'assets/playertile.png');
        game.load.image('enemytile', 'assets/enemytile.png');
        game.load.image('enemytile2', 'assets/enemytile2.png');
        game.load.image('tileset', 'assets/tilesetcolours.png');
        game.load.image('wintile', 'assets/wintile.png');
        game.load.audio('beat', 'assets/beat.wav');

        game.load.image('fire', 'assets/actual/fire2.png');

        game.load.tilemap('tilemap', 'assets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);

        game.load.spritesheet('player', 'assets/actual/player-walking.png', 43, 64);
        game.load.spritesheet('enemy', 'assets/actual/pear-dancing-monster.png', 105, 128);
        game.load.spritesheet('enemy2', 'assets/actual/pear-flyer-dancing-monster.png', 105, 128);
        */
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        cursors = game.input.keyboard.createCursorKeys();

        startNewGame();
    },

    update: function() {
        handleCollision();
        movePlayer();
        moveEnemies();
    },

    render: function() {
        //game.debug.body(player);
        enemies.forEach(function(enemy) {
            //game.debug.body(enemy);
        });
        fires.forEach(function(fire) {
            //game.debug.body(fire);
        });
    }
};


function startNewGame() {

    music = game.add.audio('beat');
    music.loop = true;
    winSound = game.add.audio('win');
    jumpSound = game.add.audio('jump');
    dieSound = game.add.audio('die');

    this.createWorld();

    this.resetGame();

    game.time.events.loop(469, this.changeGameWithMusic, this);
    game.time.events.loop(469 * 4, this.changeGameWithMusicLongerInterval, this);
}

function resetGame() {
    music.play();

    game.time.events.resume();
    this.createWorld();
    this.createFires();
    this.createObjective();
    this.createEnemies();
    this.createPlayer();
}

function createWorld() {
    tilemap = game.add.tilemap('tilemap');
    tilemap.addTilesetImage('tilesetcolours', 'tileset');
    tilemap.addTilesetImage('sky', 'sky');
    tilemap.addTilesetImage('earth', 'earth');

    backgroundLayer = tilemap.createLayer('backgroundLayer');
    worldLayer = tilemap.createLayer('worldLayer');

    tilemap.setCollision(2, true, 'worldLayer');

    backgroundLayer.resizeWorld();
    
    // disco ball
    discoball = game.add.image(400, 0, 'discoball1');
    discoBallFrame = 1;
    discoball.fixedToCamera = true;
    discoball.scale.setTo(0.67, 0.67);
}

function createFires() {
    fires = game.add.group();
    fires.enableBody = true;
    objects = this.findObjectsByType('fire', tilemap, 'objectLayer');
    objects.forEach(function(element) {
        this.createFromTiledObject(element, fires);
    });

    fires.forEach(function(fire) {
        // Normally 64 x 64
        fire.body.setSize(64 * .5, 64 * .75, 10, 18);
        fire.animations.add('fire', [0, 1, 2, 3], 8, true);
        fire.animations.play('fire');
    });
    

}

function createObjective() {
    objects = this.findObjectsByType('objective', tilemap, 'objectLayer');
    objective = game.add.sprite(objects[0].x, objects[0].y, 'wintile');
    game.physics.arcade.enable(objective);
}

function createPlayer() {
    objects = this.findObjectsByType('player', tilemap, 'objectLayer');
    player = game.add.sprite(objects[0].x, objects[0].y, 'player', 3);
    player.animations.add('right', [0, 1, 2, 3], 10, true);
    game.physics.arcade.enable(player);

    // Normally 43 x 64
    player.body.setSize(43 * 0.67, 64 * 0.75, -2, -5);

    player.anchor.setTo(.5, 1);

    player.body.collideWorldBounds = true;
    player.body.gravity.y = 300;
    player.body.bounce.y = 0.1;
    player.scale.setTo(0.75, 0.75);
    game.camera.follow(player);
}

function createEnemies() {
    enemies = game.add.group();
    enemies.enableBody = true;

    objects = this.findObjectsByType('enemy', tilemap, 'objectLayer');

    objects.forEach(function(element) {
        this.createFromTiledObject(element, enemies);
    });

    enemies.forEach(function(enemy) {
        if (enemy.subType === 'grounded') {
            // Normally 105 x 64
            enemy.body.setSize(64 * .75, 105, 0, 0);
        } else if (enemy.subType ==='flying') {
            enemy.body.setSize(64 * .75, 105, 0, 0);
        }
        enemy.anchor.setTo(.5, 1);
    });


    enemies.forEachAlive(function(enemy) {
        enemy.body.velocity.x = 0;
        if (enemy.subType === 'grounded') {
            enemy.body.gravity.y = 200;
            enemy.forwardSpeed = game.rnd.integerInRange(200, 300);

            //console.log('ayy');
            //console.log('grounded enemy frame: ' + enemy.frame);
            //enemy.scale.x *= -1;
        } else if (enemy.subType === 'flying') {
            enemy.speed = game.rnd.integerInRange(200, 300);
            enemy.body.velocity.x = -enemy.speed;
            enemy.body.velocity.y = game.rnd.integerInRange(300, 500);
            enemy.scale.x *= -1;
        }
        enemy.animations.add('right', [0, 1, 2, 3], 4, true);
    }, this);

    enemies.setAll('body.bounce.x', 0.2);
    enemies.setAll('body.bounce.y', 0.2);
    enemies.setAll('body.collideWorldBounds', true);
}

function handleCollision() {
    game.physics.arcade.collide(player, worldLayer);
    game.physics.arcade.collide(enemies, worldLayer);
    game.physics.arcade.overlap(player, objective, this.winGame);
    //game.physics.arcade.overlap(player, enemies, this.killPlayer);
    game.physics.arcade.overlap(player, fires, this.killPlayer);
}

function moveEnemies() {
    enemies.forEachAlive(function(enemy) {
        if (enemy.subType === 'grounded') {
            var speed;

            if (player.x < enemy.x) {
                if (enemy.goingForward) {
                    if (enemy.scale.x >= 0) {
                        enemy.scale.x *= -1;
                    }
                    speed = -enemy.forwardSpeed;
                } else {
                    if (enemy.scale.x < 0) {
                        enemy.scale.x *= -1;
                    }
                    speed = enemy.forwardSpeed / 2;
                }
            } else if (player.x > enemy.x) {
                if (enemy.goingForward) {
                    if (enemy.scale.x < 0) {
                        enemy.scale.x *= -1;
                    }
                    speed = enemy.forwardSpeed / 2;
                } else {
                    if (enemy.scale.x >= 0) {
                        enemy.scale.x *= -1;
                    }
                    speed = -enemy.forwardSpeed / 4;
                }
            }
            enemy.animations.play('right');

            enemy.body.velocity.x = speed;
        } else if (enemy.subType === 'flying') {
            var speed = enemy.body.velocity.x;

            if (enemy.x == 0) {
                enemy.scale.x *= -1;
                speed = enemy.speed;
            } 

            if (enemy.x == game.world.width - enemy.width) {
                enemy.scale.x *= -1;
                speed = -enemy.speed;
            }

            enemy.animations.play('right');

            enemy.body.velocity.x = speed;
        }
    }, this);
}

function movePlayer() {
    var speed = 100, slowDown = 10, maxSpeed = 300, jumpHeight = 300;

    if (cursors.left.isDown) {
        if (player.scale.x >= 0) {
            player.scale.x *= -1;
        }
        player.animations.play('right');
        if (player.body.velocity.x > 0) {
            player.body.velocity.x -= slowDown;
        }
        if (player.body.velocity.x > -maxSpeed) {
            player.body.velocity.x -= speed;
        }
    } else if (cursors.right.isDown) {
        if (player.scale.x < 0) {
            player.scale.x *= -1;
        }
        player.animations.play('right');
        if (player.body.velocity.x < 0) {
            player.body.velocity.x += slowDown;
        }
        if (player.body.velocity.x < maxSpeed) {
            player.body.velocity.x += speed;
        }
    } else {
        player.frame = 3;
        if (player.body.velocity.x < 0) {
        player.body.velocity.x += slowDown;
        } else if (player.body.velocity.x > 0) {
            player.body.velocity.x -= slowDown;
        }
    }

    if (cursors.up.isDown && player.body.onFloor()) {
        player.body.velocity.y -= jumpHeight;
        jumpSound.play();
    }
}

function killPlayer() {
    dieSound.play();
    stopGame();
    resetGame();
}

function winGame() {
    winSound.play();
    music.stop();
    game.time.events.pause();
    tilemap.destroy();
    backgroundLayer.destroy();
    //resetGame();
    game.state.start('menu');
    //stopGame();
}

function stopGame() {
    music.stop();
    game.time.events.pause();
    player.destroy();
    enemies.destroy();
    discoball.destroy();
    objective.destroy();
    fires.destroy();
    tilemap.destroy();
    backgroundLayer.destroy();
    worldLayer.destroy();
}

function createFromTiledObject(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

    Object.keys(element.properties).forEach(function(key) {
        sprite[key] = element.properties[key];
    });
}

function findObjectsByType(type, map, layer) {
    var objects = [];

    map.objects[layer].forEach(function(element) {
        if (element.properties.type === type) {
            element.y -= map.tileHeight;
            objects.push(element);
        }
    });

    return objects;
}

function changeGameWithMusic() {
    changeWorldWithMusic();
    changeEnemyWithMusic();
}

function changeGameWithMusicLongerInterval() {
    changeEnemyWithMusicLongerInterval();
}

function changeEnemyWithMusicLongerInterval() {
    enemies.forEachAlive(function(enemy) {
        if (enemy.subType === 'grounded') {
            //enemy.body.velocity.y = -50;
        } else if (enemy.subType === 'flying') {

        }
    }, this);
}

// Alternate art on every beat or so
function changeWorldWithMusic() {
    if (discoBallFrame === 1) {
        discoball.loadTexture('discoball2');
        discoBallFrame = 2;
    } else {
        discoball.loadTexture('discoball1');
        discoBallFrame = 1;
    }
}

// Animates enemies. Called on update
function animateEnemies() {

}

// If enemy is grounded, change direction between forward and back
// If flying, change direction between up and down
function changeEnemyWithMusic() {
    enemies.forEachAlive(function(enemy) {
        if (enemy.subType === 'grounded' && enemy.body.onFloor()) {
            enemy.goingForward = !enemy.goingForward;
        } else if (enemy.subType === 'flying') {
            if (enemy.body.velocity.y >= 0) {
                enemy.body.velocity.y = -enemy.body.velocity.y;
            } else {
                enemy.body.velocity.y = -enemy.body.velocity.y;
            }
        }
    }, this);
}