import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getEventPoints } from '../eventStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('event_balance')
    .setDescription('Показать баланс ивент-баллов')
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Кого проверить')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('target') ?? interaction.user;
    const balance = getEventPoints(target.id);

    const embed = new EmbedBuilder()
      .setTitle(`Баланс ${target.username}`)
      .setDescription(`⭐ ${balance} ивент-баллов`)
      .setThumbnail(target.displayAvatarURL({ size: 128 }))
      .setColor('White');

    return interaction.reply({ embeds: [embed] });
  }
};
