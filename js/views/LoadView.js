const LoadView = {
    totalSlots: 30, // 固定存档槽数量

    // 渲染函数：生成并插入存档界面的 HTML 结构
    render: (container, engine, params = {}) => {
        const L = engine.localization; // 本地化工具
        const saves = engine.saveManager.currentUser.saveArray;
        const from = params && params.from ? params.from : null;

        // 主体界面 HTML
        container.innerHTML = `
            <div class="view load-view">
                <!-- 背景图片 -->
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>

                <!-- 顶部导航栏 -->
                <nav class="navbar">
                    <span class="main-menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <a>存档系统</a>
                    </span>

                    ${from === 'MainMenu' ? '' : `
                    <button id="resume-btn" class="main-menu-button" style="background:none;border:none;font-family: 'lilyshow', 'FangSong', '仿宋', 'SimSun', sans-serif;">
                        <img class="button-img" src="./assets/img/button.png">
                        <a>${L.get('ui.continue')}</a>
                    </button>
                    `}
                    
                    <button id="back-to-menu" class="main-menu-button" style="background:none;border:none;font-family: 'lilyshow', 'FangSong', '仿宋', 'SimSun', sans-serif;">
                        <img class="button-img" src="./assets/img/button.png">
                        <a>${L.get('ui.title')}</a>
                    </button>
                </nav>

                <!-- 存档槽容器 -->
                <div class="save-slots-container"></div>
            </div>
        `;

        // 渲染所有存档槽
        const slotsContainer = container.querySelector('.save-slots-container');
        for (let i = 0; i < LoadView.totalSlots; i++) {
            const save = saves[i] || null;
            const nodeData = save ? engine.dataManager.getNode(save.nodeId) : null;
            const thumbnail = nodeData && nodeData.bgr ? `./assets/img/bgr/${nodeData.bgr}.png` : './assets/img/bgr/test.png';
            const chapter = nodeData ? `章节 ${Math.floor(save.nodeId / 100)}` : '---';
            const saveDate = save ? save.saveDate : '空';
            const saveName = save && save.name ? save.name : `存档 ${i + 1}`;

            const slot = document.createElement('div');
            slot.className = 'save-slot';
            slot.innerHTML = `
                <img class="save-slot-bg" src="./assets/img/menuBox/paper2.png">
                <div class="save-info">
                    <h2>${saveName}</h2>
                    <p class="save-date">${saveDate}</p>
                    <div class="save-buttons">
                        <div class="action-button" data-action="load" data-slot="${i}">
                            <img class="button-icon" src="./assets/img/load.png">
                            <img class="button-icon-hover" src="./assets/img/load_hover.png">
                        </div>
                        <div class="action-button" data-action="save" data-slot="${i}">
                            <img class="button-icon" src="./assets/img/save.png">
                            <img class="button-icon-hover" src="./assets/img/save_hover.png">
                        </div>
                         <div class="action-button" data-action="delete" data-slot="${i}">
                            <img class="button-icon" src="./assets/img/delete.png">
                            <img class="button-icon-hover" src="./assets/img/delete_hover.png">
                        </div>
                    </div>
                </div>
                <div class="save-chapter">${chapter}</div>
                <div class="save-thumbnail"><img src="${thumbnail}" style="border-radius:10px"></div>
            `;
            slotsContainer.appendChild(slot);
        }

        // 绑定事件（传入 params 以便事件处理器知道来源）
        LoadView.attachEventListeners(container, engine, params);
    },

    // 绑定全局事件监听器
    attachEventListeners: (container, engine, params = {}) => {
        const backBtn = document.getElementById('back-to-menu');
        if (backBtn) backBtn.addEventListener('click', () => engine.showView('MainMenu'));

        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', async () => {
                try { engine.audioManager.playSoundEffect && engine.audioManager.playSoundEffect('click'); } catch (e) {}
                // 恢复优先：尝试 resumeGame，若不可用或抛错则回退为 startNewGame
                if (typeof engine.resumeGame === 'function') {
                    try {
                        await engine.resumeGame();
                    } catch (e) {
                        console.error('resumeGame failed:', e);
                        if (typeof engine.startNewGame === 'function') engine.startNewGame();
                    }
                } else if (typeof engine.startNewGame === 'function') {
                    engine.startNewGame();
                }
            });
        }

        // 给存档槽按钮绑定事件
        LoadView.bindSlotButtons(container, engine);
    },

    // 给存档槽里的按钮绑定事件
    bindSlotButtons: (container, engine) => {
        container.querySelectorAll('.action-button').forEach(button => {
            if (!button.dataset.bound) {
                button.dataset.bound = "true";

                button.addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));
                button.addEventListener('click', (e) => {
                    engine.audioManager.playSoundEffect('click');
                    const action = e.currentTarget.dataset.action;
                    const slot = parseInt(e.currentTarget.dataset.slot);

                    if (action === 'load') {
                        const saveData = engine.saveManager.loadGame(slot);
                        if (saveData) {
                            engine.startGame(saveData);
                        } else {
                            alert("空存档，无法读取。");
                        }
                    } else if (action === 'save') {
                        if (engine.gameState.currentSave) {
                            const currentSave = engine.saveManager.currentUser.saveArray[slot];
                            const defaultName = currentSave && currentSave.name ? currentSave.name : `章节 ${Math.floor(engine.gameState.currentSave.nodeId / 100)}`;
                            const saveName = prompt('请输入存档名称：', defaultName);

                            if (saveName && saveName.trim() !== "") {
                                if (engine.saveManager.saveGame(slot, engine.gameState.currentSave, saveName.trim())) {
                                    alert(`存档 "${saveName.trim()}" 已成功保存到栏位 ${slot + 1}！`);
                                    LoadView.render(container, engine);
                                }
                            } else if (saveName !== null) {
                                alert("存档名称不能为空。");
                            }
                        } else {
                            alert("没有正在进行的游戏可以存档。");
                        }
                    } else if (action === 'delete') {
                        if (engine.saveManager.currentUser.saveArray[slot]) {
                            if (confirm(`您确定要删除 存档 ${slot + 1} 吗？此操作不可恢复。`)) {
                                if (engine.saveManager.deleteSave(slot)) {
                                    alert(`存档 ${slot + 1} 已被删除。`);
                                    LoadView.render(container, engine);
                                }
                            }
                        } else {
                            alert("这是一个空存档，无需删除。");
                        }
                    }
                });
            }
        });
    }
};

export default LoadView;