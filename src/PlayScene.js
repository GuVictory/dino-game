import Phaser from 'phaser';

class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    const { height, width } = this.game.config;
    this.gameSpeed = 10;
    this.isGameRunning = false;
    this.respawnTime = 0;
    
    this.startTrigger = this.physics.add.sprite(0, 10).setOrigin(0, 1).setImmovable();
    this.ground = this.add.tileSprite(0, height, 88, 26, 'ground').setOrigin(0, 1);

    this.dino = this.physics.add.sprite(0, height, 'dino-idle')
        .setCollideWorldBounds(true)
        // применим силу тяжести к Дино
        .setGravityY(5000)
        .setOrigin(0, 1);
    this.obsticles = this.physics.add.group();
   
    this.createControll();
    this.initStartTrigger();
    this.initAnims();
  }

  initStartTrigger() {
    const { width, height } = this.game.config;
    
    // Обработчик
    this.physics.add.overlap(this.startTrigger, this.dino, () => {
      // Если параметр y, у нашего страйта триггера === 10,
      // то переместим наш триггер, чтобы больше его не трогать
      if (this.startTrigger.y === 10) {
        this.startTrigger.body.reset(0, height);
        return;
      }

      // Как только мы начнем игру, 
      // то можно перестать слушать данный обработчик
      this.startTrigger.disableBody(true, true);

      const startEvent =  this.time.addEvent({
        delay: 1000/60, // Небольшая задержка
        loop: true, // Зациклинность
        callbackScope: this, // Область работы - наш класс
        callback: () => { // Обработчик срабатывания
          // Немного переместим нашего Дино
          this.dino.setVelocityX(80);
          // И активируем ему анимацию
          this.dino.play('dino-run', 1);
  
          // Плавно будем добавлять ширину земли
          // но только пока она будет меньше ширины canvas
          if (this.ground.width < width) {
            this.ground.width += 17 * 2;
          }
  
          // Как только достигним нужной ширины - запустим игру
          if (this.ground.width >= 1000) {
            this.ground.width = width;
            this.isGameRunning = true;
            this.dino.setVelocityX(0);
            startEvent.remove();
          }
        }
      });

    }, null, this);
  }

  placeObsticle() {
    const { width, height } = this.game.config;
    const obsticleNum = Math.floor(Math.random() * 7) + 1;
    const distance = Phaser.Math.Between(600, 900);

    let obsticle;
    if (obsticleNum > 6) {
      // Птеродактиль может лететь на разной высоте
      const enemyHeight = [50, 70];
      obsticle = this.obsticles.create(width + distance, height - enemyHeight[Math.floor(Math.random() * 2)], `enemy-bird`)
        .setOrigin(0, 1)
      obsticle.play('enemy-dino-fly', 1);
      obsticle.body.height = obsticle.body.height / 1.5;
    } else {
      // Если вы посмотрите в нашу статику,
      // то там есть 6 разных вариантов отрисовки кактусов,
      // именно поэтому картинка спрайта obsticle-${obsticleNum}
      obsticle = this.obsticles.create(width + distance, height, `obsticle-${obsticleNum}`)
        .setOrigin(0, 1);

      obsticle.body.offset.y = +10;
    }

    obsticle.setImmovable();
  }

  update(time, delta) {
    // Ничего не делаем, если игра не началась
    if (!this.isGameRunning) { return; }

    this.ground.tilePositionX += this.gameSpeed;
    Phaser.Actions.IncX(this.obsticles.getChildren(), -this.gameSpeed);

    // delta - время, которое прошло с момента прошлого фрейма
    this.respawnTime += delta * this.gameSpeed * 0.08;
    if (this.respawnTime >= 1500) {
      this.placeObsticle();
      // после того как создадим препятствие,
      // надо бы обнулить таймер до следующей пачки
      this.respawnTime = 0;
    }

    if (this.dino.body.deltaAbsY() > 0) {
      this.dino.anims.stop();
      this.dino.setTexture('dino', 0);
    } else {
      this.dino.body.height <= 58
        ? this.dino.play('dino-down-anim', true)
        : this.dino.play('dino-run', true);
    }
  }

  createControll() {
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.dino.body.onFloor()) { return; }
      
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;

      this.dino.setTexture('dino', 0);
      this.dino.setVelocityY(-1600);
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      if (!this.dino.body.onFloor()) { return; }

      this.dino.body.height = 58;
      this.dino.body.offset.y = 34;
    });

    this.input.keyboard.on('keyup-DOWN', () => {
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
    });
  }

  initAnims() {
    this.anims.create({
      key: 'dino-run',
      frames: this.anims.generateFrameNumbers('dino', 
        {start: 2, end: 3}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'dino-down-anim',
      frames: this.anims.generateFrameNumbers('dino-down', {start: 0, end: 1}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy-dino-fly',
      frames: this.anims.generateFrameNumbers('enemy-bird', {start: 0, end: 1}),
      frameRate: 6,
      repeat: -1
    });
   }
}

export default PlayScene;