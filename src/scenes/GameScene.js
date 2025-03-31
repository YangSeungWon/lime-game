export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.limes = [];
        this.selectedLimes = [];
        this.score = 0;
        this.initialTime = 60;
        this.timeLeft = this.initialTime;
        this.isSelecting = false;
        this.selectionRect = null;  // 선택 사각형
        this.dragStart = null;      // 드래그 시작 위치
        this.timeBar = null;
    }

    create() {
        // 게임 영역 계산
        this.calculateGameArea();

        // 게임 배경 설정
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xe0f7df).setOrigin(0);

        // 그리드 생성
        this.createGrid();

        // UI 생성
        this.createUI();

        // 입력 이벤트 설정
        this.setupInputEvents();
    }

    calculateGameArea() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 오른쪽에 타이머 영역 확보
        const timerWidth = width * 0.15; // 전체 너비의 15%를 타이머 영역으로
        const playWidth = width - timerWidth; // 실제 게임 영역 너비

        const padding = width * 0.03; // 3% 패딩

        // 게임 영역 계산 (타이머 영역을 제외한 나머지)
        this.gameArea = {
            x: padding,
            y: height * 0.12, // 상단 여백 축소
            width: playWidth - (padding * 2),
            height: height * 0.8, // 게임 영역 확대
            cellSize: 0
        };

        // 타이머 영역 계산
        this.timerArea = {
            x: playWidth,
            y: 0,
            width: timerWidth,
            height: height
        };

        // 셀 크기 계산 (17x10 그리드 기준)
        const cellWidth = this.gameArea.width / 17;
        const cellHeight = this.gameArea.height / 10;
        this.gameArea.cellSize = Math.min(cellWidth, cellHeight);
    }

    createGrid() {
        const startX = this.gameArea.x;
        const startY = this.gameArea.y;
        const cellSize = this.gameArea.cellSize;
        const limeRadius = cellSize * 0.4; // 셀 크기의 40%

        for (let row = 0; row < 10; row++) {
            this.limes[row] = [];
            for (let col = 0; col < 17; col++) {
                const x = startX + (col * cellSize) + (cellSize / 2);
                const y = startY + (row * cellSize) + (cellSize / 2);

                const lime = this.add.circle(x, y, limeRadius, 0x32CD32);
                const number = Phaser.Math.Between(1, 9);

                const text = this.add.text(x, y, number.toString(), {
                    fontSize: `${limeRadius}px`,
                    color: '#ffffff'
                }).setOrigin(0.5);

                lime.setInteractive();
                lime.setData({
                    number: number,
                    text: text,
                    row: row,
                    col: col,
                    isSelected: false
                });

                this.limes[row][col] = lime;
            }
        }
    }

    createUI() {
        // 점수 표시
        this.scoreText = this.add.text(
            this.gameArea.x,
            this.gameArea.y * 0.4,
            'Score: 0',
            {
                fontSize: `${this.scale.height * 0.04}px`,
                color: '#000000'
            }
        );

        // 타임바 생성
        const timeBarWidth = this.timerArea.width * 0.4;
        const timeBarHeight = this.timerArea.height * 0.7;
        const timeBarX = this.timerArea.x + (this.timerArea.width * 0.3);
        const timeBarY = this.timerArea.height * 0.85 - timeBarHeight; // 위치를 아래로 이동

        // 타임바 배경 (회색 배경)
        this.add.rectangle(
            timeBarX,
            timeBarY,
            timeBarWidth,
            timeBarHeight,
            0xcccccc
        ).setOrigin(0);

        // 실제 타임바 (초록색)
        this.timeBar = this.add.rectangle(
            timeBarX,
            timeBarY + timeBarHeight, // 시작 위치를 바닥으로
            timeBarWidth,
            timeBarHeight,
            0x00ff00
        ).setOrigin(0, 1); // 원점을 왼쪽 아래로 설정

        // 시간 텍스트
        this.timeText = this.add.text(
            timeBarX + (timeBarWidth / 2),
            timeBarY + timeBarHeight + this.scale.height * 0.05, // 텍스트를 타임바 아래로
            this.timeLeft.toString(),
            {
                fontSize: `${this.scale.height * 0.05}px`,
                color: '#000000'
            }
        ).setOrigin(0.5);

        // 타이머 영역 구분선 (시각적 구분을 위해)
        this.add.line(
            this.timerArea.x,
            0,
            0,
            0,
            0,
            this.scale.height,
            0x000000,
            0.2
        );

        // 타이머 설정
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    setupInputEvents() {
        this.input.on('pointerdown', (pointer) => {
            this.isSelecting = true;
            this.dragStart = { x: pointer.x, y: pointer.y };

            // 선택 사각형 색상을 빨간색으로 변경
            this.selectionRect = this.add.rectangle(
                pointer.x,
                pointer.y,
                0,
                0,
                0xff0000,  // 빨간색으로 변경
                0.3
            ).setOrigin(0);
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isSelecting && this.selectionRect) {
                // 사각형 크기 업데이트
                const width = pointer.x - this.dragStart.x;
                const height = pointer.y - this.dragStart.y;

                // 음수 값 처리를 위한 계산
                const x = width < 0 ? pointer.x : this.dragStart.x;
                const y = height < 0 ? pointer.y : this.dragStart.y;

                this.selectionRect.setPosition(x, y);
                this.selectionRect.setSize(Math.abs(width), Math.abs(height));

                // 사각형 내의 라임 선택
                this.selectLimesInRect();
            }
        });

        this.input.on('pointerup', () => {
            if (this.isSelecting) {
                this.checkSelection();
                this.isSelecting = false;

                // 선택 사각형 제거
                if (this.selectionRect) {
                    this.selectionRect.destroy();
                    this.selectionRect = null;
                }
            }
        });
    }

    selectLimesInRect() {
        // 이전 선택 초기화
        this.selectedLimes.forEach(lime => {
            lime.setFillStyle(0x32CD32);  // 기본 라임 색상으로 복구
            lime.setData('isSelected', false);
        });
        this.selectedLimes = [];

        // 사각형 범위 계산
        const bounds = this.selectionRect.getBounds();

        // 모든 라임을 확인하여 사각형 안에 있는 것들 선택
        this.limes.forEach(row => {
            row.forEach(lime => {
                if (lime.active && bounds.contains(lime.x, lime.y)) {
                    lime.setFillStyle(0x228B22);  // 선택된 라임을 더 진한 초록색으로
                    lime.setData('isSelected', true);
                    this.selectedLimes.push(lime);
                }
            });
        });
    }

    checkSelection() {
        const sum = this.selectedLimes.reduce((total, lime) => {
            return total + lime.getData('number');
        }, 0);

        if (sum === 10) {
            // 선택 성공
            this.selectedLimes.forEach(lime => {
                this.score += lime.getData('number');
                lime.getData('text').destroy();
                lime.destroy();
            });
            this.scoreText.setText('Score: ' + this.score);
        } else {
            // 선택 실패 - 원래 색상으로 복구
            this.selectedLimes.forEach(lime => {
                lime.setFillStyle(0x32CD32);  // 기본 라임 색상으로 복구
                lime.setData('isSelected', false);
            });
        }

        this.selectedLimes = [];
    }

    updateTimer() {
        this.timeLeft--;
        this.timeText.setText(this.timeLeft);

        // 타임바 높이 업데이트 (아래에서 위로 줄어듦)
        const progress = this.timeLeft / this.initialTime;
        const height = this.timerArea.height * 0.7 * progress;
        this.timeBar.setSize(this.timerArea.width * 0.4, height);

        // y 위치는 고정 (아래쪽 기준점)
        this.timeBar.setY(this.timerArea.height * 0.85);

        if (this.timeLeft <= 10) {
            this.timeBar.setFillStyle(0xff0000);
        }

        if (this.timeLeft <= 0) {
            this.timer.remove();
            this.gameOver();
        }
    }

    gameOver() {
        const centerX = this.gameArea.x + (this.gameArea.width / 2);
        const centerY = this.gameArea.y + (this.gameArea.height / 2);

        const gameOverText = this.add.text(centerX, centerY, 'GAME OVER', {
            fontSize: `${this.scale.height * 0.08}px`,
            color: '#000000'
        }).setOrigin(0.5);

        const finalScore = this.add.text(
            centerX,
            centerY + this.scale.height * 0.1,
            `Final Score: ${this.score}`,
            {
                fontSize: `${this.scale.height * 0.05}px`,
                color: '#000000'
            }
        ).setOrigin(0.5);

        this.input.enabled = false;
    }
} 