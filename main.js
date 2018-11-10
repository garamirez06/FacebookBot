
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
const fs = require('fs');


const APP_TOKEN = 'EAANQqmZC6gpQBAJjF65u06hgMjI0hZB5wZCSsRV1tNNe15vK4Y24OoEOrx3nzE5354rOMs9R3iEy4VulWahf7uUyzZAPlkTMvZBpfMGHhkbg6wjSPQ0LlwZCTU3uTMT9KaDWAUp8uaAwc0aWxfjYwPxjMv32PZAY2dGwMdZAgRjZB0QZDZD';

var app = express();
app.use(bodyParser.json());

app.listen(3000, function () {
    console.log('EL servidor se encuentra en el puerto 3000');
});

app.get('/', function (req, res) {
    res.send('Bienvenido!!');
});

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] == '1234') {
        res.send(req.query['hub.challenge'])
    }
    else {
        res.send('NO tienes que estar aqui');
    }
});


app.post('/webhook', function (req, res) {
    var data = req.body;
    grabarEnArchivo(JSON.stringify(data));

    if (data.object == 'page') {
        //Recorremos las entradas de pagina
        data.entry.forEach(function (pageEntry) {

            pageEntry.messaging.forEach(function (messagingEvent) {
                if (messagingEvent.message) {
                    receiveMessage(messagingEvent);
                }
            });
        });



        res.sendStatus(200);
    }
});

function receiveMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var messageText = event.message.text;

    sendLeido(senderID);

    console.log("Sender: " + senderID);
    console.log("Recipient: " + senderID);
    console.log("Texto: " + messageText);
    evaluateMessage(senderID, messageText);
}


function evaluateMessage(senderID, message) {
    var finalMessage = 'No hay mensaje';

    if (typeof yourvar !== 'undefined') {
        //Ayuda --> envio ayuda
        if (isContain(message, 'ayuda')) {
            finalMessage = message;
        }
        else {
            finalMessage = message;
        }
    }



    getInfoApi(senderID);

    sendTyping(senderID);
    sendMessageText(senderID, "El texto recibo es: " + finalMessage);
    if (isContain(finalMessage, 'gato'))
        sendMessageAttachment(senderID);
    if (isContain(finalMessage, 'ayuda'))
        sendMessageTemplate(senderID);
}

function isContain(sentence, word) {
    return sentence.indexOf(word) > -1;
}


function sendMessageText(recipientID, message) {
    var messageData = {
        recipient: {
            id: recipientID
        },
        message: {
            text: message
        }
    };
    callSendAPI(messageData);
}


function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: APP_TOKEN },
        method: 'POST',
        json: messageData
    }, function (error, response, data) {
        if (error) {
            console.log('NO es posible enviar');
        }
        else {
            console.log('Mensaje enviado');
        }
    });
}


function sendMessageAttachment(recipientID) {
    var messageData = {
        recipient: {
            id: recipientID
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: "https://estaticos.elperiodico.com/resources/jpg/1/6/1502194230861.jpg"
                }
            }
        }
    };
    callSendAPI(messageData);
}

function sendMessageTemplate(recipientID) {
    var messageData = {
        recipient: {
            id: recipientID
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [elementTemplate()]
                }
            }
        }
    };
    callSendAPI(messageData);
}

function elementTemplate() {
    return {
        title: "Gustavo Ramirez",
        subtitle: "Desarrollador",
        item_url: "https://web.facebook.com/TestingR2/",
        image_url: "https://estaticos.elperiodico.com/resources/jpg/1/6/1502194230861.jpg",
        buttons: [buttonTemplate()],
    }
}

function buttonTemplate() {
    return {
        type: "web_url",
        url: "https://web.facebook.com/TestingR2/",
        title: "RG"
    }
}

function getInfoApi(recipientID) {
    request({
        uri: 'https://graph.facebook.com/v2.6/' + recipientID + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + APP_TOKEN,
        qs: { access_token: APP_TOKEN },
        method: 'GET',
        json: true
    }, function (error, response, data) {
        if (error) {
            console.log('NO es posible obtener la info... ');
            console.log(error);
        }
        else {
            console.log('Se obtuvo informacion');
            console.log(response);
        }
    });
}


function sendTyping(recipientID) {
    var messageData = {
        recipient: {
            id: recipientID
        },
        sender_action: "typing_on"
    };
    callSendAPI(messageData);
}

function sendLeido(recipientID) {
    var messageData = {
        recipient: {
            id: recipientID
        },
        sender_action: "mark_seen"
    };
    callSendAPI(messageData);
}


//Logueo de informacion
function grabarEnArchivo(data) {
    fs.appendFile('data.txt', data + "\n", error => {
        if (error)
            console.log(error);
    });
}
