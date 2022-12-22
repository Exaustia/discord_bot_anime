const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');
const { autoToday } = require('./autoToday');
const cron = require('cron');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
	// launch setInterval one time per day
	const scheduledMessage = new cron.CronJob('0 14 * * *', () => {
		// This runs every day at 10:30:00, you can do anything you want
		autoToday(client);
	});

	// When you want to start it, use:
	scheduledMessage.start();
});

client.on('messageCreate', async (message) => {
	if (!message) return;
});

client.on('guildCreate', async (guild) => {
	if (!guild) return;
});

client.on('messageReactionAdd', async (message) => {
	if (!message) return;
});
client.on('messageReactionRemove', async (message) => {
	if (!message) return;
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true,
		});
	}
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
	// Vérifie si l'utilisateur a ajouté ou retiré un rôle

	if (!oldMember.roles.cache.equals(newMember.roles.cache)) {
		// Envoie un message privé à l'utilisateur
		// trouve le nouveau role ajouté ou retiré
		const newRole = newMember.roles.cache.find((role) => !oldMember.roles.cache.has(role.id));
		const oldRole = oldMember.roles.cache.find((role) => !newMember.roles.cache.has(role.id));
		// envoie un message privé à l'utilisateur
		console.log(newRole);
		console.log(oldRole);
	}
});

client.login(token);
