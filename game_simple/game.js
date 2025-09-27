/**

* game.js - Three.jsを用いた3Dサバイバルゲーム
* * プレイヤーは自動で前進
* * 敵に近づくと攻撃
* * アイテム取得でスコア加算
    */

// =====================
// 初期セットアップ
// =====================
const canvas = document.getElementById("gameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 10, 20);

// 環境光 & 平行光
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(light);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// =====================
// プレイヤー
// =====================
let player = {
mesh: null,
hp: 10,
speed: 0.05
};

// シンプルなボックスをプレイヤーに仮置き
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x3399ff });
player.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player.mesh);

// =====================
// 敵・アイテム
// =====================
let objects = [];
const SIZE = 2;

function spawnEnemy() {
const geom = new THREE.SphereGeometry(1, 16, 16);
const mat = new THREE.MeshStandardMaterial({ color: 0x552255 });
const enemy = new THREE.Mesh(geom, mat);
enemy.position.set(
(Math.random() - 0.5) * 30,
1,
(Math.random() - 0.5) * 30
);
enemy.userData = { type: "bear", hp: 3 };
scene.add(enemy);
objects.push(enemy);
}

function spawnMeat() {
const geom = new THREE.BoxGeometry(1, 0.5, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0xcc2222 });
const meat = new THREE.Mesh(geom, mat);
meat.position.set(
(Math.random() - 0.5) * 30,
0.5,
(Math.random() - 0.5) * 30
);
meat.userData = { type: "meat" };
scene.add(meat);
objects.push(meat);
}

// 初期配置
for (let i = 0; i < 5; i++) spawnEnemy();
for (let i = 0; i < 5; i++) spawnMeat();

// =====================
// ゲーム進行
// =====================
let meat = 0, money = 0, bag = 0;

function updateUI() {
document.getElementById("hp").textContent = player.hp;
document.getElementById("meat").textContent = meat;
document.getElementById("money").textContent = money;
document.getElementById("bag").textContent = bag;
}

// 自動前進 & 当たり判定
function animate() {
requestAnimationFrame(animate);

// プレイヤー自動前進
player.mesh.position.z -= player.speed;

// 敵やアイテムとの判定
objects.forEach((obj, idx) => {
const dist = player.mesh.position.distanceTo(obj.position);
if (dist < 2) {
if (obj.userData.type === "bear") {
obj.userData.hp--;
if (obj.userData.hp <= 0) {
scene.remove(obj);
objects.splice(idx, 1);
spawnMeat();
}
} else if (obj.userData.type === "meat") {
meat++;
bag++;
scene.remove(obj);
objects.splice(idx, 1);
}
}
});

renderer.render(scene, camera);
updateUI();
}
animate();

// =====================
// UI操作
// =====================
document.getElementById("sellMeat").onclick = () => {
money += meat * 10;
bag = 0;
meat = 0;
updateUI();
};
