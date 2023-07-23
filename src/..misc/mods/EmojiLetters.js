import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";

import MessageActions from "@Modules/MessageActions";

export default class EmojiLetters extends Disposable {
	constructor() {
		super();
		this.active = false;
		this.keyDownHandler = this.keyDownHandler.bind(this);
		this.mappings = {
			"0": ":zero: ",
			"1": ":one: ",
			"2": ":two: ",
			"3": ":three: ",
			"4": ":four: ",
			"5": ":five: ",
			"6": ":six: ",
			"7": ":seven: ",
			"8": ":eight: ",
			"9": ":nine: ",
			"a": ":regional_indicator_a: ",
			"b": ":regional_indicator_b: ",
			"c": ":regional_indicator_c: ",
			"d": ":regional_indicator_d: ",
			"e": ":regional_indicator_e: ",
			"f": ":regional_indicator_f: ",
			"g": ":regional_indicator_g: ",
			"h": ":regional_indicator_h: ",
			"i": ":regional_indicator_i: ",
			"j": ":regional_indicator_j: ",
			"k": ":regional_indicator_k: ",
			"l": ":regional_indicator_l: ",
			"p": ":regional_indicator_p: ",
			"q": ":regional_indicator_q: ",
			"r": ":regional_indicator_r: ",
			"s": ":regional_indicator_s: ",
			"t": ":regional_indicator_t: ",
			"u": ":regional_indicator_u: ",
			"v": ":regional_indicator_v: ",
			"w": ":regional_indicator_w: ",
			"x": ":regional_indicator_x: ",
			"y": ":regional_indicator_y: ",
			"z": ":regional_indicator_z: ",
			"o": ":regional_indicator_o: ",
			"m": ":regional_indicator_m: ",
			"n": ":regional_indicator_n: ",
			" ": "	",
			"!": ":exclamation: ",
		};
	}

	keyDownHandler(e) {
		if (e?.code?.includes?.("End")) {
			this.active = !this.active;
			document.querySelector('.wordmarkWindows-2dq6rw').classList.toggle('active');
		}
	}

	Init() {
		document.addEventListener('keydown', this.keyDownHandler);
		if (MessageActions)
			this.patches = [
				Patcher.before(MessageActions, "sendMessage", (_, [, messageObject]) => {
					try {
						if (this.active)
							messageObject.content = messageObject.content.split('').map(a => this.mappings[a] || a).join('');
					} catch {} finally {
						this.active = false;
						document.querySelector('.wordmarkWindows-2dq6rw').classList.remove('active');
					}
				})
			];
		else
			Logger.patch("EmojiLetters");
	}

	Dispose() {
		super.Dispose();
		document.removeEventListener('keydown', this.keyDownHandler);
	}
}