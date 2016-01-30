var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});

var player, enemies, enemySpeed, tilemap, backgroundLayer, worldLayer, objectLayer, cursors;

function preload() {
    game.load.image('playertile', 'assets/playertile.png');
    game.load.image('enemytile', 'assets/enemytile.png');
    game.load.image('tileset', 'assets/tilesetcolours.png');
    game.load.tilemap('tilemap', 'assets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
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
    createWorld();
    createEnemies();
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

function createPlayer() {
    objects = findObjectsByType('playerStart', tilemap, 'objectLayer');
    player = game.add.sprite(objects[0].x, objects[0].y, 'playertile');
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
    
    enemies.setAll('body.gravity.y', 200);
    enemies.setAll('body.bounce.y', 0.2);
    enemies.setAll('facingRight', false);
    enemies.setAll('body.collideWorldBounds', true);
    enemySpeed = 175;
}

function handleCollision() {
    game.physics.arcade.collide(player, worldLayer);
    game.physics.arcade.collide(enemies, worldLayer);
    game.physics.arcade.collide(enemies);
    game.physics.arcade.overlap(player, enemies, killPlayer);
}

function moveEnemies() {
    enemies.forEachAlive(function(enemy) {
        var speed = enemy.body.velocity.x;
        
        if (enemy.body.onWall() || enemy.body.touching.left || enemy.body.touching.right) {
            enemy.facingRight = !enemy.facingRight;
        }
        
        if (enemy.facingRight) {
            speed = enemySpeed;
        } else {
            speed = -enemySpeed;
        }
        
        enemy.body.velocity.x = speed;
        
    }, this);
}

function movePlayer() {
    var speed = 10, slowDown = 10, maxSpeed = 250, jumpHeight = 450;
    
    if (cursors.left.isDown) {
        if (player.body.velocity.x > 0) {
            player.body.velocity.x -= slowDown;
        }
        if (player.body.velocity.x > -maxSpeed) {
            player.body.velocity.x -= speed;
        }
    } else if (cursors.right.isDown) {
        if (player.body.velocity.x < 0) {
            player.body.velocity.x += slowDown;
        }
        if (player.body.velocity.x < maxSpeed) {
            player.body.velocity.x += speed;
        }
    } else {
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
    player.destroy();
    enemies.destroy();
    startNewGame();
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