import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Отправить репорт на пользователя')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('Пользователь, на которого отправляется репорт')
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    
    const modal = new ModalBuilder()
      .setCustomId(`reportModal_${target.id}_${interaction.user.id}`)
      .setTitle(`Репорт на ${target.username}`);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reasonInput')
      .setLabel('Причина репорта')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(1000)
      .setRequired(true)
      .setPlaceholder('Опишите подробно нарушение...');

    const actionRow = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    const filter = (modalInteraction) => 
      modalInteraction.customId === `reportModal_${target.id}_${interaction.user.id}`;

    try {
      const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 300000 });

      const reason = modalInteraction.fields.getTextInputValue('reasonInput');
      const reporter = modalInteraction.user;

      const reportChannelId = '1409180956169994401';
      const reportChannel = await modalInteraction.client.channels.fetch(reportChannelId);

      if (!reportChannel) {
        return modalInteraction.reply({
          content: 'Канал для репортов не найден!',
          ephemeral: true
        });
      }

      const reportEmbed = new EmbedBuilder()
        .setTitle(`Репорт на ${target.tag}`)
        .setColor(0xFFFFFF)
        .addFields(
          { name: 'Репорт от:', value: `${reporter} (${reporter.tag})`, inline: true },
          { name: 'Нарушитель:', value: `${target} (${target.tag})`, inline: true },
          { name: 'Нарушение:', value: reason }
        )
        .setTimestamp()

      await reportChannel.send({
        embeds: [reportEmbed]
      });
      
      await modalInteraction.reply({
        content: 'Ваш репорт успешно отправлен модераторам!',
        ephemeral: true
      });

    } catch (error) {
      if (error.code === 'InteractionCollectorError') {
        console.log('Пользователь не заполнил модальное окно репорта');
      } else {
        console.error('Ошибка при обработке репорта:', error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'Произошла ошибка при отправке репорта!',
            ephemeral: true
          });
        }
      }
    }
  },
};