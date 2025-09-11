const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 160, y: 270, hp: 10 };
let snow = 0, coal = 0, fuel = 0;
let objects = [];
const SIZE = 24;
let campfire = {x: 160, y: 160, level: 1, fuel: 0};

function spawnObject(type) {
  let pos = {
    x: Math.floor(Math.random() * 12) * SIZE,
    y: Math.floor(Math.random() * 7) * SIZE
  };
  if(type==='snow') pos.y += 32; //雪は下の方に
  objects.push({type, ...pos});
}

function initGame() {
  objects = [];
  for (let i = 0; i < 10; i++) spawnObject('snow');
  for (let i = 0; i < 3; i++) spawnObject('bear');
  for (let i = 0; i < 2; i++) spawnObject('wolf');
}

function drawGame() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // キャンプファイア（橙色円+炎）
  ctx.beginPath();
  ctx.arc(campfire.x, campfire.y, 14 + campfire.level*2, 0, Math.PI*2);
  ctx.fillStyle = campfire.fuel > 0 ? "#fd8" : "#aaa";
  ctx.fill();
  // 炎
  if(campfire.fuel > 0){
    ctx.beginPath();
    ctx.moveTo(campfire.x, campfire.y-10);
    ctx.quadraticCurveTo(campfire.x-8,campfire.y-18,campfire.x,campfire.y-20);
    ctx.quadraticCurveTo(campfire.x+8,campfire.y-18,campfire.x,campfire.y-10);
    ctx.fillStyle = "#f60"; ctx.fill();
  }
  // プレイヤー（青円と白四角: バキューム持ち）
  ctx.beginPath();
  ctx.arc(player.x+12, player.y+6, 10, 0, Math.PI*2, false);
  ctx.fillStyle = "#59f"; ctx.fill();
  ctx.fillStyle="#fff"; ctx.fillRect(player.x+6, player.y+18, 12, 8);

  // オブジェ群
  objects.forEach(obj=>{
    switch(obj.type){
      case 'bear': //クマ（黒円+耳）
        ctx.beginPath();
        ctx.arc(obj.x+12, obj.y+9, 10, 0, Math.PI*2,false);
        ctx.fillStyle="#432";ctx.fill();
        ctx.beginPath();
        ctx.arc(obj.x+7, obj.y+3,4,0,Math.PI*2,false);
        ctx.arc(obj.x+17,obj.y+3,4,0,Math.PI*2,false);
        ctx.fillStyle="#654";ctx.fill();
        break;
      case 'wolf': // オオカミ（灰色円+耳）
        ctx.beginPath();
        ctx.arc(obj.x+12, obj.y+9, 10, 0, Math.PI*2,false);
        ctx.fillStyle="#aaa";ctx.fill();
        ctx.beginPath();
        ctx.arc(obj.x+7, obj.y+3,3,0,Math.PI*2,false);
        ctx.arc(obj.x+17,obj.y+3,3,0,Math.PI*2,false);
        ctx.fillStyle="#ccd";ctx.fill();
        break;
      case 'snow': // 雪（淡青円+ライト青枠）
        ctx.beginPath();
        ctx.arc(obj.x+12,obj.y+13,8,0,Math.PI*2,false);
        ctx.fillStyle="#e7f3fa";ctx.fill();
        ctx.strokeStyle="#bce";ctx.stroke();
        break;
    }
  });
}

// キー操作
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp' && player.y>0) player.y-=SIZE;
  if(e.key==='ArrowDown' && player.y+SIZE<canvas.height) player.y+=SIZE;
  if(e.key==='ArrowLeft' && player.x>0) player.x-=SIZE;
  if(e.key==='ArrowRight' && player.x+SIZE<canvas.width) player.x+=SIZE;
  checkCollision(); drawGame();
});

function checkCollision() {
  for(let obj of objects) {
    if(Math.abs(obj.x-player.x)<SIZE && Math.abs(obj.y-player.y)<SIZE){
      if(obj.type==='snow'){ snow++; objects.splice(objects.indexOf(obj),1); }
      else if(obj.type==='bear'){ player.hp--; if(player.hp<=0) alert('Game Over'); objects.splice(objects.indexOf(obj),1);}
      else if(obj.type==='wolf'){ player.hp--; if(player.hp<=0) alert('Game Over'); objects.splice(objects.indexOf(obj),1);}
    }
  }
  updateUI();
}

function updateUI() {
  document.getElementById('snow').textContent = snow;
  document.getElementById('coal').textContent = coal;
  document.getElementById('fuel').textContent = fuel;
  document.getElementById('hp').textContent = player.hp;
}

// 雪バキューム（ボタン）
document.getElementById('useVacuum').onclick = ()=>{
  if(snow>=5){
    coal++; snow-=5; 
    updateUI();
    drawGame();
  }
};
// 石炭投入（ボタン）
document.getElementById('addCoal').onclick = ()=>{
  if(coal>0){
    coal--; campfire.fuel+=3; campfire.level++;
    updateUI(); drawGame();
  }
};

// キャンプファイヤーの燃料消費と雪消滅ロジック
setInterval(()=>{
  if(campfire.fuel > 0){
    campfire.fuel--;
    // レベルごとにフィールド内の雪を消す
    let removed = 0;
    for(let obj of objects){
      if(obj.type === 'snow' && campfire.level > 1){
        // 範囲判定
        if(Math.hypot(obj.x+12-campfire.x,obj.y+13-campfire.y)<campfire.level*32){
          objects.splice(objects.indexOf(obj),1); removed++;
          if(removed>=campfire.level) break;
        }
      }
    }
    drawGame();
  }
}, 1100);

initGame(); drawGame(); updateUI();
