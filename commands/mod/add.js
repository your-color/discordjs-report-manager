const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ThreadAutoArchiveDuration } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('課題を追加')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('課題名')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('month')
				.setDescription('月を指定')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('day')
				.setDescription('日を指定')
				.setRequired(true)),
	async execute(interaction, report) {
		const name = interaction.options.getString('name');
		const year = interaction.options.getInteger('year');
		const month = interaction.options.getInteger('month');
		const day = interaction.options.getInteger('day');

		if (interaction.user.id === "536472209062100992") {


			// inside a command, event listener, etc.
			
			const exampleEmbed = new EmbedBuilder()
				.setColor("#a26ac9")
				.setTitle(name + "｜" + month + "月" + day + "日")
				.setDescription("<:unchecked:1282973351182336022> 回答はまだ添付されていません\n<:happy:1282982378909995038> ファイルを添付すると課題は回答済みとしてマークされます")
			const msg = await interaction.channel.send({ embeds: [exampleEmbed] });
			const thread = await msg.startThread({
				name: "課題：" + name,
				autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
				reason: 'Generated by Yomi',
			});
			console.log(thread.id)
			const confirm = new ButtonBuilder()
				.setLabel('課題の答えを添付')
				.setURL("https://discord.com/channels/930742080047833089/" + thread.id )
				.setStyle(ButtonStyle.Link);

			const row = new ActionRowBuilder()
				.addComponents(confirm);
			msg.edit({components: [row]})
			console.log(`Created thread: ${thread.name}`);
			await report.set(thread.id, { name: name, date: month + "月" + day + "日", answer: false, msgid: msg.id, channelid: interaction.channel.id })
			await interaction.reply({ content: 'ok', ephemeral: true });
		} else {
			await interaction.reply("no action command");
		}

	},
};