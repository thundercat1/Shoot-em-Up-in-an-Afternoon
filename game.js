
BasicGame.Game = function (game) {
};

BasicGame.Game.prototype = {
  preload: function() {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('enemy', 'assets/enemy.png', 32, 32);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/player.png', 64, 64);
  },

  create: function () {
    this.sea = this.add.tileSprite(0, 0, 800, 600, 'sea');

    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(100, 'enemy');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);

    this.enemyPool.forEach(function(enemy){
      enemy.animations.add('fly', [0,1,2], 20, true);
    });

    this.nextEnemyAt = 0;
    this.enemyDelay = 1000;


    this.bulletPool = this.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(100, 'bullet');
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    this.nextShotAt = 0;
    this.shotDelay = 100;

    this.explosionPool = this.add.group();
    this.explosionPool.createMultiple(100, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.forEach(function(explosion){
      explosion.animations.add('boom');
    });


    this.player = this.add.sprite(100, 500, 'player');
    this.player.anchor.setTo(.5, .5);
    this.player.animations.add('fly', [0,1,2], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;
    this.player.speed = 250;
    this.player.bulletSpeed = 400;
    this.player.body.setSize(20, 20, 0, -5);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.instructions = this.add.text( 400, 500, 
      'Use Arrow Keys to Move, Press Z to Fire\n' + 
      'Tapping/clicking does both', 
      { font: '20px monospace', fill: '#fff', align: 'center' }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + 10000;
  },

  update: function () {
    if (this.time.now > this.instExpire){
      this.instructions.destroy();
    }

    if (this.enemyPool.countDead() > 0 &&
      this.time.now > this.nextEnemyAt){
      var enemy = this.enemyPool.getFirstExists(false);
      enemy.reset(this.rnd.integerInRange(50, 750), 0);
      enemy.body.velocity.y = this.rnd.integerInRange(10, 90);
      enemy.play('fly');
      this.nextEnemyAt += this.enemyDelay;
    }

    this.sea.tilePosition.y += 0.2;

    this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);

    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    if (!(this.cursors.left.isDown && this.cursors.right.isDown)) {
      if (this.cursors.left.isDown) {
        this.player.body.velocity.x = -this.player.speed;
      } else if (this.cursors.right.isDown) {
        this.player.body.velocity.x = this.player.speed;
      }
    }

    if (!(this.cursors.down.isDown && this.cursors.up.isDown)) {
      if (this.cursors.up.isDown) {
        this.player.body.velocity.y = -this.player.speed;
      } else if (this.cursors.down.isDown) {
        this.player.body.velocity.y = this.player.speed;
      }
    }

    if (this.input.activePointer.isDown && this.physics.arcade.distanceToPointer(this.player) > 15) {
      this.physics.arcade.moveToPointer(this.player, this.player.speed);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.Z) ||
      this.input.activePointer.isDown){
      this.fire();
    }

  },

  fire: function(){
    if (this.nextShotAt > this.time.now || !this.player.alive){
      return;
    }

    if (this.bulletPool.countDead() === 0){
      return;
    }

    var bullet = this.bulletPool.getFirstExists(false);
    bullet.reset(this.player.x, this.player.y - 20);
    bullet.body.velocity.y = -this.player.bulletSpeed;
    this.nextShotAt = this.time.now + this.shotDelay;
  },

  explode: function(sprite){
    if (this.explosionPool.countDead() === 0){
      return;
    }
    var explosion = this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x, sprite.y);
    explosion.play('boom', 15, false, true);
  },

  enemyHit: function(bullet, enemy){
    console.log(enemy.key);
    bullet.kill();
    enemy.kill();
    this.explode(enemy);
  },

  playerHit: function(player, enemy){
    console.log(enemy.key);
    console.log(player.key);
    enemy.kill();
    player.kill();
    this.explode(player);
  },

  render: function() {
    //this.game.debug.body(this.enemy);
    //this.game.debug.body(this.bullet);

  },

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};
