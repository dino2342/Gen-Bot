module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.warn(`[Interaction] No command handler found for ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`[Interaction] Error executing ${interaction.commandName}:`, error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: 'An unexpected error occurred while running this command. Please try again later.',
          ephemeral: true,
        }).catch((followError) => {
          console.error('[Interaction] Failed to send follow-up error message:', followError);
        });
      } else {
        await interaction.reply({
          content: 'An unexpected error occurred while running this command. Please try again later.',
          ephemeral: true,
        }).catch((replyError) => {
          console.error('[Interaction] Failed to send initial error reply:', replyError);
        });
      }
    }
  });
};
