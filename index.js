const express = require('express');
const axios = require('axios');
const MongoClient = require("mongodb").MongoClient;
require('dotenv').config();
const telegramUrl = 'https://api.telegram.org/bot';
const telegramToken = process.env.TOKEN ;
const URL = process.env.URL;
const mongodbURL =  process.env.MongoURL;
const app = express();
app.use(express.json());


const setWebHook = async ()=>{
  try {
    res =  await axios.post(`${telegramUrl}${telegramToken}/setWebhook?url=${URL}/${telegramToken}`)
  } catch (err) {
    console.error(err);
  }
}     

setWebHook();

const client = new MongoClient(mongodbURL, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  app.locals.collection  = client.db("test").collection("devices");
   app.listen (process.env.PORT || 80, function(){
      console.log("Сервер ожидает подключения...");
  });
 });
 
const sendMessage = async (chat_id, text) => {
  try {
    res = await axios.post(`${telegramUrl}${telegramToken}/sendMessage`, { chat_id, text });
  } catch (err) {
    console.error(err);
  }
 };

app.post(`/${telegramToken}`, async function(req, res) {
        const messageChatId = req.body.message.chat.id;
        const messageText = req.body.message.text;
        const messageName = req.body.message.from.first_name;
        const messageDate = new Date ((req.body.message.date+10800)*1000);
        //console.log(req.body);
        await sendMessage(messageChatId, messageText);
        const massage = {name: messageName, massage: messageText, chatId:messageChatId , date:messageDate };
        
        const collection = req.app.locals.collection;
        collection.insertOne(massage, function(err, result){     
            if(err) return console.log(err);
            res.status(200).send(massage);
             
        });
    });
   
       

 

