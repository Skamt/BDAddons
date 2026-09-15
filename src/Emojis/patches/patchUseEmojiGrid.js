// import { Patcher } from "@Api";
// import Logger from "@Utils/Logger";
// import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";
// import { getModuleAndKey, Filters } from "@Webpack";

// import Plugin from "@common/Plugin";

// const emojiHooks = getModuleAndKey(Filters.byStrings("gridWidth", "getDisambiguatedEmojiContext", "getFlattenedGuildIds"), { searchExports: true });

// Plugin.onStart(() => {
// 	const { module, key } = emojiHooks;

// 	if (!module || !key) return Logger.patchError("patchUseEmojiGrid");

// 	Patcher.after(module, key, (_, [{ pickerIntention }], ret) => {
// 		// console.log(ret);
// 		// return ret;
// 		if (pickerIntention !== EmojiIntentionEnum.CHAT) return ret;
// 		for (const a of ret.sectionDescriptors) {
// 			a.isNitroLocked = false;
// 		}
// 	});
// });
