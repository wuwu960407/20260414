// 模擬每周作業資料的陣列
const homeworks = [
  { title: "Week 1: p5.js 基礎", url: "https://p5js.org/" },
  { title: "Week 2: 與gemini的對話", url: "https://p5js.org/reference/" },
  { title: "Week 3: 取得文字、數值和其他輸入", url: "https://p5js.org/examples/" },
  { title: "Week 4: 海葵製作", url: "https://p5js.org/tutorials/" },
  { title: "Week 5: 電流急急棒", url: "https://wuwu960407.github.io/20260407/" }
];

// 生態系陣列
let seaweeds = [];
let fishes = [];
let bubbles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 1. 產生海草：象徵學習的成長，作品越多海草長得越高
  let baseHeight = height * 0.2;
  let heightGrowth = (height * 0.6) / homeworks.length; 
  
  // 產生一些背景裝飾用的短海草
  for (let i = 0; i < 15; i++) {
    seaweeds.push(new Seaweed(random(width), height, random(100, 300)));
  }
  
  // 產生與「作業數量」對應且長得特別高的「主海草」
  for (let i = 0; i < homeworks.length; i++) {
    let swHeight = baseHeight + (i * heightGrowth); // 隱喻：隨時間成長
    let xPos = (width / (homeworks.length + 1)) * (i + 1);
    seaweeds.push(new Seaweed(xPos + random(-20, 20), height, swHeight));
    
    // 2. 產生包裹著作業連結的「氣泡」
    // 氣泡會浮在對應主海草的頂端附近
    bubbles.push(new Bubble(xPos, height - swHeight - 50, homeworks[i]));
  }

  // 3. 產生奇幻魚群
  for (let i = 0; i < 10; i++) {
    fishes.push(new Fish(random(width), random(height * 0.2, height * 0.8)));
  }
}

function draw() {
  // 水底漸層背景
  setGradient(0, 0, width, height, color(1, 26, 39), color(0, 119, 182));

  // 繪製所有的 Class 生態物件
  for (let sw of seaweeds) {
    sw.update();
    sw.display();
  }
  
  for (let fish of fishes) {
    fish.update();
    fish.display();
  }
  
  for (let bubble of bubbles) {
    bubble.update();
    bubble.display();
  }
}

// 建立背景漸層
function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

// --- Iframe 互動機制 ---
function mousePressed() {
  for (let bubble of bubbles) {
    if (bubble.isHovered(mouseX, mouseY)) {
      openIframe(bubble.hw.url);
      break; // 一次只點擊一個氣泡
    }
  }
}

function openIframe(url) {
  document.getElementById('workFrame').src = url;
  document.getElementById('modal-overlay').style.display = 'block';
}

function closeIframe() {
  document.getElementById('workFrame').src = "";
  document.getElementById('modal-overlay').style.display = 'none';
}

// ================= 生態物件類別 (Classes) =================

class Seaweed {
  constructor(x, y, h) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.segments = floor(h / 20); // 依據高度決定節點數
    this.noiseOffset = random(1000);
    this.c = color(random(20, 50), random(150, 220), random(100, 180), 200);
  }
  update() {
    this.noiseOffset += 0.015; // 控制海草搖擺速度
  }
  display() {
    noFill();
    strokeWeight(12);
    stroke(this.c);
    beginShape();
    // 使用 curveVertex 畫出柔和的海草曲線
    for (let i = 0; i <= this.segments; i++) {
      let segY = this.y - (this.h / this.segments) * i;
      // 底部不搖擺，越往頂端搖擺幅度 (sway) 越大
      let sway = map(noise(this.noiseOffset + i * 0.1), 0, 1, -80, 80) * (i / this.segments);
      curveVertex(this.x + sway, segY);
      // 頭尾需要重複頂點以確保曲線正確貼合
      if (i === 0 || i === this.segments) curveVertex(this.x + sway, segY);
    }
    endShape();
  }
}

class Fish {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(1, 3) * (random() > 0.5 ? 1 : -1);
    this.vy = random(-0.5, 0.5);
    this.size = random(0.6, 1.2);
    this.c = color(random(100, 255), random(100, 200), 255, 180);
    this.tailOffset = random(100);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    // 游出邊界後從另一邊出現
    if (this.x > width + 50) this.x = -50;
    if (this.x < -50) this.x = width + 50;
    if (this.y > height) this.y = height;
    if (this.y < 0) this.y = 0;
    this.tailOffset += 0.2;
  }
  display() {
    push();
    translate(this.x, this.y);
    scale(this.vx > 0 ? this.size : -this.size, this.size); // 面朝方向翻轉
    
    noStroke();
    fill(this.c);
    
    // 結合 Vertex 勾勒出的幾何奇幻魚形狀
    beginShape();
    vertex(25, 0);           // 嘴巴
    vertex(10, -12);         // 背部
    vertex(-15, -8);         // 靠近尾巴上緣
    // 讓尾巴動態搖擺
    let tailSway = sin(this.tailOffset) * 8; 
    vertex(-25 + tailSway, -15); // 尾鰭上端
    vertex(-15, 0);          // 尾巴內凹
    vertex(-25 + tailSway, 15);  // 尾鰭下端
    vertex(-15, 8);          // 靠近尾巴下緣
    vertex(10, 12);          // 腹部
    endShape(CLOSE);
    
    // 魚眼
    fill(255);
    circle(12, -4, 6);
    fill(0);
    circle(14, -4, 3);
    pop();
  }
}

class Bubble {
  constructor(x, y, hw) {
    this.x = x;
    this.baseY = y;
    this.y = y;
    this.r = 45;
    this.hw = hw;
    this.floatOffset = random(100);
  }
  update() {
    // 氣泡上下浮動效果
    this.y = this.baseY + sin(frameCount * 0.04 + this.floatOffset) * 15;
  }
  display() {
    let hovered = this.isHovered(mouseX, mouseY);
    
    push();
    // 氣泡本體
    fill(255, 255, 255, hovered ? 100 : 40);
    stroke(255, 255, 255, 180);
    strokeWeight(hovered ? 3 : 1);
    circle(this.x, this.y, this.r * 2);
    
    // 氣泡高光反射
    noStroke();
    fill(255, 255, 255, 200);
    ellipse(this.x - 15, this.y - 15, 15, 10);
    
    // 文字標籤
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(hovered ? 16 : 14);
    textStyle(BOLD);
    text(this.hw.title, this.x, this.y + this.r + 20);
    pop();
  }
  isHovered(px, py) {
    return dist(px, py, this.x, this.y) < this.r;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}