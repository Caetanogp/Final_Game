class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {
    this.load.image('bg', 'assets/bg.jpg');
    this.load.image('player', 'assets/player.jpg');
    this.load.image('enemy', 'assets/alien.jpg');
    this.load.image('bullet', 'assets/tiro2.png');

    this.load.audio('shoot', 'assets/somDeTiro.wav');
    this.load.audio('explosion', 'assets/somDeExplosao.mp3');
    this.load.audio('hit', 'assets/somDeHit.mp3');
  }

  create() {
    const bg = this.add.image(400, 300, 'bg');
    bg.setDepth(0);
    // Desativa interação no fundo para não bloquear clique
    bg.setInteractive().disableInteractive();

    this.add.text(300, 150, 'JOGO ESPACIAL', { fontSize: '32px', fill: '#fff' }).setDepth(1);

    const jogarBtn = this.add.text(350, 250, 'JOGAR', { fontSize: '24px', fill: '#0f0' })
      .setInteractive()
      .setDepth(1)
      .on('pointerdown', () => this.scene.start('Game'));

    const sobreBtn = this.add.text(350, 300, 'SOBRE', { fontSize: '24px', fill: '#0ff' })
      .setInteractive()
      .setDepth(1)
      .on('pointerdown', () => this.scene.start('Sobre'));
  }
}

class Sobre extends Phaser.Scene {
  constructor() {
    super('Sobre');
  }

  create() {
    const bg = this.add.image(400, 300, 'bg');
    bg.setDepth(0);
    bg.setInteractive().disableInteractive();

    this.add.text(100, 100, 'Feito por: Caetano Padoin e Bruno Cristofolli', { fontSize: '20px', fill: '#fff' }).setDepth(1);
    this.add.text(100, 150, 'Clique para voltar', { fontSize: '20px', fill: '#0f0' })
      .setInteractive()
      .setDepth(1)
      .on('pointerdown', () => this.scene.start('Menu'));
  }
}

class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const bg = this.add.image(400, 300, 'bg');
    bg.setDepth(0);
    bg.setInteractive().disableInteractive();

    // Sons
    this.shootSound = this.sound.add('shoot');
    this.explosionSound = this.sound.add('explosion');
    this.hitSound = this.sound.add('hit');

    this.score = 0;
    this.lives = 3;

    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '18px', fill: '#fff' }).setDepth(1);
    this.livesText = this.add.text(10, 30, 'Vidas: 3', { fontSize: '18px', fill: '#fff' }).setDepth(1);

    this.player = this.physics.add.sprite(400, 550, 'player').setScale(0.1);
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();

    this.enemySpawnTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitsEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.enemyHitsPlayer, null, this);

    this.time.addEvent({
      delay: 10000,
      callback: () => {
        if (this.enemySpawnTimer.delay > 500) {
          this.enemySpawnTimer.delay -= 100;
        }
      },
      callbackScope: this,
      loop: true
    });

    this.isGameOver = false;
  }

  spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, 0, 'enemy');
    enemy.setVelocityY(100 + this.score * 2);
    enemy.setScale(0.1);
  }

  bulletHitsEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    this.explosionSound.play();
  }

  enemyHitsPlayer(player, enemy) {
    enemy.destroy();
    this.lives -= 1;
    this.livesText.setText('Vidas: ' + this.lives);
    this.hitSound.play();

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.physics.pause();
    this.enemySpawnTimer.remove(false);
    this.add.text(300, 280, 'GAME OVER', { fontSize: '48px', fill: '#f00' }).setDepth(2);
    this.add.text(250, 350, 'Clique para voltar ao menu', { fontSize: '24px', fill: '#fff' })
      .setInteractive()
      .setDepth(2)
      .on('pointerdown', () => this.scene.start('Menu'));
  }

  update() {
    if (this.isGameOver) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
      this.player.setAngle(-15);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
      this.player.setAngle(15);
    } else {
      this.player.setVelocityX(0);
      this.player.setAngle(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shootBullet();
    }

    this.bullets.children.each(bullet => {
      if (bullet.y < 0) bullet.destroy();
    });

    this.enemies.children.each(enemy => {
      if (enemy.y > 600) {
        enemy.destroy();
        this.lives -= 1;
        this.livesText.setText('Vidas: ' + this.lives);
        this.hitSound.play();
        if (this.lives <= 0) this.gameOver();
      }
    });
  }

  shootBullet() {
    const bullet = this.bullets.create(this.player.x, this.player.y - 30, 'bullet');
    bullet.setVelocityY(-500);
    bullet.setScale(0.15);
    bullet.setAngle(-90);

    this.shootSound.play();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [Menu, Sobre, Game]
};

const game = new Phaser.Game(config);
