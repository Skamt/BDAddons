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
	}]
};

function getPlugin() {
	const [ParentPlugin, Api] = global.ZeresPluginLibrary.buildPlugin(config);
	const { Modules, Plugin } = (() => {
		const { Webpack: { Filters, getModule } } = BdApi;
		return {
			Modules: {
				PendingReplyStore: { module: getModule(m => m.getPendingReply) },
				EmojiIntentionEnum: { module: getModule(Filters.byProps('GUILD_ROLE_BENEFIT_EMOJI'), { searchExports: true }), fallback: { CHAT: 3 }, },
				EmojiSendAvailabilityEnum: { module: getModule(Filters.byProps('GUILD_SUBSCRIPTION_UNAVAILABLE'), { searchExports: true }), fallback: { DISALLOW_EXTERNAL: 0, PREMIUM_LOCKED: 2 } },
				EmojiFunctions: { module: getModule(Filters.byProps('getEmojiUnavailableReason'), { searchExports: true }), isBreakable: true },
				InsertText: {
					module: (() => {
						let ComponentDispatch;
						return (content) => {
							if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners('INSERT_TEXT').length, { searchExports: true });
							ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
								plainText: content
							});
						}
					})()
				},
				...(() => {
					const { Dispatcher, DiscordPermissions, SelectedChannelStore, MessageActions, Permissions, ChannelStore, UserStore } = Api.DiscordModules;
					return {
						Dispatcher: { module: Dispatcher },
						DiscordPermissions: { module: DiscordPermissions, fallback: { EMBED_LINKS: 16384n } },
						SelectedChannelStore: { module: SelectedChannelStore, isBreakable: true },
						MessageActions: { module: MessageActions },
						Permissions: { module: Permissions, isBreakable: true },
						ChannelStore: { module: ChannelStore, isBreakable: true },
						UserStore: { module: UserStore, isBreakable: true }
					};
				})()
			},
			Plugin(ParentPlugin, Modules) {
				const {
					UI,
					DOM,
					Utils,
					Patcher,
					ReactUtils: {
						getInternalInstance
					}
				} = new BdApi(config.info.name);

				// Utilities
				const SelfUtils = {
					showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
					hasEmbedPerms: (channel, user) => !channel.guild_id || Modules.Permissions.can({ permission: Modules.DiscordPermissions.EMBED_LINKS, context: channel, user }),
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
				const css = `.CHAT .premiumPromo-1eKAIB {
    display:none;
}
.emojiItemDisabled-3VVnwp {
    filter: unset;
}`;

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
						const reply = Modules.PendingReplyStore.getPendingReply(channelId);
						if (!reply) return {};
						Modules.Dispatcher.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
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
						const user = Modules.UserStore.getCurrentUser();
						const intention = Modules.EmojiIntentionEnum.CHAT;
						const channel = Modules.ChannelStore.getChannel(Modules.SelectedChannelStore.getChannelId());
						if (!SelfUtils.isEmojiSendable({ emoji, channel, intention }))
							this.handleUnsendableEmoji(emoji, channel, user);
					}

					getPickerIntention(event) {
						const picker = event.path.find(i => i.id === 'emoji-picker-tab-panel');
						if (!picker) return [null];
						const pickerInstance = getInternalInstance(picker);
						const { pickerIntention } = BdApi.Utils.findInTree(pickerInstance, m => m && "pickerIntention" in m, { walkable: ["pendingProps", "children", "props"] }) || {};
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

					onStart() {
						try {
							DOM.addStyle(css);
							this.patchEmojiPickerUnavailable();
							document.addEventListener("mouseup", this.emojiClickHandler);
						} catch (e) {
							console.error(e);
						}
					}

					onStop() {
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
	})(Api);
	return [ParentPlugin, Plugin, Modules]
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

function checkModules(modules) {
	return Object.entries(modules).reduce((acc, [moduleName, { module, fallback, errorNote, isBreakable, withKey }]) => {
		if ((withKey && !module.module) || !module) {
			if (isBreakable) acc[0] = true;
			acc[2].push([moduleName, errorNote]);
			if (fallback) acc[1][moduleName] = fallback;
		} else
			acc[1][moduleName] = module;
		return acc;
	}, [false, {},
		[]
	]);
}

function ensuredata() {
	return BdApi.Data.load(config.info.name, 'brokenModulesData') || {
		version: config.info.version,
		first: true,
		errorPopupCount: 0,
		savedBrokenModules: []
	};
}

function setPluginMetaData() {
	const { version, first } = ensuredata();
	if (version != config.info.version || first)
		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			version: config.info.version,
			errorPopupCount: 0,
			savedBrokenModules: []
		});
}

function handleBrokenModules(brokenModules) {
	const { version, errorPopupCount, savedBrokenModules } = ensuredata();

	const newBrokenModules = brokenModules.some(([newItem]) => !savedBrokenModules.includes(newItem));
	const isUpdated = version != config.info.version;
	const isPopupLimitReached = errorPopupCount === 3;

	if (isUpdated || !isPopupLimitReached || newBrokenModules) {
		pluginErrorAlert([
			"Detected some Missing modules, certain aspects of the plugin may not work properly.",
			`\`\`\`md\nMissing modules:\n\n${brokenModules.map(([moduleName, errorNote]) => `[${moduleName}]: ${errorNote ? `\n\t${errorNote}` :""}`).join('\n')}\`\`\``
		]);

		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			version,
			errorPopupCount: (errorPopupCount + 1) % 4,
			savedBrokenModules: brokenModules.map(([moduleName]) => moduleName)
		});
	}
}

function initPlugin() {
	setPluginMetaData();
	const [ParentPlugin, Plugin, Modules] = getPlugin();

	const [pluginBreakingError, SafeModules, BrokenModules] = checkModules(Modules);
	if (pluginBreakingError)
		return getErrorPlugin([
			"**Plugin is broken:** Take a screenshot of this popup and show it to the dev.",
			`\`\`\`md\nMissing modules:\n\n${BrokenModules.map(([moduleName],i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
		]);
	else {
		if (BrokenModules.length > 0)
			handleBrokenModules(BrokenModules);
		return Plugin(ParentPlugin, SafeModules);
	}
}

module.exports = !global.ZeresPluginLibrary ?
	getErrorPlugin(["**Library plugin is needed**",
		`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`,
		"Please download it from the officiel website",
		"https://betterdiscord.app/plugin/ZeresPluginLibrary"
	]) :
	initPlugin();
