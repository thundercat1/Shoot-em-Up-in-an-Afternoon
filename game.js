
BasicGame.Game = function (game) {
};

BasicGame.Game.prototype = {
  preload: function() {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('enemy', 'assets/enemy.png', 32, 32);
    this.load.spritesheet('shooter', 'assets/shooting-enemy.png', 32, 32);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/player.png', 64, 64);
    this.load.image('titlepage', 'assets/titlepage.png');
    this.load.image('powerup1', 'assets/powerup1.png');
  },

  create: function () {
    this.setupBackground();
    this.setupPlayer();
    this.setupPlayerIcons();
    this.setupEnemies();
    this.setupBullets();
    this.setupExplosions();
    this.setupPowerUps();
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
    this.weaponLevel = 0;
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
    this.enemyDelay = BasicGame.SPAWN_ENEMY_DELAY;
    this.shooterDelay = BasicGame.SPAWN_SHOOTER_DELAY;

    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(100, 'enemy');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    this.enemyPool.setAll('reward', BasicGame.ENEMY_REWARD, false, false, 0, true)
    this.enemyPool.setAll('dropRate', BasicGame.ENEMY_DROP_RATE, false, false, 0, true);

    this.enemyPool.forEach(function(enemy){
      enemy.animations.add('fly', [0,1,2], 20, true);
      enemy.animations.add('hit', [3,1,3,2], 20, false);
      enemy.events.onAnimationComplete.add(function(e){
        e.play('fly');
      }, this);
    });

    this.nextEnemyAt = 0;

    this.shooterPool = this.add.group();
    this.shooterPool.enableBody = true;
    this.shooterPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.shooterPool.createMultiple(100, 'shooter');
    this.shooterPool.setAll('anchor.x', 0.5);
    this.shooterPool.setAll('anchor.y', 0.5);
    this.shooterPool.setAll('outOfBoundsKill', true);
    this.shooterPool.setAll('checkWorldBounds', true);
    this.shooterPool.setAll('reward', BasicGame.SHOOTER_REWARD, false, false, 0, true)
    this.shooterPool.setAll('dropRate', BasicGame.SHOOTER_DROP_RATE, false, false, 0, true);

    this.shooterPool.forEach(function(shooter){
      shooter.animations.add('fly', [0,1,2], 20, true);
      shooter.animations.add('hit', [3,1,3,2], 20, false);
      shooter.events.onAnimationComplete.add(function(e){
        e.play('fly');
      }, this);

      shooter.nextShotAt = 0;
    });

    this.nextShooterAt = this.time.now + Phaser.Timer.SECOND * 5;
  },

  setupBullets: function(){
    this.bulletPool = this.add.group(); 
    this.bulletPool.enableBody = true; 
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(BasicGame.MAX_PLAYER_BULLETS, 'bullet');
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    this.nextShotAt = 0;
    this.shotDelay = BasicGame.SHOT_DELAY;


    this.enemyBulletPool = this.add.group(); 
    this.enemyBulletPool.enableBody = true; 
    this.enemyBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyBulletPool.createMultiple(BasicGame.MAX_ENEMY_BULLETS, 'bullet');
    this.enemyBulletPool.setAll('anchor.x', 0.5);
    this.enemyBulletPool.setAll('anchor.y', 0.5);
    this.enemyBulletPool.setAll('outOfBoundsKill', true);
    this.enemyBulletPool.setAll('checkWorldBounds', true);
    this.enemyBulletPool.setAll('reward', 0, false, false, 0, true);

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

  setupPowerUps: function(){
    this.powerUpPool = this.add.group();
    this.powerUpPool.enableBody = true;
    this.powerUpPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.powerUpPool.createMultiple(5, 'powerup1');
    this.powerUpPool.setAll('anchor.x', 0.5);
    this.powerUpPool.setAll('anchor.y', 0.5);
    this.powerUpPool.setAll('outOfBoundsKill', true);
    this.powerUpPool.setAll('checkWorldBounds', true);
    this.powerUpPool.setAll('reward', BasicGame.POWERUP_REWARD, false, false, 0, true);
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

  update: function () {
     this.checkCollisions();
     this.spawnEnemies();
     this.processPlayerInput();
     this.processDelayedEffects();
     this.enemyFire();
  },

  processDelayedEffects: function(){
    if (this.instructions && this.time.now > this.instExpire){
      this.instructions.destroy();
    }

    if (this.ghostUntil && this.time.now > this.ghostUntil){
      this.player.play('fly');
      this.ghostUntil = null;
    }

    if (this.returnTime && this.time.now > this.returnTime){
      this.returnTime = null;
      this.displayReturnText();
    }
  },

  checkCollisions: function(){
    this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.bulletPool, this.shooterPool, this.enemyHit, null, this);

    this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);
    this.physics.arcade.overlap(this.player, this.shooterPool, this.playerHit, null, this);

    this.physics.arcade.overlap(this.player, this.enemyBulletPool, this.playerHit, null, this);

    this.physics.arcade.overlap(this.player, this.powerUpPool, this.collectPowerUp, null, this);
  },

  enemyHit: function(bullet, enemy){
    //console.log(enemy.key);
    bullet.kill();
    this.damageEnemy(enemy, BasicGame.BULLET_DAMAGE);
  },

  playerHit: function(player, enemy){
    if (this.ghostUntil && this.ghostUntil > this.time.now){
      return;
    }

    this.damageEnemy(enemy, BasicGame.CRASH_DAMAGE);
    this.weaponLevel = 0;

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

  collectPowerUp: function(player, powerUp){
    if (this.weaponLevel < 5){
      this.weaponLevel += 1;
    }
    console.log('PowerUp Collected: Weapon Level ' + this.weaponLevel);
    powerUp.kill();
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
      if (this.returnText && this.returnText.exists){
        this.quit();
      } else {
        this.fire();
      }
    }
  },

  fire: function(){
    if (this.nextShotAt > this.time.now || !this.player.alive){
      return;
    }


    if (this.weaponLevel == 0){
      if (this.bulletPool.countDead() === 0){
        return;
      }
      var bullet = this.bulletPool.getFirstExists(false);
      bullet.reset(this.player.x, this.player.y - 20);
      bullet.body.velocity.y = -BasicGame.BULLET_VELOCITY;
    } else {
      if (this.bulletPool.countDead() < this.weaponLevel*2){
        return;
      }
      for (var i = 0; i < this.weaponLevel; i++){
        //fire bullets in scatter formation
        var bullet = this.bulletPool.getFirstExists(false);
        bullet.reset(this.player.x, this.player.y - 20);
        this.physics.arcade.velocityFromAngle(-92 - i*4, BasicGame.BULLET_VELOCITY, bullet.body.velocity);

        var bullet = this.bulletPool.getFirstExists(false);
        bullet.reset(this.player.x, this.player.y - 20);
        this.physics.arcade.velocityFromAngle(-88 + i*4, BasicGame.BULLET_VELOCITY, bullet.body.velocity);
      }
    }

    this.nextShotAt = this.time.now + this.shotDelay;


  },

  enemyFire: function(){
    this.shooterPool.forEachAlive(function(shooter){
      if (this.time.now > shooter.nextShotAt && this.enemyBulletPool.countDead() > 0){
        //console.log('shooter firing:');
        //console.log(shooter);
        shooter.nextShotAt = this.time.now + BasicGame.SHOOTER_SHOT_DELAY;
        var bullet = this.enemyBulletPool.getFirstExists(false);
        //console.log('firing bullet:');
        //console.log(bullet);
        bullet.reset(shooter.x, shooter.y);
        //console.log('successfully reset bullet');
        this.physics.arcade.moveToXY(bullet, shooter.targetX, shooter.targetY,
          BasicGame.ENEMY_BULLET_VELOCITY);

        //console.log('set bullet target');
      }
    }, this);
  },

  spawnEnemies: function(){
    //spawn vanilla enemies
    if (this.enemyPool.countDead() > 0 && this.time.now > this.nextEnemyAt){
      var enemy = this.enemyPool.getFirstExists(false);
    enemy.reset(this.rnd.integerInRange(50, this.game.width-50), 0, BasicGame.ENEMY_HEALTH);
    enemy.body.velocity.y = this.rnd.integerInRange(
      BasicGame.ENEMY_MIN_Y_VELOCITY, BasicGame.ENEMY_MAX_Y_VELOCITY);
    enemy.play('fly');
    this.nextEnemyAt = this.time.now + BasicGame.SPAWN_ENEMY_DELAY;
    }

    //spawn shooters
    if (this.shooterPool.countDead() > 0 &&
      this.time.now > this.nextShooterAt){
      //console.log('Spawning Shooters!');
    var shooter = this.shooterPool.getFirstExists(false);
    shooter.reset(this.rnd.integerInRange(50, this.game.width-50), 0, BasicGame.SHOOTER_HEALTH);
    shooter.play('fly');
    this.nextShooterAt = this.time.now + BasicGame.SPAWN_SHOOTER_DELAY;

      //enemy.body.velocity.y = this.rnd.integerInRange(
      //  BasicGame.SHOOTER_MIN_VELOCITY, BasicGame.SHOOTER_MAX_VELOCITY);
    shooter.targetX = this.rnd.integerInRange(-10, this.game.width+10);
    shooter.targetY = this.game.height;
    shooter.rotation = this.physics.arcade.moveToXY(shooter, shooter.targetX, shooter.targetY,
      this.rnd.integerInRange(BasicGame.SHOOTER_MIN_VELOCITY, BasicGame.SHOOTER_MAX_VELOCITY)
      ) - Math.PI/2;
    }
  },

  explode: function(sprite){
    if (this.explosionPool.countDead() === 0){
      return;
    }
    var explosion = this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x, sprite.y);
    explosion.play('boom', 15, false, true);
  },

  damageEnemy: function(enemy, damage){
    enemy.damage(damage);
    if (enemy.alive){
      enemy.play('hit');
    } else {
      this.explode(enemy);
      this.addToScore(enemy.reward);
      //drop powerup?
      this.spawnPowerUp(enemy);

      if (this.score >= BasicGame.WINNING_SCORE){
        this.displayEnd(true);
        this.shooterPool.destroy();
        this.enemyPool.destroy();
        this.enemyBulletPool.destroy();
      }
    }
  },

  spawnPowerUp: function(enemy){
    if (this.powerUpPool.countDead() <= 0 || this.weaponLevel >= 5){
      return;
    }
    if (this.rnd.frac() < enemy.dropRate){
      var powerUp = this.powerUpPool.getFirstExists(false);
      powerUp.reset(enemy.x, enemy.y);
      powerUp.body.velocity.y = BasicGame.POWERUP_VELOCITY;
    }
  },

  addToScore: function(reward){
    this.score += reward;
    this.scoreText.text = this.score;
  },

  render: function() {
    //this.game.debug.body(this.enemy);
    //this.game.debug.body(this.bullet);
  },

  displayEnd: function(win){
    if (this.endText && this.endText.exists){
      return;
    }
    var msg = win ? 'You Win!' : 'You Lose...';
    this.endText = this.add.text(this.game.width / 2, this.game.height / 2, msg, 
      {font: '80px monospace', fill: '#fff', align: 'center'});

    this.endText.anchor.setTo(0.5, 0.5);
    this.returnTime = this.time.now + BasicGame.RETURN_MESSAGE_DELAY;
  },

  displayReturnText: function(){
    if (this.returnText && this.returnText.exists){
      return;
    }

    this.endText.destroy();
    this.returnTime = null;
    var msg = 'Press Z or Tap Screen to Continue';
    this.returnText = this.add.text(this.game.width / 2, this.game.height / 2, msg, 
      {font: '20px monospace', fill: '#fff', align: 'center'});
    this.returnText.anchor.setTo(0.5, 0.5);
  },

  quit: function(){
    this.sea.destroy();
    this.player.destroy();
    this.enemyPool.destroy();
    this.bulletPool.destroy();
    this.explosionPool.destroy();
    this.instructions.destroy();
    this.scoreText.destroy();
    this.endText.destroy();
    this.returnText.destroy();
    //  Then let's go back to the main menu.
    this.state.start('MainMenu');
  }

};
