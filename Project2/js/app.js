// 这是我们的玩家要躲避的敌人 
class Enemy{
    // 要应用到每个敌人的实例的变量写在这里
    // 我们已经提供了一个来帮助你实现更多

    // 敌人的图片，用一个我们提供的工具函数来轻松的加载文件
    constructor(x=450,y=0,sprite='images/enemy-bug.png'){
        this.sprite = sprite;
        this.x = x;
        this.y = y;
    }

    // 此为游戏必须的函数，用来更新敌人的位置
    // 参数: dt ，表示时间间隙
    update (dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
        if(this.x>505){
            this.x = -101;
        }
        else{
            this.x+=101*dt;
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
    constructor(x=100,y=100, sprite='images/char-boy.png'){
        super(x,y,sprite);
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
    player;
function initEnemies(){
    for(let i = 0; i < 5; i++){
        allEnemies.push(new Enemy(i*101,i*83));
    }
    player = new Player();
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


