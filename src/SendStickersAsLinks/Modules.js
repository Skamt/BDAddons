import {  getMangled, Filters } from "@Webpack";

export const StickerSendability = getMangled(
	/SENDABLE_WITH_BOOSTED_GUILD.{1,3}/,
	{
		StickersSendabilityEnum: Filters.byKeys("SENDABLE_WITH_PREMIUM"),
		getStickerSendability: Filters.byStrings("canUseCustomStickersEverywhere"),
		isSendableSticker: Filters.byStrings("0===")
	},
	// { searchExports: true, raw:true }
);

console.log(StickerSendability)