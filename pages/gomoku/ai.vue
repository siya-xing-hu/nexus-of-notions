<template>
  <div class="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 bg-[url('/gomoku/img/stype/bg.jpg')] bg-cover">
    <!-- 游戏菜单界面 - 对应原始代码中的menuInit -->
    <div v-show="!gameStarted" class="menu-init w-full max-w-md h-auto p-8 bg-[url('/gomoku/img/stype/init-bg.png')] bg-contain bg-no-repeat bg-center flex flex-col items-center justify-center">
      <div class="flex flex-col sm:flex-row justify-around w-full mb-8 text-[#815332]">
        <!-- 难度选择 - 对应原始代码中的depth单选框组 -->
        <div class="menu-info text-lg mb-4 sm:mb-0">
          <h3 class="font-bold mb-2">选择难度</h3>
          <label class="cursor-pointer block"><input type="radio" name="depth" value="0" v-model="difficulty"> 菜鸟水平</label>
          <label class="cursor-pointer block"><input type="radio" name="depth" value="1" v-model="difficulty" checked> 中级水平</label>
          <label class="cursor-pointer block"><input type="radio" name="depth" value="2" v-model="difficulty"> 高手水平</label>
        </div>
        <!-- 先后手选择 - 对应原始代码中的offens单选框组 -->
        <div class="menu-info text-lg">
          <h3 class="font-bold mb-2">选择先后手</h3>
          <label class="cursor-pointer block"><input type="radio" name="offens" value="0" v-model="playerFirst" checked> 我先手</label>
          <label class="cursor-pointer block"><input type="radio" name="offens" value="1" v-model="playerFirst"> AI先手</label>
        </div>
      </div>
      <!-- 开始游戏按钮 - 对应原始代码中的playBtn -->
      <a @click="startGame" class="btn block w-48 h-12 text-center bg-[url('/gomoku/img/stype/btn-bg.png')] bg-no-repeat bg-center bg-cover font-sans text-xl leading-[3rem] text-[#815332] cursor-pointer hover:text-[#FFA433]">开始对弈</a>
    </div>

    <!-- 游戏主界面 - 对应原始代码中的wuziBox -->
    <div v-show="gameStarted" class="wuzi-box w-full max-w-[620px] flex flex-col items-center">
      <!-- 画布容器 - 对应原始代码中的canvas -->
      <div ref="canvasWrapperRef" class="canvas-wrapper w-full">
        <canvas ref="canvasRef" @click="clickCanvas"></canvas>
      </div>
      <!-- 按钮区域 - 对应原始代码中的bn_box -->
      <div class="bn_box mt-4 flex justify-center items-center gap-x-2 sm:gap-x-4">
        <!-- 悔棋按钮 - 对应原始代码中的regretBtn -->
        <a @click="regret" class="flex-shrink-0 bg-[url('/gomoku/img/stype/btn-bg1.png')] bg-no-repeat bg-center bg-cover h-8 w-28 sm:h-10 sm:w-36 text-center font-sans text-sm sm:text-base leading-[2rem] sm:leading-[2.5rem] text-[#7E410A] cursor-pointer" :style="{ opacity: regretCount > 0 ? 1 : 0.3 }">悔   棋({{ regretCount }})</a>
        <!-- 重新开始按钮 - 对应原始代码中的restartBtn -->
        <a @click="restartGame" class="flex-shrink-0 bg-[url('/gomoku/img/stype/btn-bg1.png')] bg-no-repeat bg-center bg-cover h-8 w-28 sm:h-10 sm:w-36 text-center font-sans text-sm sm:text-base leading-[2rem] sm:leading-[2.5rem] text-[#7E410A] cursor-pointer">重新开始</a>
        <!-- 返回首页按钮 - 新增功能 -->
        <a @click="goHome" class="flex-shrink-0 bg-[url('/gomoku/img/stype/btn-bg1.png')] bg-no-repeat bg-center bg-cover h-8 w-28 sm:h-10 sm:w-36 text-center font-sans text-sm sm:text-base leading-[2rem] sm:leading-[2.5rem] text-[#7E410A] cursor-pointer">返回首页</a>
      </div>
    </div>

    <!-- 音效资源 - 对应原始代码中的audio元素 -->
    <audio src="/gomoku/audio/click.wav" ref="clickAudioRef" preload="auto"></audio>
    <audio src="/gomoku/audio/select.wav" ref="selectAudioRef" preload="auto"></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useGomokuAI } from '~/composables/useGomokuAI';

// 引入AI模块 - 对应原始代码中的window.AI
const { AI } = useGomokuAI();

// DOM引用 - 对应原始代码中的document.getElementById
const canvasRef = ref(null);
const canvasWrapperRef = ref(null);
const clickAudioRef = ref(null);
const selectAudioRef = ref(null);
const router = useRouter();

// 游戏状态变量 - 对应原始代码中的play对象属性
const gameStarted = ref(false); // 对应原始代码中的菜单显示状态
const difficulty = ref("1"); // 对应原始代码中的depth单选框值
const playerFirst = ref("0"); // 对应原始代码中的offens单选框值

// 游戏核心变量 - 对应原始代码中的play对象属性
let ct, bgImg, AImg, BImg, paneImg; // 对应原始代码中的com对象属性
let childList = []; // 对应原始代码中的com.childList
let my = 1; // 对应原始代码中的play.my
let pace = []; // 对应原始代码中的play.pace
let isPlay = true; // 对应原始代码中的play.isPlay
let map = []; // 对应原始代码中的play.map
let regretCount = ref(3); // 对应原始代码中的play.regretCount

/**
 * 样式配置 - 对应原始代码中的com.stype.stype
 * 定义画布尺寸、间距、起始位置等参数
 */
const stype = {
  width: 620,
  height: 570,
  spaceX: 36,
  spaceY: 36,
  pointStartX: 26,
  pointStartY: 2,
  pieceSize: 16, // 新增：棋子尺寸，用于精确绘制
};

/**
 * 选择框对象 - 对应原始代码中的com.class.Pane
 * 用于高亮显示最后落子位置
 */
const pane = {
  x: 0,
  y: 0,
  isShow: false,
  show() {
    if (this.isShow) {
      // 绘制选择框，位置计算对应原始代码中的com.showPane
      ct.drawImage(paneImg, stype.spaceX * this.x + stype.pointStartX - stype.pieceSize / 2, stype.spaceY * this.y + stype.pointStartY - stype.pieceSize / 2, stype.pieceSize * 2, stype.pieceSize * 2);
    }
  }
};

/**
 * 背景对象 - 对应原始代码中的com.class.Bg
 * 负责绘制棋盘背景
 */
const bg = {
  x: 0,
  y: 0,
  isShow: true,
  show() {
    if (this.isShow) ct.drawImage(bgImg, 0, 0, stype.width, stype.height);
  }
};

/**
 * 棋子类 - 对应原始代码中的com.class.Man
 * 表示棋盘上的一个棋子
 * @param {Number} x - X坐标
 * @param {Number} y - Y坐标
 * @param {Number} my - 玩家标识(1为黑棋，-1为白棋)
 * @param {Boolean} isOffense - 是否为进攻方(决定棋子颜色)
 */
function Man(x, y, my, isOffense) {
  this.x = x || 0;
  this.y = y || 0;
  this.my = my || 1;
  this.show = function() {
    // 根据进攻方选择棋子图片，对应原始代码中的com.class.Man.show
    const img = (isOffense) ? AImg : BImg;
    ct.drawImage(img, stype.spaceX * this.x + stype.pointStartX - stype.pieceSize, stype.spaceY * this.y + stype.pointStartY - stype.pieceSize, stype.pieceSize * 2, stype.pieceSize * 2);
  };
}

/**
 * 加载图片资源 - 对应原始代码中的com.loadImages
 * 加载棋盘背景、棋子、选择框等图片
 * @returns {Promise} 返回加载完成的Promise
 */
function loadImages() {
  bgImg = new Image();
  bgImg.src = '/gomoku/img/stype/bg.png';
  AImg = new Image();
  AImg.src = '/gomoku/img/stype/A.png';
  BImg = new Image();
  BImg.src = '/gomoku/img/stype/B.png';
  paneImg = new Image();
  paneImg.src = '/gomoku/img/stype/pane.png';

  // 等待所有图片加载完成
  return new Promise((resolve) => {
    let count = 4;
    const onload = () => {
      count--;
      if (count === 0) resolve();
    };
    bgImg.onload = onload;
    AImg.onload = onload;
    BImg.onload = onload;
    paneImg.onload = onload;
  });
}

/**
 * 绘制函数 - 对应原始代码中的com.show
 * 清空画布并绘制所有子元素
 */
function draw() {
  ct.clearRect(0, 0, stype.width, stype.height);
  for (let i = 0; i < childList.length; i++) {
    childList[i].show();
  }
}

/**
 * 显示选择框 - 对应原始代码中的com.showPane
 * 高亮显示最后落子的位置
 * @param {Number} x - X坐标
 * @param {Number} y - Y坐标
 */
function showPane(x, y) {
  pane.isShow = true;
  pane.x = x;
  pane.y = y;
}

/**
 * 初始化游戏 - 对应原始代码中的play.init
 * 设置游戏状态、初始化棋盘、重置变量
 */
function initGame() {
  my = 1; // 玩家方
  pace = []; // 清空棋谱
  isPlay = true; // 允许走棋
  regretCount.value = 3; // 重置悔棋次数
  pane.isShow = false; // 隐藏选择框
  childList = [bg, pane]; // 初始化子元素列表，只保留背景和选择框
  map = Array(15).fill(0).map(() => Array(15).fill(0)); // 初始化15x15棋盘数组
  draw(); // 绘制棋盘
}

/**
 * 开始游戏 - 对应原始代码中的playBtn点击事件
 * 初始化画布、加载资源、启动游戏
 */
async function startGame() {
  gameStarted.value = true; // 显示游戏界面
  await nextTick(); // 等待DOM更新
  ct = canvasRef.value.getContext('2d'); // 获取画布上下文
  await loadImages(); // 加载图片资源
  resizeCanvas(); // 调整画布尺寸
  initGame(); // 初始化游戏

  // 如果选择AI先手，则AI先落子 - 对应原始代码中的AI先手逻辑
  if (playerFirst.value === "1") {
    my = -1; // 切换到AI方
    AIPlay(0, 0, { x: Math.floor(Math.random() * 3) + 6, y: Math.floor(Math.random() * 3) + 6 });
  }
}

/**
 * 在指定位置落子 - 对应原始代码中的play.clickPoint
 * 更新棋盘状态、记录棋谱、创建棋子对象、检查胜负
 * @param {Number} x - X坐标
 * @param {Number} y - Y坐标
 * @returns {Boolean} 返回是否落子成功
 */
function clickPoint(x, y) {
  map[y][x] = my; // 地图上加入该棋子
  pace.push([x, y]); // 棋谱上加入
  
  // 判断是否为进攻方(决定棋子颜色) - 对应原始代码中的颜色判断逻辑
  const isOffense = (my === 1 && playerFirst.value === "0") || (my === -1 && playerFirst.value === "1");
  const man = new Man(x, y, my, isOffense); // 创建棋子对象
  childList.push(man); // 添加到显示列表
  draw(); // 重新绘制
  
  // 检测是否获胜 - 对应原始代码中的play.isWin
  if (isWin(x, y)) {
    showWin(my);
    return false;
  }
  return true;
}

/**
 * 点击棋盘事件处理 - 对应原始代码中的play.clickCanvas
 * 将鼠标点击坐标转换为棋盘坐标，并执行落子
 * @param {Event} e - 点击事件对象
 */
function clickCanvas(e) {
  if (!isPlay) return; // 如果游戏已结束，不响应点击
  
  const point = getClickPoint(e); // 获取点击的棋盘坐标
  const { x, y } = point;
  if (clickAudioRef.value) clickAudioRef.value.play(); // 播放落子音效
  
  // 检查该位置是否为空
  if (!map[y][x]) {
    if (clickPoint(x, y)) { // 执行落子
      my = -1; // 切换到AI方
      setTimeout(() => AIPlay(x, y), 100); // 延迟100ms后AI走棋
    }
  }
}

/**
 * 获得点击的着点坐标 - 对应原始代码中的play.getClickPoint
 * 将鼠标点击坐标转换为棋盘格子坐标
 * @param {Event} e - 点击事件对象
 * @returns {Object} 返回棋盘坐标 {x, y}
 */
function getClickPoint(e) {
  const rect = canvasRef.value.getBoundingClientRect(); // 获取画布位置
  let x = Math.round((e.clientX - rect.left - stype.pointStartX) / stype.spaceX); // 计算X坐标
  let y = Math.round((e.clientY - rect.top - stype.pointStartY) / stype.spaceY); // 计算Y坐标
  
  // 边界检查
  x = Math.max(0, Math.min(x, 14));
  y = Math.max(0, Math.min(y, 14));
  return { x, y };
}

/**
 * AI自动走棋 - 对应原始代码中的play.AIPlay
 * 调用AI算法计算最佳落子位置并执行
 * @param {Number} x - 上一步X坐标
 * @param {Number} y - 上一步Y坐标
 * @param {Object} paceObj - 预设的落子位置(可选)
 */
function AIPlay(x, y, paceObj) {
  isPlay = false; // 禁止玩家操作
  
  // AI难度配置 - 对应原始代码中的play.arg配置
  const arg = [
    { random: -60, timer: 100, pur: 5, rank: "菜鸟水平" },
    { random: 3, timer: 300, pur: 5, rank: "中级水平" },
    { random: 2, timer: 1000, pur: 14, rank: "高手水平" },
  ][parseInt(difficulty.value, 10)];

  // 调用AI算法计算最佳落子位置 - 对应原始代码中的AI函数调用
  const bestMove = paceObj || AI(map, parseInt(difficulty.value, 10) + 1, my, x, y, arg);
  showPane(bestMove.x, bestMove.y); // 显示AI的选择框
  draw(); // 重新绘制

  // 延迟执行AI落子，模拟思考时间 - 对应原始代码中的setTimeout逻辑
  setTimeout(() => {
    if (selectAudioRef.value) selectAudioRef.value.play(); // 播放选择音效
    if (clickPoint(bestMove.x, bestMove.y)) { // AI落子
      isPlay = true; // 恢复玩家操作
      my = 1; // 切换回玩家方
    }
  }, arg.timer);
}

/**
 * 检测是否获胜 - 对应原始代码中的play.isWin
 * 检查四个方向是否有五子连珠
 * @param {Number} x - 落子X坐标
 * @param {Number} y - 落子Y坐标
 * @returns {Boolean} 返回是否获胜
 */
function isWin(x, y) {
    // 定义四个检查方向：水平、垂直、对角线
    const directions = [
        { x: 1, y: 0 },  // Horizontal
        { x: 0, y: 1 },  // Vertical
        { x: 1, y: 1 },  // Diagonal \
        { x: 1, y: -1 } // Diagonal /
    ];

    // 检查每个方向
    for (const dir of directions) {
        let count = 1; // 连子计数
        // 向正方向检查
        for (let i = 1; i < 5; i++) {
            const newX = x + i * dir.x;
            const newY = y + i * dir.y;
            if (newX >= 0 && newX < 15 && newY >= 0 && newY < 15 && map[newY][newX] === my) {
                count++;
            } else {
                break;
            }
        }
        // 向负方向检查
        for (let i = 1; i < 5; i++) {
            const newX = x - i * dir.x;
            const newY = y - i * dir.y;
            if (newX >= 0 && newX < 15 && newY >= 0 && newY < 15 && map[newY][newX] === my) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) return true; // 找到五子连珠
    }
    return false;
}

/**
 * 显示游戏结束信息 - 对应原始代码中的play.showWin
 * 根据获胜方显示相应的提示信息
 * @param {Number} player - 获胜方标识(1为玩家，-1为AI)
 */
function showWin(player) {
  isPlay = false; // 禁止继续操作
  setTimeout(() => {
    alert(player === 1 ? "恭喜你，你赢了！" : "很遗憾，你输了！");
  }, 300);
}

/**
 * 悔棋功能 - 对应原始代码中的play.regret
 * 撤销最后两步棋(玩家一步，AI一步)
 */
function regret() {
  if (regretCount.value === 0 || pace.length < 2 || !isPlay) return;
  
  // 撤销AI的最后一步
  let step = pace.pop();
  map[step[1]][step[0]] = 0;
  childList.pop();
  
  // 撤销玩家的最后一步
  step = pace.pop();
  map[step[1]][step[0]] = 0;
  childList.pop();
  
  // 显示上一步的位置
  const lastPace = pace[pace.length - 1];
  if(lastPace) {
      showPane(lastPace[0], lastPace[1]);
  } else {
      pane.isShow = false;
  }

  draw(); // 重新绘制棋盘
  regretCount.value--; // 减少悔棋次数
}

/**
 * 重新开始游戏 - 对应原始代码中的restartBtn点击事件
 * 确认后返回主菜单
 */
function restartGame() {
  if (confirm("是否确定要重新开始？")) {
    gameStarted.value = false; // 显示菜单界面
    initGame(); // 重新初始化游戏
  }
}

/**
 * 返回首页 - 新增功能，原始代码中没有
 * 使用Vue Router导航到首页
 */
function goHome() {
    router.push('/');
}

/**
 * 调整画布尺寸 - 新增功能，原始代码中没有
 * 根据容器宽度自适应调整画布大小
 */
function resizeCanvas() {
    if (!canvasRef.value || !canvasWrapperRef.value) return;
    const wrapperWidth = canvasWrapperRef.value.clientWidth;
    const originalWidth = 620;
    const originalHeight = 570;
    
    // 按比例计算新尺寸
    stype.width = wrapperWidth;
    stype.height = (wrapperWidth / originalWidth) * originalHeight;
    
    // 设置画布尺寸
    canvasRef.value.width = stype.width;
    canvasRef.value.height = stype.height;

    // 按比例调整所有间距和位置参数
    const scale = stype.width / originalWidth;
    stype.spaceX = 36 * scale;
    stype.spaceY = 36 * scale;
    stype.pointStartX = 26 * scale;
    stype.pointStartY = 2 * scale;
    stype.pieceSize = 16 * scale;

    draw(); // 重新绘制
}

// 生命周期钩子 - 新增功能，原始代码中没有
onMounted(() => {
    window.addEventListener('resize', resizeCanvas); // 监听窗口大小变化
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCanvas); // 清理事件监听器
});

</script>

<style scoped>
.btn:hover {
  background-position: 0 0;
  color: #FFA433;
}
.menu-init {
    background-size: contain;
    background-repeat: no-repeat;
}
.canvas-wrapper {
  aspect-ratio: 620 / 570;
}
canvas {
  width: 100%;
  height: 100%;
}
</style>