var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});

var player, enemies, fires, objective, tilemap, backgroundLayer, worldLayer, objectLayer, cursors, music;

function preload() {
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
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    cursors = game.input.keyboard.createCursorKeys();
    
    startNewGame();
}

function update() {
    handleCollision();
    movePlayer();
    moveEnemies();
}

function startNewGame() {
    
    music = game.add.audio('beat');
    music.loop = true;
    
    createWorld();
    
    resetGame();
    
    game.time.events.loop(469, changeGameWithMusic, this);
    game.time.events.loop(469 * 4, changeGameWithMusicLongerInterval, this);
}

function resetGame() {
    music.play();
    
    game.time.events.resume();
    createWorld();
    createObjective();
    createEnemies();
    createFires();
    createPlayer();
}

function createWorld() {
    tilemap = game.add.tilemap('tilemap');
    tilemap.addTilesetImage('tilesetcolours', 'tileset');
    
    backgroundLayer = tilemap.createLayer('backgroundLayer');
    worldLayer = tilemap.createLayer('worldLayer');
    
    tilemap.setCollision(2, true, 'worldLayer');
    
    backgroundLayer.resizeWorld();
}

function createFires() {
    fires = game.add.group();
    fires.enableBody = true;
    objects = findObjectsByType('fire', tilemap, 'objectLayer');
    objects.forEach(function(element) {
        createFromTiledObject(element, fires);
    });
}

function createObjective() {
    objects = findObjectsByType('objective', tilemap, 'objectLayer');
    objective = game.add.sprite(objects[0].x, objects[0].y, 'wintile');
    game.physics.arcade.enable(objective);
}

function createPlayer() {
    objects = findObjectsByType('player', tilemap, 'objectLayer');
    player = game.add.sprite(objects[0].x, objects[0].y, 'player', 3);
    player.animations.add('right', [0, 1, 2, 3], 10, true);
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.body.gravity.y = 300;
    player.body.bounce.y = 0.1;
    player.scale.setTo(0.75, 0.75);
    game.camera.follow(player);
}

function createEnemies() {
    enemies = game.add.group();
    enemies.enableBody = true;
    
    objects = findObjectsByType('enemy', tilemap, 'objectLayer');
    
    objects.forEach(function(element) {
        createFromTiledObject(element, enemies);
    });
    
    enemies.forEachAlive(function(enemy) {
        enemy.body.velocity.x = 0;
        console.log('ayy');
        if (enemy.subType === 'grounded') {
            enemy.body.gravity.y = 200;
            enemy.forwardSpeed = game.rnd.integerInRange(200, 300);
            
            //console.log('ayy');
            //console.log('grounded enemy frame: ' + enemy.frame);
        } else if (enemy.subType === 'flying') {
            enemy.speed = game.rnd.integerInRange(200, 300);
            enemy.body.velocity.x = -enemy.speed;
            enemy.body.velocity.y = game.rnd.integerInRange(200, 300);
            enemy.scale.x *= -1;
        }
        enemy.animations.add('right', [0, 1, 2, 3], 10, true);
    }, this);
    
    enemies.setAll('body.bounce.x', 0.2);
    enemies.setAll('body.bounce.y', 0.2);
    enemies.setAll('body.collideWorldBounds', true);
}

function handleCollision() {
    game.physics.arcade.collide(player, worldLayer);
    game.physics.arcade.collide(enemies, worldLayer);
    game.physics.arcade.overlap(player, objective, winGame);
    game.physics.arcade.overlap(player, enemies, killPlayer);
    game.physics.arcade.overlap(player, fires, killPlayer);
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
    var speed = 100, slowDown = 10, maxSpeed = 300, jumpHeight = 325;
    
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
    }
}

function killPlayer() {
    stopGame();
    resetGame();
}

function winGame() {
    stopGame();
    resetGame();
}

function stopGame() {
    music.stop();
    game.time.events.pause();
    player.destroy();
    enemies.destroy();
    objective.destroy();
    fires.destroy();
    tilemap.destroy();
    backgroundLayer.destroy();
    worldLayer.destroy();
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

function createFromTiledObject(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);
    
    Object.keys(element.properties).forEach(function(key) {
        sprite[key] = element.properties[key];
    });
}

function scaleGame() {
    
}

function changeGameWithMusic() {
    changeWorldWithMusic();
    changeEnemyWithMusic2();
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
}

// Animates enemies. Called on update
function animateEnemies() {
    
}

// If enemy is grounded, change direction between forward and back
// If flying, change direction between up and down
function changeEnemyWithMusic2() {
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

function resetPositions() {
    //play
}

function changeEnemyWithMusic1() {
    var jumpHeight = 90;
    enemies.forEachAlive(function(enemy) {
        if (enemy.facingLeft === true) {
            enemy.loadTexture('enemytile');
            enemy.facingLeft = false;
        } else if (enemy.facingLeft === false) {
            enemy.loadTexture('enemytile2');
            enemy.facingLeft = true;
            if (enemy.body.onFloor()) {
                enemy.body.velocity.y = -jumpHeight;
            }
        }
    }, this);
}