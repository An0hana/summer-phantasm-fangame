import { Game as PlatformerGame } from '../../minigames/platformer/js/core/Game.js';

const MinigameView = {
    gameInstance: null,
    assetManager: null, 

    render: (container, engine, params) => {
        const node = params.nodeData;
        
        container.innerHTML = `
            <style>
                .minigame-canvas { display: block; width: 100vw; height: 100vh; }
                
                /* 介绍和结果浮层的通用样式 */
                .minigame-overlay {
                    position: fixed; top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, 0.85); color: white;
                    display: flex; justify-content: center; align-items: center;
                    text-align: center; z-index: 1001;
                    font-family: 'FangSong', '仿宋', sans-serif;
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                }
                .overlay-content {
                    max-width: 600px; padding: 40px;
                    border: 2px solid #aaa; background-color: rgba(10, 10, 10, 0.7);
                    border-radius: 10px;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.5);
                }
                .overlay-content h2 { font-size: 2.5em; margin-bottom: 20px; }
                .overlay-content p { font-size: 1.2em; line-height: 1.6; margin-bottom: 30px; }
                .overlay-content .controls-hint { font-size: 1.1em; color: #ccc; margin-bottom: 40px; }
                .overlay-content button {
                    padding: 15px 40px; font-size: 1.5em; cursor: pointer;
                    background-color: #333; color: white; border: 2px solid white;
                    border-radius: 5px; transition: all 0.3s ease;
                }
                .overlay-content button:hover { background-color: white; color: black; }
                
                /* 特定样式 */
                #minigame-intro-overlay .overlay-content h2 { color: #5b6ba9ff; }
                #minigame-result-overlay { display: none; }

                /* 暂停按钮样式 */
                #minigame-pause-btn {
                    position: fixed;
                    top: 80px;
                    left: 20px;
                    z-index: 1002;
                    padding: 10px 20px;
                    font-size: 1.2em;
                    cursor: pointer;
                    background-color: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: 2px solid white;
                    border-radius: 8px;
                    font-family: 'lilyshow', 'FangSong', '仿宋', sans-serif;
                    display: none; /* 游戏开始前隐藏 */
                    transition: background-color 0.3s, color 0.3s;
                }
                #minigame-pause-btn:hover {
                    background-color: rgba(255, 255, 255, 0.9);
                    color: black;
                }

                /* 暂停菜单浮层样式 */
                #minigame-pause-overlay {
                    display: none; /* 默认隐藏 */
                }
                
                .pause-menu-content {
                    max-width: 750px;
                    padding: 25px 50px;
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    align-items: center;
                }

                .pause-menu-buttons {
                    display: flex;
                    justify-content: space-around;
                    width: 100%;
                    gap: 20px;
                }

                .pause-menu-content button {
                    font-size: 1.3em;
                    padding: 12px 0;
                    width: 180px;
                    flex-shrink: 0;
                }
            </style>
            <div class="view minigame-view">
                <!-- 介绍浮层 -->
                <div id="minigame-intro-overlay" class="minigame-overlay">
                    <div class="overlay-content">
                        <h2>记忆碎片</h2>
                        <p>${node.introText || '收集所有光芒以继续。'}</p>
                        <div class="controls-hint">A / D : 移动  |  W : 跳跃</div>
                        <button id="minigame-start-btn">开始</button>
                    </div>
                </div>

                <!-- 结果浮层 -->
                <div id="minigame-result-overlay" class="minigame-overlay">
                    <div class="overlay-content">
                        <h2 id="result-title"></h2>
                        <p id="result-text"></p>
                        <button id="minigame-continue-btn">继续</button>
                    </div>
                </div>
                
                <!-- 暂停按钮 -->
                <button id="minigame-pause-btn">暂停</button>

                <!-- 暂停菜单浮层 -->
                <div id="minigame-pause-overlay" class="minigame-overlay">
                    <div class="overlay-content pause-menu-content">
                        <h2>游戏已暂停</h2>
                        <div class="pause-menu-buttons">
                            <button id="minigame-resume-btn">继续游戏</button>
                            <button id="minigame-restart-btn">重新开始</button>
                            <button id="minigame-load-view-btn">存档/读档</button>
                        </div>
                    </div>
                </div>

                <canvas id="minigame-canvas" class="minigame-canvas"></canvas>
                <div id="minigame-loading-overlay" class="minigame-overlay">正在加载小游戏资源...</div>
            </div>
        `;
    },

    attachEventListeners: async (container, engine, params) => {
        const node = params.nodeData;
        const canvas = document.getElementById('minigame-canvas');
        const introOverlay = document.getElementById('minigame-intro-overlay');
        const loadingOverlay = document.getElementById('minigame-loading-overlay');
        const startButton = document.getElementById('minigame-start-btn');

        const resultOverlay = document.getElementById('minigame-result-overlay');
        const resultTitle = document.getElementById('result-title');
        const resultText = document.getElementById('result-text');
        const continueButton = document.getElementById('minigame-continue-btn');
        
        const pauseButton = document.getElementById('minigame-pause-btn');
        const pauseOverlay = document.getElementById('minigame-pause-overlay');
        const resumeButton = document.getElementById('minigame-resume-btn');
        const restartButton = document.getElementById('minigame-restart-btn');
        const loadViewButton = document.getElementById('minigame-load-view-btn');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const onGameComplete = (result) => {
            console.log("MinigameView 收到完成回调:", result);
            pauseButton.style.display = 'none';

            const resultData = node.onComplete[result.status];
            if (!resultData) {
                console.error("未找到对应的游戏结果数据:", result.status);
                engine.showView('MainMenu');
                return;
            }
            
            resultTitle.textContent = node.resultTitle || '任务结果';
            resultText.textContent = resultData.outroText;
            resultTitle.style.color = result.status === 'win' ? '#5b6ba9ff' : '#bd504fff';
            
            resultOverlay.style.display = 'flex';

            continueButton.addEventListener('click', async () => {
                await engine.animation.play('fadeInBlack');

                if (MinigameView.gameInstance) {
                    MinigameView.gameInstance.destroy();
                    MinigameView.gameInstance = null;
                }
                
                const nextNodeId = resultData.targetNode;

                engine.gameState.currentSave.nodeId = nextNodeId;

                await engine.returnToGame();

                await engine.animation.play('fadeOutBlack');

            }, { once: true });
        };

        const startGame = async () => {
            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.destroy();
                MinigameView.gameInstance = null;
            }

            const gameConfig = {
                level: node.level, winCondition: node.winCondition,
                loseCondition: node.loseCondition, timeLimit: node.timeLimit
            };

            MinigameView.gameInstance = new PlatformerGame(canvas, gameConfig, onGameComplete);
            MinigameView.gameInstance.assetManager = MinigameView.assetManager; 
            
            try {
                await MinigameView.gameInstance.start();
                pauseButton.style.display = 'block';
            } catch (err) {
                console.error("小游戏启动失败:", err);
                onGameComplete({ status: 'lose' });
            }
        };

        if (!MinigameView.assetManager) {
            const tempGame = new PlatformerGame(canvas, {}, () => {});
            MinigameView.assetManager = tempGame.assetManager;
            try {
                 await MinigameView.assetManager.loadAll();
            } catch(err) {
                console.error("小游戏资源加载失败:", err);
                loadingOverlay.textContent = '资源加载失败，请刷新重试。';
                onGameComplete({ status: 'lose' });
                return;
            }
        }
        
        loadingOverlay.style.display = 'none';
        introOverlay.style.display = 'flex';

        startButton.addEventListener('click', async () => {
            introOverlay.style.display = 'none';
            await startGame();
        });

        pauseButton.addEventListener('click', () => {
            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.pause();
            }
            pauseOverlay.style.display = 'flex';
        });

        resumeButton.addEventListener('click', () => {
            pauseOverlay.style.display = 'none';
            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.resume();
            }
        });

        restartButton.addEventListener('click', async () => {
            pauseOverlay.style.display = 'none';
            await startGame();
        });

        loadViewButton.addEventListener('click', () => {
            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.pause();
            }
            engine.showView('Load', { from: 'Minigame' });
        });
    }
};

export default MinigameView;