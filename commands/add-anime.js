const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const day = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-anime')
		.setDescription('Add an anime to the list.')
		.addStringOption((option) =>
			option.setName('url').setDescription('URL MAL').setRequired(true),
		),
	// .addStringOption(
	// 	(option) => option.setName('name').setDescription('Name of the anime').setRequired(true),
	// 	// .addChoices(
	// 	// 	{ name: 'Monday', value: 'MONDAY' },
	// 	// 	{ name: 'Tuesday', value: 'TUESDAY' },
	// 	// 	{ name: 'Wednesday', value: 'WEDNESDAY' },
	// 	// 	{ name: 'Thursday', value: 'THURSDAY' },
	// 	// 	{ name: 'Friday', value: 'FRIDAY' },
	// 	// 	{ name: 'Saturday', value: 'SATURDAY' },
	// 	// 	{ name: 'Sunday', value: 'SUNDAY' },
	// 	// ),
	// ),
	async execute(interaction) {
		const url = interaction.options.getString('url') ?? 'No url provided';

		const idFromUrl = url.split('/')[4];

		const MAL = await axios(
			`https://api.myanimelist.net/v1/anime/${idFromUrl}?fields=id,title,main_picture,start_date,end_date,mean`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization:
						'Bearer ',
				},
			},
		)
			.then((res) => res.data)
			.catch(() => {
				return { error: true };
			});

		if (MAL.error) return interaction.reply('Error during the request, try again, gros nul');
		const startDate = new Date(MAL.start_date);
		const d = day[startDate.getDay()];
		const picture = MAL.main_picture.medium;

		const isExist = await prisma.anime.findUnique({
			where: {
				anime_id: MAL.id,
			},
		});

		if (isExist) return interaction.reply('Anime already exist');
		if (MAL.end_date && new Date(MAL.end_date) < new Date()) {
			return interaction.reply('Anime already finished');
		}

		const insert = await prisma.anime.create({
			data: {
				anime_name: MAL.title,
				anime_id: MAL.id,
				anime_url: url,
				anime_picture: picture,
				start_date: startDate,
				day: d,
			},
		});

		if (insert) {
			const exampleEmbed = new EmbedBuilder()
				.setColor(0x2e51a2)
				.setTitle('Anime added')
				.setURL(url)
				.setDescription(MAL.title)
				.setImage(picture)
				.addFields({ name: 'Note', value: MAL.mean.toString() });

			return interaction.reply({ embeds: [exampleEmbed] });
		} else {
			return interaction.reply('Error during the request, try again, gros nul');
		}
	},
};

/**
 * dimanche = 0
 * lundi = 1
 * samedi = 6
 */
