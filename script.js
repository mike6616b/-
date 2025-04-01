// 取得 canvas 元素和 2D 繪圖環境
const canvas = document.getElementById('interactiveCanvas');
const ctx = canvas.getContext('2d'); // ctx 是 context 的縮寫，是慣用名稱

// 設定畫布尺寸為視窗大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- 互動和繪圖邏輯將會加在這裡 ---

// 簡單範例：在畫布中央畫一個紅色圓形
function drawInitialCircle() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;

    ctx.beginPath(); // 開始繪製路徑
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); // 畫圓形 (x, y, 半徑, 起始角, 結束角)
    ctx.fillStyle = 'red'; // 設定填滿顏色
    ctx.fill(); // 填滿圓形
}

drawInitialCircle(); // 執行繪製函數

// 監聽視窗大小變化事件，重新設定畫布大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // 視窗大小改變後，可以選擇重新繪製初始狀態
    // drawInitialCircle(); // 如果希望調整大小後圓仍在中央，取消註解此行
    // 或者在這裡觸發更複雜的重繪邏輯
});
