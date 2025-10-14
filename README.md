# 夏夜唤灵簿

一个基于 **HTML/CSS/JavaScript** 的网页叙事互动（AVG）项目，内嵌独立的平台跳跃类 **Platformer** 小游戏。

---

## 目录结构

```text
.
├── assets/          # 静态资源 (图片, CSS, 音视频)
├── data/            # 游戏内容数据 (剧情, 语言, 成就)
│   ├── lang/
│   └── *.json
├── js/              # 主叙事引擎JavaScript源代码
│   ├── core/        # 核心管理器 (GameEngine, DataManager, etc.)
│   ├── modules/     # 可重用功能模块 (Animation, SentencePrinter, etc.)
│   └── views/       # 视图状态模块 (MainMenuView, GameView, etc.)
├── minigames/       # 嵌入式小游戏
│   └── platformer/  # 平台跳跃游戏 (一个独立的ECS项目)
│       ├── assets/         # 小游戏专属资源 (地图, 精灵图, 音频)    
│       ├── js/             # 小游戏JavaScript源代码
│       │   ├── components/ # 实体组件 (Physics, Animator, etc.)
│       │   ├── core/       # 引擎核心 (Game, GameObject, Scene, etc.)
│       │   ├── game/       # 游戏具体实现 (PlayerFactory, EnemyFactory, etc.)
│       │   ├── services/   # 后台服务 (存档, 成就管理)
│       │   ├── states/     # 游戏状态管理 (PlayState, etc.)
│       │   ├── systems/    # ECS中的系统 (RendererSystem, Camera)
│       │   ├── ui/         # UI相关模块 (UIManager)
│       │   └── utils/      # 通用工具 (常量, 加载器)
│       ├── index.html      # (可选)小游戏独立测试入口
│       └── style.css       # 小游戏专属的极简样式   
├── team/            # 团队成员介绍静态页面
└── index.html       # 应用主入口

```

---

## 技术架构

### 主叙事引擎 (AVG Engine)

* **架构**：采用视图驱动的FSM（有限状态机）模型。`GameEngine.js` 作为中央控制器，通过 `showView()` 方法切换不同的游戏状态（如主菜单、游戏内、设置等）。
* **数据流**：`DataManager.js` 在启动时**异步加载** `data/*.json` 文件；`GameEngine` 的核心循环 `processNode()` 解析 `story.json` 中的叙事节点，并向各功能模块分发指令（文本打印、立绘切换、分支选择等）。
* **核心数据结构**：

  * **叙事节点图 (`story.json`)**：以**节点ID为键**的哈希表，逻辑上构成**有向图**；通过 `onNext` 属性定义剧情的流转规则（顺序、分支、跳转）。
  * **存档对象 (`SaveManager.js`)**：基于 `User` 与 `Save` 类的**状态模型**，用于游戏进度、变量与设置的**持久化**。

### 平台跳跃引擎 (Platformer Engine)

* **架构**：采用经典的 **ECS（Entity–Component–System）**。

  * **实体**（`GameObject.js`）：游戏世界中万物的容器。
  * **组件**（`/components`）：封装单一功能的数据与逻辑，例如 `Transform`、`Physics`、`Animator`、`HealthComponent`。
  * **系统**（`/systems`）：处理拥有特定组件的实体，例如 `RendererSystem`。
* **物理与游戏循环**：使用 `requestAnimationFrame` 驱动的**固定时间步长**游戏循环；内置基于**欧拉积分**与**网格离散碰撞检测**的简易 2D 物理（`Physics.js`）。
* **关卡定义**：关卡布局、碰撞区域与实体生成点由 **Tiled Map Editor** 导出为 `level*.json` 文件。

---

## 贡献者

* **Wang Wanqi (王万淇)** — Project Manager
* **Ge Hongkang (葛洪康)** — Story Director
* **Wang Guangyuan (王光源)** — Technical Director
* **Chen Yuwei (陈煜玮)** — Video Editor / Tester
* **Liu Lanxuan (刘澜轩)** — Frontend Developer

---

## 许可证

本项目基于 **MIT License** 开源。
