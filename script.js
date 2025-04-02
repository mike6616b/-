// 取得 canvas 元素和 2D 繪圖環境
const canvas = document.getElementById('interactiveCanvas');
const ctx = canvas.getContext('2d'); // ctx 是 context 的縮寫，是慣用名稱

// 設定畫布尺寸為視窗大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 定義粒子數組和鼠標位置
const particles = [];
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let prevMouseX = mouseX;
let prevMouseY = mouseY;
let isMoving = false;
let moveTimeout;

// 定義典雅金色系列的顏色
const elegantColors = [
    '#d4af37', // 真金色
    '#ffd700', // 金色
    '#f0e68c', // 卡其色
    '#daa520', // 金菊色
    '#b8860b'  // 暗金色
];

// 滑鼠追蹤點的屬性
const pointer = {
    x: mouseX,
    y: mouseY,
    radius: 8, // 更小的跟隨點
    color: elegantColors[0]
};

// 尾巴點的類別
class TrailPoint {
    constructor(x, y, age = 0) {
        this.x = x;
        this.y = y;
        this.age = age; // 用於控制透明度和大小
        this.maxAge = 50; // 進一步增加尾巴點的最大生命周期
    }

    // 更新尾巴點的生命週期
    update() {
        this.age++;
        return this.age < this.maxAge;
    }

    // 繪製尾巴點
    draw() {
        const ageRatio = this.age / this.maxAge;
        const opacity = 1 - ageRatio;
        // 隨著年齡增加，半徑慢慢減小
        const radius = pointer.radius * (1 - ageRatio * 0.8);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        
        // 創建從中心向外漸變透明的效果
        const trailGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, radius
        );
        
        trailGradient.addColorStop(0, `rgba(212, 175, 55, ${opacity})`);
        trailGradient.addColorStop(1, `rgba(212, 175, 55, ${opacity * 0.5})`); // 邊緣50%的透明度
        
        ctx.fillStyle = trailGradient;
        ctx.fill();
    }
}

// 粒子類別（用於煙火效果）
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.color = elegantColors[Math.floor(Math.random() * elegantColors.length)];
        this.life = 50 + Math.random() * 50; // 進一步增加粒子壽命
        this.maxLife = this.life;
        this.initialX = x;
        this.initialY = y;
        this.trail = []; // 儲存粒子的尾巴路徑
        this.trailLength = 10 + Math.floor(Math.random() * 15); // 增加尾巴長度
    }

    // 更新粒子位置和生命週期
    update() {
        // 儲存當前位置到尾巴
        this.trail.push({x: this.x, y: this.y});
        
        // 限制尾巴長度
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
        
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        
        // 粒子逐漸減速，但減速更慢，讓路徑更長
        this.speedX *= 0.98;
        this.speedY *= 0.98;
        
        return this.life > 0;
    }

    // 繪製粒子及其尾巴
    draw() {
        const headOpacity = this.life / this.maxLife;
        
        // 繪製尾巴
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length - 1; i++) {
                // 計算每個尾巴點的透明度，尾端為30%透明度
                const pointIndex = i / this.trail.length;
                const tailOpacity = headOpacity * (0.3 + (0.7 * pointIndex));
                
                const lineWidth = this.size * (0.5 + (pointIndex * 0.5));
                
                ctx.beginPath();
                ctx.moveTo(this.trail[i].x, this.trail[i].y);
                ctx.lineTo(this.trail[i+1].x, this.trail[i+1].y);
                ctx.strokeStyle = this.color + Math.floor(tailOpacity * 255).toString(16).padStart(2, '0');
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            }
        }
        
        // 繪製粒子本身
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * headOpacity, 0, Math.PI * 2);
        
        // 創建粒子頭部的漸變
        const particleGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * headOpacity
        );
        
        particleGradient.addColorStop(0, this.color);
        particleGradient.addColorStop(1, this.color + Math.floor(headOpacity * 0.5 * 255).toString(16).padStart(2, '0'));
        
        ctx.fillStyle = particleGradient;
        ctx.fill();
    }
}

// 尾巴點數組
const trail = [];

// 監聽滑鼠移動事件
canvas.addEventListener('mousemove', (e) => {
    // 更新前一個位置
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    
    // 更新當前位置
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // 檢測是否正在移動
    isMoving = true;
    clearTimeout(moveTimeout);
    
    // 如果滑鼠移動距離大於閾值，生成粒子
    const distance = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);
    if (distance > 5) {
        createParticles(mouseX, mouseY, 3 + Math.floor(distance / 10));
    }
    
    // 設置一個短暫的延遲後將移動狀態設為否
    moveTimeout = setTimeout(() => {
        isMoving = false;
    }, 100);
});

// 生成粒子函數
function createParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
    }
}

// 動畫循環
function animate() {
    // 漸隱效果，進一步減慢消失速度讓粒子停留更久
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 更新指針位置（緩和移動）
    pointer.x += (mouseX - pointer.x) * 0.2;
    pointer.y += (mouseY - pointer.y) * 0.2;
    
    // 添加新的尾巴點
    if (isMoving) {
        trail.unshift(new TrailPoint(pointer.x, pointer.y));
    }
    
    // 更新和繪製尾巴
    for (let i = trail.length - 1; i >= 0; i--) {
        if (!trail[i].update()) {
            trail.splice(i, 1);
        } else {
            trail[i].draw();
        }
    }
    
    // 更新和繪製粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
            particles.splice(i, 1);
        } else {
            particles[i].draw();
        }
    }
    
    // 繪製主要指標
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, pointer.radius, 0, Math.PI * 2);
    
    // 創建一個金色漸變填充，從中心向外越來越透明
    const gradient = ctx.createRadialGradient(
        pointer.x, pointer.y, 0,
        pointer.x, pointer.y, pointer.radius
    );
    gradient.addColorStop(0, elegantColors[1]); // 明亮的金色中心
    gradient.addColorStop(0.7, elegantColors[0]); // 真金色中間區域
    gradient.addColorStop(1, elegantColors[0] + '80'); // 50%透明的金色邊緣
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 添加發光效果
    ctx.shadowBlur = 10;
    ctx.shadowColor = elegantColors[0];
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    requestAnimationFrame(animate);
}

// 監聽視窗大小變化事件，重新設定畫布大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 開始動畫循環
animate();
