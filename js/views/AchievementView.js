// 成就界面视图对象
const AchievementView = {
    totalSlots: 32, // 固定成就槽数量（4组 * 每组8个）
    slotsPerGroup: 8, // 每组显示 8 个
    categories: ["战斗类", "探索类", "收集类", "隐藏类"],

    render: (container, engine) => {
        const L = engine.localization;
        const allAchievements = engine.dataManager.getAllAchievements();
        const unlockedIds = engine.saveManager.currentUser.achievementArray;
        const lockedIcon = engine.dataManager.getLockedAchievementIcon();

        // 取前32个成就，如果不足32个，用空占位
        const achievementsToRender = allAchievements.slice(0, AchievementView.totalSlots);
        while (achievementsToRender.length < AchievementView.totalSlots) {
            achievementsToRender.push(null); // 空占位
        }

        // 将成就按组分，每组8个（共4组）
        const groups = [];
        for (let i = 0; i < achievementsToRender.length; i += AchievementView.slotsPerGroup) {
            groups.push(achievementsToRender.slice(i, i + AchievementView.slotsPerGroup));
        }

        // 每组生成 HTML
        const groupsHTML = groups.map((group, groupIndex) => {
            const rowCategory = AchievementView.categories[groupIndex] || `类别 ${groupIndex + 1}`;

            // 使用战斗类前四个成就槽样式参数
            const itemsHTML = group.map((ach, index) => {
                if (ach) {
                    const isUnlocked = unlockedIds.includes(ach.id);
                    const statusClass = isUnlocked ? 'unlocked' : 'locked';
                    const iconSrc = isUnlocked ? ach.icon : lockedIcon;
                    const name = isUnlocked ? `<h3>${ach.name}</h3>` : '<h3>？？？</h3>';
                    const description = isUnlocked ? `<p>${ach.description}</p>` : '<p>解锁条件未达成</p>';

                    return `
                        <div class="achievement-item ${statusClass}" title="${isUnlocked ? ach.name : '未解锁'}">
                            <img class="achievement-icon" src="${iconSrc}" alt="${name}">
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

            return `
                <div class="achievement-group">
                    <h2 class="row-category">${rowCategory}</h2>
                    <div class="achievement-group-items">
                        ${itemsHTML}
                    </div>
                </div>
            `;
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
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                }

                .menu-button {
                    position: relative;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-family: 'lilyshow','FangSong','仿宋','SimSun',sans-serif;
                    padding: 0;
                }

                .menu-button img {
                    display: block;
                }

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
                }

                .achievement-grid-container::-webkit-scrollbar {
                    display: none;
                }
                .achievement-grid-container {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .achievement-group {
                    margin-bottom: 50px;
                }

                .row-category {
                    text-align: center;
                    font-size: 1.6em;
                    color: #ffd700;
                    margin-bottom: 20px;
                    text-shadow: 1px 1px 3px #000;
                }

                /* 使用战斗类前四个成就槽布局 */
                .achievement-group-items {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 25px;
                    justify-items: center;
                }

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
                    max-width: 220px;
                    height: 220px;
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
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #fff;
                    flex-shrink: 0;
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
                    font-size: 1.2em;
                    color: #fff;
                }

                .achievement-item.locked .achievement-info h3 {
                    color: #aaa;
                }

                .achievement-info p {
                    margin: 0;
                    font-size: 0.9em;
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
                    ${groupsHTML}
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
