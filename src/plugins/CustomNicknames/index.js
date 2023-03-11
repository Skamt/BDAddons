function main(Api) {
	const { React, Webpack: { Filters, getModule } } = BdApi;
	return {
		Modules: {
			MessageHeader: {
				module: DiscordModules.MessageHeader,
				isBreakable: true
			},
			UserStore: {
				module: DiscordModules.UserStore,
				errorNote: "Current user will not be excluded from context menu"
			},
			openModal: {
				module: DiscordModules.openModal,
				errorNote: "Won't be able to add/change nicknames"
			},
			ModalRoot: {
				module: DiscordModules.ModalRoot,
				fallback: function fallbackModalRoot(props) {
					return React.createElement('div', { ...props, style: { pointerEvents: "all" } })
				},
				errorNote: "Sloppy fallback is used"
			},
			Text: {
				module: DiscordModules.Text,
				fallback: function fallbackText(props) {
					return React.createElement('h2', props)
				},
				errorNote: "Sloppy fallback is used"
			},
			Label: {
				module: DiscordModules.Label,
				fallback: function fallbackLabel(props) {
					return React.createElement('p', props)
				},
				errorNote: "Sloppy fallback is used"
			},
			...(() => {
				let exp = undefined;
				getModule((m, e) => (m.toString().includes("onAnimationEnd") ? true && (exp = e.exports) : undefined), { searchExports: true });
				if (!exp) return { Modals: { module: undefined } };
				const funcs = Object.values(exp) || [];
				const ModalHeader = funcs.find(Filters.byStrings("headerIdIsManaged", "headerId", "separator"));
				const ModalBody = funcs.find(Filters.byStrings("scrollerRef", "content", "children"));
				const ModalFooter = funcs.find(Filters.byStrings("footerSeparator"));
				return {
					ModalHeader: {
						module: ModalHeader,
						fallback: function fallbackModalHeader(props) {
							return React.createElement('div', props)
						},
						errorNote: "Sloppy fallback is used"
					},
					ModalBody: {
						module: ModalBody,
						fallback: function fallbackModalBody(props) {
							return React.createElement('div', props)
						},
						errorNote: "Sloppy fallback is used"
					},
					ModalFooter: {
						module: ModalFooter,
						fallback: function fallbackModalFooter(props) {
							return React.createElement('div', props)
						},
						errorNote: "Sloppy fallback is used"
					}
				};
			})(),
			...(() => {
				const { ButtonData, Textbox, TextElement } = Api.DiscordModules;
				return {
					ButtonData: {
						module: ButtonData,
						fallback: function fallbackButtonData(props) {
							return React.createElement('button', props)
						},
						errorNote: "Sloppy fallback is used"
					},
					Textbox: {
						module: Textbox,
						fallback: function fallbackTextbox(props) {
							return React.createElement('input', {
								...props,
								onChange: (e) => props.onChange(e.target.value),
								type: "text"
							})
						},
						errorNote: "Sloppy fallback is used"
					}
				};
			})()
		},
		Plugin(ParentPlugin, Modules) {
			const {
				UI,
				Data,
				DOM,
				React,
				React: { useState, useEffect },
				Patcher,
				ContextMenu
			} = new BdApi(config.info.name);

			// Utilities
			const Utils = {
				showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type })
			};

			// Components
			const ErrorBoundary = require("components/ErrorBoundary.jsx");
			const AddUserNicknameComponent = require("components/AddUserNicknameComponent.jsx");

			// Styles
			const css = require("styles.css");

			return class CustomNicknames extends ParentPlugin {

				constructor() {
					super();
				}

				onStart() {
					DOM.addStyle(css);
					this.patches = [
						Patcher.after(Modules.MessageHeader, "Z", (_, [{ message }], ret) => {
							const nick = Data.load(message.author.id);
							if (nick) ret.props.children.splice(3, 0, React.createElement("span", { className: "nick" }, nick));
						}),
						ContextMenu.patch("user-context", (retVal, { user }) => {
							if (user.id !== Modules.UserStore.getCurrentUser().id)
								retVal.props.children.unshift(
									ContextMenu.buildItem({
										type: "button",
										label: "Add user nickname",
										action: () => Modules.openModal(props => React.createElement(ErrorBoundary, {
											id: "AddUserNicknameComponent",
											plugin: config.info.name,
											closeModal: props.onClose
										}, React.createElement(AddUserNicknameComponent, { props, user })))
									})
								);
						})
					];
				}

				onStop() {
					DOM.removeStyle();
					this.patches?.forEach?.(p => p());
					this.patches = null;
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}
			}
		}
	}
}