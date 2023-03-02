module.exports = {
	"SwitchRow": "getModule(m => m.toString().includes('tooltipNote'), { searchExports: true })",
	"ImageModal": `getModuleAndKey(m => {
		if (!m?.toString || typeof (m?.toString) !== "function") return;
		const strs = ["original","maxHeight","maxWidth","noreferrer noopener"];
		const funcStr = m?.toString();
		for(const s of strs)
			if (!funcStr.includes(s)) return false;
		return true;
	})`,
	"StickerModule": "getModuleAndKey(Filters.byStrings('sticker', 'withLoadingIndicator'))",
	"ChannelComponent": "getModuleAndKey(Filters.byStrings('canHaveDot', 'isFavoriteSuggestion', 'mentionCount'))",
	"Text": "getModule(Filters.byStrings('data-text-variant'), { searchExports: true })",
	"Label": "getModule(Filters.byStrings('LEGEND', 'LABEL', 'h5'), { searchExports: true })",
	"Markdown": "getModule((m) => m.Z?.rules && m.Z?.defaultProps?.parser).Z",
	"UserStore": "getModule((m, e, i) => m.getCurrentUser && m.getUser)",
	"MessageHeader": "getModule((m) => m.Z?.toString().includes('userOverride') && m.Z?.toString().includes('withMentionPrefix'))",
	"PendingReplyStore": "getModule(m =>  m.getPendingReply)",
	"DMChannel": "getModule(Filters.byStrings('isMobileOnline', 'channel'),{searchExports:true})",
	"ChannelTypeEnum": "getModule(Filters.byProps('GUILD_TEXT','DM') ,{searchExports:true})",
	"SelectedChannelStore": "getModule(Filters.byProps('getLastSelectedChannelId'))",
	"ChannelContent": "getModule(m => m && m.Z && m.Z.type && m.Z.type.toString().includes('showingSpamBanner'))",
	"ChannelActions": "getModule(Filters.byProps('actions', 'fetchMessages'), { searchExports: true })",
	"UserStore": "getModule(Filters.byProps('getCurrentUser', 'getUser'))",
	"Permissions": "getModule(Filters.byProps('computePermissions'))",
	"DiscordPermissions": "getModule(Filters.byProps('ADD_REACTIONS'), { searchExports: true })",
	"MessageActions": "getModule(Filters.byProps('jumpToMessage', '_sendMessage'))",
	"EmojiIntentionEnum": "getModule(Filters.byProps('GUILD_ROLE_BENEFIT_EMOJI'), { searchExports: true })",
	"EmojiSendAvailabilityEnum": "getModule(Filters.byProps('GUILD_SUBSCRIPTION_UNAVAILABLE'), { searchExports: true })",
	"EmojiFunctions": "getModule(Filters.byProps('getEmojiUnavailableReason'), { searchExports: true })",
	"ChannelStore": "getModule(Filters.byProps('getChannel', 'getDMFromUserId'))",
	"StickerStore": "getModule(Filters.byProps('getStickerById'))",
	"ChannelTextArea": "getModule((exp) => exp?.type?.render?.toString().includes('CHANNEL_TEXT_AREA'))",
	"StickerTypeEnum": "getModule(Filters.byProps('GUILD', 'STANDARD'), { searchExports: true })",
	"StickerFormatEnum": "getModule(Filters.byProps('APNG', 'LOTTIE'), { searchExports: true })",
	"GuildPermissions": "getModule(Filters.byProps('getGuildPermissions'), { searchExports: true })",
	"Popout": "getModule(Filters.byStrings('renderPopout', 'animationPosition'), { searchExports: true })",
	"ExpressionPickerInspector": "getModule((m) => m.Z && m.Z.toString().includes('EMOJI_IS_FAVORITE_ARIA_LABEL'))",
	"Tooltip": "getModule(m => m.defaultProps?.shouldShow,{searchExports:true})",
	"ModalRoot": "getModule(Filters.byStrings('onAnimationEnd'), { searchExports: true })",
	"openModal": "getModule(Filters.byStrings('onCloseCallback', 'Layer'), { searchExports: true })",
	"ModalCarousel": "getModule(m => m.prototype?.navigateTo && m.prototype?.preloadImage)",
	"UserBannerMask": "getModule((m) => m.Z && m.Z.toString().includes('overrideAvatarDecorationURL'))",
	"ProfileTypeEnum": "getModule(Filters.byProps('POPOUT','SETTINGS'), { searchExports: true})",
	"CurrentUserStore": "getModule(Filters.byProps('getCurrentUser', 'getUsers'))",
	"DefaultEmojisManager": "getModule(m => m.getByName && m.EMOJI_NAME_RE)",
	"SelectedGuildStore": "getModule(Filters.byProps('getLastSelectedGuildId'))",
	"ComponentDispatch": "getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners('INSERT_TEXT').length, { searchExports: true })",
	"renderLinkComponent": "getModule(m => m.type?.toString().includes('MASKED_LINK'))"
}