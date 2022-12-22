const { SlashCommandBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const { openIA } = require('./config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ask')
		.setDescription('Ask something')
		.addStringOption((option) =>
			option.setName('question').setDescription('nulos').setRequired(true),
		),
	async execute(interaction) {
		try {
			const question = interaction.options.getString('question') ?? 'No url provided';
			await interaction.reply('Thinking... :thinking: ');

			const configuration = new Configuration({
				apiKey: openIA,
			});
			const openai = new OpenAIApi(configuration);

			const response = await openai.createCompletion({
				model: 'text-davinci-003',
				prompt: question,
				temperature: 0.9,
				max_tokens: 150,
				top_p: 1,
				frequency_penalty: 0,
				presence_penalty: 0.6,
			});

			return interaction.followUp(
				'Question: ' +
					'**' +
					question +
					'**' +
					'\n' +
					'response: ' +
					'**' +
					response.data.choices[0].text.toString() +
					'**',
			);
		} catch (error) {
			return interaction.reply('oups something went wrong');
		}
	},
};

/**
 * dimanche = 0
 * lundi = 1
 * samedi = 6
 */
