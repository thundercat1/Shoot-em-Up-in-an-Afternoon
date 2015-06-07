
BasicGame.Game = function (game) {
};

BasicGame.Game.prototype = {
  preload: function() {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('enemy', 'assets/enemy.png', 32, 32);
    this.load.spritesheet('shooter', 'assets/shooting-enemy.png', 32, 32);
    this.load.spritesheet('boss', 'assets/boss.png', 93, 75);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/player.png', 64, 64);
    this.load.image('titlepage', 'assets/titlepage.png');
    this.load.image('powerup1', 'assets/powerup1.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('destroyer', 'assets/destroyer.png', 32, 174);
  },

  create: function () {
    this.setupBackground();
    this.setupEnemies();
    this.setupPlayer();
    this.setupPlayerIcons();
    this.setupBombs();
    
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

  setupBombs: function(){
    this.bombs = this.add.group();
    for (var i = 0; i < BasicGame.BOMB_COUNT; i++){
      var bomb = this.bombs.create(100 - (i*30), 30, 'bomb');
      bomb.anchor.setTo(0.5, 0.5);
    }
    this.nextBombAt = 0;
  },

  setupEnemies: function(){
    this.enemyGroups = [];


    this.destroyerPool = this.add.group();
    this.enemyGroups.push(this.destroyerPool);
    this.destroyerPool.enableBody = true;
    this.destroyerPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.destroyerPool.createMultiple(100, 'destroyer');
    this.destroyerPool.setAll('anchor.x', 0.5);
    this.destroyerPool.setAll('anchor.y', 0.5);
    this.destroyerPool.setAll('outOfBoundsKill', true);
    this.destroyerPool.setAll('checkWorldBounds', true);
    this.destroyerPool.setAll('reward', BasicGame.DESTROYER_REWARD, false, false, 0, true)
    this.destroyerPool.setAll('dropRate', BasicGame.DESTROYER_DROP_RATE, false, false, 0, true);

    this.destroyerPool.forEach(function(destroyer){
      destroyer.animations.add('cruise', [0,1], 3, true);
      destroyer.animations.add('hit', [2,0,2,1], 3, false);
      destroyer.events.onAnimationComplete.add(function(e){
        e.play('cruise');
      }, this);
      destroyer.nextShotAt = 0;
    });
    this.nextDestroyerAt = this.time.now + BasicGame.FIRST_DESTROYER_TIME;


    this.enemyDelay = BasicGame.SPAWN_ENEMY_DELAY;
    this.shooterDelay = BasicGame.SPAWN_SHOOTER_DELAY;

    this.enemyPool = this.add.group();
    this.enemyGroups.push(this.enemyPool);
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
    this.enemyGroups.push(this.shooterPool);
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




    






    this.bossPool = this.add.group();
    this.enemyGroups.push(this.bossPool);
    this.bossPool.enableBody = true;
    this.bossPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bossPool.createMultiple(1, 'boss');
    this.bossPool.setAll('anchor.x', 0.5);
    this.bossPool.setAll('anchor.y', 0.5);
    this.bossPool.setAll('outOfBoundsKill', true);
    this.bossPool.setAll('checkWorldBounds', true);
    this.bossPool.setAll('reward', BasicGame.BOSS_REWARD, false, false, 0, true)

    this.bossPool.forEach(function(boss){
      boss.animations.add('fly', [0,1,2], 20, true);
      boss.animations.add('hit', [3,1,3,2], 20, false);
      boss.events.onAnimationComplete.add(function(e){
        e.play('fly');
      }, this);

      boss.nextShotAt = 0;
    });

    this.boss = this.bossPool.getTop();
    console.log(this.boss.nextShotAt);
    this.bossApproaching = false;
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

    if (this.bossApproaching && this.boss.y >= BasicGame.BOSS_HOLDING_POSITION){
      this.bossApproaching = false;
      this.boss.body.velocity.y = 0;
      this.boss.body.velocity.x = BasicGame.BOSS_X_VELOCITY;
      this.boss.body.bounce.x = 1;
      this.boss.body.collideWorldBounds = true;
    }
  },

  checkCollisions: function(){
    this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.bulletPool, this.shooterPool, this.enemyHit, null, this);

    this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);
    this.physics.arcade.overlap(this.player, this.shooterPool, this.playerHit, null, this);

    this.physics.arcade.overlap(this.player, this.enemyBulletPool, this.playerHit, null, this);

    this.physics.arcade.overlap(this.player, this.powerUpPool, this.collectPowerUp, null, this);

    if (this.bossApproaching === false){
      //player runs into boss
      this.physics.arcade.overlap(this.player, this.boss, this.playerHit, null, this);

      //bullet hits boss
      this.physics.arcade.overlap(this.bulletPool, this.bossPool, this.enemyHit, null, this);

    }
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
    //if (this.weaponLevel < 5){
      this.weaponLevel += 1;
    //}
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

    if (this.input.keyboard.isDown(Phaser.Keyboard.X)){
      this.dropBomb();
    }
  },

  fire: function(){
    if (this.nextShotAt > this.time.now || !this.player.alive){
      return;
    }

      if (this.bulletPool.countDead() === 0){
        return;
      }
      this.nextShotAt = this.time.now + this.shotDelay;
      var bullet = this.bulletPool.getFirstExists(false);
      bullet.reset(this.player.x, this.player.y - 20);
      bullet.body.velocity.y = -BasicGame.BULLET_VELOCITY;

      if (this.bulletPool.countDead() < this.weaponLevel*2){
        return;
      }
      for (var i = 0; i < this.weaponLevel; i++){
        //fire bullets in scatter formation
        var bullet = this.bulletPool.getFirstExists(false);
        bullet.reset(this.player.x, this.player.y - 20);

        var bulletSpread = BasicGame.BULLET_SPREAD;
        this.physics.arcade.velocityFromAngle(-90 - bulletSpread*(i+1), BasicGame.BULLET_VELOCITY, bullet.body.velocity);

        var bullet = this.bulletPool.getFirstExists(false);
        bullet.reset(this.player.x, this.player.y - 20);
        this.physics.arcade.velocityFromAngle(-90 + bulletSpread*(i+1), BasicGame.BULLET_VELOCITY, bullet.body.velocity);
      }
  },

  dropBomb: function(){
    var bomb = this.bombs.getFirstAlive();
    if (bomb && this.time.now > this.nextBombAt){
      this.nextBombAt = this.time.now + BasicGame.BOMB_DELAY;
      bomb.kill();

      this.enemyGroups.forEach(function(group){
        group.forEachAlive(function(enemy){
          this.damageEnemy(enemy, 50);
        }, this);
      }, this);

      this.enemyBulletPool.forEachAlive(function(bullet){
        bullet.kill();
      }, this);
    }
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

    if (this.bossApproaching === false && this.boss.alive &&
      this.boss.nextShotAt < this.time.now && this.enemyBulletPool.countDead() >= 11){
      console.log('Boss Firing');
      //boss can fire ten bullets
      this.boss.nextShotAt = this.time.now + BasicGame.BOSS_SHOT_DELAY;

      var middleBullet = this.enemyBulletPool.getFirstExists(false);
      middleBullet.reset(this.boss.x, this.boss.y+10)
      this.physics.arcade.moveToXY(middleBullet, this.player.x, this.player.y, BasicGame.BOSS_BULLET_VELOCITY);
      for (var i = 0; i < 5; i++){
        var bulletSpread = (this.boss.health > BasicGame.BOSS_HEALTH*.5) ? 3 : 25;

        var leftBullet = this.enemyBulletPool.getFirstExists(false);
        leftBullet.reset(this.boss.x - 3*(i+1), this.boss.y+10);

        var rightBullet = this.enemyBulletPool.getFirstExists(false);
        rightBullet.reset(this.boss.x + 3*(i+1), this.boss.y+10);
        

        //this.physics.arcade.moveToObject(rightBullet, this.player, BasicGame.BOSS_BULLET_VELOCITY);
        //this.physics.arcade.moveToObject(leftBullet, this.player, BasicGame.BOSS_BULLET_VELOCITY);
        this.physics.arcade.moveToXY(rightBullet, this.player.x + bulletSpread*(1+i), this.player.y, BasicGame.BOSS_BULLET_VELOCITY); 
        this.physics.arcade.moveToXY(leftBullet, this.player.x - bulletSpread*(1+i), this.player.y, BasicGame.BOSS_BULLET_VELOCITY);
      }
//      var bullet = this.enemyBulletPool.getFirstExists(false);
//      bullet.reset(this.boss.x, this.boss.y);
//      this.physics.arcade.moveToObject(bullet, this.player, BasicGame.BOSS_BULLET_VELOCITY);
    }


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

    //spawn destroyers
    if (this.destroyerPool.countDead() > 0 &&
      this.time.now > this.nextDestroyerAt){
      console.log('spawning destroyer');
      var destroyer = this.destroyerPool.getFirstExists(false);
      this.nextDestroyerAt = this.time.now + BasicGame.SPAWN_DESTROYER_DELAY;
      destroyer.reset(this.rnd.integerInRange(50, this.game.width-50), -80, BasicGame.DESTROYER_HEALTH);
      destroyer.body.velocity.y = BasicGame.DESTROYER_SPEED;
      destroyer.play('cruise');
    }
  },

  spawnBoss: function(){
    this.bossApproaching = true;
    //console.log('Resetting boss with health = ', BasicGame.BOSS_HEALTH);
    this.boss.reset(this.game.width/2, 50, BasicGame.BOSS_HEALTH);
    //console.log(this.boss.health);
    this.boss.body.velocity.y = BasicGame.BOSS_Y_VELOCITY;
    this.boss.play('fly');
    //console.log('boss pool:');
    //console.log(this.bossPool);
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
    //console.log('damaging enemy!');
    //console.log(enemy);
    //console.log(damage);
    enemy.damage(damage);
    if (enemy.alive){
      enemy.play('hit');
    } else {
      this.explode(enemy);
      this.addToScore(enemy.reward);
      //drop powerup?
      this.spawnPowerUp(enemy);
      if (enemy.key == 'boss'){
        this.displayEnd(true);
        this.shooterPool.destroy();
        this.enemyPool.destroy();
        this.enemyBulletPool.destroy();
        this.bossPool.destroy();
      }
    }
  },

  spawnPowerUp: function(enemy){
    console.log('living power ups:' + this.powerUpPool.countLiving());
    if (this.powerUpPool.countDead() <= 0 || 
      this.powerUpPool.countLiving() + this.weaponLevel >= 3){
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
      console.log('bossPool.countDead = ' + this.bossPool.countDead());
      if (this.score >= BasicGame.BOSS_APPEARANCE_SCORE && this.bossPool.countDead() === 1){
        this.spawnBoss();
      }
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
