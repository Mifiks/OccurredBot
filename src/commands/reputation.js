import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from "discord.js";
import fs from "fs";
import path from "path";

const DATA_FILE = path.resolve("./data/reputation.json");
const DAY_MS = 24 * 60 * 60 * 1000;

function loadReps() {
  if (!fs.existsSync(DATA_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } 
  catch { return {}; }
}

function saveReps(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getUserData(userId, data) {
  if (!data[userId]) data[userId] = { rep: 0, lastRep: 0 };
  if (data[userId].lastRep === undefined) data[userId].lastRep = 0;
  return data[userId];
}

export default {
  data: new SlashCommandBuilder()
    .setName("reputation")
    .setDescription("Показать репутацию или доску лидеров")
    .addStringOption(opt =>
      opt.setName("type")
        .setDescription("Тип: user или leaders")
        .setRequired(true)
        .addChoices(
          { name: "User", value: "user" },
          { name: "Leaders", value: "leaders" }
        )
    )
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("Кому смотреть репутацию?")
    ),

  async execute(interaction) {
    const type = interaction.options.getString("type");
    const caller = interaction.user;
    const data = loadReps();

    if (type === "user") {
      const target = interaction.options.getUser("user") ?? caller;
      const userData = getUserData(target.id, data);

      const embed = new EmbedBuilder()
        .setTitle(`Репутация: ${target.username}`)
        .setDescription(`Текущая репутация: **${userData.rep}**`)
        .setColor(0xFFFFFF)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }));

      const canInteract = caller.id !== target.id;
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`rep_down_${target.id}_${caller.id}`)
          .setLabel("Понизить репутацию")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!canInteract),
        new ButtonBuilder()
          .setCustomId(`rep_up_${target.id}_${caller.id}`)
          .setLabel("Повысить репутацию")
          .setStyle(ButtonStyle.Success)
          .setDisabled(!canInteract)
      );

      await interaction.reply({ embeds: [embed], components: [row] });

    } else if (type === "leaders") {
      const allUsers = Object.entries(data);

      const topPositive = allUsers
        .filter(([_, udata]) => udata.rep >= 1)
        .sort((a, b) => b[1].rep - a[1].rep)
        .slice(0, 10);

      const topNegative = allUsers
        .filter(([_, udata]) => udata.rep <= -1)
        .sort((a, b) => a[1].rep - b[1].rep)
        .slice(0, 10);

      const embed = new EmbedBuilder()
        .setTitle("🏆 Доска репутации")
        .setDescription("Нажми кнопку, чтобы выбрать TOP-10")
        .setColor(0xFFFFFF)

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`top_positive_${caller.id}`)
          .setLabel("Доска Почета")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`top_negative_${caller.id}`)
          .setLabel("Доска Позора")
          .setStyle(ButtonStyle.Danger)
      );

      interaction.client.reputationTopCache = { topPositive, topNegative };
      await interaction.reply({ embeds: [embed], components: [row] });
    }
  }
};

export async function handleReputationButton(interaction) {
  if (!interaction.isButton()) return false;
  const data = loadReps();

  const split = interaction.customId.split("_");
  const action = split[0];

  if (action === "rep") {
    const [, dir, targetId, callerId] = split;
    if (interaction.user.id !== callerId) {
      await interaction.reply({ content: "⚠️ Эти кнопки не для тебя!", ephemeral: true });
      return true;
    }

    const targetData = getUserData(targetId, data);
    const callerData = getUserData(callerId, data);
    const now = Date.now();

    if (now - callerData.lastRep < DAY_MS) {
      const hoursLeft = Math.ceil((DAY_MS - (now - callerData.lastRep)) / (60*60*1000));
      await interaction.reply({ content: `⏳ Ты уже менял чью-то репутацию сегодня. Попробуй через ~${hoursLeft}ч.`, ephemeral: true });
      return true;
    }

    if (dir === "up") targetData.rep++;
    else if (dir === "down") targetData.rep--;

    callerData.lastRep = now;
    saveReps(data);

    const targetUser = await interaction.client.users.fetch(targetId);
    const embed = new EmbedBuilder()
      .setTitle(`Репутация: ${targetUser.username}`)
      .setDescription(`Текущая репутация: **${targetData.rep}**`)
      .setColor(0xFFFFFF)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));

    await interaction.update({ embeds: [embed], components: interaction.message.components });
    return true;

  } else if (action === "top") {
    const [, boardType, callerId] = split;
    if (interaction.user.id !== callerId) {
      await interaction.reply({ content: "⚠️ Эти кнопки не для тебя!", ephemeral: true });
      return true;
    }

    const { topPositive, topNegative } = interaction.client.reputationTopCache || { topPositive: [], topNegative: [] };
    let embed = new EmbedBuilder().setColor(0xFFFFFF);

    if (boardType === "positive") {
      embed.setTitle("🏆 Доска Почета")
        .setDescription(topPositive.length
          ? topPositive.map(([uid, udata], i) => `${i+1}. <@${uid}> | ${udata.rep}`).join("\n")
          : "Упс... Кажется Эго скушал лидеров..."
        );
    } else if (boardType === "negative") {
      embed.setTitle("💀 Доска Позора")
        .setDescription(topNegative.length
          ? topNegative.map(([uid, udata], i) => `${i+1}. <@${uid}> | ${udata.rep}`).join("\n")
          : "Упс... Кажется Эго скушал лидеров..."
        );
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`top_positive_${callerId}`).setLabel("Доска Почета").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`top_negative_${callerId}`).setLabel("Доска Позора").setStyle(ButtonStyle.Danger)
    );

    await interaction.update({ embeds: [embed], components: [row] });
    return true;
  }
  return false;
}