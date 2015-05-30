
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
    this.setupBackground();
    this.setupPlayer();
    this.setupPlayerIcons();
    this.setupEnemies();
    this.setupBullets();
    this.setupExplosions();
    this.setupText();

    this.cursors = this.input.keyboard.createCursorKeys();
  },

  setupBackground: function(){
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
  },

  setupPlayer: function(){
    this.player = this.add.sprite(this.game.width/2, this.game.height-50, 'player');
    this.player.anchor.setTo(.5, .5);
    this.player.animations.add('fly', [0,1,2], 20, true);
    this.player.animations.add('ghost', [0,3,2,3], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;
    this.player.speed = BasicGame.PLAYER_SPEED;
    this.player.body.setSize(20, 20, 0, -5);
  },

  setupPlayerIcons: function(){
    this.lives = this.add.group();
    var firstLifeIconX = this.game.width - 10 - (BasicGame.PLAYER_EXTRA_LIVES * 30);
    for (var i = 0; i < BasicGame.PLAYER_EXTRA_LIVES; i++){
      var life = this.lives.create(firstLifeIconX - (i*30), 30, 'player');
      life.scale.setTo(0.5, 0.5);
      life.anchor.setTo(0.5, 0.5);
    }
  },

  setupEnemies: function(){
    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(100, 'enemy');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    this.enemyPool.setAll('reward', BasicGame.ENEMY_REWARD, false, false, 0, true)

    this.enemyPool.forEach(function(enemy){
      enemy.animations.add('fly', [0,1,2], 20, true);
      enemy.animations.add('hit', [3,1,3,2], 20, false);
      enemy.events.onAnimationComplete.add(function(e){
        e.play('fly');
      }, this);
    });

    this.nextEnemyAt = 0;
    this.enemyDelay = 1000;
  },

  setupBullets: function(){
    this.bulletPool = this.add.group(); this.bulletPool.enableBody = true; this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(100, 'bullet');
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    this.nextShotAt = 0;
    this.shotDelay = BasicGame.SHOT_DELAY;
  },

  setupExplosions: function(){
    this.explosionPool = this.add.group();
    this.explosionPool.createMultiple(100, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.forEach(function(explosion){
      explosion.animations.add('boom');
    });
  },

  setupText: function(){
    this.instructions = this.add.text(this.game.width / 2, this.game.height - 100, 
      'Use Arrow Keys to Move, Press Z to Fire\n' + 
      'Tapping/clicking does both', 
      { font: '20px monospace', fill: '#fff', align: 'center' }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + BasicGame.INSTRUCTION_EXPIRE;

    this.score = 0;
    this.scoreText = this.add.text(this.game.width/2, 20, this.score, 
      {font: '20px monospace', fill: '#fff', align: 'left'});
  },

  displayEnd: function(win){
    if (this.endDisplay && this.endDisplay.exists){
      return;
    }
    console.log('Displaying end for ' + win);
    var msg = win ? 'You Win!' : 'You Lose...';
    console.log(msg);
    this.endDisplay = this.add.text(this.game.width / 2, this.game.height / 2, msg, 
      {font: '80px monospace', fill: '#fff', align: 'center'});

    this.endDisplay.anchor.setTo(0.5, 0.5);
  },


  update: function () {
     this.checkCollisions();
     this.spawnEnemies();
     this.processPlayerInput();
     this.processDelayedEffects();
  },

  checkCollisions: function(){
    this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);
  },

  spawnEnemies: function(){
    if (this.enemyPool.countDead() > 0 &&
      this.time.now > this.nextEnemyAt){
      var enemy = this.enemyPool.getFirstExists(false);
      enemy.reset(this.rnd.integerInRange(50, this.game.width-50), 0, BasicGame.ENEMY_HEALTH);
      enemy.body.velocity.y = this.rnd.integerInRange(
        BasicGame.ENEMY_MIN_Y_VELOCITY, BasicGame.ENEMY_MAX_Y_VELOCITY);
      enemy.play('fly');
      this.nextEnemyAt = this.time.now + BasicGame.SPAWN_ENEMY_DELAY;
    }
  },

  processPlayerInput: function(){
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
      if (this.endDisplay && this.endDisplay.exists){
        this.quit();
      } else {
        this.fire();
      }
    }

  },

  quit: function(){
    this.sea.destroy();
    this.player.destroy();
    this.enemyPool.destroy();
    this.bulletPool.destroy();
    this.explosionPool.destroy();
    this.instructions.destroy();
    this.scoreText.destroy();
    this.endDisplay.destroy();
    //this.returnText.destroy();
    //  Then let's go back to the main menu.
    this.state.start('MainMenu');
  },

  processDelayedEffects: function(){
    if (this.time.now > this.instExpire){
      this.instructions.destroy();
    }

    if (this.time.now > this.ghostUntil){
      this.player.play('fly');
      this.ghostUntil = null;
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
    bullet.body.velocity.y = -BasicGame.BULLET_VELOCITY;
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
    this.damageEnemy(enemy, BasicGame.BULLET_DAMAGE);
  },

  damageEnemy: function(enemy, damage){
    enemy.damage(damage);
    if (enemy.alive){
      enemy.play('hit');
    } else {
      this.explode(enemy);
      this.addToScore(enemy.reward);
      if (this.score > 2000){
        this.displayEnd(true);
      }
    }
  },

  addToScore: function(reward){
    this.score += reward;
    this.scoreText.text = this.score;
  },

  playerHit: function(player, enemy){
    if (this.ghostUntil && this.ghostUntil > this.time.now){
      return;
    }
    this.damageEnemy(enemy, BasicGame.CRASH_DAMAGE);
    var life = this.lives.getFirstAlive();
    if (life !== null){
      life.kill();
      this.ghostUntil = this.time.now + BasicGame.PLAYER_GHOST_TIME;
      player.play('ghost');
    } else {
      player.kill();
      this.explode(player);
      this.displayEnd(false);
    }
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
