import CmdClass, { developers, moderators, staff, translators } from '../../framework/commands/info/credits';
import '../../helper';

beforeEach(() => {
	global.setupBot();
});

it('should contain all developers, moderators, staff and translators', async () => {
	const cmd = new CmdClass(global.client);
	await cmd.action(global.message, [], {}, global.context);

	expect(global.client.sentMessages.length).toEqual(1);

	const msg = global.client.sentMessages[0];
	expect(msg.fields.length).toEqual(4);

	// Developers
	developers.forEach(dev => expect(msg.fields[0].value).toContain(dev));

	// Moderators
	moderators.forEach(mod => expect(msg.fields[1].value).toContain(mod));

	// Staff
	staff.forEach(st => expect(msg.fields[2].value).toContain(st));

	// Translators
	translators.forEach(trans => expect(msg.fields[3].value).toContain(trans));
});
