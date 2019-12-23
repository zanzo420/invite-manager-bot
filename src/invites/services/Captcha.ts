import { Guild, Member, Message } from 'eris';
import i18n from 'i18n';
import moment from 'moment';

import { IMClient } from '../../client';

export class CaptchaService {
	private client: IMClient;

	public constructor(client: IMClient) {
		this.client = client;

		client.on('guildMemberAdd', this.onGuildMemberAdd.bind(this));
	}

	private async onGuildMemberAdd(guild: Guild, member: Member) {
		// Ignore when pro bot is active
		if (this.client.disabledGuilds.has(guild.id)) {
			return;
		}

		const sets = await this.client.cache.guilds.get(guild.id);
		if (!sets.captchaVerificationOnJoin) {
			return;
		}

		const [text, buffer] = ['temp', Buffer.from([])]; // TODO: Add gm

		const embed = this.client.msg.createEmbed({
			title: 'Captcha',
			description: sets.captchaVerificationWelcomeMessage.replace(/\{serverName\}/g, member.guild.name),
			image: {
				url: 'attachment://captcha.png'
			}
		});

		const dmChannel = await member.user.getDMChannel();
		await dmChannel.createMessage(
			{ embed },
			{
				name: 'captcha.png',
				file: buffer
			}
		);

		const endTime = moment().add(sets.captchaVerificationTimeout, 's');

		while (true) {
			const response = await this.awaitMessage(member, endTime.diff(moment(), 'ms'));

			if (!response) {
				await dmChannel
					.createMessage(sets.captchaVerificationFailedMessage.replace(/\{serverName\}/g, member.guild.name))
					.catch(() => undefined);
				member.kick().catch(() => undefined);
				return;
			}

			if (response === text) {
				await dmChannel.createMessage(
					sets.captchaVerificationSuccessMessage.replace(/\{serverName\}/g, member.guild.name)
				);
				return;
			}

			await dmChannel.createMessage(i18n.__({ locale: sets.lang, phrase: 'captcha.invalid' }));
		}
	}

	private async awaitMessage(member: Member, timeLeft: number) {
		return new Promise<string>(resolve => {
			let timeOut: NodeJS.Timer;
			const func = async (resp: Message) => {
				if (member.id !== resp.author.id) {
					return;
				}

				clearTimeout(timeOut);
				this.client.removeListener('messageCreate', func);

				resolve(resp.content);
			};

			this.client.on('messageCreate', func);

			const timeOutFunc = () => {
				this.client.removeListener('messageCreate', func);

				resolve();
			};

			timeOut = setTimeout(timeOutFunc, timeLeft);
		});
	}
}
