module.exports = () => {
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
			Popout: { module: DiscordModules.Popout, isBreakable: true },
			ExpressionPickerInspector: { module: DiscordModules.ExpressionPickerInspector, isBreakable: true },
			SwitchRow: { module: DiscordModules.SwitchRow },
			closeExpressionPicker: { module: getModuleAndKey(m => m?.toString?.().includes('activeView:null,activeViewType:null')), withKey: true },
			DefaultEmojisManager: { module: DiscordModules.DefaultEmojisManager, isBreakable: true }
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
			const ErrorBoundary = require("components/ErrorBoundary.jsx");
			const PreviewComponent = require("components/PreviewComponent.jsx");
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
			const css = require("styles.css");

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
}