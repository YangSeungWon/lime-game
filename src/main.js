import Phaser from 'phaser/dist/phaser.js';
import GameScene from './scenes/GameScene.js';

const calculateGameSize = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 기본 게임 크기를 더 작게 설정 (4:3 비율)
    let baseWidth = 1600;
    let baseHeight = 1200;

    const ratio = baseWidth / baseHeight;

    let width = Math.min(windowWidth, baseWidth);
    let height = width / ratio;

    if (height > windowHeight) {
        height = Math.min(windowHeight, baseHeight);
        width = height * ratio;
    }

    return { width, height };
};

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: calculateGameSize().width,
        height: calculateGameSize().height
    },
    backgroundColor: '#e0f7df',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);

// 창 크기 변경 시 게임 크기 조정
window.addEventListener('resize', () => {
    const newSize = calculateGameSize();
    game.scale.resize(newSize.width, newSize.height);
}); 