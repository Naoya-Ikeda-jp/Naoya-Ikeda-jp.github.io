// game.js
// Three.js + GLTFLoader を使った簡易3D RPG

import * as THREE from './libs/three.module.js';
import { GLTFLoader } from './libs/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 環境光とライト
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// 床
const planeGeo = new THREE.PlaneGeometry(50, 50);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// GLTFLoader
const loader = new GLTFLoader();

// プレイヤー
let player;
loader.load(
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AnimatedCube/glTF-Binary/AnimatedCube.glb",
  (gltf) => {
    player = gltf.scene;
    player.scale.set(0.5, 0.5, 0.5);
    player.position.set(0, 0, 0);
    scene.add(player);
  }
);

// 敵スポーン
function spawnEnemy() {
  loader.load(
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb",
    (gltf) => {
      const enemy = gltf.scene;
      enemy.scale.set(0.02, 0.02, 0.02);
      enemy.position.set(Math.random() * 10 - 5, 0, Math.random() * -10);
      scene.add(enemy);
    }
  );
}
for (let i = 0; i < 3; i++) spawnEnemy();

// カメラ初期位置
camera.position.set(0, 3, 8);

// キー操作
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

function handleMovement() {
  if (!player) return;
  const speed = 0.1;
  if (keys['w'] || keys['ArrowUp']) player.position.z -= speed;
  if (keys['s'] || keys['ArrowDown']) player.position.z += speed;
  if (keys['a'] || keys['ArrowLeft']) player.position.x -= speed;
  if (keys['d'] || keys['ArrowRight']) player.position.x += speed;
  camera.lookAt(player.position);
}

// UI更新
function updateUI() {
  if (player) {
    const pos = player.position;
    document.getElementById("coords").textContent =
      `x:${pos.x.toFixed(2)} y:${pos.y.toFixed(2)} z:${pos.z.toFixed(2)}`;
  }
}

// リサイズ対応
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// メインループ
function animate() {
  requestAnimationFrame(animate);
  handleMovement();
  updateUI();
  renderer.render(scene, camera);
}
animate();
