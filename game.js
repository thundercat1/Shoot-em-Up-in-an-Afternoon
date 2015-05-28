
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

    this.enemy = this.add.sprite(400, 400, 'enemy');
    this.enemy.anchor.setTo(.5, .5);
    this.enemy.animations.add('fly', [0,1,2], 20, true);
    this.enemy.play('fly');
    this.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    this.bullets = [];
    this.nextShotAt = 0;
    this.shotDelay = 100;

    this.player = this.add.sprite(100, 500, 'player');
    this.player.anchor.setTo(.5, .5);
    this.player.animations.add('fly', [0,1,2], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;
    this.player.speed = 200;
    this.player.bulletSpeed = 400;

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

    this.sea.y += 0.2;
    for (var i=0; i < this.bullets.length; i++){
      this.physics.arcade.overlap(this.bullets[i], this.enemy, this.enemyHit, null, this);
    }

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
    if (this.nextShotAt > this.time.now){
      return;
    }

    var bullet = this.add.sprite(this.player.x, this.player.y - 20, 'bullet');
    bullet.anchor.setTo(.5, .5);
    this.physics.enable(bullet, Phaser.Physics.ARCADE);
    bullet.body.velocity.y = -this.player.bulletSpeed;
    this.bullets.push(bullet);
    this.nextShotAt = this.time.now + this.shotDelay;

  },

  enemyHit: function(bullet, enemy) {
    console.log('Hit!');
    bullet.kill();
    enemy.kill();

    var explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
    explosion.anchor.setTo(.5, .5);
    explosion.animations.add('explode');
    explosion.play('explode', 15, false, true);

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
