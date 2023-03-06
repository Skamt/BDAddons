module.exports = (Api) => {
	const { Webpack: { Filters, getModule } } = BdApi;
	return {
		Modules: {
			MessageHeader: { module: DiscordModules.MessageHeader, isBreakable: true },
			UserStore: { module: DiscordModules.UserStore },
			openModal: { module: DiscordModules.openModal },
			ModalRoot: { module: DiscordModules.ModalRoot },
			Text: { module: DiscordModules.Text },
			Label: { module: DiscordModules.Label },
			...(() => {
				let exp = undefined;
				getModule((m, e) => (m.toString().includes("onAnimationEnd") ? true && (exp = e.exports) : undefined), { searchExports: true });
				if (!exp) return { Modals: { module: undefined } };
				const funcs = Object.values(exp) || [];
				const ModalHeader = funcs.find(Filters.byStrings("headerIdIsManaged", "headerId", "separator"));
				const ModalBody = funcs.find(Filters.byStrings("scrollerRef", "content", "children"));
				const ModalFooter = funcs.find(Filters.byStrings("footerSeparator"));
				return {
					ModalHeader: { module: ModalHeader },
					ModalBody: { module: ModalBody },
					ModalFooter: { module: ModalFooter }
				};
			})(),
			...(() => {
				const { ButtonData, Textbox, TextElement } = Api.DiscordModules;
				return {
					ButtonData: { module: ButtonData },
					Textbox: { module: Textbox },
					TextElement: { module: TextElement }
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
			const ErrorBoundary = require("ErrorBoundary.jsx");
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