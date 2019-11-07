import { Message } from 'eris';
import i18n from 'i18n';

import { IMClient } from './client';
import { guildDefaultSettings } from './settings';
import { BotType } from './types';

jest.mock('./client');

declare global {
	namespace NodeJS {
		interface Global {
			client: any;
			setupBot: () => void;
			pkg: any;
			config: any;
			message: any;
			context: any;
			i18n: any;
			t: (key: string, replacements?: { [key: string]: string }) => string;
		}
	}
}

i18n.configure({
	locales: ['cs', 'de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt', 'pt_BR', 'ro', 'ru', 'tr'],
	defaultLocale: 'en',
	directory: __dirname + '/../i18n/bot',
	objectNotation: true
});

global.setupBot = () => {
	const t = (key: any, replacements?: any) => i18n.__({ locale: 'en', phrase: key }, replacements);

	global.pkg = require('../package.json');
	global.config = require('../config.json');
	global.client = new IMClient({
		version: global.pkg.version,
		token: '__FAKE_TOKEN__',
		type: BotType.regular,
		instance: 'regular',
		shardId: 1,
		shardCount: 1,
		flags: [],
		config: global.config
	});
	global.message = new Message(
		{
			id: '__FAKE_ID__',
			content: `!botInfo`,
			channel_id: '__FAKE_CHANNEL__',
			author: null,
			embeds: [],
			attachments: [],
			mentions: []
		},
		global.client
	);
	global.context = {
		t: t,
		settings: guildDefaultSettings,
		isPremium: false,
		guild: null,
		me: null
	};
	global.i18n = i18n;
	global.t = t;
};
