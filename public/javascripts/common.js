document.onkeydown = function(){
    keyEvent(true);
}
document.onkeyup = function(){
    keyEvent(false);
}

let socket = io();

const CODE_ARRAY = {
    spacebar: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    t: 84,
    esc: 27
}

const POWER_COLOR = {
    /*
     * Drone color ('l' of hsl)
     */
    on: 73,
    off: 33
}

function keyEvent(isKeyDown){
    var keyCode = event.keyCode;

    switch(keyCode){
    case CODE_ARRAY.t:
        /*
         * Chat mode
         */
        if(isKeyDown && !(appChat.isVisible)){
            appChat.isVisible = true;
        }
        break;
    case CODE_ARRAY.esc:
        /*
         * Chat mode end
         */
        if(isKeyDown){
            appChat.isVisible = false;
        }
    }

    if(appChat.isVisible){
        /*
         * Can't control drone at chat mode
         */
        return;
    }

    if(keyCode == CODE_ARRAY.spacebar){
        if(isKeyDown){
            appDrone.power = !appDrone.power;
        }
        if(appDrone.power){
            appDrone.hsla.l = POWER_COLOR.on;
        }else{
            appDrone.hsla.l = POWER_COLOR.off;
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