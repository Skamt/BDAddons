function main() {
	const { React, Webpack: { Filters, getModule } } = BdApi;

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
			Popout: {
				module: DiscordModules.Popout,
				isBreakable: true
			},
			ExpressionPickerInspector: {
				module: DiscordModules.ExpressionPickerInspector,
				isBreakable: true
			},
			SwitchRow: {
				module: DiscordModules.SwitchRow,
				fallback: function fallbackSwitchRow(props) {
					return React.createElement('div', { style: { color: "#fff" } }, [
						props.children,
						React.createElement('input', {
							checked: props.value,
							onChange: (e) => props.onChange(e.target.checked),
							type: "checkbox"
						})
					])
				},
				errorNote: "Sloppy fallback is used"
			},
			closeExpressionPicker: {
				module: getModuleAndKey(m => m?.toString?.().includes('activeView:null,activeViewType:null')),
				withKey: true,
				errorNote: "Preview state will not be preserved across tabs"
			},
			DefaultEmojisManager: {
				module: DiscordModules.DefaultEmojisManager,
				errorNote: "Preview is disabled for default emojis"
			}
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

			const nop = () => {};

			// Constants
			const PREVIEW_SIZE = 300;
			const PREVIEW_UNAVAILABLE = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="rgb(202 204 206)" d="M12 2C6.477 2 2 6.477 2 12C2 17.522 6.477 22 12 22C17.523 22 22 17.522 22 12C22 6.477 17.523 2 12 2ZM8 6C9.104 6 10 6.896 10 8C10 9.105 9.104 10 8 10C6.896 10 6 9.105 6 8C6 6.896 6.896 6 8 6ZM18 14C18 16.617 15.14 19 12 19C8.86 19 6 16.617 6 14V13H18V14ZM16 10C14.896 10 14 9.105 14 8C14 6.896 14.896 6 16 6C17.104 6 18 6.896 18 8C18 9.105 17.104 10 16 10Z"></path></svg>`;

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
			function addStyles(){
				DOM.addStyle(require("styles.css"));
			}

			return class StickerEmojiPreview {
				constructor() {
					this.settings = Data.load("settings") || { previewDefaultState: false };
					this.previewState = this.settings.previewDefaultState;
				}

				getMediaInfo({ props, type }, titlePrimary) {
					if (props.sticker)
						return [type, props];
					if (props.src)
						return [type, { src: props.src.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`) || PREVIEW_UNAVAILABLE }]
					if (titlePrimary && titlePrimary.includes(':'))
						return ['img', { src: Modules.DefaultEmojisManager?.getByName(titlePrimary.split(":")[1]).url || PREVIEW_UNAVAILABLE }];

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
					if (Modules.closeExpressionPicker)
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
					else
						Patcher.after(Modules.ExpressionPickerInspector, "Z", (_, [{ graphicPrimary, titlePrimary }], ret) => {
							return React.createElement(ErrorBoundary, {
									id: "PreviewComponent",
									plugin: config.info.name,
									fallback: ret
								},
								React.createElement(PreviewComponent, {
									target: ret,
									defaultState: false,
									setPreviewState: nop,
									previewComponent: this.getPreviewComponent(graphicPrimary, titlePrimary)
								}));
						});
				}

				patchCloseExpressionPicker() {
					/**
					 * a listener for when experession picker is closed
					 */
					if (Modules.closeExpressionPicker)
						Patcher.after(Modules.closeExpressionPicker.module, Modules.closeExpressionPicker.key, (_, args, ret) => {
							this.previewState = false;
						});
				}

				start() {
					try {
						addStyles();
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
					return React.createElement(settingComponent, {
						description: "Preview open by default.",
						value: this.settings.previewDefaultState,
						onChange: e => {
							this.settings.previewDefaultState = e;
							Data.save("settings", this.settings);
						}
					});
				}
			};
		}
	}
}