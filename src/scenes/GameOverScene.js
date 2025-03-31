class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        const { width, height } = this.scale;

        // Create background with particles
        this.createBackground(width, height);

        // Create main container for animations
        const mainContainer = this.add.container(width / 2, height / 2);

        // Create game over panel
        this.createGameOverPanel(mainContainer, width, height);

        // Animate the container entrance
        mainContainer.setScale(0.8);
        mainContainer.setAlpha(0);

        this.tweens.add({
            targets: mainContainer,
            scale: 1,
            alpha: 1,
            duration: 800,
            ease: 'Back.easeOut'
        });
    }

    createBackground(width, height) {
        // Dark overlay with gradient
        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0x1b5e20, 0x1b5e20, 0x004d40, 0x004d40, 0.9);
        overlay.fillRect(0, 0, width, height);

        // Add subtle pattern
        const pattern = this.add.graphics();
        pattern.fillStyle(0xffffff, 0.03);

        for (let x = 0; x < width; x += 30) {
            for (let y = 0; y < height; y += 30) {
                if ((x + y) % 60 === 0) {
                    pattern.fillCircle(x, y, 3);
                }
            }
        }

        // Create particle effect
        this.createParticles(width, height);

        // Add floating limes in background
        this.createFloatingLimes(width, height);
    }

    createParticles(width, height) {
        // Create a graphics object for particles
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(2, 6);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.4);

            const particle = this.add.circle(x, y, size, 0xffffff, alpha);

            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(100, 300),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 8000),
                ease: 'Sine.easeOut',
                onComplete: () => {
                    particle.y = height + 10;
                    particle.x = Phaser.Math.Between(0, width);
                    particle.alpha = alpha;

                    this.tweens.add({
                        targets: particle,
                        y: y - Phaser.Math.Between(100, 300),
                        alpha: 0,
                        duration: Phaser.Math.Between(3000, 8000),
                        ease: 'Sine.easeOut',
                        loop: -1
                    });
                }
            });
        }
    }

    createFloatingLimes(width, height) {
        // Add some decorative limes in the background
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(15, 40);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.2);

            // Create lime group
            const limeGroup = this.add.container(x, y);

            // Main lime circle
            const lime = this.add.circle(0, 0, size, 0x7cb342, alpha);
            lime.setStrokeStyle(1, 0x558b2f, alpha);

            // Highlight
            const highlight = this.add.circle(-size * 0.3, -size * 0.3, size * 0.2, 0xffffff, alpha * 0.5);

            limeGroup.add([lime, highlight]);

            // Add floating animation
            this.tweens.add({
                targets: limeGroup,
                y: y + Phaser.Math.Between(-30, 30),
                x: x + Phaser.Math.Between(-30, 30),
                angle: Phaser.Math.Between(-15, 15),
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });
        }
    }

    createGameOverPanel(container, width, height) {
        // Panel background
        const panelWidth = width * 0.7;
        const panelHeight = height * 0.6;

        // Create panel with shadow
        const panelShadow = this.add.rectangle(5, 5, panelWidth, panelHeight, 0x000000, 0.5)
            .setOrigin(0.5)
            .setRoundedRectangle(20);

        const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0xffffff, 0.9)
            .setOrigin(0.5)
            .setRoundedRectangle(20)
            .setStrokeStyle(4, 0x81c784);

        container.add([panelShadow, panel]);

        // Add lime decoration
        this.addLimeDecorations(container, panelWidth, panelHeight);

        // Game over text with animation
        const gameOverText = this.add.text(0, -panelHeight * 0.35, 'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#2e7d32',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);

        container.add(gameOverText);

        // Animate game over text
        this.tweens.add({
            targets: gameOverText,
            scale: 1.1,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Score display with animation
        const scoreContainer = this.add.container(0, -panelHeight * 0.1);

        const scoreLabel = this.add.text(0, -30, 'FINAL SCORE', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#4e342e'
        }).setOrigin(0.5);

        const scoreValue = this.add.text(0, 10, this.finalScore.toString(), {
            fontSize: '72px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#2e7d32'
        }).setOrigin(0.5);

        scoreContainer.add([scoreLabel, scoreValue]);
        container.add(scoreContainer);

        // Animate score counting up
        let displayScore = 0;
        const duration = Math.min(2000, Math.max(1000, this.finalScore * 10));

        this.tweens.addCounter({
            from: 0,
            to: this.finalScore,
            duration: duration,
            ease: 'Cubic.easeOut',
            onUpdate: (tween) => {
                displayScore = Math.floor(tween.getValue());
                scoreValue.setText(displayScore.toString());
            }
        });

        // Add achievement or message based on score
        let message = '';
        if (this.finalScore >= 200) {
            message = 'Lime Master!';
        } else if (this.finalScore >= 100) {
            message = 'Great Job!';
        } else if (this.finalScore >= 50) {
            message = 'Well Done!';
        } else {
            message = 'Try Again!';
        }

        const achievementText = this.add.text(0, panelHeight * 0.1, message, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ff6d00'
        }).setOrigin(0.5).setAlpha(0);

        container.add(achievementText);

        // Animate achievement text
        this.tweens.add({
            targets: achievementText,
            alpha: 1,
            y: panelHeight * 0.15,
            duration: 800,
            ease: 'Back.easeOut',
            delay: duration
        });

        // Create buttons
        this.createButtons(container, panelWidth, panelHeight);
    }

    addLimeDecorations(container, panelWidth, panelHeight) {
        // Add decorative limes to the panel corners
        const positions = [
            { x: -panelWidth * 0.45, y: -panelHeight * 0.45 },
            { x: panelWidth * 0.45, y: -panelHeight * 0.45 },
            { x: -panelWidth * 0.45, y: panelHeight * 0.45 },
            { x: panelWidth * 0.45, y: panelHeight * 0.45 }
        ];

        positions.forEach(pos => {
            const limeGroup = this.add.container(pos.x, pos.y);

            const lime = this.add.circle(0, 0, 25, 0x7cb342);
            lime.setStrokeStyle(2, 0x558b2f);

            const highlight = this.add.circle(-8, -8, 6, 0xffffff, 0.4);

            limeGroup.add([lime, highlight]);
            container.add(limeGroup);

            // Add subtle animation
            this.tweens.add({
                targets: limeGroup,
                angle: Phaser.Math.Between(-15, 15),
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        });
    }

    createButtons(container, panelWidth, panelHeight) {
        // Button container
        const buttonContainer = this.add.container(0, panelHeight * 0.3);
        container.add(buttonContainer);

        // Button style
        const buttonWidth = 180;
        const buttonHeight = 60;
        const buttonSpacing = 30;

        // Restart button
        const restartButton = this.createButton(
            -buttonWidth - buttonSpacing / 2,
            0,
            buttonWidth,
            buttonHeight,
            'Restart',
            0x2e7d32,
            () => this.scene.start('GameScene')
        );

        // Main menu button
        const menuButton = this.createButton(
            buttonWidth / 2 + buttonSpacing / 2,
            0,
            buttonWidth,
            buttonHeight,
            'Main Menu',
            0x2e7d32,
            () => this.scene.start('TitleScene')
        );

        buttonContainer.add([restartButton.container, menuButton.container]);

        // Animate buttons entrance
        [restartButton.container, menuButton.container].forEach((btn, index) => {
            btn.y = 50;
            btn.alpha = 0;

            this.tweens.add({
                targets: btn,
                y: 0,
                alpha: 1,
                duration: 500,
                ease: 'Back.easeOut',
                delay: 500 + (index * 150)
            });
        });
    }

    createButton(x, y, width, height, label, color, callback) {
        const container = this.add.container(x, y);

        // Button shadow
        const shadow = this.add.rectangle(4, 4, width, height, 0x000000, 0.3)
            .setOrigin(0.5)
            .setRoundedRectangle(15);

        // Button background
        const button = this.add.rectangle(0, 0, width, height, color)
            .setOrigin(0.5)
            .setRoundedRectangle(15)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                button.setFillStyle(0x1b5e20);
                container.setScale(1.05);
                glow.setAlpha(0.5);
            })
            .on('pointerout', () => {
                button.setFillStyle(color);
                container.setScale(1);
                glow.setAlpha(0.2);
            })
            .on('pointerdown', () => {
                this.tweens.add({
                    targets: container,
                    scale: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: callback
                });
            });

        // Button glow effect
        const glow = this.add.rectangle(0, 0, width + 10, height + 10, 0x81c784, 0.2)
            .setOrigin(0.5)
            .setRoundedRectangle(20);

        // Button text
        const text = this.add.text(0, 0, label, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add icon based on button type
        let icon;
        if (label === 'Restart') {
            // Create restart icon (circle with arrow)
            const iconContainer = this.add.container(-width / 2 + 30, 0);
            const circle = this.add.circle(0, 0, 12, 0xffffff);

            // Create arrow using graphics
            const arrow = this.add.graphics();
            arrow.fillStyle(color, 1);
            arrow.beginPath();
            arrow.moveTo(-5, -5);
            arrow.lineTo(5, 0);
            arrow.lineTo(-5, 5);
            arrow.closePath();
            arrow.fill();

            iconContainer.add([circle, arrow]);
            icon = iconContainer;
        } else {
            // Create home icon
            const iconContainer = this.add.container(-width / 2 + 30, 0);
            const home = this.add.graphics();
            home.fillStyle(0xffffff, 1);
            home.beginPath();
            home.moveTo(0, -10);
            home.lineTo(12, 0);
            home.lineTo(12, 10);
            home.lineTo(7, 10);
            home.lineTo(7, 3);
            home.lineTo(-7, 3);
            home.lineTo(-7, 10);
            home.lineTo(-12, 10);
            home.lineTo(-12, 0);
            home.closePath();
            home.fill();

            iconContainer.add(home);
            icon = iconContainer;
        }

        container.add([glow, shadow, button, text, icon]);

        // Add pulse animation to glow
        this.tweens.add({
            targets: glow,
            scaleX: 1.05,
            scaleY: 1.05,
            alpha: 0.3,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        return { container, button, text };
    }
}