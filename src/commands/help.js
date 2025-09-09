import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Показывает список всех доступных команд.'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Список команд')
      .setColor(0xFFFFFF)
      .setDescription(
        'Здесь перечислены все команды, которые ты можешь использовать с ботом:\n\n' +
        interaction.client.commands
          .map(cmd => `\`/${cmd.data.name}\` — ${cmd.data.description}`)
          .join('\n')
      )

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
