const path = require('node:path');
const fs = require('node:fs');
const { Collection, Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

console.log('[Startup] Loading environment variables');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

const botConfig = require(path.resolve(__dirname, '..', 'config', 'botConfig.json'));

const intents = botConfig.intents.map((intentName) => {
  if (!GatewayIntentBits[intentName]) {
    throw new Error(`Invalid intent configured: ${intentName}`);
  }
  return GatewayIntentBits[intentName];
});

const client = new Client({ intents });
client.commands = new Collection();

const commandsPath = path.resolve(__dirname, '..', 'commands');
console.log('[Startup] Loading commands from', commandsPath);

fs.readdirSync(commandsPath).forEach((file) => {
  if (!file.endsWith('.js')) return;
  const commandPath = path.join(commandsPath, file);
  const command = require(commandPath);
  if (!command?.data || !command?.execute) {
    console.warn(`[Startup] Skipping ${file} - missing data or execute export`);
    return;
  }
  client.commands.set(command.data.name, command);
  console.log(`[Startup] Loaded command: ${command.data.name}`);
});

require(path.resolve(__dirname, '..', 'handlers', 'ready.js'))(client);
require(path.resolve(__dirname, '..', 'handlers', 'interaction.js'))(client);

console.log('[Startup] Logging into Discord');
client
  .login(process.env.TOKEN)
  .then(() => console.log('[Startup] Login promise resolved'))
  .catch((error) => {
    console.error('[Startup] Failed to login:', error);
    process.exit(1);
  });
