document.onkeydown = function(){
    keyEvent(true);
}
document.onkeyup = function(){
    keyEvent(false);
}

const CODE_ARRAY = {
    spacebar: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40
}

function keyEvent(isKeyDown){
    var keyCode = event.keyCode;
    if(keyCode == CODE_ARRAY.spacebar){
        if(isKeyDown){
            appDrone.power = !appDrone.power;
        }
    }

    if(!appDrone.power){
        appDrone.left = false;
        appDrone.up = false;
        appDrone.right = false;
        appDrone.down = false;
        return;
    }

    switch(keyCode){
    case CODE_ARRAY.left:
        appDrone.left = isKeyDown;
        break;
    case CODE_ARRAY.up:
        appDrone.up = isKeyDown;
        break;
    case CODE_ARRAY.right:
        appDrone.right = isKeyDown;
        break;
    case CODE_ARRAY.down:
        appDrone.down = isKeyDown;
    }
}