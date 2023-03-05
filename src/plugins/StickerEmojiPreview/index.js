module.exports = () => {
	const { Webpack: { Filters, getModule } } = BdApi;
	return {
		Modules: {
			Popout: { module: DiscordModules.Popout, isBreakable: true },
			ExpressionPickerInspector: { module: DiscordModules.ExpressionPickerInspector, isBreakable: true },
			SwitchRow: { module: DiscordModules.SwitchRow },
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
			const ErrorBoundary = require("ErrorBoundary.jsx");
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

				start() {
					try {
						DOM.addStyle(css);
						Patcher.after(Modules.ExpressionPickerInspector, "Z", (_, [{ graphicPrimary, titlePrimary }], ret) => {
							return React.createElement(ErrorBoundary, {
									id: "PreviewComponent",
									plugin: config.info.name
								},
								React.createElement(PreviewComponent, {
									target: ret,
									defaultState: this.previewState,
									setPreviewState: (e) => this.previewState = e,
									previewComponent: this.getPreviewComponent(graphicPrimary, titlePrimary)
								}));
						});
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