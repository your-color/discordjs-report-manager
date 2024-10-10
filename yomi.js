const { Client, Events, GatewayIntentBits, ButtonBuilder, ButtonStyle, Partials } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { ActivityType } = require('discord.js');
// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction
	]
});

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Keyv = require('keyv')

// 保存したいデータごとにtableを変えて作る
const report = new Keyv('sqlite://yomi.sqlite', { table: 'report' })
client.on('ready', async () => {
	/*
	client.user.setPresence({
		activities: [{
			type: ActivityType.Custom,
			name: "custom", // name is exposed through the API but not shown in the client for ActivityType.Custom
			state: "流れ逝く岸を歩いて"
		}]
	})
		*/
})


client.on('messageCreate', async (message) => {
	if (message.guild.id === "930742080047833089") {
		var chname = message.channel.name;
		console.log(chname)
		if (chname.includes("課題：")) {
			const data = await report.get(message.channel.id)
			console.log(data)
			if (data === undefined) {

			} else {
				if (data.answer === false) {
					const exampleEmbed = new EmbedBuilder()
						.setColor("#a26ac9")
						.setTitle(data.name + "｜" + data.date)
						.setDescription("<:checked:1282973348934189057> **<@" + message.author.id + ">**によって回答が添付されました\n<:happy:1282982378909995038> ファイルを添付すると課題は回答済みとしてマークされます")
					const confirm = new ButtonBuilder()
						.setLabel('課題の答えを確認')
						.setURL("https://discord.com/channels/930742080047833089/" + message.channel.id)
						.setStyle(ButtonStyle.Link);

					const row = new ActionRowBuilder()
						.addComponents(confirm);
					const channel2 = client.channels.cache.get(data.channelid)
					channel2.messages.fetch(data.msgid).then(msg => {
						msg.edit({ embeds: [exampleEmbed], components: [row] })
					})
					await report.set(message.channel.id, { answer: true })
				}
			}
		}
	}
})

const { REST, Collection, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
client.commands = new Collection();
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, report);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(token);
