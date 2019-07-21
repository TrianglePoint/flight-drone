const ALMOST_60FPS = 16;

const GRAVITY = 0.25;
const SPEED_MIN = 0;
const SPEED_MAX = 10;
const ACCELERATION = 1;
const STABILIZE_SPEED = 0.25;
const ENERGY_LOSS_RATE = 0.25;
const PERCENT_100 = 1;

const SPAWN_MIN = 100;
const SPAWN_MAX = 300;

var objectLocations = [];

socket.on('create someone drone', (json)=>{
    appField.createThing(json);
});

socket.on('update someone drone', (json)=>{
    appField.updateThing(json);
});

socket.on('remove someone drone', (json)=>{
    appField.removeThing(json);
});

socket.on('change speed', (json)=>{
    switch(json.dimension){
    case 'x':
        appDrone.setSpeedX(json.speed);
        break;
    case 'y':
        appDrone.setSpeedY(json.speed);
    }
});

Vue.component('thing', {
    props: ['x', 'y', 'w', 'h', 'rgba'],
    data: function(){ 
        return {
            styleObjectSvg: {
                position: 'absolute',
            },
            styleObjectShape: {
                fill: 'rgba(' + 
                this.rgba.r + ', ' + 
                this.rgba.g + ', ' + 
                this.rgba.b + ', ' +
                this.rgba.a + ')'
            }
        }
    },
    template: `<svg v-bind:style="{position: styleObjectSvg.position, 
    left: x, bottom: y, width: w, height: h}">
        <rect v-bind:style="{left: x, bottom: y, width: w, height: h, 
        fill: styleObjectShape.fill}"/>
    </svg>`
});

Vue.component('drone', {
    props: ['object'],
    data: function(){
        return {
            styleObjectSvg: {
                position: 'absolute',
            },
            styleObjectShape: {
                fill: 'rgba(135, 206, 235, 0.75)'
            }
        }
    },
    template: '<svg v-bind:style="{' +
    'position: styleObjectSvg.position, ' + 
    'width: object.width, ' +
    'height: object.height, ' + 
    'left:object.x, bottom:object.y}">' +
        '<rect v-bind:style="{' + 
        'fill: styleObjectShape.fill, ' + 
        'width: object.width,' + 
        'height: object.height}"/>' +
    '</svg>'
});

var appField = new Vue({
    el: '#field',
    data: {
        infos: [
            /*
             * Info of other drone
             * default size is 0
             */
        ]
    },
    methods: {
        createThing: function(json){
            this.infos.push({
                id: json.id,
                x: json.x,
                y: json.y,
                speedX: json.speedX,
                speedY: json.speedY,
                width: json.width,
                height: json.height
            });
        },
        updateThing: function(json){
            var index = this.infos.findIndex((info)=>{
                return info.id == json.id;
            });

            if(index != -1){
                Vue.set(this.infos, index, json);
            }
        },
        removeThing: function(json){
            if(json){
                var index = this.infos.findIndex((info)=>{
                    return info.id == json.id;
                })

                this.infos.splice(index, 1);
            }
        },
        updateObjectLocation: function(){
            var field = document.getElementById('field');

            objectLocations = [];
            
            Array.from(field.children).forEach(element => {
                var template = {
                    id: element.id,
                    x0: parseInt(element.style.left),
                    y0: parseInt(element.style.bottom),
                    x1: parseInt(element.style.left) + 
                    parseInt(element.style.width),
                    y1: parseInt(element.style.bottom) + 
                    parseInt(element.style.height)
                }

                objectLocations.push(template);
            });

            setTimeout(this.updateObjectLocation, ALMOST_60FPS);
        },

        getCollisionObject: function(location){

            for(var i = 0; i < objectLocations.length; i++){
                if(objectLocations[i].x0 <= location.x1 && 
                objectLocations[i].x1 >= location.x0 && 
                objectLocations[i].y0 <= location.y1 && 
                objectLocations[i].y1 >= location.y0){

                    return objectLocations[i];
                }
            }

            return null;
        }
    }
});

var appDrone = new Vue({
    el: '#drone',
    data: {
        power: true,
        x: SPAWN_MIN + Math.floor(Math.random() * SPAWN_MAX),
        y: SPAWN_MIN + Math.floor(Math.random() * SPAWN_MAX),
        speedX: 0,
        speedY: 0,
        left: false,
        up: false,
        right: false,
        down: false,
        width: 50,
        height: 50
    },
    methods: {
        transmitFirstDroneData: function(){
            let location = {
                x0 : this.x,
                y0 : this.y,
                x1 : this.x + this.width,
                y1 : this.y + this.height
            }

            if(socket.id && appField.getCollisionObject(location) == null){
                socket.emit('created drone', this.getObjectDataAsJSON(socket.id));
            }else{
                this.setX(SPAWN_MIN + Math.floor(Math.random() * SPAWN_MAX));
                this.setY(SPAWN_MIN + Math.floor(Math.random() * SPAWN_MAX));
                setTimeout(this.transmitFirstDroneData, ALMOST_60FPS);
            }
        },
        stabilizeX: function(){
            if(this.speedX > SPEED_MIN){
                this.setSpeedX(this.speedX - STABILIZE_SPEED);
                if(this.speedX < SPEED_MIN){
                    this.speedX = SPEED_MIN;
                }
            }else if(this.speedX < SPEED_MIN){
                this.setSpeedX(this.speedX + STABILIZE_SPEED);
                if(this.speedX > SPEED_MIN){
                    this.speedX = SPEED_MIN;
                }
            }
        },
        stabilizeY: function(){
            if(this.speedY > SPEED_MIN){
                this.setSpeedY(this.speedY - STABILIZE_SPEED);
                if(this.speedY < SPEED_MIN){
                    this.speedY = SPEED_MIN;
                }
            }else if(this.speedY < SPEED_MIN){
                this.setSpeedY(this.speedY + STABILIZE_SPEED);
                if(this.speedY > SPEED_MIN){
                    this.speedY = SPEED_MIN;
                }
            }
        },
        updateX: function(){
            let collisionObject;
            let futureLocation = {
                x0 : this.x + this.speedX,
                y0 : this.y,
                x1 : this.x + this.speedX + this.width,
                y1 : this.y + this.height
            }

            collisionObject = appField.getCollisionObject(futureLocation);

            if(collisionObject != null){
                let found = appField.infos.find((info)=>{
                    return info.id == collisionObject.id;
                });

                if(found != null){
                    /*
                     * Collision with ohter drone.
                     */
                    socket.emit('collision with other drone', {
                        "dimension": 'x', 
                        "id": found.id, 
                        "speed": this.speedX
                    });
                    this.setSpeedX(found.speedX * (PERCENT_100 - ENERGY_LOSS_RATE));
                    this.setSpeedY(this.speedY * (PERCENT_100 - ENERGY_LOSS_RATE));
                }else{
                    /*
                    * Change to Negative is Bounce
                    */
                    this.setSpeedX(-(this.speedX * (PERCENT_100 - ENERGY_LOSS_RATE)));
                    this.setSpeedY(this.speedY * (PERCENT_100 - ENERGY_LOSS_RATE));
                }
            }else{
                /*
                 * No collision
                 */
                this.setX(this.x + this.speedX);
            }
            socket.emit('transmit drone data', this.getObjectDataAsJSON(socket.id));
            
            setTimeout(this.updateX, ALMOST_60FPS);
        },
        updateY: function(){
            let collisionObject;
            let futureLocation = {
                x0 : this.x,
                y0 : this.y + this.speedY,
                x1 : this.x + this.width,
                y1 : this.y + this.speedY + this.height
            }

            collisionObject = appField.getCollisionObject(futureLocation);
            
            if(collisionObject != null){                    
                let found = appField.infos.find((info)=>{
                    return info.id == collisionObject.id;
                });

                if(found != null){
                    /*
                     * Collision with ohter drone.
                     */
                    socket.emit('collision with other drone', {
                        "dimension": 'y', 
                        "id": found.id, 
                        "speed": this.speedY
                    });
                    this.setSpeedY(found.speedY * (PERCENT_100 - ENERGY_LOSS_RATE));
                    this.setSpeedX(this.speedX * (PERCENT_100 - ENERGY_LOSS_RATE));
                }else{
                    /*
                    * Change to Negative is Bounce
                    */
                    this.setSpeedY(-(this.speedY * (PERCENT_100 - ENERGY_LOSS_RATE)));
                    this.setSpeedX(this.speedX * (PERCENT_100 - ENERGY_LOSS_RATE));
                }                    
            }else{
                /*
                 * No collision
                 */
                this.setY(this.y + this.speedY);
            }
            socket.emit('transmit drone data', this.getObjectDataAsJSON(socket.id));

            setTimeout(this.updateY, ALMOST_60FPS);
        },
        updateSpeed: function(){
            if(this.left){
                this.setSpeedX(this.speedX - ACCELERATION);
            }
            if(this.right){
                this.setSpeedX(this.speedX + ACCELERATION);
            }
            if(this.up){
                this.setSpeedY(this.speedY + ACCELERATION);
            }
            if(!this.power){
                this.setSpeedY(this.speedY - GRAVITY);
            }else if(this.down){
                this.setSpeedY(this.speedY - ACCELERATION);
            }

            if(this.isIdleX()){
                this.stabilizeX();
            }
            if(this.isIdleY()){
                this.stabilizeY();
            }

            setTimeout(this.updateSpeed, ALMOST_60FPS);
        },
        getObjectDataAsJSON: function(id){
            var json = {
                "id": id,
                "x": this.x,
                "y": this.y,
                "speedX": this.speedX,
                "speedY": this.speedY,
                "width": this.width,
                "height": this.height
            }

            return json;
        },
        setX: function(location){
            this.x = location;
        },
        setY: function(location){
            this.y = location;
        },
        setSpeedX: function(speed){
            if(speed < (-SPEED_MAX)){
                this.speedX = -SPEED_MAX;
            }else if(speed > SPEED_MAX){
                this.speedX = SPEED_MAX;
            }else{
                this.speedX = speed;
            }
        },
        setSpeedY: function(speed){
            if(speed < (-SPEED_MAX)){
                this.speedY = -SPEED_MAX;
            }else if(speed > SPEED_MAX){
                this.speedY = SPEED_MAX;
            }else{
                this.speedY = speed;
            }
        },
        isIdleX: function(){
            return (this.power) && 
            (!this.left) && (!this.right)
        },
        isIdleY: function(){
            return (this.power) && 
            (!this.up) &&(!this.down);
        }
    }
});

appDrone.transmitFirstDroneData();
appDrone.updateX();
appDrone.updateY();
appDrone.updateSpeed();

appField.updateObjectLocation();