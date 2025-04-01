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
        this.lastSelectionTime = 0;
        this.lastSelectionString = '';
        this.isGameOver = false;
        this.gameOverPanel = null;
        this.darkOverlay = null;
        this.bgMusic = null;
    }

    preload() {
        // Load audio files
        this.load.audio('bgm', 'assets/audio/bgm.ogg');
        this.load.audio('pop', 'assets/audio/pop.ogg');
        this.load.audio('success', 'assets/audio/success.ogg');
    }

    create() {
        // Play background music
        this.bgMusic = this.sound.add('bgm', {
            volume: 0.4,
            loop: true
        });
        this.bgMusic.play();

        // Add sound effects
        this.popSound = this.sound.add('pop', { volume: 0.6 });
        this.successSound = this.sound.add('success', { volume: 0.7 });

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
        const padding = width * 0.03;

        // Check if screen is portrait (height > width)
        const isPortrait = height > width;

        // Timer area calculation
        const timerHeight = height * 0.1; // 10% of screen height for timer
        this.timerArea = {
            x: 0,
            y: 0,
            width: width,
            height: timerHeight
        };

        // Calculate available space for the grid
        const availableWidth = width - (padding * 2);
        const availableHeight = height - timerHeight - (padding * 2);

        // Calculate cell size based on orientation
        let cellSize;
        if (isPortrait) {
            // Portrait: 17x10 grid
            const cellWidth = availableWidth / 10;
            const cellHeight = availableHeight / 17;
            cellSize = Math.min(cellWidth, cellHeight);
        } else {
            // Landscape: 10x17 grid
            const cellWidth = availableWidth / 17;
            const cellHeight = availableHeight / 10;
            cellSize = Math.min(cellWidth, cellHeight);
        }

        // Calculate actual grid dimensions
        const cols = isPortrait ? 10 : 17;
        const rows = isPortrait ? 17 : 10;
        const actualGridWidth = cellSize * cols;
        const actualGridHeight = cellSize * rows;

        // Center the grid horizontally and vertically
        this.gameArea = {
            x: (width - actualGridWidth) / 2,
            y: timerHeight + ((height - timerHeight - actualGridHeight) / 2),
            width: actualGridWidth,
            height: actualGridHeight,
            cellSize: cellSize
        };

        this.gridDimensions = { rows, cols };
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
        const { rows, cols } = this.gridDimensions;

        // Create grid container for better organization
        this.gridContainer = this.add.container(0, 0);

        // Initialize limes array with correct dimensions
        this.limes = new Array(rows);
        for (let i = 0; i < rows; i++) {
            this.limes[i] = new Array(cols).fill(null);
        }

        console.log('Initialized limes array:', rows, 'x', cols);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
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
            }
        }
    }

    createUI() {
        // Create UI container
        this.uiContainer = this.add.container(0, 0);

        // Score display with improved styling
        const scorePanel = this.add.rectangle(
            this.scale.width * 0.15,
            this.timerArea.height / 2,
            this.scale.width * 0.2,
            this.timerArea.height * 0.8,
            0xffffff,
            0.7
        ).setOrigin(0.5).setStrokeStyle(2, 0x81c784);

        this.scoreText = this.add.text(
            scorePanel.x,
            scorePanel.y,
            'Score: 0',
            {
                fontSize: `${this.scale.height * 0.03}px`,
                color: '#2e7d32',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                resolution: 2
            }
        ).setOrigin(0.5);

        this.uiContainer.add([scorePanel, this.scoreText]);

        // Timer area with improved visuals
        const timerPanel = this.add.rectangle(
            this.scale.width * 0.5,
            this.timerArea.height / 2,
            this.scale.width * 0.4,
            this.timerArea.height * 0.8,
            0xffffff,
            0.2
        ).setOrigin(0.5).setStrokeStyle(2, 0x81c784);

        this.uiContainer.add(timerPanel);

        // Timer label
        const timerLabel = this.add.text(
            timerPanel.x - timerPanel.width * 0.2,
            timerPanel.y,
            'TIME',
            {
                fontSize: `${this.scale.height * 0.025}px`,
                color: '#2e7d32',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                resolution: 2
            }
        ).setOrigin(0.5);

        this.uiContainer.add(timerLabel);

        // Time bar container
        const timeBarWidth = timerPanel.width * 0.4;
        const timeBarHeight = timerPanel.height * 0.6;
        const timeBarX = timerPanel.x + timeBarWidth * 0.1;
        const timeBarY = timerPanel.y - timeBarHeight / 2;

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
            timeBarY,
            timeBarWidth,
            timeBarHeight,
            0x4caf50
        ).setOrigin(0, 0);

        this.uiContainer.add(this.timeBar);

        // Time bar highlight
        this.timeBarHighlight = this.add.rectangle(
            timeBarX + timeBarWidth * 0.7,
            timeBarY,
            timeBarWidth * 0.3,
            timeBarHeight,
            0xffffff
        ).setOrigin(0, 0).setAlpha(0.2);

        this.uiContainer.add(this.timeBarHighlight);

        // Time text
        this.timeText = this.add.text(
            timerPanel.x + timerPanel.width * 0.3,
            timerPanel.y,
            this.timeLeft.toString(),
            {
                fontSize: `${this.scale.height * 0.03}px`,
                color: '#2e7d32',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                resolution: 2
            }
        ).setOrigin(0.5);

        this.uiContainer.add(this.timeText);
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
        }

        this.selectedLimes = [];
    }

    handleSuccessfulSelection() {
        // Play success sound
        this.popSound.play();

        // 기본 점수 계산
        const pointsEarned = this.selectedLimes.length;

        // 점수 업데이트
        this.score += pointsEarned;
        this.scoreText.setText('Score: ' + this.score);

        // 라임 애니메이션
        this.animateSuccessfulLimes();
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
                '+1',
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
    }

    createNewLime(row, col) {
        // Validate row and column
        if (typeof row !== 'number' || typeof col !== 'number') {
            console.error('Invalid row or column type:', { row, col });
            return null;
        }

        const { rows, cols } = this.gridDimensions;

        if (row < 0 || row >= rows || !this.limes[row]) {
            console.error('Invalid row:', row);
            return null;
        }
        if (col < 0 || col >= cols) {
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
        // Calculate elapsed time in seconds since game start
        const elapsedTime = (time - this.lastUpdateTime) / 1000;
        const currentTime = Math.max(0, this.initialTime - elapsedTime);

        if (currentTime <= 0) {
            this.timeLeft = 0;
            this.gameOver();
            return;
        }

        this.timeLeft = Math.ceil(currentTime);

        // Update time bar height smoothly
        const progress = currentTime / this.initialTime;

        // Update time bar and highlight sizes
        this.timeBar.setScale(1, progress);
        this.timeBarHighlight.setScale(1, progress);

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
        if (this.isGameOver) return;
        this.isGameOver = true;

        // Stop background music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }

        // Play success sound
        this.successSound.play();

        // 기존 요소들 제거
        if (this.gameOverPanel) this.gameOverPanel.destroy();
        if (this.darkOverlay) this.darkOverlay.destroy();

        // 어두운 오버레이
        this.darkOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
            .setOrigin(0)
            .setAlpha(0)
            .setDepth(998);

        this.tweens.add({
            targets: this.darkOverlay,
            alpha: 0.6,
            duration: 500
        });

        // 게임오버 패널 크기 축소
        const panelWidth = this.scale.width * 0.4; // 0.8에서 0.4로 축소
        const panelHeight = this.scale.height * 0.5; // 0.7에서 0.5로 축소
        this.gameOverPanel = this.add.container(this.scale.width / 2, this.scale.height / 2)
            .setDepth(999);

        // 패널 배경
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0xffffff, 1);
        panelBg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        panelBg.lineStyle(2, 0x81c784);
        panelBg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);

        // 트로피 아이콘 크기 축소
        const trophyBg = this.add.circle(0, -panelHeight * 0.3, 32, 0xf1f8e9);
        const trophy = this.add.text(0, -panelHeight * 0.3, '🏆', { fontSize: '32px' }).setOrigin(0.5);

        this.tweens.add({
            targets: trophy,
            angle: 360,
            duration: 1000,
            ease: 'Cubic.easeOut'
        });

        // Game Over 텍스트 크기 축소
        const gameOverText = this.add.text(0, -panelHeight * 0.15, 'GAME OVER', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            color: '#2e7d32'
        }).setOrigin(0.5);

        // 점수 컨테이너 크기 축소
        const scoreContainer = this.add.container(0, 0);
        const scoreBg = this.add.rectangle(0, 0, panelWidth * 0.8, panelHeight * 0.2, 0xf1f8e9)
            .setOrigin(0.5);

        const scoreLabel = this.add.text(0, -20, 'FINAL SCORE', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#33691e'
        }).setOrigin(0.5);

        const scoreText = this.add.text(0, 10, this.score.toString(), {
            fontSize: '42px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            color: '#2e7d32'
        }).setOrigin(0.5);

        scoreContainer.add([scoreBg, scoreLabel, scoreText]);

        // 버튼 크기 축소
        const buttonY = panelHeight * 0.25;
        const restartButton = this.createStylizedButton(
            -panelWidth * 0.25,
            buttonY,
            'Restart',
            0x2e7d32,
            () => {
                // 버튼 클릭 시 모든 게임오버 관련 요소 제거
                this.isGameOver = false;
                if (this.gameOverPanel) this.gameOverPanel.destroy();
                if (this.darkOverlay) this.darkOverlay.destroy();
                this.scene.restart();
            }
        );

        const menuButton = this.createStylizedButton(
            panelWidth * 0.25,
            buttonY,
            'Main Menu',
            0xffffff,
            () => {
                // 버튼 클릭 시 모든 게임오버 관련 요소 제거
                this.isGameOver = false;
                if (this.gameOverPanel) this.gameOverPanel.destroy();
                if (this.darkOverlay) this.darkOverlay.destroy();
                this.scene.start('TitleScene');
            },
            true
        );

        // 모든 요소를 패널에 추가
        this.gameOverPanel.add([panelBg, trophyBg, trophy, gameOverText, scoreContainer, restartButton, menuButton]);

        // 패널 등장 애니메이션
        this.gameOverPanel.setScale(0.8);
        this.gameOverPanel.setAlpha(0);

        this.tweens.add({
            targets: this.gameOverPanel,
            scale: 1,
            alpha: 1,
            duration: 800,
            ease: 'Back.easeOut'
        });
    }

    createStylizedButton(x, y, text, color, callback, isOutline = false) {
        const buttonWidth = 120;
        const buttonHeight = 40;
        const button = this.add.container(x, y);

        // 버튼 배경을 히트영역으로 사용
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, color)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        if (isOutline) {
            bg.setStrokeStyle(2, 0x2e7d32);
            bg.setFillStyle(0xffffff);
        }

        const buttonText = this.add.text(0, 0, text, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: isOutline ? '#2e7d32' : '#ffffff'
        }).setOrigin(0.5);

        button.add([bg, buttonText]);

        // 버튼 인터랙션 이벤트
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 100
            });
        });

        // 클릭 이벤트를 명확하게 설정
        bg.on('pointerdown', () => {
            // 클릭 효과 추가
            this.tweens.add({
                targets: button,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    if (callback) callback();
                }
            });
        });

        return button;
    }
}