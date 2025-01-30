import {  mapExports, Filters } from "@Webpack";

export const StickerSendability = mapExports(
	a => typeof a === "object" && "SENDABLE" in a,
	{
		StickerSendability: Filters.byProps("SENDABLE_WITH_PREMIUM"),
		getStickerSendability: Filters.byStrings("canUseCustomStickersEverywhere"),
		isSendableSticker: Filters.byStrings("0===")
	},
	{ searchExports: true }
);