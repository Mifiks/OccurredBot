import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getBalance, setBalance, getLastWork, setLastWork } from '../economyStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Работать и заработать монетки'),

  async execute(interaction) {
    const user = interaction.user;
    const now = Date.now();
    const lastWork = getLastWork(user.id);

    if (now - lastWork < 1000 * 60 * 120) {
      const left = Math.ceil((1000 * 60 * 120 - (now - lastWork)) / 1000 / 60);
      return interaction.reply({
        content: `Подожди ещё ${left} мин.`,
        ephemeral: true
      });
    }

    const earned = Math.floor(Math.random() * 51) + 50;
    const newBalance = getBalance(user.id) + earned;

    setBalance(user.id, newBalance);
    setLastWork(user.id, now);

    const embed = new EmbedBuilder()
      .setTitle('Работа завершена')
      .setDescription(`Ты заработал **${earned}** монет. Баланс: ${newBalance}`)
      .setThumbnail(user.displayAvatarURL({ size: 128 }))
      .setColor('White');

    return interaction.reply({ embeds: [embed] });
  }
};
