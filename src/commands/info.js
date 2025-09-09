import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Показать информацию о боте'),

  async execute(interaction) {
    const bot = interaction.client.user;

    const embed = new EmbedBuilder()
      .setTitle('Информация о боте')
      .setColor(0xFFFFFF)
      .setThumbnail(bot.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: 'Основная информация',
          value: `**Имя:** ${bot.username}\n**ID:** ${bot.id}\n**Создан:** <t:${Math.floor(bot.createdTimestamp / 1000)}:R>\n**Версия бота:** 1.0.0\n**Разработчик:** <@1338940453751623874>`,
          inline: false
        }
      )
      .setFooter({ 
        text: `Запрошено ${interaction.user.username}`, 
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};