import dotenv from 'dotenv';
dotenv.config({ path: './data/.env' });

import { Client, GatewayIntentBits, REST, Routes, ActivityType, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { handleReputationButton } from "./src/commands/reputation.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(PORT, () => console.log(`🌐 Express server listening on port ${PORT}`));

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('⚠️ TOKEN not found.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const LOCAL = false;
const GUILD_ID = '1302294457932058697';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, 'src', 'commands');

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const { default: command } = await import(`file://${filePath}`);
  if (command?.data && command?.execute) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
    console.log(`✅ Loaded command: ${command.data.name}`);
  } else {
    console.warn(`⚠️ Skipped file (no data/execute): ${file}`);
  }
}

client.once('ready', async () => {
  console.log(`📕 Bot logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: 'Следит за реальностью...', type: ActivityType.Custom }],
    status: 'dnd'
  });

  const rest = new REST({ version: '10' }).setToken(token);
  try {
    console.log('📡 Registering commands...');
    if (LOCAL) {
      await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
      console.log('🚀 Local commands loaded.');
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log('🚀 Global commands loaded.');
    }
  } catch (err) {
    console.error('⚠️ Command registration error:', err);
  }
});

client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "⚠️ Error executing command.", ephemeral: true });
    }
  } else if (interaction.isButton()) {
    await handleReputationButton(interaction);
  }
});

client.login(token);

setInterval(() => {
  const used = process.memoryUsage();

  const memMB = Object.fromEntries(
    Object.entries(used).map(([key, value]) => [key, (value / 1024 / 1024).toFixed(2) + " MB"])
  );

  const totalMB = (
    Object.values(used).reduce((acc, val) => acc + val, 0) /
    1024 /
    1024
  ).toFixed(2);

  console.log("Memory usage:");
  console.table(memMB);
  console.log(`Total: ${totalMB} MB\n`);
}, 60_000);
