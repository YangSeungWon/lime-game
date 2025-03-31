class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.limes = [];
        this.selectedLimes = [];
        this.score = 0;
        this.initialTime = 120;
        this.timeLeft = this.initialTime;
        this.lastUpdateTime = 0;
        this.isSelecting = false;
        this.selectionRect = null;
        this.dragStart = null;
        this.timeBar = null;
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboText = null;
        this.lastSelectionTime = 0;
        this.lastSelectionString = '';
    }

    create() {
        // 17x10 크기의 2차원 배열 초기화
        const ROWS = 17;
        const COLS = 10;

        for (let i = 0; i < ROWS; i++) {
            this.limes[i] = new Array(COLS).fill(null);
        }

        console.log('Initialized limes array:', ROWS, 'x', COLS);

        // Calculate game area dimensions
        this.calculateGameArea();

        // Create background with pattern
        this.createBackground();

        // Create grid of limes
        this.createGrid();

        // Create UI elements
        this.createUI();

        // Setup input events
        this.setupInputEvents();

        // Store initial start time
        this.lastUpdateTime = this.game.getTime();
    }

    calculateGameArea() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Reserve space for timer area on the right
        const timerWidth = width * 0.15;
        const playWidth = width - timerWidth;
        const padding = width * 0.03;

        // Game area calculation (excluding timer area)
        this.gameArea = {
            x: padding,
            y: height * 0.15,
            width: playWidth - (padding * 2),
            height: height * 0.8,
            cellSize: 0
        };

        // Timer area calculation
        this.timerArea = {
            x: playWidth,
            y: 0,
            width: timerWidth,
            height: height
        };

        // Calculate cell size for 17x10 grid
        const cellWidth = this.gameArea.width / 17;
        const cellHeight = this.gameArea.height / 10;
        this.gameArea.cellSize = Math.min(cellWidth, cellHeight);
    }

    createBackground() {
        // Main background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xe8f5e9).setOrigin(0);

        // Create subtle pattern
        const pattern = this.add.graphics();
        pattern.fillStyle(0xc8e6c9, 0.3);

        for (let x = 0; x < this.scale.width; x += 40) {
            for (let y = 0; y < this.scale.height; y += 40) {
                if ((x + y) % 80 === 0) {
                    pattern.fillCircle(x, y, 5);
                }
            }
        }

        // Add decorative elements
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(0, this.scale.width);
            const y = Phaser.Math.Between(0, this.scale.height);
            const size = Phaser.Math.Between(100, 200);

            const decoration = this.add.circle(x, y, size, 0xa5d6a7, 0.1);
            this.tweens.add({
                targets: decoration,
                scale: 1.2,
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createGrid() {
        const startX = this.gameArea.x;
        const startY = this.gameArea.y;
        const cellSize = this.gameArea.cellSize;
        const limeRadius = cellSize * 0.38;

        // Create grid container for better organization
        this.gridContainer = this.add.container(0, 0);

        for (let row = 0; row < 10; row++) {
            this.limes[row] = [];
            for (let col = 0; col < 17; col++) {
                const x = startX + (col * cellSize) + (cellSize / 2);
                const y = startY + (row * cellSize) + (cellSize / 2);

                // Create lime with improved visuals
                const limeGroup = this.add.container(x, y);

                // Shadow for depth
                const shadow = this.add.circle(2, 2, limeRadius, 0x000000, 0.2);

                // Main lime circle
                const lime = this.add.circle(0, 0, limeRadius, 0x7cb342);
                lime.setStrokeStyle(2, 0x558b2f);

                // Highlight effect
                const highlight = this.add.circle(-limeRadius * 0.3, -limeRadius * 0.3, limeRadius * 0.25, 0xffffff, 0.3);

                // Number text with improved styling
                const number = Phaser.Math.Between(1, 9);
                const text = this.add.text(0, 0, number.toString(), {
                    fontSize: `${limeRadius * 1.2}px`,
                    color: '#ffffff',
                    fontFamily: 'Arial, sans-serif',
                    fontStyle: 'bold',
                    resolution: 2
                }).setOrigin(0.5);

                // Add shadow to text
                text.setShadow(1, 1, 'rgba(0,0,0,0.5)', 3);

                // Add all elements to the lime group
                limeGroup.add([shadow, lime, highlight, text]);

                // Make interactive
                lime.setInteractive({ useHandCursor: true });
                lime.input.hitArea.setTo(-limeRadius, -limeRadius, limeRadius * 2, limeRadius * 2);

                // Store data with the lime
                lime.setData({
                    number: number,
                    text: text,
                    group: limeGroup,
                    row: row,
                    col: col,
                    isSelected: false
                });

                // Add to grid container
                this.gridContainer.add(limeGroup);
                this.limes[row][col] = lime;

                // Add subtle idle animation
                this.tweens.add({
                    targets: limeGroup,
                    y: y + Phaser.Math.Between(-2, 2),
                    duration: Phaser.Math.Between(2000, 4000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    delay: Phaser.Math.Between(0, 1000)
                });
            }
        }
    }

    createUI() {
        // Create UI container
        this.uiContainer = this.add.container(0, 0);

        // Score display with improved styling
        const scorePanel = this.add.rectangle(
            this.gameArea.x,
            this.gameArea.y * 0.4,
            this.gameArea.width * 0.2,
            this.gameArea.y * 0.5,
            0xffffff,
            0.7
        ).setOrigin(0, 0.5).setStrokeStyle(2, 0x81c784);

        this.scoreText = this.add.text(
            scorePanel.x + scorePanel.width / 2,
            scorePanel.y,
            'Score: 0',
            {
                fontSize: `${this.scale.height * 0.04}px`,
                color: '#2e7d32',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                resolution: 2
            }
        ).setOrigin(0.5);

        this.uiContainer.add([scorePanel, this.scoreText]);

        // Combo text
        this.comboText = this.add.text(
            this.scoreText.x,
            this.scoreText.y + this.scoreText.height + 10,
            '',
            {
                fontSize: `${this.scale.height * 0.03}px`,
                color: '#ff6d00',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                resolution: 2
            }
        ).setOrigin(0.5).setAlpha(0);

        this.uiContainer.add(this.comboText);

        // Timer area with improved visuals
        const timerPanel = this.add.rectangle(
            this.timerArea.x + this.timerArea.width * 0.5,
            this.timerArea.height * 0.5,
            this.timerArea.width * 0.8,
            this.timerArea.height * 0.9,
            0xffffff,
            0.2
        ).setOrigin(0.5).setStrokeStyle(2, 0x81c784);

        this.uiContainer.add(timerPanel);

        // Timer label
        const timerLabel = this.add.text(
            timerPanel.x,
            timerPanel.y - timerPanel.height * 0.4,
            'TIME',
            {
                fontSize: `${this.scale.height * 0.03}px`,
                color: '#2e7d32',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                resolution: 2
            }
        ).setOrigin(0.5);

        this.uiContainer.add(timerLabel);

        // Time bar container
        const timeBarWidth = this.timerArea.width * 0.4;
        const timeBarHeight = this.timerArea.height * 0.6;
        const timeBarX = timerPanel.x - timeBarWidth / 2;
        const timeBarY = timerPanel.y - timeBarHeight / 2 + timerPanel.height * 0.1;

        // Time bar background
        const timeBarBg = this.add.rectangle(
            timeBarX,
            timeBarY,
            timeBarWidth,
            timeBarHeight,
            0x424242,
            0.8
        ).setOrigin(0, 0).setStrokeStyle(3, 0xffffff);

        this.uiContainer.add(timeBarBg);

        // Actual time bar
        this.timeBar = this.add.rectangle(
            timeBarX,
            timeBarY + timeBarHeight,
            timeBarWidth,
            timeBarHeight,
            0x4caf50
        ).setOrigin(0, 1);

        this.uiContainer.add(this.timeBar);

        // Time bar highlight
        this.timeBarHighlight = this.add.rectangle(
            timeBarX + timeBarWidth * 0.7,
            timeBarY + timeBarHeight,
            timeBarWidth * 0.3,
            timeBarHeight,
            0xffffff
        ).setOrigin(0, 1).setAlpha(0.2);

        this.uiContainer.add(this.timeBarHighlight);

        // Time text
        this.timeText = this.add.text(
            timerPanel.x,
            timeBarY + timeBarHeight + this.scale.height * 0.05,
            this.timeLeft.toString(),
            {
                fontSize: `${this.scale.height * 0.05}px`,
                color: '#2e7d32',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                resolution: 2
            }
        ).setOrigin(0.5);

        this.uiContainer.add(this.timeText);

        // Add a divider line
        const divider = this.add.line(
            this.timerArea.x,
            0,
            0,
            0,
            0,
            this.scale.height,
            0x81c784,
            0.5
        );

        this.uiContainer.add(divider);
    }

    setupInputEvents() {
        this.input.on('pointerdown', (pointer) => {
            this.isSelecting = true;
            this.dragStart = { x: pointer.x, y: pointer.y };

            // Create selection rectangle with improved visuals
            this.selectionRect = this.add.rectangle(
                pointer.x,
                pointer.y,
                0,
                0,
                0x4caf50,
                0.3
            ).setOrigin(0).setStrokeStyle(2, 0x2e7d32);
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isSelecting && this.selectionRect) {
                // Update rectangle size
                const width = pointer.x - this.dragStart.x;
                const height = pointer.y - this.dragStart.y;

                // Handle negative values
                const x = width < 0 ? pointer.x : this.dragStart.x;
                const y = height < 0 ? pointer.y : this.dragStart.y;

                this.selectionRect.setPosition(x, y);
                this.selectionRect.setSize(Math.abs(width), Math.abs(height));

                // Select limes in rectangle
                this.selectLimesInRect();
            }
        });

        this.input.on('pointerup', () => {
            if (this.isSelecting) {
                this.checkSelection();
                this.isSelecting = false;

                // Remove selection rectangle with fade out
                if (this.selectionRect) {
                    this.tweens.add({
                        targets: this.selectionRect,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => {
                            this.selectionRect.destroy();
                            this.selectionRect = null;
                        }
                    });
                }
            }
        });
    }

    selectLimesInRect() {
        // Reset previous selection
        this.selectedLimes.forEach(lime => {
            if (lime && lime.active) {
                const group = lime.getData('group');
                if (group) {
                    this.tweens.add({
                        targets: group,
                        scale: 1,
                        duration: 100
                    });
                }
                lime.setFillStyle(0x7cb342);
                lime.setData('isSelected', false);
            }
        });
        this.selectedLimes = [];

        // Check if selection rectangle exists
        if (!this.selectionRect) return;

        // Calculate rectangle bounds
        const bounds = this.selectionRect.getBounds();

        // Check all limes and select those within the rectangle
        this.limes.forEach((row, rowIndex) => {
            if (!row) return;
            row.forEach((lime, colIndex) => {
                if (lime && lime.active) {
                    const group = lime.getData('group');
                    if (!group) return;

                    if (bounds.contains(group.x, group.y)) {
                        lime.setFillStyle(0x558b2f);
                        lime.setData('isSelected', true);
                        this.selectedLimes.push(lime);

                        // Add selection animation
                        this.tweens.add({
                            targets: group,
                            scale: 1.1,
                            duration: 100
                        });
                    }
                }
            });
        });

        // Create a string representation of current selection for comparison
        const currentSelectionString = this.selectedLimes
            .map(lime => `${lime.getData('row')},${lime.getData('col')}`)
            .sort()
            .join('|');

        // Check if selection has changed
        if (currentSelectionString !== this.lastSelectionString) {
            this.lastSelectionString = currentSelectionString;
            this.lastSelectionTime = this.game.getTime();
        } else if (this.game.getTime() - this.lastSelectionTime > 100) { // 0.1초 경과
            // Calculate and update selection rectangle color based on sum
            const sum = this.calculateSum();
            if (sum === 10) {
                this.selectionRect.setFillStyle(0x4caf50, 0.4);
                this.selectionRect.setStrokeStyle(2, 0x2e7d32);
            } else if (sum > 10) {
                this.selectionRect.setFillStyle(0xf44336, 0.4);
                this.selectionRect.setStrokeStyle(2, 0xb71c1c);
            } else {
                this.selectionRect.setFillStyle(0x2196f3, 0.3);
                this.selectionRect.setStrokeStyle(2, 0x0d47a1);
            }
        }
    }

    calculateSum() {
        return this.selectedLimes.reduce((total, lime) => {
            return total + lime.getData('number');
        }, 0);
    }

    checkSelection() {
        const sum = this.calculateSum();

        if (sum === 10 && this.selectedLimes.length > 0) {
            // Successful selection
            this.handleSuccessfulSelection();
        } else {
            // Failed selection - restore original appearance
            this.selectedLimes.forEach(lime => {
                const group = lime.getData('group');
                lime.setFillStyle(0x7cb342);
                lime.setData('isSelected', false);

                // Add shake animation for failed selection
                this.tweens.add({
                    targets: group,
                    x: group.x + 3,
                    duration: 50,
                    yoyo: true,
                    repeat: 3,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        this.tweens.add({
                            targets: group,
                            scale: 1,
                            duration: 100
                        });
                    }
                });
            });

            // Reset combo
            this.resetCombo();
        }

        this.selectedLimes = [];
    }

    handleSuccessfulSelection() {
        // Increase combo count
        this.comboCount++;

        // Calculate points with combo multiplier
        const basePoints = this.selectedLimes.length;
        const comboMultiplier = Math.min(this.comboCount, 5);
        const pointsEarned = basePoints * comboMultiplier;

        // Update score
        this.score += pointsEarned;
        this.scoreText.setText('Score: ' + this.score);

        // Show combo text
        if (this.comboCount > 1) {
            this.comboText.setText(`Combo x${comboMultiplier}! +${pointsEarned}`);
            this.comboText.setAlpha(1);

            this.tweens.add({
                targets: this.comboText,
                scale: 1.3,
                duration: 200,
                yoyo: true,
                onComplete: () => {
                    this.tweens.add({
                        targets: this.comboText,
                        alpha: 0,
                        delay: 1000,
                        duration: 300
                    });
                }
            });
        }

        // Reset combo timer
        if (this.comboTimer) {
            this.comboTimer.remove();
        }

        // Set new combo timer
        this.comboTimer = this.time.delayedCall(3000, this.resetCombo, [], this);

        // Animate successful limes
        this.animateSuccessfulLimes();

        // Add time bonus (1 second per lime)
        this.lastUpdateTime -= (this.selectedLimes.length * 1000);
    }

    resetCombo() {
        this.comboCount = 0;
        if (this.comboTimer) {
            this.comboTimer.remove();
            this.comboTimer = null;
        }
    }

    animateSuccessfulLimes() {
        const bottomY = this.scale.height + 50;

        // Create a flash effect
        const flash = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0xffffff
        ).setAlpha(0);

        this.tweens.add({
            targets: flash,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            onComplete: () => flash.destroy()
        });

        // Animate each selected lime
        this.selectedLimes.forEach((lime, index) => {
            const group = lime.getData('group');
            const text = lime.getData('text');
            const startX = group.x;
            const startY = group.y;

            // Create score popup
            const scorePopup = this.add.text(
                startX,
                startY,
                '+' + lime.getData('number'),
                {
                    fontSize: '24px',
                    color: '#ffffff',
                    fontFamily: 'Arial, sans-serif',
                    fontStyle: 'bold',
                    stroke: '#2e7d32',
                    strokeThickness: 4
                }
            ).setOrigin(0.5).setDepth(1000);

            // Animate score popup
            this.tweens.add({
                targets: scorePopup,
                y: startY - 50,
                alpha: 0,
                duration: 800,
                ease: 'Quad.easeOut',
                onComplete: () => scorePopup.destroy()
            });

            // Set lime to top layer
            group.setDepth(100 + index);

            // First animation: bounce up
            this.tweens.add({
                targets: group,
                y: startY - 50,
                scale: 1.2,
                duration: 300,
                ease: 'Quad.easeOut',
                delay: index * 50,
                onComplete: () => {
                    // Second animation: fall down
                    this.tweens.add({
                        targets: group,
                        y: bottomY,
                        x: startX + Phaser.Math.Between(-100, 100),
                        angle: Phaser.Math.Between(-180, 180),
                        scale: 0.5,
                        alpha: 0,
                        duration: 600,
                        ease: 'Quad.easeIn',
                        onComplete: () => {
                            // Remove lime and text
                            group.destroy();

                            // Replace with a new lime
                            this.createNewLime(lime.getData('row'), lime.getData('col'));
                        }
                    });
                }
            });
        });

        // Play success sound (placeholder)
        // this.sound.play('success');
    }

    createNewLime(row, col) {
        // Validate row and column
        if (typeof row !== 'number' || typeof col !== 'number') {
            console.error('Invalid row or column type:', { row, col });
            return null;
        }

        if (row < 0 || row >= 10 || !this.limes[row]) {
            console.error('Invalid row:', row);
            return null;
        }
        if (col < 0 || col >= 17) {
            console.error('Invalid column:', col);
            return null;
        }

        const cellSize = this.gameArea.cellSize;
        const limeRadius = cellSize * 0.38;
        const x = this.gameArea.x + (col * cellSize) + (cellSize / 2);
        const y = this.gameArea.y - cellSize; // Start above the grid
        const targetY = this.gameArea.y + (row * cellSize) + (cellSize / 2);

        // Create new lime group
        const limeGroup = this.add.container(x, y);

        // Shadow
        const shadow = this.add.circle(2, 2, limeRadius, 0x000000, 0.2);

        // Main lime
        const lime = this.add.circle(0, 0, limeRadius, 0x7cb342);
        lime.setStrokeStyle(2, 0x558b2f);

        // Highlight
        const highlight = this.add.circle(-limeRadius * 0.3, -limeRadius * 0.3, limeRadius * 0.25, 0xffffff, 0.3);

        // Number
        const number = Phaser.Math.Between(1, 9);
        const text = this.add.text(0, 0, number.toString(), {
            fontSize: `${limeRadius * 1.2}px`,
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            resolution: 2
        }).setOrigin(0.5);

        text.setShadow(1, 1, 'rgba(0,0,0,0.5)', 3);

        // Add all elements to group
        limeGroup.add([shadow, lime, highlight, text]);

        // Make interactive
        lime.setInteractive({ useHandCursor: true });
        lime.input.hitArea.setTo(-limeRadius, -limeRadius, limeRadius * 2, limeRadius * 2);

        // Store data
        lime.setData({
            number: number,
            text: text,
            group: limeGroup,
            row: row,
            col: col,
            isSelected: false
        });

        // Add to grid container
        this.gridContainer.add(limeGroup);
        this.limes[row][col] = lime;

        // Animate falling into place
        this.tweens.add({
            targets: limeGroup,
            y: targetY,
            duration: 500,
            ease: 'Bounce.easeOut'
        });
    }

    update(time, delta) {
        // Smooth time bar update
        const currentTime = this.initialTime - (this.game.getTime() - this.lastUpdateTime) / 1000;

        if (currentTime <= 0) {
            this.timeLeft = 0;
            this.gameOver();
            return;
        }

        this.timeLeft = Math.ceil(currentTime);

        // Update time bar height smoothly
        const progress = currentTime / this.initialTime;
        const height = this.timeBar.height * progress;

        this.timeBar.setSize(this.timeBar.width, this.timeBar.height * progress);
        this.timeBarHighlight.setSize(this.timeBarHighlight.width, this.timeBar.height * progress);

        // Color gradient effect based on time remaining
        if (progress > 0.6) {
            this.timeBar.setFillStyle(0x4caf50); // Green
        } else if (progress > 0.3) {
            this.timeBar.setFillStyle(0xffc107); // Yellow
        } else {
            this.timeBar.setFillStyle(0xf44336); // Red

            // Add pulsing effect when time is low
            if (progress < 0.2 && Math.floor(currentTime) % 2 === 0) {
                this.timeBar.setAlpha(0.8);
            } else {
                this.timeBar.setAlpha(1);
            }
        }

        // Update time text
        if (this.timeText) {
            this.timeText.setText(Math.ceil(currentTime).toString());
        }

        // Update selection sum display if selecting
        if (this.isSelecting && this.selectedLimes.length > 0) {
            const sum = this.calculateSum();
            if (!this.sumText) {
                this.sumText = this.add.text(
                    this.scale.width / 2,
                    this.scale.height * 0.1,
                    `Sum: ${sum}/10`,
                    {
                        fontSize: '32px',
                        color: sum === 10 ? '#4caf50' : '#2196f3',
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold',
                        stroke: '#ffffff',
                        strokeThickness: 4
                    }
                ).setOrigin(0.5).setDepth(1000);
            } else {
                this.sumText.setText(`Sum: ${sum}/10`);
                this.sumText.setColor(sum === 10 ? '#4caf50' : sum > 10 ? '#f44336' : '#2196f3');
            }
        } else if (this.sumText) {
            this.sumText.destroy();
            this.sumText = null;
        }
    }

    gameOver() {
        // Transition to game over scene
        this.scene.start('GameOverScene', { score: this.score });
    }
}