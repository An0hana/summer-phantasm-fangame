const SettingsView = {
    render: (container, engine) => {
        const L = engine.localization;
        const audioManager = engine.audioManager;
        
        container.innerHTML = `
            <style>
                .settings-view {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .settings-panel {
                    width: 600px;
                    padding: 40px;
                    background-color: rgba(0, 0, 0, 0.75);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 15px;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    position: relative; /* allow absolute-positioned close button */
                }
                .settings-panel h2 {
                    text-align: center;
                    margin-top: 0;
                    margin-bottom: 40px;
                    font-size: 2.5em;
                }
                .setting-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .setting-item label {
                    flex: 0 0 120px;
                    font-size: 1.5em;
                }
                .setting-item input[type="range"] {
                    flex-grow: 1;
                    cursor: pointer;
                }
                .settings-buttons {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-around;
                }
                .settings-button { /* 沿用主菜单按钮样式 */
                    position: relative;
                    cursor: pointer;
                    width: clamp(10px, 25vw, 300px);
                    transition: transform 180ms cubic-bezier(.2,.8,.2,1), box-shadow 160ms ease, color 120ms ease;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .settings-button .button-img {
                    width: 100%;
                    transition: transform 180ms cubic-bezier(.2,.8,.2,1), filter 160ms ease;
                }
                .settings-button a {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: clamp(10px, 2vw, 300px);
                    color: white;
                }
                /* 悬停时略微放大，离开/点击后恢复 */
                .settings-button:hover {
                    transform: scale(1.06) translateZ(0);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.45);
                }
                .settings-button:hover .button-img {
                    transform: scale(1.08);
                }
                .settings-button:hover a { color: #F6E27A; /* 淡金色文字 */ }
                .settings-button:active,
                .settings-button.pressed {
                    transform: scale(0.985);
                    box-shadow: 0 3px 8px rgba(0,0,0,0.45) inset;
                }
                /* 右上角关闭按钮 */
                .settings-close {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 28px;
                    line-height: 1;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: background .12s ease, transform .12s ease;
                }
                .settings-close:hover { background: rgba(255,255,255,0.04); transform: scale(1.04); }
                .settings-close:active { transform: scale(0.98); }
                /* 仅针对退出登录和返回按钮的文字大小调整，保持一致 */
                #logout-btn a,
                #back-to-menu-btn a {
                    font-size: 25px; /* 可改为 18px/22px 或 使用 rem/em/clamp */
                }
            </style>
            <div class="view settings-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                <div class="settings-panel">
                    <button id="settings-close" class="settings-close" aria-label="关闭">×</button>
                    <h2>设置</h2>
                    <div class="setting-item">
                        <label for="bgm-volume">背景音乐</label>
                        <input type="range" id="bgm-volume" min="0" max="1" step="0.01" value="${audioManager.volumes.indexBgm}">
                    </div>
                    <div class="setting-item">
                        <label for="voice-volume">人物语音</label>
                        <input type="range" id="voice-volume" min="0" max="1" step="0.01" value="${audioManager.volumes.voice}">
                    </div>
                    <div class="settings-buttons">
                        <div id="logout-btn" class="settings-button">
                             <img class="button-img" src="./assets/img/button.png">
                             <a>退出登录</a>
                        </div>
                        <div id="back-to-menu-btn" class="settings-button">
                             <img class="button-img" src="./assets/img/button.png">
                             <a>返回</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    attachEventListeners: (container, engine, params = {}) => {
        const bgmSlider = document.getElementById('bgm-volume');
        const voiceSlider = document.getElementById('voice-volume');
        const logoutBtn = document.getElementById('logout-btn');
        const backBtn = document.getElementById('back-to-menu-btn');
    const closeBtn = document.getElementById('settings-close');

        // 实时更新音量
        bgmSlider.addEventListener('input', () => {
            // 注意：主菜单BGM被标记为isIndex=true，所以我们调整indexBgm
            engine.audioManager.setVolume('indexBgm', bgmSlider.value);
            // 同时，为了游戏内BGM也能被设置，我们也更新gameBgm
            engine.audioManager.setVolume('gameBgm', bgmSlider.value);
        });

        voiceSlider.addEventListener('input', () => {
            engine.audioManager.setVolume('voice', voiceSlider.value);
        });

        // 退出登录
        if (logoutBtn) {
            logoutBtn.setAttribute('role', 'button');
            logoutBtn.setAttribute('tabindex', '0');
            logoutBtn.setAttribute('aria-label', '退出登录');
            const doLogout = (e) => {
                if (e) e.stopPropagation();
                logoutBtn.classList.remove('pressed');
                try { logoutBtn.blur(); } catch (ex) {}
                engine.audioManager.playSoundEffect('click');
                if (confirm('您确定要退出登录吗？')) {
                    engine.logout(); // 调用引擎的登出方法
                }
            };
            logoutBtn.addEventListener('click', doLogout);
            logoutBtn.addEventListener('touchstart', (e) => { e.stopPropagation(); logoutBtn.classList.add('pressed'); }, {passive:true});
            logoutBtn.addEventListener('touchend', (e) => { e.stopPropagation(); logoutBtn.classList.remove('pressed'); doLogout(e); });
            logoutBtn.addEventListener('mouseleave', () => { logoutBtn.classList.remove('pressed'); });
            logoutBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doLogout(e); } });
        }

        // 返回主菜单
        if (backBtn) {
            backBtn.setAttribute('role', 'button');
            backBtn.setAttribute('tabindex', '0');
            backBtn.setAttribute('aria-label', '返回主菜单');
            const doBack = (e) => {
                if (e) e.stopPropagation();
                backBtn.classList.remove('pressed');
                try { backBtn.blur(); } catch (ex) {}
                engine.audioManager.playSoundEffect('click');
                engine.showView('MainMenu');
            };
            backBtn.addEventListener('click', doBack);
            backBtn.addEventListener('touchstart', (e) => { e.stopPropagation(); backBtn.classList.add('pressed'); }, {passive:true});
            backBtn.addEventListener('touchend', (e) => { e.stopPropagation(); backBtn.classList.remove('pressed'); doBack(e); });
            backBtn.addEventListener('mouseleave', () => { backBtn.classList.remove('pressed'); });
            backBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doBack(e); } });
        }

        // 添加悬停音效
        container.querySelectorAll('.settings-button').forEach(button => {
            button.addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));
        });

        // 右上角关闭 × 按钮：若来自游戏（params.from==='Game'）则 resume；若来自主菜单则返回上一个菜单
        if (closeBtn) {
            closeBtn.setAttribute('role', 'button');
            closeBtn.setAttribute('tabindex', '0');
            closeBtn.addEventListener('click', async (e) => {
                if (e) e.stopPropagation();
                try { engine.audioManager.playSoundEffect('click'); } catch (ex) {}
                const from = params && params.from ? params.from : null;
                if (from === 'Game') {
                    // 从游戏中打开设置：行为等同继续游戏
                    if (typeof engine.resumeGame === 'function') {
                        try { await engine.resumeGame(); }
                        catch (err) {
                            console.error('resumeGame failed from settings close:', err);
                            if (typeof engine.startNewGame === 'function') engine.startNewGame();
                        }
                    } else if (typeof engine.startNewGame === 'function') {
                        engine.startNewGame();
                    }
                } else {
                    // 默认行为：返回到主菜单（或上一个菜单）
                    engine.showView('MainMenu');
                }
            });
            closeBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeBtn.click(); } });
        }
    }
};

export default SettingsView;