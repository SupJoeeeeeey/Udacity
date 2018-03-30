const playerImages = ['images/char-boy.png', 
                    'images/char-cat-girl.png',
                    'images/char-horn-girl.png',
                    'images/char-pink-girl.png',
                    'images/char-princess-girl.png'];
let selectedPlayer;

// 这是我们的玩家要躲避的敌人 
class Enemy{
    // 要应用到每个敌人的实例的变量写在这里
    // 我们已经提供了一个来帮助你实现更多

    // 敌人的图片，用一个我们提供的工具函数来轻松的加载文件
    constructor(sprite='images/enemy-bug.png', x=450, y=0, speed=0){
        this.sprite = sprite;
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    // 此为游戏必须的函数，用来更新敌人的位置
    // 参数: dt ，表示时间间隙
    update (dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
        if(this.x>505){
            this.x = -101;
            this.y = (Math.floor(Math.random()*3))*83+60;
            this.speed = (Math.floor(Math.random()*2)+1)*101;
        }
        else{
            this.x+=this.speed*dt;
        }
    }

    // 此为游戏必须的函数，用来在屏幕上画出敌人，
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
class Player extends Enemy{
    constructor(sprite='images/char-boy.png', x=101,y=324,speed=0){
        super(sprite,x,y,speed);
    }

    update(dt){

    }

    render(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        this.collisionHandler();
    }

    handleInput(e){
        switch(e){
            case 'left':
                if(this.x>0){
                    this.x-=101;
                }
                break;
            case 'right':
                if(this.x<404){
                    this.x+=101;
                }
                break;
            case 'up':
                if(this.y>-8){
                    this.y-=83;
                }
                break;
            case 'down':
                if(this.y<402){
                    this.y+=83;
                }
                break;
            default:
                break;
        }
    }

    collisionHandler(){
        allEnemies.forEach(function(enemy) {
            if((enemy.x < player.x && enemy.x+50.5>=player.x)|| (enemy.x-50.5<player.x && enemy.x>=player.x)){
                if(enemy.y+15 == player.y){
                    player.reset();
                }
            }
        });
    }

    reset(){
        this.x=Math.floor(Math.random()*5)*101;
        
        this.y=324+Math.floor(Math.random()*2)*83;
    }
}
//创建过关钥匙类，继承敌人类
class Key extends Enemy{
    constructor(sprite='images/Key.png',x=0,y=-5,speed=0){
        super(sprite,x,y,speed);
    }
    update(dt){

    }
    render(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

// 现在实例化你的所有对象
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
// 把玩家对象放进一个叫 player 的变量里面
let allEnemies = [],
    player,
    key,
    time=0,
    timeCounter,
    lastSelected;

function initAll(){
    key = null;
    time = 0;
    //创建5个敌人对象
    if(allEnemies.length == 0){
        for(let i = 0; i < 5; i++){
            allEnemies.push(new Enemy('images/enemy-bug.png',-101,(Math.floor(Math.random()*3))+60,(Math.floor(Math.random()*2)+1)*101));
        }
    }

    //创建玩家人物
    player = new Player();

    //玩家可自定义人物
    playerSelect();
    $(".players").click(function(){
        selectedPlayer = $(this).children('img').attr('src');
        if(lastSelected!=null){
            $(lastSelected).css('border','2px solid brown');
        }
        $(this).css('border','medium double rgb(250,0,255)');
        lastSelected = this;
    });

    //创建钥匙位置
    key = new Key('images/Key.png',Math.floor(Math.random()*4)*101,-5);
}



// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Player.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});


//游戏开始前选择人物
function playerSelect(){
    let players = '';
    for(let i = 0; i < playerImages.length; i++){
        players+=`<li class='players'><img src='${playerImages[i]}' height='171px' width='101px' /></li>`
    }
    const playerContainer = `<ul class='container'>${players}</ul>`
    swal({
        title: 'Select Your Player',
        html: playerContainer,
        width: 680,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "Let's go!"
        }).then((result) => {
        if (result.value) {
            player.sprite = selectedPlayer;
            timeCounter = setInterval(function(){
                time++;
                $("#timeCounter").text(time+' Seconds');
            },1000);
        }
        else{
            player.sprite='images/char-boy.png';
        }
    });
}



