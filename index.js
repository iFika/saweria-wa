{{const fs = require("fs")
if(!fs.existsSync("config.json"))
{
    fs.writeFile(`config.json`, `{"subdomain":"",
"owner":0,
"port":0,
"groupid":"",
"prefix":""
}`, function(err) {

})
     console.log(`[!] : Program Meminta Restart, Silakan Buka Kembali!`)
     return;
}
const config = require("./config.json")
var bodyParser = require('body-parser')
const express = require("express")
const {Client, MessageMedia, Buttons} = require("whatsapp-web.js")
let app = express()
const localtunnel = require("localtunnel")
const qrcode = require("qrcode-terminal")
const { group } = require("console")

//Validation

if(config.owner == 0)
{
    return console.log(`[ERROR] : Hai! Masih Ada Yang Kosong, Silakan Diisi Di Config.json ya!
Silakan Di Awali Dengan 62 ya!
(Yang Dibutuhkan : OWNER NUMBER)`)
}
if(config.subdomain == "")
{
    return console.log(`[ERROR] : Hai! Masih Ada Yang Kosong, Silakan Diisi Di Config.json ya!
Silakan Isi Subdomain Nya Dengan 1 Kata Saja Seperti Nama Channel Pemilik.

(Yang Dibutuhkan : SUBDOMAIN)`)
}
if(config.port == 0)
{
    return console.log(`[ERROR] : Hai! Masih Ada Yang Kosong, Silakan Diisi Di Config.json ya!
(Yang Dibutuhkan : PORT)`)
}
if(config.prefix == "")
{
    return console.log(`[ERROR] : Prefix Belum Dikonfigurasikan, Silakan Setting di config.json!`)
}
if(config.groupid == "")
{
    console.log(`[WARN] : ID GROUP Kamu Belum Dikonfigurasi, Silakan ${config.prefix}group`)
}
let p = config.prefix
// Path where the session data will be stored
const SESSION_FILE_PATH = './saweriaseason.json';

// Load the session data if it has been previously saved
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}
let webhook = "";
(async () => {
    const tunnel = await localtunnel({ port: config.port, subdomain: config.subdomain });
  
    // the assigned public url for your tunnel
    // i.e. https://abcdefgjhij.localtunnel.me
    tunnel.url;
    webhook = tunnel.url;
    tunnel.on('close', () => {
    console.log(`OOPS! Subdomain Not Supported, Please Change Again!`)
    });
  })();
// Use the saved values
const client = new Client({
    puppeteer: {
        headless :true
    },
    session: sessionData
});
client.on(`qr`, function(qr) {
    console.log(qrcode.generate(qr, {small:true}))
})
// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
        
    });
});

client.on(`ready`, function(as) {
    console.log(`Silakan Taruh Di Integration Saweria Di : https://saweria.co/admin/integrations Lalu Pilih Webhook.\n
URL Webhook : ${webhook}/saweria`)
})
app.use(bodyParser.json())
app.get(`/`, function(req,res) {
    res.status(200).send(`OK`)
})
app.post(`/saweria`, function(req,res) {
    if(config.groupid == "")
    {
     client.sendMessage(`${config.owner}@c.us`, `*[!] ALERT* : Kamu Belum Mengkonfigurasikan ID Group, Silakan ${config.prefix}group!
*Donasi Tetap Dilanjutkan, Namun Pesan Tidak Terkirim!*`)
res.status(200).send(`OK`)
     return;
    }
    const nDate = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta'
      });
    let btn = new Buttons(`🎁Donatur : *${req.body['donator_name']}*
🚀Tipe Donasi : *${req.body['type']}*
✉️Email Donatur : *_${req.body['donator_email']}_*
🧧Pesan : *_${req.body['message']}_*
💵Jumlah Kotor : _${req.body['amount_raw']}_
💸Jumlah Bersih : _${parseInt(req.body['amount_raw']) - parseInt(req.body['cut'])}_`, [{body : `Donasi Dibuat : ${nDate}`}], `SAWERIA 🚀`, `(c) 2021-2022 iFika Project x Saweria`)
    client.sendMessage(`${config.groupid}@g.us`, btn)
    res.status(200).send(`Done!`)
})    
client.on(`message`, async(msg) => {

    let text = msg.body
    const args = msg.body.slice(config.prefix.length).trim().split(/ +/g);
    const user = await msg.getContact();
    const chat = await msg.getChat();
    
    if(text.startsWith(`${p}group`))
    {
        if(!chat.isGroup)
        {
            return msg.reply(`*SAWERIA SETUP* :
Kamu Tidak Berada Di Grup, Silakan Gunakan Grup!`)
        }
if(config.owner != user.id.user)
{
    return msg.reply(`*Server Tidak Mendeteksi Kamu Sebagai Owner!*`)
}
config.groupid = `${chat.id.user}`;
fs.writeFileSync(`${__dirname}/config.json`, JSON.stringify(config));
msg.reply(`*[SAWERIA SETUP]* :
Konfigurasi Berhasil!`)
    }
  
})
app.listen(config.port);
client.initialize();}}