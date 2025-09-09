import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAllUsers } from '../economyStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('bal-leaders')
    .setDescription('Топ 10 богачей'),

  async execute(interaction) {
    const users = getAllUsers();
    const sorted = Object.entries(users)
      .map(([id, data]) => ({ id, balance: data.balance ?? 0 }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);

    if (sorted.length === 0) {
      return interaction.reply({ content: 'Пока никто не заработал.', ephemeral: true });
    }

    const desc = sorted
      .map((u, idx) => `**${idx + 1}.** <@${u.id}> | ${u.balance} монет`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Топ 10 богачей')
      .setDescription(desc)
      .setColor('White');

    return interaction.reply({ embeds: [embed] });
  }
};
