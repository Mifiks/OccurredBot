import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { setEventPoints } from '../eventStore.js';

const adminRole = "1385297293347127328";

export default {
  data: new SlashCommandBuilder()
    .setName('set_event_points')
    .setDescription('Установить количество ивент-баллов для участника')
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Кому установить баллы')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('value')
        .setDescription('Новое значение (целое, не отрицательное)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has(adminRole)) {
      return interaction.reply({ content: 'У тебя нет доступа к этой команде.', ephemeral: true });
    }

    const target = interaction.options.getUser('target');
    const value = interaction.options.getInteger('value');

    if (value < 0) {
      return interaction.reply({ content: 'Баллы не могут быть отрицательными.', ephemeral: true });
    }

    setEventPoints(target.id, value);

    const embed = new EmbedBuilder()
      .setTitle('Баллы обновлены')
      .setDescription(`${target.username} теперь имеет **${value}** ивент-баллов.`)
      .setColor('White');

    return interaction.reply({ embeds: [embed] });
  }
};
