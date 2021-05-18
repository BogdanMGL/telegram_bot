const express = require('express');
const axios = require('axios');
require('dotenv').config();
const telegramUrl = 'https://api.telegram.org/bot';
const telegramToken = process.env.TOKEN ;
const URL = process.env.URL;

const app = express();
app.use(express.json());


const setWebHook = async ()=>{
  try {
    res =  await axios.post(`${telegramUrl}${telegramToken}/setWebhook?url=${URL}/${telegramToken}`)
  } catch (err) {
    console.error(err);
  }
}     
//
setWebHook();

const sendMessage = async (chat_id, text) => {
  try {
    res = await axios.post(`${telegramUrl}${telegramToken}/sendMessage`, { chat_id, text });
  } catch (err) {
    console.error(err);
  }
 };

app.post(`/${telegramToken}`, async function(req, res) {
        const chatId = req.body.message.chat.id;
        const text = req.body.message.text;
        await sendMessage(chatId, text);
        res.status(200).send({});
       
})  
 
app.listen(3000 , function() {
    console.log('Ready') 
});

