import * as dotenv from 'dotenv'
import * as fs from 'fs'

import {
    WAConnection,
    MessageType,
    MessageOptions,
    ReconnectMode,
} from '@adiwajshing/baileys'

import {
    checkOutBox, 
} from './Modules/Messages'


dotenv.config();

// inisialisasi koneksi
const conn = new WAConnection()
conn.autoReconnect = ReconnectMode.onConnectionLost 
conn.logger.level = 'error' 
conn.connectOptions.maxRetries = 10

fs.existsSync('./auth_info.json') && conn.loadAuthInfo ('./auth_info.json')

conn.connect()
const authInfo = conn.base64EncodedAuthInfo()
fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, '\t'))

async function index() {
    const options: MessageOptions = { }
    const type = MessageType.text
    
    checkOutBox(conn, options, type)
    

}

index().catch((err) => console.log(`encountered error: ${err}`))