/**
 * @name CopyImageLink
 * @description Adds (Copy Link) button next to (Open Original) under images
 * @version 1.2.1
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/CopyImageLink
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js
 */

const config = {
	"info": {
		"name": "CopyImageLink",
		"version": "1.2.1",
		"description": "Adds (Copy Link) button next to (Open Original) under images",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/CopyImageLink",
		"authors": [{
			"name": "Skamt"
		}]
	}
}

const css = `
.copyBtn {
	left: 115px;
	white-space: nowrap;
    position: absolute;
    top: 100%;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    line-height: 30px;
    transition: opacity .15s ease;
    opacity: .5;
}
.copyBtn:hover{
	opacity: 1;
    text-decoration: underline;
}

.copyBtnSpan {
	left: 105px;
	position: absolute;
	top: 100%;
	font-weight: 500;
	color: hsl(0, calc(var(--saturation-factor, 1) * 0%), 100%) !important;
	line-height: 30px;
	opacity: 0.5;
}`;

const Logger = {
	error(...args) {
		this.p(console.error, ...args);
	},
	patch(patchId) {
		console.error(`%c[${config.info.name}] %c Error at %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
	},
	log(...args) {
		this.p(console.log, ...args);
	},
	p(target, ...args) {
		target(`%c[${config.info.name}]`, "color: #3a71c1;font-weight: bold;", ...args);
	}
};

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

const ImageModalVideoModal = getModule(Filters.byProps("ImageModal"), { searchExports: false });

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getNestedProp(obj, path) {
	return path.split(".").reduce(function(ob, prop) {
		return ob && ob[prop];
	}, obj);
}

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { type });
}

const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

const CopyButtonComponent = ({ href }) => {
	return (
		React.createElement(React.Fragment, null, React.createElement('span', { className: "copyBtnSpan", }, "|"), React.createElement('a', {
				className: "copyBtn",
				onClick: () => {
					copy(href);
					Toast.success("Link Copied!");
				},
			}, "Copy link"

		))
	);
};

class CopyImageLink {
	start() {
		try {
			DOM.addStyle(css);
			if (ImageModalVideoModal)
				Patcher.after(ImageModalVideoModal, "ImageModal", (_, __, returnValue) => {
					const children = getNestedProp(returnValue, "props.children");
					const { href } = getNestedProp(returnValue, "props.children.2.props");
					children.push(React.createElement(CopyButtonComponent, { href: href, }));
				});
			else Logger.patch("patchImageModal");
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}

module.exports = CopyImageLink;
