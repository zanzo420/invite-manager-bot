import dataUriToBuffer from 'data-uri-to-buffer';
import { writeFileSync } from 'fs';
import Jimp from 'jimp';
import pathModule from 'path';
import QRCode, { QRCodeToDataURLOptions } from 'qrcode';

/*
class MemoryStream extends Stream.Writable {
	private buffer: Buffer = Buffer.from([]);

	public _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void {
		console.log(encoding, chunk.toString());
		callback();
	}
}
*/
function createImageFromDataUri(dataUri: string): Promise<Jimp> {
	return new Promise(res => {
		return new Jimp(dataUriToBuffer(dataUri), (err, img) => {
			if (err) {
				throw err;
			}
			res(img);
		});
	});
}

function createQRCode(
	data: any,
	opt: QRCodeToDataURLOptions = { errorCorrectionLevel: 'M', margin: 2 }
): Promise<Jimp> {
	return new Promise(res => {
		QRCode.toDataURL(data, opt, (err: any, response: any) => {
			if (err) {
				throw err;
			}
			res(createImageFromDataUri(response));
		});
	});
}

function fetchLogo(_logoPath: string) {
	const logoPath = _logoPath[0] === '/' || _logoPath[0] === '\\' ? _logoPath : pathModule.resolve(__dirname, _logoPath);
	return Jimp.read(logoPath);
}

function resizeSquared(img: Jimp, _w: number, _h: number) {
	let w;
	let h;

	if (_h > _w) {
		w = Jimp.AUTO;
		h = _h;
	} else {
		w = _w;
		h = Jimp.AUTO;
	}
	return img.resize(w, h);
}

async function getResizedLogo({ path, w, h }: { path: string; w: number; h: number }) {
	return fetchLogo(path).then(img => resizeSquared(img, w, h));
}

export default async function generate({
	text,
	path,
	opt,
	ratio = 2
}: {
	text: string;
	path: string;
	opt: any;
	ratio: number;
}) {
	const img = await createQRCode(text, opt);
	const logo = await getResizedLogo({
		path,
		w: Math.floor(img.bitmap.width / ratio),
		h: Math.floor(img.bitmap.height / ratio)
	});

	// Center the logo
	const x = Math.floor((img.bitmap.width - logo.bitmap.width) / 2);
	const y = Math.floor((img.bitmap.height - logo.bitmap.height) / 2);

	// Apply on the QRCode
	const qrImg = img.composite(logo, x, y);

	return new Promise((res, rej) => {
		qrImg.getBuffer(Jimp.MIME_PNG, (err, buf) => {
			if (err) {
				return rej(err);
			}
			return res(buf);
		});
	});
}

generate({
	text: 'invitemanager.gg',
	path: 'im-logo.png',
	opt: { errorCorrectionLevel: 'H', margin: 2 },
	ratio: 4
})
	.then(res => {
		console.log('qr', res);
		writeFileSync('./qr.png', res);
	})
	.catch(console.error);
