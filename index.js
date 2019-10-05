var sw = 20,//小方块宽
    sh = 20,//小方块高
    tr = 30,//行数
    tc = 30;//列数
var snake = null,//蛇的实例
    food = null,//食物的实例
    game = null;//游戏实例

//方块的构造函数
function Square(x,y,classname){
    this.x = x*sw;
    this.y = y*sh;
    this.class = classname;
    this.viewcontent = document.createElement('div');
    this.viewcontent.className = this.class;
    this.parent = document.getElementsByClassName('snakewrap')[0];//加[0]

}
//方块生成方法
Square.prototype.create = function(){
    this.viewcontent.style.width = sw + 'px';
    this.viewcontent.style.height = sh + 'px';
    this.viewcontent.style.position = 'absolute';
    this.viewcontent.style.left = this.x + 'px';
    this.viewcontent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewcontent);
}
//方块删除方法
Square.prototype.remove = function(){
    this.parent.removeChild(this.viewcontent);
}
//蛇的构造函数
function Snake(){
    this.head = null,
    this.tail = null,
    this.pos = []; //存储蛇每个位置的坐标
    this.directionnum = { //蛇行走方向
        left:{
            x:-1,
            y:0,
            rotate:180
        },
        right:{
            x:1,
            y:0,
            rotate:0
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        down:{
            x:0,
            y:1,
            rotate:90
        }
    }
    
}
//蛇初始化
Snake.prototype.init = function(){
    
    //创建蛇头
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2,0]);

    //创建蛇身1
    var snakeBody1 = new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]);

    //创建蛇身2
    var snakeBody2 = new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0,0]);

    //形成链表关系
    // null<=tail<=>snakeBody1<=>head=>null
    this.head.last = null;
    this.head.next = snakeBody1;
    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;
    this.tail.last = snakeBody1;
    this.tail.next = null;

    this.direction = this.directionnum.right;

}
//蛇下一个位置及状态
Snake.prototype.nextState = function(){
    var nextPos = [this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y];
    //下个点是墙，碰到墙
    if(nextPos[0]<0 || nextPos[0]>tr-1 || nextPos[1]<0 || nextPos[1]>tc-1){
        this.action.die.call(this);
        return;
    }
    // 下个点是自己，碰到自己
    var selfflag = false;
    this.pos.forEach(function(ele){
        if(ele[0] == nextPos[0] && ele[1] == nextPos[1]){
            selfflag = true;
        }
    });
    if(selfflag){
        this.action.die.call(this);
        return;
    }

    // 下个点是食物，吃到食物
    if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]){
        this.action.eat.call(this);
        return;
    }
    
    //下个点什么都没有，继续前进
    this.action.move.call(this);
}
//蛇三种状态下要执行的动作
Snake.prototype.action = {
    move:function(format){//format参数表示是否删除蛇尾，false：正常行走，删除蛇尾，true：吃到食物，不删除蛇尾
        //创建新身体
        var newbody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        //更新链表关系
        newbody.next = this.head.next;
        newbody.next.last = newbody;
        newbody.last = null;

        this.head.remove();
        newbody.create();
        //创建新蛇头
        var newhead = new Square(this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y,'snakeHead');
        
        //更新链表关系
        newbody.last = newhead;
        newhead.next = newbody;
        newhead.last = null;

        newhead.viewcontent.style.transform = 'rotate('+ this.direction.rotate +'deg)';
        newhead.create();   

        //更新存放蛇位置信息的数组
        this.pos.unshift([this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y])
        this.head = newhead;

        if(!format){
                this.tail.remove(); //删除蛇尾
                this.tail = this.tail.last;
                this.pos.pop();
        }  
    },
    eat:function(){
        this.action.move.call(this,true);
        creatFood();
        game.score++;
    },
    die:function(){
        game.over();
    }
}

function creatFood(){
    var x = null,
        y = null;
    var include = true;
    while(include){
        x = Math.round(Math.random()*(tr-1));
        y = Math.round(Math.random()*(tc-1));
        snake.pos.forEach(function(ele){
            if(x!=ele[0] && y!=ele[1]){
                include = false;
            }
        });
    }
    //生成食物
    food = new Square(x,y,'food');
    food.pos = [x,y];
    var foodDom = document.querySelector('.food');
    if(foodDom){
        foodDom.style.left = x*sw + 'px';
        foodDom.style.top = y*sh + 'px';
    }else{
        food.create();
    }   
    
}
//创建游戏构造函数
function Game(){
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function(){
    snake.init();
    creatFood();
    //绑定键盘事件
    document.onkeydown = function(e){
        if(e.key == 'ArrowLeft' && snake.direction != snake.directionnum.right){
            snake.direction = snake.directionnum.left;
        }else if(e.key == 'ArrowRight' && snake.direction != snake.directionnum.left){
            snake.direction = snake.directionnum.right;
        }else if(e.key == 'ArrowUp' && snake.direction != snake.directionnum.down){
            snake.direction = snake.directionnum.up;
        }else if(e.key == 'ArrowDown' && snake.direction != snake.directionnum.up){
            snake.direction = snake.directionnum.down;
        }       
    }
    this.start();
}
//游戏开始
Game.prototype.start = function(){
    this.timer = setInterval(function(){
        snake.nextState();
    },300)
}
//游戏暂停
Game.prototype.pause = function(){
    clearInterval(this.timer);
}
// 游戏结束
Game.prototype.over = function(){
    clearInterval(this.timer);
    alert('你的得分为：'+ this.score+ '\n游戏结束！！！');
    //游戏回到最初状态，页面结构清空，缓存清空
    var snakewrap = document.getElementsByClassName('snakewrap')[0];
    snakewrap.innerHTML= '';
    snake = new Snake();
    game = new Game();
    var startbtn = document.getElementsByTagName('button')[0];
    startbtn.parentNode.style.display = 'block';
}


//*
//* main
//*
var snake = new Snake();
game = new Game();
var startbtn = document.getElementsByTagName('button')[0];
//开始按钮绑定点击事件
startbtn.onclick = function(){
    startbtn.parentNode.style.display = 'none';
    game.init();
}
//暂停游戏绑定事件
var snakewrap = document.getElementsByClassName('snakewrap');
var pausebtn = document.getElementsByTagName('button')[1];
snakewrap.onclick = function(){
    game.pause();
    pausebtn.parentNode.style.display = 'block';
}
//暂停后再开始事件绑定
pausebtn.onclick = function(){
    game.start();
    pausebtn.parentNode.style.display = 'none';
}





