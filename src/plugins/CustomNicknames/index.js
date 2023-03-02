module.exports = (Plugin, Api) => {
	const {
		UI,
		Data,
		DOM,
		React,
		React: { useState, useEffect },
		Patcher,
		ContextMenu,
		Webpack: {
			Filters,
			getModule
		}
	} = new BdApi(config.info.name);

	// Modules
	const Modules = {
		MessageHeader: DiscordModules.MessageHeader,
		UserStore: DiscordModules.UserStore,
		openModal: DiscordModules.openModal,
		ModalRoot: DiscordModules.ModalRoot,
		Text: DiscordModules.Text,
		Label: DiscordModules.Label,
		...(() => {
			let exp = undefined;
			getModule((m, e) => m.toString().includes('onAnimationEnd') ? (true && (exp = e.exports)) : undefined, { searchExports: true });
			if (!exp) return { Modals: undefined };
			const funcs = Object.values(exp) || [];
			const ModalHeader = funcs.find(Filters.byStrings('headerIdIsManaged', 'headerId', 'separator'));
			const ModalBody = funcs.find(Filters.byStrings('scrollerRef', 'content', 'children'));
			const ModalFooter = funcs.find(Filters.byStrings('footerSeparator'));
			return { ModalHeader, ModalBody, ModalFooter };
		})(),
		...(() => {
			const { ButtonData, Textbox, TextElement } = Api.DiscordModules;
			return { ButtonData, Textbox, TextElement };
		})()
	}

	failsafe;

	// Utilities
	const Utils = {
		showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
	};

	// Components
	const AddUserNickname = require("components/AddUserNickname.jsx");

	// Styles
	const css = require("styles.css");

	return class CustomNicknames extends Plugin {

		constructor() {
			super();
		}

		onStart() {
			DOM.addStyle(css);
			this.patches = [
				Patcher.after(Modules.MessageHeader, "Z", (_, [{ message }], ret) => {
					const nick = Data.load(message.author.id);
					if (nick)
						ret.props.children.splice(3, 0, React.createElement('span', { className: "nick" }, nick))
				}),
				ContextMenu.patch("user-context", (retVal, { user }) => {
					if (user.id !== Modules.UserStore.getCurrentUser().id)
						retVal.props.children.unshift(ContextMenu.buildItem({
							type: "button",
							label: "Add user nickname",
							action: () => Modules.openModal(props => React.createElement(AddUserNickname, { props, user }))
						}));
				})
			]
		}

		onStop() {
			DOM.removeStyle();
			this.patches?.forEach?.(p => p());
			this.patches = null;
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}