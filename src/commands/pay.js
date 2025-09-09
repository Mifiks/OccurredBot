import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getBalance, setBalance } from '../economyStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Перевести монетки другому')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Кому перевести')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Сколько перевести')
        .setRequired(true)
    ),

  async execute(interaction) {
    const sender = interaction.user;
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (target.id === sender.id) {
      return interaction.reply({ content: 'Себе переводить нельзя.', ephemeral: true });
    }
    if (amount <= 0) {
      return interaction.reply({ content: 'Сумма должна быть положительной.', ephemeral: true });
    }

    const senderBalance = getBalance(sender.id);
    if (senderBalance < amount) {
      return interaction.reply({ content: 'Недостаточно монет.', ephemeral: true });
    }

    setBalance(sender.id, senderBalance - amount);
    setBalance(target.id, getBalance(target.id) + amount);

    const embed = new EmbedBuilder()
      .setTitle('Перевод успешен')
      .setDescription(`${sender.username} -> ${target.username}: **${amount}** монет`)
      .setThumbnail(target.displayAvatarURL({ size: 128 }))
      .setColor('White');

    return interaction.reply({ embeds: [embed] });
  }
};
