
const axios = require('axios')

import {
    MessageType,
    MessageOptions,
    WALocationMessage,
} from '@adiwajshing/baileys'

export async function getMessageFromTemplate(msg:string) {
    let messages:any=[];
    try {
        const options = {
            params: { 
                msg 
            },
            headers: {
                token: process.env.API_TOKEN
            }
        }

        messages = await axios.get(process.env.API_URL+'/message/template',options); 
        console.log(messages)
    } catch (error) {
        console.error(error)
    }
    return messages
}

export async function checkMessage(sender:string, type:string, input:string, desc:string) {
    let messages:any=[];
    try {
        const options = {
            headers: {
                token: process.env.API_TOKEN
            }
        }
        

        messages = await axios.get(process.env.API_URL+'/message/check-message',
        { sender,type,input,desc},
        options); 
        console.log(messages);        
    } catch (error) {
        console.error(error)
    }
    return messages
}

export async function checkInbox(conn, chat) {
    
    if(chat.imgUrl) {
        console.log('imgUrl of chat changed ', chat.imgUrl)
        return
    }
    // only do something when a new message is received
    if (!chat.hasNewMessage) {
        if(chat.messages) {
            console.log('updated message: ', chat.messages.first)
        }
        return
    } 
    
    const m = chat.messages.all()[0] // pull the new message from the update
    const messageContent = m.message
    // if it is not a regular text or media message
    if (!messageContent) return
    
    if (m.key.fromMe) {
        console.log('relayed my own message')
        return
    }

    let sender = m.key.remoteJid
    let user = conn.contacts[sender]
    

    

    if (m.key.participant) {
        // participant exists if the message is in a group
        sender += ' (' + m.key.participant + ')'
    }
    const messageType = Object.keys (messageContent)[0] // message will always contain one key signifying what kind of message

    if (messageType === MessageType.location || messageType === MessageType.liveLocation) {
        const locMessage = m.message[messageType] as WALocationMessage
        console.log(`${sender} sent location (lat: ${locMessage.degreesLatitude}, long: ${locMessage.degreesLongitude})`)
    }else if (messageType === MessageType.text) {
        const text = m.message.conversation
        console.log(sender + ' sent: ' + text)        
        await conn.chatRead(m.key.remoteJid) 
        const options: MessageOptions = { quoted: m }
        let content:string
        let type: MessageType

        type = MessageType.text
        content = 'content not set'
        
        if (text.toLowerCase() ==='info'){
            content = 'sender id: '+ sender
        }else{
            return false
            const desc = JSON.stringify({user})
            // const chekMessage:any = await checkMessage(sender,type,text,desc)

            // if (chekMessage.data.status=='success'){
            //     content = chekMessage.data.data.message
            //     console.log(content);
            // }else{
            //     const getMessage:any = await getMessageFromTemplate(text.toLowerCase())

            //     if (getMessage.data.status=='error'){
            //         console.log(getMessage.data);            
            //         return false
            //     }

            //     content = getMessage.data.data.message
            // }
        }
        
        const response = await conn.sendMessage(m.key.remoteJid, content, type, options)
        console.log("sent message with ID '" + response.key.id + "' successfully")
    }else{
        console.log(messageType)        
        return
    }
}