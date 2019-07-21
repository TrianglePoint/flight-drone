const MESSAGE_COUNT_MAX = 10;
const MESSAGE_LENGTH_MAX = 50;

socket.on('new message', (json)=>{
    appChat.addMessage(json);
});

Vue.component('chat', {
    props: ['message'],
    data: ()=>{
        return {
            styleObject: {
                marginLeft: 20
            }
        }
    },
    template: `<table v-bind:style="styleObject">
        <tr>
            <td>{{(message.id == 'SYSTEM' ? '' : message.id + ': ')}}</td>
            <td v-bind:style="{
                fontWeight: (message.id == 'SYSTEM' ? 'bold' : 'normal')
            }">{{message.msg}}</td>
        </tr>
    </table>`
});

Vue.component('chat-input', {
    props: ['clientMsg'],
    data: ()=>{
        return {
            styleObject: {
                marginLeft: 20
            }
        }
    },
    template: `<form v-bind:style="styleObject" onsubmit="return submitMessage(this)">
        <input placeholder="chat..." v-focus/>
    </form>`,
    directives: {
        focus: {
            inserted: function(el){
                el.focus();
                el.type = 'number';
                setTimeout(()=>{
                    el.type = 'text';
                }, 1);
            }
        }
    }
});

var appChat = new Vue({
    el: '#chat',
    data: {
        inputId: 'chatInput',
        isVisible: false,
        messages: [
            /*
             * {
             *  number: number,
             *  id: string,
             *  msg: string
             * }
             */
        ]
    },
    methods: {
        pushMessage: function(msg){
            socket.emit('send message', {
                "id": socket.id,
                "msg": msg
            });
        },
        addMessage: function(json){
            if(this.messages.length >= MESSAGE_COUNT_MAX){
                /*
                 * Remove first message
                 */
                this.messages.splice(0, 1);
                this.messages.forEach(message => {
                    message.number -= 1;
                });
            }
            this.messages.push({
                number: this.messages.length,
                id: json.id,
                msg: json.msg
            });
        }
    }
});

function submitMessage(form){
    let input = form.querySelector('input');

    if(input.value.length > 0 && input.value.length <= MESSAGE_LENGTH_MAX){
        appChat.pushMessage(input.value);
    }
    input.value = '';

    return false;
}