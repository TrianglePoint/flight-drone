const MESSAGE_MAX = 10;

socket.on('new message', (json)=>{
    appChat.addMessage(json);
});

Vue.component('chat', {
    props: ['message'],
    template: `<table>
        <tr>
            <td>{{message.id}}</td><td>{{message.msg}}</td>
        </tr>
    </table>`
});

Vue.component('chat-input', {
    props: ['clientMsg'],
    template: `<form onsubmit="return submitMessage(this)">
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
            if(this.messages.length >= MESSAGE_MAX){
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

    appChat.pushMessage(input.value);
    input.value = '';

    return false;
}