const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// HTTP Server
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('Uptime server ready!'));

// Bump Logic
let nextBumpTime = null;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  scheduleNextBump();
});

function scheduleNextBump() {
  const TWO_HOURS = 7200000; 
  const EXTRA_MINUTES = 5 + Math.floor(Math.random() * 16);
  const TOTAL_DELAY = TWO_HOURS + (EXTRA_MINUTES * 60000);

  nextBumpTime = new Date(Date.now() + TOTAL_DELAY);
  
  setTimeout(() => {
    sendBump();
    scheduleNextBump();
  }, TOTAL_DELAY);

  console.log(`Next bump in 2h + ${EXTRA_MINUTES}min`);
}

async function sendBump() {
  try {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    await channel.send('@defnotalt6024 @goku_omey @stomachacid30 HUMP IT NIGGAS!!!');
    console.log(`Bump sent at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error('Bump failed:', error);
    try {
      const owner = await client.users.fetch(process.env.YOUR_DISCORD_ID);
      await owner.send(`❌ Bump failed: ${error.message}`);
    } catch (dmError) {
      console.error('Failed to send DM:', dmError);
    }
  }
}

client.on('messageCreate', async message => {
  if (message.content === '!bumpstatus') {
    if (!nextBumpTime) return message.reply('Bump schedule not initialized yet.');
    
    const timeLeft = Math.max(0, nextBumpTime - Date.now());
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    message.reply(`Next bump in ${hours}h ${minutes}m (at ${nextBumpTime.toLocaleTimeString()})`);
  }
});

setInterval(() => {
  if (!client.isReady()) {
    console.log("Bot disconnected! Crashing to force restart...");
    process.exit(1);
  }
}, 30_000);

client.login(process.env.BOT_TOKEN);
