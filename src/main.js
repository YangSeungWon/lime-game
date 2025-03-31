const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1600,
    height: 1200,
    scene: [TitleScene, GameScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

// 창 크기 변경 시 게임 크기 조정
window.addEventListener('resize', () => {
    const newSize = calculateGameSize();
    game.scale.resize(newSize.width, newSize.height);
}); 