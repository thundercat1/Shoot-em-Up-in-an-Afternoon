
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {
  preload: function() {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('enemy', 'assets/enemy.png', 32, 32);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
  },

  create: function () {
    this.sea = this.add.tileSprite(0, 0, 800, 600, 'sea');

    this.enemy = this.add.sprite(400, 400, 'enemy');
    this.enemy.anchor.setTo(.5, .5);
    this.enemy.animations.add('fly', [0,1,2], 20, true);
    this.enemy.play('fly');
    this.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    this.bullet = this.add.sprite(400, 100, 'bullet');
    this.bullet.anchor.setTo(.5, .5);

    this.physics.enable(this.bullet, Phaser.Physics.ARCADE);
    this.bullet.body.velocity.y = 200;
  },

  update: function () {
    this.sea.y += 0.2;
    this.physics.arcade.overlap(this.bullet, this.enemy, this.enemyHit, null, this);
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
