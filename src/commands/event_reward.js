import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { addEventPoints } from '../eventStore.js';

const allowedRole = "1385302406308430025";

export default {
  data: new SlashCommandBuilder()
    .setName('event_reward')
    .setDescription('Выдать 1 ивент-балл участнику')
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Кому выдать балл')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has(allowedRole)) {
      return interaction.reply({ content: 'У тебя нет доступа к этой команде.', ephemeral: true });
    }

    const target = interaction.options.getUser('target');
    if (target.id === interaction.user.id) {
      return interaction.reply({ content: 'Себе выдавать нельзя.', ephemeral: true });
    }

    addEventPoints(target.id, 1);

    const embed = new EmbedBuilder()
      .setTitle('🎉 Ивент-награда')
      .setDescription(`${target.username} получил **+1** ивент-балл!`)
      .setColor('White');

    return interaction.reply({ embeds: [embed] });
  }
};
