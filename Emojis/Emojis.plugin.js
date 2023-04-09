/**
 * @name Emojis
 * @description Send emoji as link if it can't be sent it normally.
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Emojis
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js
 */

const config = {
	info: {
		name: "Emojis",
		version: "1.0.0",
		description: "Send emoji as link if it can't be sent it normally.",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/Emojis",
		authors: [{
			name: "Skamt"
		}]
	},
	defaultConfig: [{
		type: "switch",
		id: "sendDirectly",
		name: "Send Directly",
		note: "Send the emoji link in a message directly instead of putting it in the chat box.",
		value: false
	}, {
		type: "switch",
		id: "ignoreEmbedPermissions",
		name: "Ignore Embed Permissions",
		note: "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
		value: false
	}, {
		type: "switch",
		id: "shouldSendAnimatedEmojis",
		name: "Send animated emojis",
		note: "Animated emojis are sent as GIFs, making most of them hidden by discord's GIF tag.",
		value: false
	}, {
		type: "switch",
		id: "sendEmojiAsWebp",
		name: "Send animated as webp",
		note: "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
		value: false
	}, {
		type: "slider",
		id: "emojiSize",
		name: "Emoji Size",
		note: "The size of the Emoji in pixels.",
		value: 96,
		markers: [40, 48, 60, 64, 80, 96],
		stickToMarkers: true
	}],
	zpl: true
};

function main(API) {
	const {
		UI,
		DOM,
		Patcher,
		ReactUtils: { getInternalInstance },
		Webpack: { Filters, getModule }
	} = API;

	return {
		Modules: {
			PendingReplyStore: {
				module: getModule(m => m.getPendingReply),
				errorNote: "Replies will be ignored"
			},
			EmojiIntentionEnum: {
				module: getModule(Filters.byProps('GUILD_ROLE_BENEFIT_EMOJI'), { searchExports: true }),
				fallback: { CHAT: 3 },
				errorNote: "fallback is used, there maybe side effects"
			},
			EmojiSendAvailabilityEnum: {
				module: getModule(Filters.byProps('GUILD_SUBSCRIPTION_UNAVAILABLE'), { searchExports: true }),
				fallback: { DISALLOW_EXTERNAL: 0, PREMIUM_LOCKED: 2 },
				errorNote: "fallback is used, there maybe side effects"
			},
			EmojiFunctions: {
				module: getModule(Filters.byProps('getEmojiUnavailableReason'), { searchExports: true }),
				isBreakable: true
			},
			Dispatcher: {
				module: getModule(Filters.byProps('dispatch', 'subscribe')),
				errorNote: "replies may missbehave"
			},
			DiscordPermissions: {
				module: getModule(Filters.byProps('ADD_REACTIONS'), { searchExports: true }),
				fallback: { EMBED_LINKS: 16384n },
				errorNote: "fallback is used, there maybe side effects"
			},
			SelectedChannelStore: {
				module: getModule(Filters.byProps('getLastSelectedChannelId')),
				isBreakable: true
			},
			MessageActions: {
				module: getModule(Filters.byProps('jumpToMessage', '_sendMessage')),
				errorNote: "Send directly is disabled"
			},
			Permissions: {
				module: getModule(Filters.byProps('computePermissions')),
				errorNote: "Checking permissions is disabled"
			},
			ChannelStore: {
				module: getModule(Filters.byProps('getChannel', 'getDMFromUserId')),
				isBreakable: true
			},
			UserStore: {
				module: getModule(Filters.byProps('getCurrentUser', 'getUser')),
				errorNote: "Perm checks are disabled"
			},
			InsertText: {
				module: (() => {
					let ComponentDispatch;
					return (content) => {
						if (!ComponentDispatch)
							ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners('INSERT_TEXT').length, { searchExports: true });

						ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
							plainText: content
						});
					}
				})()
			}
		},
		Plugin(Modules, ParentPlugin) {

			// Utilities
			const SelfUtils = {
				showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
				hasEmbedPerms: (channel, user) => !channel.guild_id || Modules.Permissions?.can({ permission: Modules.DiscordPermissions.EMBED_LINKS, context: channel, user }),
				isEmojiSendable: (e) => Modules.EmojiFunctions.getEmojiUnavailableReason(e) === null,
				getEmojiUrl: (emoji, size) => `${emoji.url.replace(/(size=)(\d+)[&]/, '')}&size=${size}`,
				getEmojiWebpUrl: (emoji, size) => SelfUtils.getEmojiUrl(emoji, size).replace('gif', 'webp'),
				getEmojiGifUrl: (emoji, size) => SelfUtils.getEmojiUrl(emoji, size).replace('webp', 'gif')
			}

			// Strings & Constants
			const STRINGS = {
				missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
				disabledAnimatedEmojiErrorMessage: "You have disabled animated emojis in settings."
			};

			// Styles
			function addStyles() {
				DOM.addStyle(`.CHAT .premiumPromo-1eKAIB {
    display:none;
}
.emojiItemDisabled-3VVnwp {
    filter: unset;
}`);
			}

			return class Emojis extends ParentPlugin {
				constructor() {
					super();
					this.emojiClickHandler = this.emojiClickHandler.bind(this);
				}

				getEmojiUrl(emoji, size) {
					if (this.settings.sendEmojiAsWebp)
						return SelfUtils.getEmojiWebpUrl(emoji, size);
					if (emoji.animated)
						return SelfUtils.getEmojiGifUrl(emoji, 4096);

					return SelfUtils.getEmojiUrl(emoji, size);
				}

				sendEmojiAsLink(emoji, channel) {
					if (Modules.MessageActions && this.settings.sendDirectly)
						Modules.MessageActions.sendMessage(channel.id, {
							content: this.getEmojiUrl(emoji, this.settings.emojiSize),
							validNonShortcutEmojis: []
						}, undefined, this.getReply(channel.id));
					else
						Modules.InsertText(SelfUtils.getEmojiUrl(emoji, this.settings.emojiSize));
				}

				getReply(channelId) {
					const reply = Modules.PendingReplyStore?.getPendingReply(channelId);
					if (!reply) return {};
					Modules.Dispatcher?.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
					return {
						messageReference: {
							guild_id: reply.channel.guild_id,
							channel_id: reply.channel.id,
							message_id: reply.message.id
						},
						allowedMentions: reply.shouldMention ? undefined : {
							parse: ["users", "roles", "everyone"],
							replied_user: false
						}
					}
				}

				handleUnsendableEmoji(emoji, channel, user) {
					if (emoji.animated && !this.settings.shouldSendAnimatedEmojis)
						return SelfUtils.showToast(STRINGS.disabledAnimatedEmojiErrorMessage, "info");
					if (!SelfUtils.hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
						return SelfUtils.showToast(STRINGS.missingEmbedPermissionsErrorMessage, "info");

					this.sendEmojiAsLink(emoji, channel);
				}

				emojiHandler(emoji) {
					const user = this.getCurrentUser();
					const intention = Modules.EmojiIntentionEnum.CHAT;
					const channel = Modules.ChannelStore.getChannel(Modules.SelectedChannelStore.getChannelId());
					if (!SelfUtils.isEmojiSendable({ emoji, channel, intention }))
						this.handleUnsendableEmoji(emoji, channel, user);
				}

				getPickerIntention(event) {
					const picker = event.path.find(i => i.id === 'emoji-picker-tab-panel');
					if (!picker) return [null];
					const pickerInstance = getInternalInstance(picker);
					const { pickerIntention } = API.Utils.findInTree(pickerInstance, m => m && "pickerIntention" in m, { walkable: ["pendingProps", "children", "props"] }) || {};
					return [pickerIntention, picker];
				}

				emojiClickHandler(event) {
					if (event.button === 2) return;
					const [pickerIntention, picker] = this.getPickerIntention(event);
					if (pickerIntention !== Modules.EmojiIntentionEnum.CHAT) return;
					picker.classList.add('CHAT');
					const emojiInstance = getInternalInstance(event.target);
					const props = emojiInstance?.pendingProps;
					if (props && props["data-type"]?.toLowerCase() === "emoji" && props.children) {
						this.emojiHandler(props.children.props.emoji);
					}
				}

				patchEmojiPickerUnavailable() {
					/**
					 * This patches allows server icons to show up on the left side of the picker
					 * if external emojis are disabled, servers get filtered out
					 * and it's handy to scroll through emojis easily
					 */
					Patcher.after(Modules.EmojiFunctions, "isEmojiFiltered", (_, [, , intention], ret) => {
						if (intention !== Modules.EmojiIntentionEnum.CHAT) return ret;
						return false;
					});
					/**
					 * This patch allows emojis to be added to the picker
					 * if external emojis are disabled, they don't get added to the picker
					 * PREMIUM_LOCKED is returned becaause that is what's returned normally 
					 
					 * 0: "DISALLOW_EXTERNAL"
					 * 1: "GUILD_SUBSCRIPTION_UNAVAILABLE"
					 * 2: "PREMIUM_LOCKED"
					 * 3: "ONLY_GUILD_EMOJIS_ALLOWED"
					 * 4: "ROLE_SUBSCRIPTION_LOCKED"
					 * 5: "ROLE_SUBSCRIPTION_UNAVAILABLE"
					 */
					Patcher.after(Modules.EmojiFunctions, "getEmojiUnavailableReason", (_, [{ intention }], ret) => {
						if (intention !== Modules.EmojiIntentionEnum.CHAT) return ret;
						return ret === Modules.EmojiSendAvailabilityEnum.DISALLOW_EXTERNAL ? Modules.EmojiSendAvailabilityEnum.PREMIUM_LOCKED : ret;
					});
				}

				setUpCurrentUser() {
					const [getCurrentUser, cleanUp] = (() => {
						let currentUser = null;
						if (!Modules.Dispatcher) return [() => Modules.UserStore?.getCurrentUser() || {}];

						const resetCurrentUser = () => currentUser = null;
						Modules.Dispatcher.subscribe('LOGOUT', resetCurrentUser);
						return [
							() => {
								if (currentUser) return currentUser;
								const user = Modules.UserStore?.getCurrentUser();
								if (user) {
									currentUser = user;
								} else {
									try {
										const target = document.querySelector('.panels-3wFtMD .container-YkUktl');
										const instance = API.ReactUtils.getInternalInstance(target);
										const props = API.Utils.findInTree(instance, a => a?.currentUser, { walkable: ["return", "pendingProps"] });
										currentUser = props.currentUser;
									} catch { /* empty */ }
								}
								return currentUser || {};
							},
							() => Modules.Dispatcher.unsubscribe('LOGOUT', resetCurrentUser)
						]
					})();
					this.getCurrentUser = getCurrentUser;
					this.cleanUp = cleanUp;
				}

				onStart() {
					try {
						addStyles();
						this.setUpCurrentUser();
						this.patchEmojiPickerUnavailable();
						document.addEventListener("mouseup", this.emojiClickHandler);
					} catch (e) {
						console.error(e);
					}
				}

				onStop() {
					this.cleanUp?.();
					DOM.removeStyle();
					Patcher.unpatchAll();
					document.removeEventListener("mouseup", this.emojiClickHandler);
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}
			}
		}
	}
}

const AddonManager = (() => {
	const API = new BdApi(config.info.name);

	const Modals = {
		AddStyles() {
			if (!document.querySelector('head > bd-head > bd-styles > #AddonManagerCSS'))
				API.DOM.addStyle('AddonManagerCSS', `#modal-container {
    position: absolute;
    z-index: 3000;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    overflow: hidden;
    user-select: text;
    font-family: "gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    --backdrop: #000;
    --modal: #57616f;
    --modal: #313437;
    --head: #25272a;
    --note: #dbdee1;
    --module: #27292b;
    --error-message: #b5bac1;
    --footer: #27292c;
    --close-btn: #5865f2;
    --close-btn-hover: #4752c4;
    --close-btn-active: #3c45a5;
    --added: #2dc770;
    --improved: #949cf7;
    --fixed: #f23f42;
    --notice: #f0b132;
}

#modal-container .backdrop {
    background: var(--backdrop);
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: .85;
}

#modal-container .modal {
    background: var(--modal);
    display: inline-flex;
    flex-direction: column;
    color: white;
    overflow: hidden;
    border-radius: 8px;
    margin: auto;
    max-width: 600px;
    max-height: 70vh;
}

#modal-container .head {
    background: var(--head);
    padding: 12px;
}

#modal-container .head > .title {
    font-size: 1.3rem;
    font-weight: bold;
}

#modal-container .head > .version {
    margin: 2px 0 0 0;
    font-size: 12px;
}

#modal-container .body {
    background: var(--body);
    padding: 10px;
    overflow: hidden auto;
    margin-right:1px;
}

#modal-container .body::-webkit-scrollbar {
    width: 5px;
}

#modal-container .body::-webkit-scrollbar-thumb {
    background-color: #171819;
    border-radius:25px;
}

#modal-container .note {
    color: var(--note);
    font-size: 1rem;
    margin: 8px 0;
}

#modal-container .bm {
    margin: 10px 0;
    font-weight: bold;
}

#modal-container .modules {
    margin: 10px 0;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

#modal-container .module {
    padding: 5px 8px;
    background: var(--module);
    border-radius: 3px;
    flex: 1 0 0;
    white-space: nowrap;
    text-transform: capitalize;
    text-align: center;
}

#modal-container .name {
    display: block;
    line-height: 24px;
    font-size: 16px;
    font-weight: 500;
}

#modal-container .errormessage {
    margin: 2px 0;
    font-size: 13px;
    color: var(--error-message);
}

#modal-container .footer {
    background: var(--footer);
    padding: 10px;
    display: flex;
}

#modal-container button {
    margin-left: auto;
    border-radius: 3px;
    border: none;
    min-width: 96px;
    min-height: 38px;
    width: auto;
    color: #fff;
    background-color: var(--close-btn);
}

#modal-container button:hover {
    background-color: var(--close-btn-hover);
}

#modal-container button:active {
    background-color: var(--close-btn-active);
}

#modal-container.hide {
    display: none;
}

/* animations */
#modal-container .backdrop {
    animation: show-backdrop 300ms ease-out;
}

#modal-container.closing .backdrop {
    animation: hide-backdrop 100ms ease-in;
}

@keyframes show-backdrop {
    from {
        opacity: 0;
    }

    to {
        opacity: .85;
    }
}

@keyframes hide-backdrop {
    from {
        opacity: .85;
    }

    to {
        opacity: 0;
    }
}

#modal-container .modal {
    animation: show-modal 300ms ease-out;
}

#modal-container.closing .modal {
    animation: hide-modal 100ms ease-in;
}

@keyframes show-modal {
    from {
        transform: scale(0);
        opacity: 0;
    }

    to {
        opacity: .85;
        transform: scale(1);
    }
}

@keyframes hide-modal {
    from {
        opacity: .85;
        transform: scale(1);
    }

    to {
        transform: scale(0);
        opacity: 0;
    }
}

/* changelog */
#modal-container .changelog {
    padding: 10px;
    max-width: 450px;
}

#modal-container .changelog .title {
    text-transform: uppercase;
    display: flex;
    align-items: center;
    font-weight: 700;
    margin-top: 20px;
    color: var(--c);
}

#modal-container .changelog .title:after {
    content: "";
    height: 1px;
    flex: 1 1 auto;
    margin-left: 8px;
    opacity: .6;
    background: currentColor;
}

#modal-container .changelog ul {
    list-style: none;
    margin: 20px 0 8px 20px;
}

#modal-container .changelog ul > li {
    position:relative;
    line-height: 20px;
    margin-bottom: 8px;
    color: #c4c9ce;
}

#modal-container .changelog ul > li:before {
    content: "";
    position: absolute;
    background:currentColor;
    top: 10px;
    left: -15px;
    width: 6px;
    height: 6px;
    margin-top: -4px;
    margin-left: -3px;
    border-radius: 50%;
    opacity: .5;
}`);
		},
		openModal(content) {
			this.AddStyles();
			const template = document.createElement("template");
			template.innerHTML = `<div id="modal-container">
									<div class="backdrop"></div>
									${content}
								</div>`;
			const modal = template.content.firstElementChild.cloneNode(true);
			modal.onclick = (e) => {
				if (e.target.classList.contains('close-btn') || e.target.classList.contains('backdrop')) {
					modal.classList.add("closing");
					setTimeout(() => { modal.remove(); }, 100);
				}
			};
			document.querySelector('bd-body').append(modal);
		},
		alert(content) {
			this.openModal(`<div class="modal">
				<div class="head">
					<h2 class="title">${config.info.name}</h2>
					<p class="version">version ${config.info.version}</p>
				</div>
				<div class="body">${content}</div>
				<div class="footer"><button class="close-btn">Close</button></div>
			</div>`);
		},
		showMissingModulesModal(missingModules) {
			this.alert(
				`<p class="note">Detected some Missing modules, certain aspects of the plugin may not work properly.</p>
				<h3 class="bm">Missing Modules:</h3>
				<div class="modules">
					${missingModules.map(([moduleName, errorNote]) => `<div class="module">
					<h3 class="name">${moduleName}</h3>
					<p class="errormessage">${errorNote || "No description provided"}</p>
					</div>`).join('')}
				</div>`);
		},
		showBrokenAddonModal(missingModules) {
			this.alert(
				`<p class="note">Plugin is broken, Take a screenshot of this popup and show it to the dev.</p>
				<h3 class="bm">Missing Modules:</h3>
				<div class="modules">
					${missingModules.map(([moduleName]) => `<div class="module">
						<h3 class="name">${moduleName}</h3>
					</div>`).join('')}
				</div>`);
		},
		showChangelogModal() {
			if (!config.changelog || !Array.isArray(config.changelog)) return;

			const changelog = config.changelog?.map(({ title, type, items }) =>
				`<h3 style="--c:var(--${type});" class="title">${title}</h3>
				<ul class="list">
					${items.map(item => `<li>${item}</li>`).join('')}
				</ul>`).join('')
			this.alert(`<div class="changelog">${changelog}</div>`);
		}
	};

	const Data = {
		get() {
			return this.data;
		},
		save(data) {
			this.data = data;
			API.Data.save('metadata', data);
		},
		Init() {
			this.data = API.Data.load('metadata');
			if (!this.data) {
				this.save({
					version: config.info.version,
					changelog: false,
				});
			}
		}
	};

	const Addon = {
		showChangelog() {
			const { version, changelog = false } = Data.get();
			if (version != config.info.version || !changelog) {
				Modals.showChangelogModal();
				Data.save({
					version: config.info.version,
					changelog: true
				});
			}
		},
		handleBrokenAddon(missingModules) {
			this.getPlugin = () => class BrokenAddon {
				stop() {}
				start() {
					Modals.showBrokenAddonModal(missingModules);
				}
			};
		},
		handleMissingModules(missingModules) {
			Modals.showMissingModulesModal(missingModules);
		},
		checkModules(modules) {
			return Object.entries(modules).reduce((acc, [moduleName, { module, fallback, errorNote, isBreakable, withKey }]) => {
				if ((withKey && !module.module) || !module) {
					if (isBreakable) acc.isAddonBroken = true;
					acc.missingModules.push([moduleName, errorNote]);
					if (fallback) acc.safeModules[moduleName] = fallback;
				} else
					acc.safeModules[moduleName] = module;
				return acc;
			}, { isAddonBroken: false, safeModules: {}, missingModules: [] });
		},
		start(ParentPlugin) {
			const { Modules, Plugin } = main(API);
			const { isAddonBroken, safeModules, missingModules } = this.checkModules(Modules);
			if (isAddonBroken) {
				this.handleBrokenAddon(missingModules);
			} else {
				if (missingModules.length > 0)
					this.handleMissingModules(missingModules);
				this.getPlugin = () => {
					if (!config.zpl) this.showChangelog();
					return Plugin(safeModules, ParentPlugin);
				};
			}
		},
		Init() {
			if (!config.zpl) return this.start();

			if (!global.ZeresPluginLibrary) {
				this.getPlugin = () => class BrokenAddon {
					stop() {}
					start() {
						API.alert("Missing library", [`**ZeresPluginLibrary** is needed to run **${config.info.name}**.`,
							"Please download it from the officiel website",
							"https://betterdiscord.app/plugin/ZeresPluginLibrary"
						]);
					}
				};
			} else
				this.start(global.ZeresPluginLibrary.buildPlugin(config)[0]);

		}
	};

	return {
		Start() {
			Data.Init();
			Addon.Init();

			return Addon.getPlugin();
		}
	}
})();

module.exports = AddonManager.Start();
