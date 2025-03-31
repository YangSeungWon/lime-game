import Phaser from 'phaser/dist/phaser.js';
import GameScene from './scenes/GameScene.js';

const calculateGameSize = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 기본 게임 크기를 더 작게 설정 (4:3 비율)
    let baseWidth = 640;  // 기존 800에서 축소
    let baseHeight = 480; // 기존 600에서 축소

    const ratio = baseWidth / baseHeight;

    let width = Math.min(windowWidth, baseWidth);
    let height = width / ratio;

    if (height > windowHeight) {
        height = Math.min(windowHeight, baseHeight);
        width = height * ratio;
    }

    return { width, height };
};

const gameSize = calculateGameSize();

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameSize.width,
        height: gameSize.height
    },
    backgroundColor: '#e0f7df',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);

// 창 크기 변경 시 게임 크기 조정
window.addEventListener('resize', () => {
    const newSize = calculateGameSize();
    game.scale.resize(newSize.width, newSize.height);
}); 