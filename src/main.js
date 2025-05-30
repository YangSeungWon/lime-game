// SEO를 위한 메타 정보 설정
document.title = "라임 퍼즐 게임"; // 게임 제목을 적절히 수정해주세요

const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = '라임을 합쳐 숫자 10을 만들어보세요. 순발력과 계산력을 테스트해보세요.';
document.head.appendChild(metaDescription);

const metaKeywords = document.createElement('meta');
metaKeywords.name = 'keywords';
metaKeywords.content = 'game, puzzle, 사과게임, 라임게임'; // 게임 특성에 맞게 키워드 수정
document.head.appendChild(metaKeywords);

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [TitleScene, GameScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 375,
            height: 667
        },
        max: {
            width: 900,
            height: 450
        }
    }
};

const game = new Phaser.Game(config);

// 디바운스 함수 추가
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 리사이즈 핸들러 단순화
const handleResize = debounce(() => {
    // 게임이 실행 중인 경우에만 재계산
    if (game.scene.scenes.length > 0) {
        const currentScene = game.scene.getScenes(true)[0];
        if (currentScene.calculateGameArea) {
            currentScene.calculateGameArea();
        }
    }
}, 100);

// 창 크기 변경 이벤트에 개선된 핸들러 연결
window.addEventListener('resize', handleResize);

// 초기 크기 설정
handleResize(); 