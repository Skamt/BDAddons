/**
 * @name CopyImageLink
 * @description Adds (Copy Link) button next to (Open Original) under images
 * @version 1.1.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/CopyImageLink
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js
 */
const config = {
	info: {
		name: "CopyImageLink",
		version: "1.1.0",
		description: "Adds (Copy Link) button next to (Open Original) under images",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/CopyImageLink",
		authors: [{
			name: "Skamt"
		}]
	}
};

function getPlugin() {
	const { Modules, Plugin } = (() => {
		const { Webpack: { Filters, getModule } } = BdApi;

		// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
		function getModuleAndKey(filter) {
			let module;
			const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
			module = module?.exports;
			if (!module) return { module: undefined };
			const key = Object.keys(module).find(k => module[k] === target);
			if (!key) return undefined;
			return { module, key };
		}

		return {
			Modules: {
				ImageModal: {
					module: getModuleAndKey(m => {
						if (!m?.toString || typeof(m?.toString) !== "function") return;
						const strs = ["original", "maxHeight", "maxWidth", "noreferrer noopener"];
						const funcStr = m?.toString();
						for (const s of strs)
							if (!funcStr.includes(s)) return false;
						return true;
					}),
					isBreakable: true,
					withKey: true
				}
			},
			Plugin(Modules) {
				const {
					UI,
					DOM,
					React,
					Patcher
				} = new BdApi(config.info.name);

				// Utilities
				const Utils = {
					showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
					copy: (data) => {
						DiscordNative.clipboard.copy(data);
						Utils.showToast("Link Copied!", "success");
					},
					/* Stolen from Zlib until it gets added to BdApi */
					getNestedProp: (obj, path) => path.split(".").reduce(function(ob, prop) {
						return ob && ob[prop];
					}, obj)
				};

				// Components
				const CopyButtonComponent = ({ href }) => {
					return React.createElement(React.Fragment, null,
						React.createElement("span", { className: "copyBtnSpan" }, "|"),
						React.createElement("a", {
							className: "copyBtn",
							onClick: (_) => Utils.copy(href)
						}, "Copy link"));

				};

				// Styles
				const css = `.copyBtn {
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

				return class CopyImageLink {
					start() {
						try {
							DOM.addStyle(css);
							Patcher.after(Modules.ImageModal.module, Modules.ImageModal.key, (_, __, returnValue) => {
								const children = Utils.getNestedProp(returnValue, "props.children");
								const { href } = Utils.getNestedProp(returnValue, "props.children.2.props");
								children.push(React.createElement(CopyButtonComponent, { href }));
							});
						} catch (e) {
							console.error(e);
						}
					}

					stop() {
						DOM.removeStyle();
						Patcher.unpatchAll();
					}
				}
			}
		}
	})();
	return [Plugin, Modules]
}

function pluginErrorAlert(content) {
	BdApi.alert(config.info.name, content);
}

function getErrorPlugin(message) {
	return () => ({
		stop() {},
		start() {
			pluginErrorAlert(message);
		}
	})
}

function checkModules(Modules) {
	return Object.entries(Modules).reduce((acc, [moduleName, { module, fallback, isBreakable, withKey }]) => {
		if ((withKey && !module.module) || !module) {
			if (isBreakable) acc[0] = true;
			acc[2].push(moduleName);
			if (fallback) acc[1][moduleName] = fallback;
		} else
			acc[1][moduleName] = module;
		return acc;
	}, [false, {},
		[]
	]);
}

function initPlugin() {
	const [Plugin, Modules] = getPlugin();

	const [pluginBreakingError, SafeModules, BrokenModules] = checkModules(Modules);
	if (pluginBreakingError)
		return getErrorPlugin([
			"**Plugin is broken:** Take a screenshot of this popup and show it to the dev.",
			`\`\`\`md\nMissing modules:\n\n${BrokenModules.map((moduleName,i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
		]);
	else {
		if (BrokenModules.length > 0)
			pluginErrorAlert([
				"Detected some Missing modules, certain aspects of the plugin may not work properly.",
				`\`\`\`md\n[Missing modules]\n\n${BrokenModules.map((moduleName,i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
			]);
		return Plugin(SafeModules);
	}
}

module.exports = initPlugin();
