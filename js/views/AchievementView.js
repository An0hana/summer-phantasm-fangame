// 成就界面视图对象
const AchievementView = {
    totalSlots: 52, // 固定成就槽数量

    render: (container, engine) => {
        const L = engine.localization;
        const allAchievements = engine.dataManager.getAllAchievements();
        const unlockedIds = engine.saveManager.currentUser.achievementArray;
        const lockedIcon = engine.dataManager.getLockedAchievementIcon();

        // 获取要显示的成就（最多 totalSlots 个）
        const achievementsToRender = allAchievements.slice(0, AchievementView.totalSlots);
        while (achievementsToRender.length < AchievementView.totalSlots) achievementsToRender.push(null);

        // 生成 HTML
        const itemsHTML = achievementsToRender.map((ach) => {
            if (ach) {
                const isUnlocked = unlockedIds.includes(ach.id);
                const statusClass = isUnlocked ? 'unlocked' : 'locked';
                const iconSrc = isUnlocked ? ach.icon : lockedIcon;
                const name = isUnlocked ? `<h3>${ach.name}</h3>` : '<h3>？？？</h3>';
                const description = isUnlocked ? `<p>${ach.description}</p>` : '<p>解锁条件未达成</p>';
                return `
                    <div class="achievement-item ${statusClass}" title="${isUnlocked ? ach.name : '未解锁'}">
                        <img class="achievement-icon" src="${iconSrc}" alt="${isUnlocked ? ach.name : '未解锁'}">
                        <div class="achievement-info">
                            ${name}
                            ${description}
                        </div>
                    </div>
                `;
            } else {
                return `<div class="achievement-item empty"></div>`;
            }
        }).join('');

        container.innerHTML = `
            <style>
                .achievement-view {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }

                .navbar {
                    height: 100px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 40px;
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background: transparent; /* 由用户要求改为透明 */
                    backdrop-filter: none; /* 禁用额外的模糊遮罩 */
                }

                .menu-button {
                    position: relative;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-family: 'lilyshow','FangSong','仿宋','SimSun',sans-serif;
                    padding: 0;
                }

                .menu-button img { display: block; }

                .menu-button span {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: clamp(20px, 2vw, 40px);
                    color: #fff;
                    white-space: nowrap;
                    pointer-events: none;
                }

                .achievement-grid-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 40px;
                    box-sizing: border-box;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr); /* 每行固定 4 个格子 */
                    gap: 25px;
                    justify-items: center;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .achievement-grid-container::-webkit-scrollbar { display: none; }

                .achievement-item {
                    background-color: rgba(0, 0, 0, 0.4);
                    border-radius: 15px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    width: 100%;
                    max-width: 300px;
                    height: 300px;
                    box-sizing: border-box;
                    text-align: center;
                }

                .achievement-item.empty {
                    background: transparent;
                    border: none;
                }

                .achievement-item.unlocked {
                    border-color: #ffd700;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
                }

                .achievement-item:hover {
                    transform: translateY(-5px);
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .achievement-icon {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #fff;
                    margin-bottom: 10px;
                }

                .achievement-item.locked .achievement-icon {
                    filter: grayscale(100%) brightness(0.7);
                }

                .achievement-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                .achievement-info h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.5em;
                    color: #fff;
                }

                .achievement-item.locked .achievement-info h3 { color: #aaa; }

                .achievement-info p {
                    margin: 0;
                    font-size: 1.2em;
                    color: #ccc;
                    line-height: 1.4;
                }
            </style>

            <div class="view achievement-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>

                <nav class="navbar" id="achievement-navbar">
                    <button class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('ui.achievement')}</span>
                    </button>

                    <button id="back-to-menu" class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('ui.title')}</span>
                    </button>
                </nav>

                <div class="achievement-grid-container">
                    ${itemsHTML}
                </div>
            </div>
        `;

        AchievementView.attachEventListeners(container, engine);
    },

    attachEventListeners: (container, engine) => {
        document.getElementById('back-to-menu').addEventListener('click', () => {
            engine.audioManager.playSoundEffect('click');
            engine.showView('MainMenu');
        });
    }
};

export default AchievementView;
