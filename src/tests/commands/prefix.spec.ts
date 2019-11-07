import CmdClass from '../../framework/commands/info/prefix';
import '../../helper';
import { guildDefaultSettings } from '../../settings';

beforeEach(() => {
	global.setupBot();
});

it('should print the current prefix', async () => {
	const cmd = new CmdClass(global.client);
	await cmd.action(global.message, [], {}, global.context);

	expect(global.client.sentMessages.length).toEqual(1);

	const msg = global.client.sentMessages[0];
	expect(msg).toEqual(global.t('cmd.prefix.title', { prefix: guildDefaultSettings.prefix }));
});
