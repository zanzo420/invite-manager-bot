import { Embed, EmbedOptions, Message, TextableChannel, User } from 'eris';
import moment from 'moment';

import { ClientOptions } from '../client';
import { BotSettingsObject } from '../settings';
import { BotType } from '../types';
import { FakeChannel } from '../util';

// tslint:disable-next-line: variable-name
export class IMClient {
	public token: string;
	public version: string;
	public config: any;
	public flags: string[];
	public type: BotType;
	public instance: string;
	public settings: BotSettingsObject;
	public hasStarted: boolean = false;

	public msg: any;
	public user: User;
	public shardId: number;
	public shardCount: number;

	public raisedEvents: any[] = [];
	public sentMessages: any[] = [];

	public constructor({ version, token, type, instance, shardId, shardCount, flags, config }: ClientOptions) {
		const self = this as any;

		this.token = token;
		this.version = version;
		this.type = type;
		this.instance = instance;
		this.shardId = shardId;
		this.shardCount = shardCount;
		this.flags = flags;
		this.config = config;
		this.shardId = shardId;
		this.shardCount = shardCount;

		this.user = new User({ id: '__FAKE_ID__', name: '__FAKE_NAME__' }, self);
		this.msg = {
			createEmbed: (options: EmbedOptions = {}, overrideFooter: boolean = true) => {
				let color = options.color ? (options.color as number | string) : parseInt('00AE86', 16);
				// Parse colors in hashtag/hex format
				if (typeof color === 'string') {
					const code = color.startsWith('#') ? color.substr(1) : color;
					color = parseInt(code, 16);
				}

				const footer =
					overrideFooter || !options.footer
						? { text: this.user.username, icon_url: this.user.avatarURL }
						: options.footer;

				delete options.color;
				return {
					...options,
					type: 'rich',
					color,
					footer,
					fields: options.fields ? options.fields : [],
					timestamp: new Date().toISOString()
				};
			},
			sendReply: (message: Message, reply: EmbedOptions | string) => {
				this.sentMessages.push(reply);
			},
			sendEmbed: (target: TextableChannel, embed: EmbedOptions | string, fallbackUser?: User) => {
				this.sentMessages.push({ embed });
			},
			showPaginated: (
				prevMsg: Message,
				page: number,
				maxPage: number,
				render: (page: number, maxPage: number) => Embed,
				author?: User
			) => {
				// TODO
			}
		};
	}

	public emit(event: any) {
		this.raisedEvents.push(event);
	}

	public getChannel(name: string) {
		return new FakeChannel({ id: '__FAKE_ID__', name }, null, 1000);
	}

	public async getCounts() {
		return {
			cachedAt: moment(),
			guilds: 1,
			members: 1
		};
	}
}
