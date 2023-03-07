/**
 * @name StickerEmojiPreview
 * @description Adds a zoomed preview to those tiny Stickers and Emojis
 * @version 1.0.5
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/StickerEmojiPreview
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/StickerEmojiPreview/StickerEmojiPreview.plugin.js
 */
const config = {
	info: {
		name: "StickerEmojiPreview",
		version: "1.0.5",
		description: "Adds a zoomed preview to those tiny Stickers and Emojis",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/StickerEmojiPreview/StickerEmojiPreview.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/StickerEmojiPreview",
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
				Popout: { module: getModule(Filters.byStrings('renderPopout', 'animationPosition'), { searchExports: true }), isBreakable: true },
				ExpressionPickerInspector: { module: getModule((m) => m.Z && m.Z.toString().includes('EMOJI_IS_FAVORITE_ARIA_LABEL')), isBreakable: true },
				SwitchRow: { module: getModule(m => m.toString().includes('tooltipNote'), { searchExports: true }) },
				closeExpressionPicker: { module: getModuleAndKey(m => m?.toString?.().includes('activeView:null,activeViewType:null')), withKey: true },
				DefaultEmojisManager: { module: getModule(m => m.getByName && m.EMOJI_NAME_RE), isBreakable: true }
			},
			Plugin(Modules) {
				const {
					DOM,
					React,
					Data,
					Patcher,
					React: { useEffect, useState },
					Webpack: { Filters, getModule }
				} = new BdApi(config.info.name);

				// Constants
				const PREVIEW_SIZE = 300;

				// Components
				const ErrorBoundary = class ErrorBoundary extends React.Component {
					state = { hasError: false, error: null, info: null };

					componentDidCatch(error, info) {
						this.setState({ error, info, hasError: true });
						const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
						console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
					}

					render() {
						return this.state.hasError ? this.props.fallback || React.createElement("b", { style: { color: "red" } }, "Error occured while rendering") : this.props.children;
					}
				};
				const PreviewComponent = ({ target, defaultState, setPreviewState, previewComponent }) => {
					const [show, setShow] = useState(defaultState);
					useEffect(() => {
						function keyupHandler(e) {
							if (e.key === "Control") {
								setPreviewState(!show);
								setShow(!show);
							}
						}
						document.addEventListener("keyup", keyupHandler);
						return () => document.removeEventListener("keyup", keyupHandler);
					}, [show]);
					return (
						React.createElement(Modules.Popout, {
								renderPopout: () =>
									React.createElement("div", {
											className: "stickersPreview",
											style: { width: `${PREVIEW_SIZE}px` }
										},
										previewComponent),

								shouldShow: show,
								position: "left",
								align: "bottom",
								animation: "3",
								spacing: 60
							},
							() => target));

				};
				const settingComponent = (props) => {
					const [enabled, setEnabled] = useState(props.value);
					return React.createElement(Modules.SwitchRow, {
						value: enabled,
						hideBorder: true,
						onChange: e => {
							props.onChange(e);
							setEnabled(e);
						}
					}, props.description);
				}

				// Styles
				const css = `.stickersPreview {
	width:400px;
	font-size: 14px;
	background: var(--background-floating);
	border-radius: 5px;
	padding: .5em;
	box-shadow: var(--elevation-high);
}
.stickersPreview img{
	min-width:100%;
	max-width:100%;
}
.animated img{
	border:1px dashed #ff8f09;
	padding:1px;
	box-sizing:border-box;
}`;

				return class StickerEmojiPreview {
					constructor() {
						this.settings = Data.load("settings") || { previewDefaultState: false };
						this.previewState = this.settings.previewDefaultState;
					}

					getMediaInfo({ props, type }, titlePrimary) {
						if (props.sticker)
							return [type, props];
						if (props.src)
							return [type, { src: props.src.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`) }]
						if (titlePrimary && titlePrimary.includes(':'))
							return ['img', { src: Modules.DefaultEmojisManager.getByName(titlePrimary.split(":")[1]).url }];

						return ['div', {}];
					}

					getPreviewComponent(graphicPrimary, titlePrimary) {
						const [type, props] = this.getMediaInfo(graphicPrimary, titlePrimary);

						return React.createElement(type, {
							...props,
							disableAnimation: false,
							size: PREVIEW_SIZE
						});
					}

					patchPickerInspector() {
						/**
						 * Main patch for the plugin
						 */
						Patcher.after(Modules.ExpressionPickerInspector, "Z", (_, [{ graphicPrimary, titlePrimary }], ret) => {
							return React.createElement(ErrorBoundary, {
									id: "PreviewComponent",
									plugin: config.info.name,
									fallback: ret
								},
								React.createElement(PreviewComponent, {
									target: ret,
									defaultState: this.previewState,
									setPreviewState: (e) => this.previewState = e,
									previewComponent: this.getPreviewComponent(graphicPrimary, titlePrimary)
								}));
						});
					}

					patchCloseExpressionPicker() {
						/**
						 * a listener for when experession picker is closed
						 */
						if (Modules.closeExpressionPicker.module)
							Patcher.after(Modules.closeExpressionPicker.module, Modules.closeExpressionPicker.key, (_, args, ret) => {
								this.previewState = false;
							});
					}

					start() {
						try {
							DOM.addStyle(css);
							this.patchPickerInspector();
							this.patchCloseExpressionPicker();
						} catch (e) {
							console.error(e);
						}
					}

					stop() {
						DOM.removeStyle();
						Patcher.unpatchAll();
					}

					getSettingsPanel() {
						return React.createElement(ErrorBoundary, {
							id: "StickerEmojiPreviewSettings",
							plugin: config.info.name
						}, React.createElement(settingComponent, {
							description: "Preview open by default.",
							value: this.settings.previewDefaultState,
							onChange: e => {
								this.settings.previewDefaultState = e;
								Data.save("settings", this.settings);
							}
						}));
					}
				};
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
