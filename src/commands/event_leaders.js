import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAllEventUsers } from '../eventStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('event_leaders')
    .setDescription('Топ 10 по ивент-баллам'),

  async execute(interaction) {
    const users = getAllEventUsers();
    const sorted = Object.entries(users)
      .map(([id, data]) => ({ id, points: data.points ?? 0 }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    if (sorted.length === 0) {
      return interaction.reply({ content: 'Пока никто не имеет ивент-баллов.', ephemeral: true });
    }

    const desc = sorted
      .map((u, idx) => `**${idx + 1}.** <@${u.id}> | ${u.points} ⭐`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Топ 10 по ивент-баллам')
      .setDescription(desc)
      .setColor('White');

    return interaction.reply({ embeds: [embed] });
  }
};
