const { REST, Routes } = require('discord.js');

module.exports = (client) => {
  client.once('ready', async () => {
    console.log(`[Ready] Logged in as ${client.user.tag}`);

    if (!process.env.CLIENT_ID) {
      console.warn('[Ready] CLIENT_ID env var missing - skipping command registration');
      return;
    }

    if (process.env.DEPLOY !== 'true') {
      console.log('[Ready] DEPLOY flag not set to true - skipping slash command deployment');
      return;
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    const commandsPayload = client.commands.map((command) => command.data.toJSON());

    console.log('[Ready] Registering slash commands');

    try {
      console.log('[Ready] Registering global commands');
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commandsPayload,
      });
      console.log('[Ready] Global slash commands registered');
    } catch (error) {
      console.error('[Ready] Failed to register global commands:', error);
    }

    if (process.env.GUILD_ID) {
      try {
        console.log(`[Ready] Registering guild commands for ${process.env.GUILD_ID}`);
        await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
          { body: commandsPayload }
        );
        console.log('[Ready] Guild slash commands registered');
      } catch (error) {
        console.error('[Ready] Failed to register guild commands:', error);
      }
    } else {
      console.log('[Ready] No GUILD_ID provided - skipping guild command registration');
    }
  });
};
