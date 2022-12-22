const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
	data: new SlashCommandBuilder().setName('list-animes').setDescription('list all animes'),
	async execute(interaction) {
		// get all current anime
		const animes = await prisma.anime.findMany({
			where: {
				end_date: null,
			},
		});
		const exampleEmbed = new EmbedBuilder();
		// get all name of animes

		// order by day and save it in a new array

		const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
		const animesByDay = [];
		days.forEach((day) => {
			const filtered = animes.filter((name) => name.day === day);
			let names = filtered.map((anime) => `- ${anime.anime_name} \n`);
			if (names.length === 0) {
				names = "There's no anime today";
			} else {
				names = names.join('');
			}

			animesByDay.push({ name: day, value: names });
		});

		console.log(animesByDay);

		exampleEmbed.setColor(0x2e51a2).setTitle('Anime list');

		exampleEmbed.addFields(
			{ name: animesByDay[1].name, value: animesByDay[1].value },
			{ name: animesByDay[2].name, value: animesByDay[2].value },
			{ name: animesByDay[3].name, value: animesByDay[3].value },
			{ name: animesByDay[4].name, value: animesByDay[4].value },
			{ name: animesByDay[5].name, value: animesByDay[5].value },
			{ name: animesByDay[6].name, value: animesByDay[6].value },
			{ name: animesByDay[0].name, value: animesByDay[0].value },
		);

		return interaction.reply({ embeds: [exampleEmbed] });
	},
};
