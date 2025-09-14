// MainMenuView.js
const MainMenuView = {
  render(container, engine) {
    const L = engine.localization;
    const bgImages = ['./assets/img/bgr/mainmenu.png'];
    const bg = bgImages[Math.floor(Math.random() * bgImages.length)];

    /** 样式：标题布局 + 按钮固定上限宽度 + 自适应缩放锚点 **/
    const STYLE_ID = 'mainmenu-inline-style';
    let styleTag = document.getElementById(STYLE_ID);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = STYLE_ID;
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      .main-menu-view .header {
        text-align: right;
        padding-right: 15vw;
        padding-top: 5vh;
      }
      .main-menu-view .title-wrap {
        display: inline-block;
        text-align: right;
        line-height: 1.1;
      }
      .main-menu-view .title-wrap .header-title { display:block; }
      .main-menu-view .title-wrap .header-subtitle{
        display:block;
        width:100%;
        text-align:center;
        transform:translateX(15%); /* 略向右贴齐主标题右边，可调 10~20% */
        margin-top:0.4em;
        font-size:clamp(14px, 2.5vw, 60px);
        color:rgba(255,255,255,0.85);
        text-shadow:1px 1px 3px rgba(0,0,0,0.5);
        pointer-events:none;
      }

      /* 按钮组放在标题下方，并由 JS 控制 scale（仅缩小不放大） */
      .main-menu-view .button-wrapper{
        display:flex;
        justify-content:center;
        width:100%;
        margin-top:3vh;
      }
      .main-menu-view .main-menu-button-group{
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:16px;
        flex-wrap:nowrap;         /* 永不换行 */
        width:max-content;
        transform-origin: top center;
        will-change: transform;
        transition: transform 120ms ease-out;
      }

      /* 按钮：固定上限宽度，不随视口变大；最宽 320px */
      .main-menu-view .main-menu-button{
        display:block;
        width: min(320px, 92vw);  /* ≤320px，上限硬控；小屏时用视口收窄 */
        position:relative;
        cursor:pointer;
      }
      .main-menu-view .main-menu-button .button-img{
        width:100%; height:auto; display:block;
      }
      .main-menu-view .main-menu-button a{
        white-space:nowrap; line-height:1.1;
        position:absolute; top:50%; left:50%;
        transform:translate(-50%, -50%);
      }
    `;

    /** 结构 **/
    container.innerHTML = `
      <div class="view main-menu-view">
        <div class="bg" style="background-image: url('${bg}');"></div>

        <div class="header fade-in">
          <div class="title-wrap">
            <a class="header-title">夏日幻魂</a>
            <span class="header-subtitle">ゆうれいのしょうかん</span>
          </div>
        </div>

        <div class="button-wrapper">
          <div class="main-menu-button-group" id="mm-btn-group">
            <div class="main-menu-button" data-action="start">
              <img class="button-img" src="./assets/img/button.png">
              <a>${L.get('ui.start') || '开始'}</a>
            </div>
            <div class="main-menu-button" data-action="load">
              <img class="button-img" src="./assets/img/button.png">
              <a>${L.get('ui.load') || '读取进度'}</a>
            </div>
            <div class="main-menu-button" data-action="achievement">
              <img class="button-img" src="./assets/img/button.png">
              <a>${L.get('ui.achievement') || '成就'}</a>
            </div>
            <div class="main-menu-button" data-action="about">
              <img class="button-img" src="./assets/img/button.png">
              <a>${L.get('ui.about') || '关于'}</a>
            </div>
            <div class="main-menu-button" id="fullscreen-btn" data-action="fullscreen">
              <img class="button-img" src="./assets/img/button.png">
              <a class="label"></a>
            </div>
          </div>
        </div>
      </div>
    `;

    // 初始化全屏按钮文案
    MainMenuView.updateFullscreenLabel(container, L);

    // 事件：全屏变化时重算
    document.addEventListener('fullscreenchange', () => {
      MainMenuView.updateFullscreenLabel(container, L);
      MainMenuView.fitButtons(container);
    });

    // 播放 BGM
    const bgmMap = { './assets/img/bgr/mainmenu.png': './assets/bgm/test.mp3' };
    engine.audioManager.playBgm(bgmMap[bg] || bgmMap['./assets/img/bgr/mainmenu.png'], true);

    // 自适应：初次、load、resize、方向变化、内容尺寸变化（ResizeObserver）
    const ro = new ResizeObserver(() => MainMenuView.fitButtons(container));
    const groupEl = container.querySelector('#mm-btn-group');
    if (groupEl) ro.observe(groupEl);

    const afterPaint = () => MainMenuView.fitButtons(container);
    requestAnimationFrame(afterPaint);
    window.addEventListener('load', afterPaint, { once:true });
    window.addEventListener('resize', () => MainMenuView.fitButtons(container));
    window.addEventListener('orientationchange', () => MainMenuView.fitButtons(container));
  },

  /** 仅缩小不放大，确保按钮组在屏幕内完全显示 */
  fitButtons(container) {
    const headerEl = container.querySelector('.main-menu-view .header');
    const groupEl  = container.querySelector('#mm-btn-group');
    if (!headerEl || !groupEl) return;

    const SAFE_V = 16;   // 上下安全留白(px)
    const SAFE_H = 16;   // 左右安全留白(px)
    const MIN_SCALE = 0.6;  // 允许的最小缩放；可改为 0.5 等

    // 复位为自然尺寸测量
    groupEl.style.transform = 'scale(1)';

    const headerRect = headerEl.getBoundingClientRect();
    const groupRect  = groupEl.getBoundingClientRect();
    const viewportW  = document.documentElement.clientWidth;
    const viewportH  = document.documentElement.clientHeight;

    const availableW = Math.max(0, viewportW - SAFE_H * 2);
    const availableH = Math.max(0, viewportH - headerRect.bottom - SAFE_V);

    // 需要的缩放比例（仅考虑缩小，不放大）
    const needW = groupRect.width  > 0 ? availableW / groupRect.width  : 1;
    const needH = groupRect.height > 0 ? availableH / groupRect.height : 1;

    // 放大上限 = 1（不放大）；取宽高两者中更小的那个；下限受 MIN_SCALE 限制
    let scale = Math.min(1, needW, needH);
    if (!isFinite(scale) || scale <= 0) scale = MIN_SCALE;
    scale = Math.max(MIN_SCALE, Math.min(1, scale));

    groupEl.style.transform = `scale(${scale})`;
  },

  updateFullscreenLabel(container, L) {
    const labelEl = container.querySelector('#fullscreen-btn .label');
    if (!labelEl) return;
    const isFs = !!document.fullscreenElement;
    labelEl.textContent = isFs
      ? (L.get('关闭全屏') || '关闭全屏')
      : (L.get('全屏模式') || '全屏模式');
  },

  attachEventListeners(container, engine) {
    const buttons = container.querySelectorAll('.main-menu-button');
    buttons.forEach((btn) => {
      btn.addEventListener('mouseover', () => {
        engine.audioManager.playSoundEffect?.('titleHover');
      });

      btn.addEventListener('click', async (e) => {
        engine.audioManager.playSoundEffect?.('titleClick');
        const action = e.currentTarget.dataset.action;

        if (action !== 'fullscreen') {
          await engine.animation.fadeOutBlack?.();
        }

        switch (action) {
          case 'start':        engine.startNewGame?.(); break;
          case 'load':         engine.showView?.('Load'); break;
          case 'achievement':  engine.showView?.('Achievement'); break;
          case 'about':        engine.showView?.('About'); break;
          case 'fullscreen': {
            try {
              if (engine.toggleFullscreen) {
                await engine.toggleFullscreen();
              } else {
                const el = document.documentElement;
                if (!document.fullscreenElement) await el.requestFullscreen?.();
                else await document.exitFullscreen?.();
              }
            } catch (err) {
              console.warn('Fullscreen toggle failed:', err);
            }
            MainMenuView.fitButtons(container);
            break;
          }
        }
      });
    });
  },
};

export default MainMenuView;
