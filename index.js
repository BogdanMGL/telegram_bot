const express = require('express');
const axios = require('axios');
require('dotenv').config();
const telegramUrl = 'https://api.telegram.org/bot';
const telegramToken = process.env.TOKEN;
const URL = process.env.URL;
const mongodbURL = process.env.MongoURL;
const moment = require('moment');
moment.locale('ru');
const app = express();
app.use(express.json());



const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MessageScheme = new Schema({ name: String, message: String, chatId: Number, date: Date }, { versionKey: false });
const Message = mongoose.model("Message", MessageScheme);

const setWebHook = async () => {
  try {
    res = await axios.post(`${telegramUrl}${telegramToken}/setWebhook?url=${URL}/${telegramToken}`)
  } catch (err) {
    console.error(err);
  }
}
setWebHook();


mongoose.connect(mongodbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function (err) {

  app.listen((process.env.PORT || 80), function () {
    console.log('Ready')
  });
});


const sendMessage = async (chat_id, text) => {
  try {
    res = await axios.post(`${telegramUrl}${telegramToken}/sendMessage`, { chat_id, text });
  } catch (err) {
    console.error(err);
  }
};

const saveMessage = (messageChatId, messageText, messageName, messageDate) => {
  const message = new Message({ name: messageName, message: messageText, chatId: messageChatId, date: messageDate });

  message.save(function (err) {
    if (err) return console.log(err);
    });

}

const getAllMessage = (messageChatId) => {
    Message.find({chatId:messageChatId}, function(err, docs){
    let text = '' ;
    for(let i = 0 ;i < docs.length;i++ ){
      text += 'text: ' + docs[i].message + ' , ' + moment(docs[i].date).format('lll')  + '\n';
     }
     sendMessage(messageChatId, text);
   
})

  }
 


const getAllChatList = (messageChatId) => {
  Message.aggregate([{$match: {}}, 
    {$group: {_id:{name:'$name', id:'$chatId' }, numberOfMessage: {$sum:1}}}], function(err, message) {
      let text = ''
      console.log(message);
      for(let i = 0 ;i < message.length;i++ ){
        text += 'name: ' + message[i]._id.name + ', id: ' + message[i]._id.id + ', number of messages: ' + message[i].numberOfMessage  + '\n';
        }
       sendMessage(messageChatId, text);

  })
}
    
app.post(`/${telegramToken}`, async function (req, res) {

  const messageChatId = req.body.message.chat.id;
  const messageText = req.body.message.text;
  const messageName = req.body.message.chat.first_name;
  const messageDate = new Date((req.body.message.date + 10800) * 1000);
 

  switch (messageText) {
    case '/message': 
    getAllMessage(messageChatId)
     break
    case '/chatlist': 
    getAllChatList(messageChatId)
      break
    default:
      saveMessage(messageChatId, messageText, messageName, messageDate);
      await sendMessage(messageChatId, messageText);
    }
  res.status(200).send({});
  console.log(messageText);
 
});


