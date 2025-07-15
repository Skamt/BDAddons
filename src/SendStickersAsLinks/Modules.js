import {  getMangled, Filters } from "@Webpack";

export const StickerSendability = getMangled(
	a => typeof a === "object" && "SENDABLE" in a,
	{
		StickersSendabilityEnum: Filters.byKeys("SENDABLE_WITH_PREMIUM"),
		getStickerSendability: Filters.byStrings("canUseCustomStickersEverywhere"),
		isSendableSticker: Filters.byStrings("0===")
	},
	{ searchExports: true, raw:true }
);
