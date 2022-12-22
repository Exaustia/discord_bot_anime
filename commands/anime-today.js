/* eslint-disable quotes */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const day = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

module.exports = {
	data: new SlashCommandBuilder().setName('anime-today').setDescription('anime by day'),
	async execute(interaction) {
		const dayNumber = new Date().getDay();
		const d = day[dayNumber];

		const animes = await prisma.anime.findMany({
			where: {
				day: d,
			},
		});
		const embeds = [];
		// get all name of animes
		const names = animes.map((anime) => `- ${anime.anime_name}`);

		for (const anime of animes) {
			const exampleEmbed = new EmbedBuilder();
			exampleEmbed.setColor(0x2e51a2).setTitle('Anime today');
			exampleEmbed.setDescription(names.join('\n'));

			exampleEmbed.setURL('https://example.org/');
			exampleEmbed.setImage(anime.anime_picture);
			embeds.push(exampleEmbed);
		}

		return interaction.reply({ embeds });
	},
};
