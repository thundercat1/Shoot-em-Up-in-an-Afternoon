var BasicGame = {
  SEA_SCROLL_SPEED: 12,
  PLAYER_SPEED: 300,
  ENEMY_MIN_Y_VELOCITY: 30,
  ENEMY_MAX_Y_VELOCITY: 60,
  SHOOTER_MIN_VELOCITY: 30,
  SHOOTER_MAX_VELOCITY: 80,
  BOSS_Y_VELOCITY: 15,
  BOSS_X_VELOCITY: 200,
  BULLET_VELOCITY: 500,
  ENEMY_BULLET_VELOCITY: 150,
  BOSS_BULLET_VELOCITY: 200,
  POWERUP_VELOCITY: 20,

  SPAWN_ENEMY_DELAY: Phaser.Timer.SECOND,
  SPAWN_SHOOTER_DELAY: Phaser.Timer.SECOND * 3,

  SHOT_DELAY: Phaser.Timer.SECOND * 0.1,
  SHOOTER_SHOT_DELAY: Phaser.Timer.SECOND * 2,
  BOSS_SHOT_DELAY: Phaser.Timer.SECOND * 0.5,

  ENEMY_HEALTH: 2,
  SHOOTER_HEALTH: 5,
  BOSS_HEALTH: 500,

  BULLET_DAMAGE: 1,
  BULLET_SPREAD: 7,
  CRASH_DAMAGE: 5,
  MAX_PLAYER_BULLETS: 75,
  MAX_ENEMY_BULLETS: 100,

  ENEMY_REWARD: 100,
  SHOOTER_REWARD: 400,
  BOSS_REWARD: 10000,
  POWERUP_REWARD: 100,
  BOSS_APPEARANCE_SCORE: 20000,

  ENEMY_DROP_RATE: 0.05,
  SHOOTER_DROP_RATE: 0.15,
  BOSS_DROP_RATE: 0,

  BOSS_HOLDING_POSITION: 80,

  PLAYER_EXTRA_LIVES: 3,
  PLAYER_GHOST_TIME: Phaser.Timer.SECOND * 3,

  INSTRUCTION_EXPIRE: Phaser.Timer.SECOND * 10,
  RETURN_MESSAGE_DELAY: Phaser.Timer.SECOND * 2
};

BasicGame.Boot = function (game) {

};

BasicGame.Boot.prototype = {

  init: function () {

    //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
    this.input.maxPointers = 1;

    //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
    // this.stage.disableVisibilityChange = true;

    if (this.game.device.desktop) {
      //  If you have any desktop specific settings, they can go in here
    } else {
      //  Same goes for mobile settings.
      //  In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.setMinMax(480, 260, 1024, 768);
      this.scale.forceLandscape = true;
    }
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
  },

  preload: function () {

    //  Here we load the assets required for our preloader (in this case a loading bar)
    this.load.image('preloaderBar', 'assets/preloader-bar.png');

  },

  create: function () {

    //  By this point the preloader assets have loaded to the cache, we've set the game settings
    //  So now let's start the real preloader going
    this.state.start('Preloader');

  }

};
