const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 160, y: 160, hp: 10 };
let meat = 0, money = 0, bag = 0;
let objects = [];
const SIZE = 24;

// �I�u�W�F����
function spawnObject(type) {
  objects.push({
    type,
    x: Math.floor(Math.random() * 12) * SIZE,
    y: Math.floor(Math.random() * 12) * SIZE
  });
}
// ������
function initGame() {
  objects = [];
  for(let i=0;i<5;i++) spawnObject('bear');
  for(let i=0;i<8;i++) spawnObject('meat');
  for(let i=0;i<2;i++) spawnObject('counter');
}
function drawGame() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // �v���C���[�i�f�t�H�����l�^�j
  ctx.beginPath();
  ctx.arc(player.x+12, player.y+8, 8, 0, Math.PI*2, false); // head
  ctx.fillStyle = "#59f"; ctx.fill();
  ctx.fillRect(player.x+8, player.y+16, 8, 18); // body
  ctx.fillStyle = "#aba"; ctx.fillRect(player.x+10, player.y+34, 4, 10); // legs

  // �����b�N�iBag: �F�Ⴂ�~�j
  if (bag > 0) {
    ctx.beginPath();
    ctx.arc(player.x+19, player.y+18, 6, 0, Math.PI*2, false);
    ctx.fillStyle="#fc8"; ctx.fill();
    ctx.strokeStyle="#a95"; ctx.stroke();
  }

  // �I�u�W�F�Q
  objects.forEach(obj => {
    switch(obj.type){
      case 'bear':
        // �N�}�i���~�{���{��j
        ctx.beginPath();
        ctx.arc(obj.x+12,obj.y+12,10,0,Math.PI*2,false);
        ctx.fillStyle="#323";ctx.fill();
        ctx.beginPath();
        ctx.arc(obj.x+7,obj.y+6,4,0,Math.PI*2,false);
        ctx.arc(obj.x+17,obj.y+6,4,0,Math.PI*2,false);
        ctx.fillStyle="#423";ctx.fill();
        ctx.fillStyle="#fff";
        ctx.fillRect(obj.x+10, obj.y+14, 4, 3); // ��
        break;
      case 'meat':
        // ���i�ԑȉ~�j
        ctx.beginPath();
        ctx.ellipse(obj.x+12,obj.y+12,8,5,Math.PI/7,0,Math.PI*2);
        ctx.fillStyle="#c22";ctx.fill();
        ctx.strokeStyle="#944";ctx.stroke();
        break;
      case 'counter':
        // �J�E���^�[�i�D�c���l�p�j
        ctx.fillStyle="#bbb";
        ctx.fillRect(obj.x+8,obj.y+6,8,16);
        break;
    }
  });
}

// �L�[����
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp' && player.y>0) player.y-=SIZE;
  if(e.key==='ArrowDown' && player.y+SIZE<canvas.height) player.y+=SIZE;
  if(e.key==='ArrowLeft' && player.x>0) player.x-=SIZE;
  if(e.key==='ArrowRight' && player.x+SIZE<canvas.width) player.x+=SIZE;
  checkCollision();
  drawGame();
});

// �����蔻��
function checkCollision() {
  for(let obj of objects) {
    if(Math.abs(obj.x-player.x)<SIZE && Math.abs(obj.y-player.y)<SIZE){
      if(obj.type==='meat'){ meat++; bag++; objects.splice(objects.indexOf(obj),1); }
      else if(obj.type==='bear'){ player.hp--; if(player.hp<=0) alert('Game Over'); }
      else if(obj.type==='counter' && meat>0){ money+=meat*10; bag=0; meat=0; }
    }
  }
  document.getElementById('meat').textContent = meat;
  document.getElementById('money').textContent = money;
  document.getElementById('hp').textContent = player.hp;
  document.getElementById('bag').textContent = bag;
}

// �����p�{�^��
document.getElementById('sellMeat').onclick = () => {
  money += meat * 10; bag = 0; meat = 0;
  document.getElementById('money').textContent = money;
  document.getElementById('meat').textContent = meat;
  document.getElementById('bag').textContent = bag;
};

initGame();
drawGame();
