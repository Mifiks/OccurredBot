import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getBalance } from '../economyStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Показать баланс')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Кого проверить')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const balance = getBalance(target.id);

    const embed = new EmbedBuilder()
      .setTitle(`Баланс ${target.username}`)
      .setDescription(`${balance} монет`)
      .setThumbnail(target.displayAvatarURL({ size: 128 }))
      .setColor('White');

    return interaction.reply({ embeds: [embed] });
  }
};
