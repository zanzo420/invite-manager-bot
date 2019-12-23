import { randomBytes } from 'crypto';
import gm from 'gm';

function generateCaptcha(code: string) {
	const width = 500;
	const height = 200;
	const fontSize = 75;
	let x = gm(width, height, '#ffffff').font('Helvetica.ttf', fontSize);

	const letterWidth = width / (code.length + 1);
	for (let i = 0; i < code.length; i++) {
		const letterPositionFromLeft = letterWidth / 2 + i * letterWidth;
		const letterPositionFromTop = (height - fontSize) * (Math.random() - 0.5);
		const randomColor = randomBytes(3).toString('hex');
		x = x.fill(`#${randomColor}`);
		x = x.draw(
			`translate ${letterPositionFromLeft},${letterPositionFromTop} skewX ${Math.random() * 120 -
				60} gravity west text 0,0 '${code[i]}'`
		);
	}

	const noiseHeight = height;
	const paddingFromBorder = 20;

	x = x.fill(`none`);

	for (let i = 0; i < 5; i++) {
		const randomColor = randomBytes(3).toString('hex');
		x = x.stroke(`#${randomColor}`, 2);
		x = x.drawBezier(
			[paddingFromBorder, Math.random() * noiseHeight],
			[width / 5, Math.random() * noiseHeight],
			[width / 2, Math.random() * noiseHeight],
			[(width / 5) * 4, Math.random() * noiseHeight],
			[width - paddingFromBorder, Math.random() * noiseHeight]
		);
	}

	x = x.motionBlur(10, 5, 40);
	// x = x.implode(-1.1);
	x.write('./newImage.jpg', function(err: any) {
		console.log('err', err);
	});
}

generateCaptcha('ABCDEF');
