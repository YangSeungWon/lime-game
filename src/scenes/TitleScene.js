class TitleScene extends Phaser.Scene {
    static COLORS = {
        PRIMARY: 0x2e7d32,
        SECONDARY: 0x81c784,
        HIGHLIGHT: 0xc5e1a5
    };

    static DIMENSIONS = {
        BUTTON_WIDTH: 220,
        BUTTON_HEIGHT: 70
    };

    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        console.log('TitleScene - preload 시작');
        this.load.image('lime', '/assets/lime.svg');
        this.load.image('leaf', '/assets/leaf.svg');
        this.load.image('particle', '/assets/particle.svg');
        console.log('TitleScene - 이미지 로드 완료');
    }

    create() {
        console.log('TitleScene - create 시작');
        const { width, height } = this.scale;
        console.log('Canvas 크기:', width, height);

        try {
            console.log('배경 생성 시작');
            this.createBackground(width, height);
            console.log('배경 생성 완료');

            console.log('플로팅 라임 생성 시작');
            this.createFloatingLimes(width, height);
            console.log('플로팅 라임 생성 완료');

            console.log('파티클 생성 시작');
            this.createParticles(width, height);
            console.log('파티클 생성 완료');

            console.log('타이틀 생성 시작');
            this.createTitle(width, height);
            console.log('타이틀 생성 완료');

            console.log('라임 아이콘 생성 시작');
            this.createLimeIcon(width, height);
            console.log('라임 아이콘 생성 완료');

            console.log('Start 버튼 생성 시작');
            this.createStartButton(width, height);
            console.log('Start 버튼 생성 완료');

            console.log('게임 설명 생성 시작');
            this.createGameDescription(width, height);
            console.log('게임 설명 생성 완료');
        } catch (error) {
            console.error('씬 생성 중 에러 발생:', error);
        }

        // Add version number and credits
        this.add.text(width - 20, height - 20, 'v1.0', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial',
        }).setOrigin(1);

        // scene 전환 시 이전 tweens과 particles 정리 필요
        this.events.on('shutdown', () => {
            this.tweens.killAll();
            // particles 정리도 필요
        });
    }

    createBackground(width, height) {
        // Create multiple gradient layers for a more dynamic background
        const bg1 = this.add.graphics();
        bg1.fillGradientStyle(0x81c784, 0x81c784, 0x66bb6a, 0x66bb6a, 1);
        bg1.fillRect(0, 0, width, height);

        // Add a subtle pattern overlay
        const pattern = this.add.graphics();
        for (let i = 0; i < width; i += 30) {
            for (let j = 0; j < height; j += 30) {
                if ((i + j) % 60 === 0) {
                    pattern.fillStyle(0xffffff, 0.05);
                    pattern.fillCircle(i, j, 3);
                }
            }
        }

        // Add a light effect at the top
        const light = this.add.graphics();
        light.fillStyle(0xffffff, 0.1);
        light.fillEllipse(width / 2, -height / 4, width * 1.5, height);
    }

    createFloatingLimes(width, height) {
        // Create several floating limes in the background
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(50, height - 50);
            const scale = Phaser.Math.FloatBetween(0.3, 0.6);
            const alpha = Phaser.Math.FloatBetween(0.2, 0.4);

            const lime = this.add.image(x, y, 'lime')
                .setScale(scale)
                .setAlpha(alpha)
                .setTint(0xc5e1a5);

            // Add floating animation
            this.tweens.add({
                targets: lime,
                y: y + Phaser.Math.Between(20, 40),
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });

            // Add slow rotation
            this.tweens.add({
                targets: lime,
                angle: Phaser.Math.Between(-15, 15),
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });
        }
    }

    createParticles(width, height) {
        try {
            console.log('파티클 생성 시작');
            const particles = this.add.particles('particle');

            particles.createEmitter({
                x: { min: 0, max: width },
                y: height + 10,
                speedY: { min: -30, max: -60 },
                speedX: { min: -10, max: 10 },
                scale: { start: 0.4, end: 0 },
                lifespan: 6000,
                frequency: 200,
                alpha: { start: 0.3, end: 0 },
                tint: [0xffffff, 0xc5e1a5, 0xaed581]
            });
            console.log('파티클 생성 완료');
        } catch (error) {
            console.error('파티클 생성 실패:', error);
        }
    }

    createTitle(width, height) {
        // Create a container for the title elements
        const titleContainer = this.add.container(width / 2, height * 0.25);

        // Add shadow for depth
        const titleShadow = this.add.text(3, 3, 'Lime\nPuzzle', {
            fontSize: '72px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            align: 'center',
            color: '#000000',
        }).setOrigin(0.5).setAlpha(0.3);

        // Main title text
        const titleText = this.add.text(0, 0, 'Lime\nPuzzle', {
            fontSize: '72px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            align: 'center',
            color: '#ffffff',
            stroke: '#2e7d32',
            strokeThickness: 8,
        }).setOrigin(0.5);

        // Add a decorative leaf
        const leaf1 = this.add.image(-80, -30, 'leaf')
            .setScale(0.6)
            .setAngle(-30)
            .setTint(0x81c784);

        const leaf2 = this.add.image(80, -30, 'leaf')
            .setScale(0.6)
            .setAngle(30)
            .setFlipX(true)
            .setTint(0x81c784);

        titleContainer.add([titleShadow, titleText, leaf1, leaf2]);

        // Add animation to the title
        this.tweens.add({
            targets: titleContainer,
            y: titleContainer.y + 10,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add a subtle pulse effect to the title
        this.tweens.add({
            targets: titleText,
            scale: 1.05,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    createLimeIcon(width, height) {
        // Create a container for the lime icon
        const limeContainer = this.add.container(width / 2, height * 0.5);

        // Create a glowing effect
        const glow = this.add.circle(0, 0, 50, 0xffffff, 0.3);

        // Create the lime circle
        const lime = this.add.circle(0, 0, 45, 0x7cb342);

        // Add highlight
        const highlight = this.add.circle(-15, -15, 10, 0xffffff, 0.4);

        // Add the number 10
        const limeText = this.add.text(0, 0, '10', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        limeContainer.add([glow, lime, highlight, limeText]);

        // Add a bounce animation
        this.tweens.add({
            targets: limeContainer,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 800,
            ease: 'Bounce.easeOut',
            yoyo: true,
            repeat: -1,
            delay: 1000
        });

        // Add a rotation animation
        this.tweens.add({
            targets: glow,
            angle: 360,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });
    }

    createStartButton(width, height) {
        console.log('createStartButton - 시작');
        const buttonContainer = this.add.container(width / 2, height * 0.7);
        console.log('버튼 위치:', width / 2, height * 0.7);

        // Create button shadow using Graphics
        const buttonShadow = this.add.graphics();
        buttonShadow.fillStyle(0x000000, 0.3);
        buttonShadow.fillRoundedRect(-110 + 4, -35 + 4, 220, 70, 35);

        // Create the button background using Graphics
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x2e7d32, 1);
        buttonBg.fillRoundedRect(-110, -35, 220, 70, 35);

        // Create a hit area for the button
        const hitArea = new Phaser.Geom.Rectangle(-110, -35, 220, 70);
        buttonContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
            .on('pointerover', () => {
                console.log('버튼 호버');
                buttonBg.clear();
                buttonBg.fillStyle(0x1b5e20, 1);
                buttonBg.fillRoundedRect(-110, -35, 220, 70, 35);
                buttonContainer.setScale(1.05);
            })
            .on('pointerout', () => {
                buttonBg.clear();
                buttonBg.fillStyle(0x2e7d32, 1);
                buttonBg.fillRoundedRect(-110, -35, 220, 70, 35);
                buttonContainer.setScale(1);
            })
            .on('pointerdown', () => {
                console.log('버튼 클릭');
                this.tweens.add({
                    targets: buttonContainer,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        this.scene.start('GameScene');
                    }
                });
            });

        // Add glow effect using Graphics
        const buttonGlow = this.add.graphics();
        buttonGlow.fillStyle(0x4caf50, 0.3);
        buttonGlow.fillRoundedRect(-115, -40, 230, 80, 40);

        // Add the text
        const buttonText = this.add.text(0, 0, 'START', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add a small lime icon
        const buttonIcon = this.add.circle(-75, 0, 15, 0xc5e1a5);

        buttonContainer.add([buttonGlow, buttonShadow, buttonBg, buttonText, buttonIcon]);

        // Add a subtle pulse animation
        this.tweens.add({
            targets: buttonGlow,
            alpha: { from: 0.3, to: 0.5 },
            scaleX: 1.1,
            scaleY: 1.1,
            alpha: 0.5,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    createGameDescription(width, height) {
        // Create a container for the description
        const descContainer = this.add.container(width / 2, height * 0.85);

        // Add a background for better readability using Graphics
        const descBg = this.add.graphics();
        const bgWidth = width * 0.7;
        const bgHeight = 50;
        descBg.fillStyle(0x000000, 0.1);
        descBg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 25);

        // Add the description text
        const descText = this.add.text(0, 0, 'Connect limes to make sum of 10!', {
            fontSize: '26px',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            align: 'center',
            stroke: '#2e7d32',
            strokeThickness: 2,
        }).setOrigin(0.5);

        descContainer.add([descBg, descText]);

        // Add a subtle fade in/out animation
        this.tweens.add({
            targets: descContainer,
            alpha: 0.8,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: 500
        });
    }
}