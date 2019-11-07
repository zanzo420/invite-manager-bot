import moment from 'moment';

import CmdClass from '../../framework/commands/info/botInfo';
import '../../helper';

beforeEach(() => {
	global.setupBot();
});

it('should print the bot info', async () => {
	const cmd = new CmdClass(global.client);
	await cmd.action(global.message, [], {}, global.context);

	expect(global.client.sentMessages.length).toEqual(1);

	const msg = global.client.sentMessages[0];
	expect(msg.fields.length).toEqual(11);

	// Bot version
	expect(msg.fields[0].value).toEqual(global.pkg.version);

	// Uptime
	expect(msg.fields[1].value).toEqual(
		moment
			.duration(moment().diff(global.client.startedAt))
			.locale('en')
			.humanize()
	);

	const counts = await global.client.getCounts();

	// Guild count
	expect(msg.fields[2].value).toEqual(`${counts.guilds}`);

	// Member count
	expect(msg.fields[3].value).toEqual(`${counts.members}`);
});
