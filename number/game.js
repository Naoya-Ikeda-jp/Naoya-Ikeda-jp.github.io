import * as THREE from './libs/three.module.js';

// --- 基本セットアップ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- ライト ---
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// --- プレイヤー（青い箱） ---
const playerGeo = new THREE.BoxGeometry(1, 1, 1);
const playerMat = new THREE.MeshStandardMaterial({ color: 0x3399ff });
const player = new THREE.Mesh(playerGeo, playerMat);
scene.add(player);
player.position.set(0, 0.5, 0);

// --- 床 ---
const floorGeo = new THREE.PlaneGeometry(20, 200);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- 数字の壁を作る ---
function createWall(z, value) {
  const wallGeo = new THREE.BoxGeometry(5, 5, 0.5);
  const wallMat = new THREE.MeshStandardMaterial({ color: value > 0 ? 0x44ff44 : 0xff4444 });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 2.5, z);
  wall.userData.value = value;

  // 数字のテキスト（CanvasTexture）
  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black"; ctx.fillRect(0,0,128,128);
  ctx.fillStyle = "white"; ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(value > 0 ? "+"+value : value, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(3,3), textMat);
  textPlane.position.set(0,0,0.3);
  wall.add(textPlane);

  scene.add(wall);
  return wall;
}

const walls = [
  createWall(-20, +10),
  createWall(-40, -5),
  createWall(-60, +20),
  createWall(-80, -10),
];

// --- スコア ---
let score = 0;
function updateScore(v) {
  score += v;
  document.getElementById("score").textContent = score;
}

// --- キー入力 ---
const keys = {};
document.addEventListener("keydown", (e) => { keys[e.key] = true; });
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// --- ゲームループ ---
function animate() {
  requestAnimationFrame(animate);

  // プレイヤー自動で前進
  player.position.z -= 0.1;

  // 左右移動
  if (keys["a"] || keys["ArrowLeft"]) player.position.x -= 0.1;
  if (keys["d"] || keys["ArrowRight"]) player.position.x += 0.1;

  // 壁との当たり判定
  walls.forEach(wall => {
    if (!wall.userData.hit && player.position.distanceTo(wall.position) < 3) {
      updateScore(wall.userData.value);
      wall.userData.hit = true;
      wall.material.color.set(0x888888); // 色を変えて「通過済み」表示
    }
  });

    // ゴール判定
    if (player.position.z <= goalZ) {
      gameOver = true;
      showBonusUI();
    }
  renderer.render(scene, camera);
}
animate();

// --- リサイズ対応 ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
// --- ゴール設定 ---
const goalZ = -100;
const goalGeo = new THREE.BoxGeometry(6, 0.5, 0.5);
const goalMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const goal = new THREE.Mesh(goalGeo, goalMat);
goal.position.set(0, 0.25, goalZ);
scene.add(goal);

let gameOver = false;

// --- ボーナスUIを作成 ---
function showBonusUI() {
  const ui = document.createElement("div");
  ui.id = "bonusUI";
  ui.style.position = "absolute";
  ui.style.top = "50%";
  ui.style.left = "50%";
  ui.style.transform = "translate(-50%,-50%)";
  ui.style.background = "rgba(0,0,0,0.8)";
  ui.style.color = "white";
  ui.style.padding = "20px";
  ui.style.textAlign = "center";
  ui.style.borderRadius = "8px";

  ui.innerHTML = `
    <h2>ボーナスチャンス！</h2>
    <p>倍率を選んでください</p>
    <button data-mult="5">×5</button>
    <button data-mult="25">×25</button>
    <button data-mult="100">×100</button>
  `;

  document.body.appendChild(ui);

  ui.querySelectorAll("button").forEach(btn => {
    btn.style.margin = "10px";
    btn.style.padding = "10px 20px";
    btn.onclick = () => {
      const mult = parseInt(btn.dataset.mult);
      score *= mult;
      document.getElementById("score").textContent = score;

      ui.innerHTML = `<h2>最終スコア: ${score}</h2>`;
      // 演出例：プレイヤーをジャンプさせる
      player.position.y = mult / 20; // 倍率に応じて高さ
    };
  });
}
