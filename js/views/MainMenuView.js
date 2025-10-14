const MainMenuView = {
  render: (container, engine) => {
    const L = engine.localization;
    const bgImages = ['./assets/img/bgr/mainmenu.png'];
    const randomIndex = Math.floor(Math.random() * bgImages.length);

    // 检查是否存在一个活动的游戏会话
    const hasActiveGame = engine.gameState.currentSave !== null;

    container.innerHTML = `
      <style>
        :root{
          --title-font-size: clamp(24px, 4vw, 48px);
          --btn-width: clamp(12rem, 16vw, 18rem);
          --btn-font-scale: 0.78;
          --btn-hover-scale: 1.06;
          --btn-press-translate: 6px;
          --btn-press-scale: 0.985;

          /* ≈间距控制：值越“负”越挤，这里略微放松，从 -6px 改为 -2px */
          --btn-stack-overlap: -2px;

          /* 按钮整体向下偏移（可按需调整） */
          --btn-group-offset: 8vh;
        }

        .view.main-menu-view{
          width:100vw;height:100vh;position:relative;overflow:hidden;
        }
        .bg{position:absolute;inset:0;background-size:cover;background-position:center;z-index:-1;}

        /* 将标题与按钮作为同一居中区域（区域 N），确保中垂线一致 */
        .menu-container{
          position:absolute;top:4%;left:80%;transform:translateX(-50%);
          display:flex;flex-direction:column;align-items:center;
        }

  .header{display:flex;flex-direction:column;align-items:center;margin-bottom:56vh;width:auto;}
  /* 微调：让主标题整体向下移动一点（不影响按钮中线对齐） */
  .header { margin-top: 0.6rem; }
        /* 使标题与按钮宽度一致，确保中垂线精确对齐 */
        .header-title{
          display:block;
          width:var(--btn-width);
          box-sizing:border-box;
          color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.45);
          /* 自动缩放标题字体，避免省略；以按钮宽度为参照 */
          font-size: clamp(20px, calc(var(--btn-width) * 0.14), 64px);
          line-height:1.05;text-align:center;
          white-space:nowrap;
        }
        .header-title{ position: relative; z-index: 2; }

        /* 主标题黄色闪烁（文字自身） */
        @keyframes goldenFlicker {
          0% { color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,.45); }
          18% { color: #f7e8b5; text-shadow: 0 6px 30px rgba(247,232,181,0.9), 0 0 10px rgba(247,232,181,0.6); }
          40% { color: #f6e7b4; text-shadow: 0 4px 18px rgba(247,232,181,0.85), 0 0 8px rgba(247,232,181,0.5); }
          60% { color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,.45); }
          100% { color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,.45); }
        }
        .header-title.flicker { animation: goldenFlicker 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .header-title.flicker { animation: none; } }

        /* 按钮组整体位置与基础“无缝”布局 */
        .main-menu-button-group{
          display:flex;flex-direction:column;align-items:center;gap:0;
          font-size:0;
          margin-top: var(--btn-group-offset);
        }

        .main-menu-button{
          position:relative;display:block;line-height:0;cursor:pointer;
          /* 固定每个按钮容器宽度以精确对齐中线，避免缩放/放大会导致错位 */
          width: var(--btn-width);
          box-sizing: border-box;
          transform-origin: center center;
          transition:transform .18s ease, filter .18s ease;
          will-change:transform;filter:drop-shadow(0 4px 10px rgba(0,0,0,.25));
          margin:0;
        }
        /* 用轻微负 margin 叠住 PNG 的透明边；从 -6px 放松到 -2px = 间距略增 */
        .main-menu-button + .main-menu-button{ margin-top: var(--btn-stack-overlap); }

        .main-menu-button img.button-img{
          width:100%;height:auto;display:block;transform-origin:center center;display:block;
          transition: transform .12s cubic-bezier(.2,.9,.2,1), filter .12s ease;
        }
        /* Hover: 图片略微放大 */
        .main-menu-button:hover img.button-img{ transform: scale(var(--btn-hover-scale)); }

        /* Pressed (active): 模拟按下，图片下移并轻微缩小，文字同步下移 */
        .main-menu-button.pressed img.button-img,
        .main-menu-button:active img.button-img{
          transform: translateY(var(--btn-press-translate)) scale(var(--btn-press-scale));
        }

        /* 按钮文字：与主标题视觉一致，且根据按钮图片宽度自适应大小，始终居中在图片内部 */
        .main-menu-button a{
          position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
          white-space:nowrap;text-align:center;pointer-events:none;line-height:1;
          /* 字体大小随按钮图片宽度缩放，但不超过主标题的大小，也有最小值保护 */
          font-size: clamp(12px, calc(var(--btn-width) * 0.11), calc(var(--title-font-size) * 0.9));
          color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,.45);
          max-width: calc(var(--btn-width) * 0.9); overflow:hidden; text-overflow:ellipsis;
          transition: color .12s ease, transform .12s cubic-bezier(.2,.9,.2,1);
        }
  /* Hover: 文字变为淡金色，增强主题氛围 */
  .main-menu-button:hover a{ color: #f6e7b4; text-shadow: 0 2px 6px rgba(0,0,0,.45); }
        .main-menu-button.pressed a, .main-menu-button:active a{ transform: translate(-50%, calc(-50% + var(--btn-press-translate))); }

        @media (max-width: 720px){
          :root{
            --btn-width: clamp(10.5rem, 42vw, 14rem);
            --btn-font-scale: 0.74;
            --btn-stack-overlap: -1px; /* 小屏同样略微放松 */
            --btn-group-offset: 10vh;
          }
          .header{margin-bottom:52vh;}
        }

        @media (min-width: 1600px){
          :root{
            --btn-width: 20rem;
            --btn-font-scale: 0.8;
            --btn-stack-overlap: 8px; /* 宽屏保持与默认一致的轻微贴合 */
            --btn-group-offset: 7vh;
          }
        }
      </style>

      <div class="view main-menu-view">
        <div class="bg" style="background-image:url('${bgImages[randomIndex]}');"></div>

        <div class="menu-container">
      <div class="header fade-in">
        <a class="header-title flicker">夏夜唤灵簿</a>
      </div>

          <div class="main-menu-button-group">
            ${hasActiveGame ? `
              <div class="main-menu-button" data-action="continue">
                <img class="button-img" src="./assets/img/button.png" alt="">
                <a>${L.get('ui.continue')}</a>
              </div>
            ` : ''}
            <div class="main-menu-button" data-action="start">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('ui.start')}</a>
            </div>
            <div class="main-menu-button" data-action="load">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('ui.load')}</a>
            </div>
            <div class="main-menu-button" data-action="achievement">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('ui.achievement')}</a>
            </div>
            <div class="main-menu-button" data-action="settings">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('设置') ?? '设置'}</a>
            </div>
            <div class="main-menu-button" data-action="about">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('ui.about')}</a>
            </div>
          </div>
        </div>
      </div>
    `;

    const bgmMap = {
      './assets/img/bgr/mainmenu.png': './assets/bgm/test.mp3',
    };
    engine.audioManager.playBgm(bgmMap[bgImages[randomIndex]], true);
    // 动态调整主标题字体，使其始终完整显示在按钮宽度内（不省略），并保持中线对齐
    (function attachTitleFit() {
      const containerEl = container;

      function fitTitleOnce() {
        const titleEl = containerEl.querySelector('.header-title');
        if (!titleEl) return;

        // 可用宽度由 CSS 的 --btn-width 控制，titleEl.clientWidth 会反映实际像素宽度
  // Use getBoundingClientRect to get actual rendered width (more reliable under browser zoom)
  const available = Math.floor(titleEl.getBoundingClientRect().width) || 0;
        if (available <= 0) return;

        // 使用比例缩放方案：以首次计算得到的基准字号为 base，按 base 下内容实际宽度与可用宽度比例缩放
        const cs = window.getComputedStyle(titleEl);
        if (!containerEl.__titleBaseFontPx) {
          containerEl.__titleBaseFontPx = Math.max(12, Math.round(parseFloat(cs.fontSize) || 24));
        }
        const basePx = containerEl.__titleBaseFontPx;

        // 先把 font-size 暂设为 base 以测量基准下的内容宽度
        titleEl.style.fontSize = basePx + 'px';
        const contentWAtBase = Math.ceil(titleEl.scrollWidth || 0);

        if (contentWAtBase <= available) {
          // 基准字号就能容纳，使用基准字号（但尝试微幅放大）
          let target = basePx;
          const growPx = Math.floor(basePx * 0.2); // 放大约 10%
          if (growPx > 0) {
            const tryPx = basePx + growPx;
            titleEl.style.fontSize = tryPx + 'px';
            if (Math.ceil(titleEl.scrollWidth) <= available) target = tryPx;
          }
          titleEl.style.fontSize = target + 'px';
        } else {
          // 需要缩放：按比例计算目标字号，保证不会异常缩小（最小12px）
          const scale = available / contentWAtBase;
          let newPx = Math.max(12, Math.floor(basePx * scale));
          // 尝试在 newPx 基础上微幅放大（6%），如果仍然 fit 则采用更大值
          const growPx = Math.max(1, Math.floor(newPx * 0.06));
          titleEl.style.fontSize = (newPx + growPx) + 'px';
          if (Math.ceil(titleEl.scrollWidth) > available) {
            // 放大会溢出，回退
            titleEl.style.fontSize = newPx + 'px';
          }
        }
      }

      // 防抖函数
      function debounce(fn, wait) {
        let t = null;
        return function () {
          clearTimeout(t);
          t = setTimeout(fn, wait);
        };
      }

      // 移除已有的监听（如果有），避免重复注册
      if (containerEl.__mainMenuTitleResizeHandler) {
        window.removeEventListener('resize', containerEl.__mainMenuTitleResizeHandler);
        containerEl.__mainMenuTitleResizeHandler = null;
      }

      const handler = debounce(() => {
        // Recompute after CSS variables potentially changed
        fitTitleOnce();
      }, 80);
      containerEl.__mainMenuTitleResizeHandler = handler;
      window.addEventListener('resize', handler);

      // 在初次渲染后稍微延迟执行一次，以等字体加载/CSS 生效
      setTimeout(fitTitleOnce, 50);
      // 也在 asset 图片加载后再尝试一次（按钮宽度可能受图片尺寸影响）
      const imgs = containerEl.querySelectorAll('.main-menu-button img.button-img');
      let loaded = 0;
      if (imgs.length === 0) return;
      imgs.forEach(img => {
        if (img.complete) { loaded++; }
        else {
          img.addEventListener('load', () => {
            loaded++;
            if (loaded === imgs.length) {
              // run twice to ensure layout stabilized
              fitTitleOnce();
              setTimeout(fitTitleOnce, 30);
            }
          });
        }
      });
      // 如果图片已经都完成了，则再次运行
      if (loaded === imgs.length) {
        fitTitleOnce();
        setTimeout(fitTitleOnce, 30);
      }
    })();
  },

  attachEventListeners: (container, engine) => {
    const buttons = container.querySelectorAll('.main-menu-button');
    buttons.forEach(button => {
      // 鼠标移入：音效
      button.addEventListener('mouseover', () => { engine.audioManager.playSoundEffect('titleHover'); });

      // 按下/松开交互（鼠标/触摸/键盘）
      const pressStart = (e) => {
        button.classList.add('pressed');
        engine.audioManager.playSoundEffect('titleClick');
        // prevent text selection / native focus move
        if (e && e.preventDefault) e.preventDefault();
      };
      const pressEnd = () => { button.classList.remove('pressed'); };

      button.addEventListener('mousedown', pressStart);
      button.addEventListener('mouseup', pressEnd);
      button.addEventListener('mouseleave', pressEnd);
      button.addEventListener('touchstart', pressStart, { passive: true });
      button.addEventListener('touchend', pressEnd);

      // 支持键盘的回车和空格触发（无阻止默认的 focus 行为）
      button.setAttribute('tabindex', '0');
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          pressStart(e);
        }
      });
      button.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          pressEnd();
          // 触发点击行为
          button.click();
        }
      });

      // 保持原来的 click 行为（导航/切换视图）
      button.addEventListener('click', async (e) => {
        const action = e.currentTarget.dataset.action;

        await engine.animation.play('fadeOutBlack');

        switch (action) {
          case 'continue': engine.resumeGame(); break;
          case 'start': engine.startNewGame(); break;
          case 'load': engine.showView('Load', { from: 'MainMenu' }); break;
          case 'settings': engine.showView('Settings', { from: 'MainMenu' }); break;
          case 'achievement': engine.showView('Achievement'); break;
          case 'about': engine.showView('About'); break;
        }
      });
    });
  }
};

export default MainMenuView;