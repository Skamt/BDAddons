import React, { useState } from "@React";
import Button from "@Components/Button";
import Settings from "@Utils/Settings";
import Tooltip from "@Components/Tooltip";
import { ImageIcon } from "@Components/icon";
import { join } from "@Utils/css";
import { promiseHandler, fit, getImageDimensions } from "@Utils";
import { colorToImg } from "@Utils/Color";
import { Filters, getModule } from "@Webpack";
import { Spinner, MediaViewerModal } from "@Discord/Modules";

async function getFittedDims(url) {
	const [err, dims] = await promiseHandler(getImageDimensions(url));
	return err ? {} : fit(dims);
}

const palletHook = getModule(Filters.byStrings("toHexString", "toHsl", "palette"), { searchExports: true }) || {};

export default ({ className, user, displayProfile }) => {
	const [fetching, setFetching] = useState(false);
	const showOnHover = Settings(Settings.selectors.showOnHover);
	const colorFromPfp = palletHook(user.getAvatarURL(displayProfile?.guildId, 80))[0];

	const handler = async () => {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({ canAnimate: true, size: 4096 });
		const color = displayProfile.accentColor ?? (displayProfile.primaryColor || colorFromPfp);

		const items = [
			{
				url: avatarURL,
				...fit({ width: 4096, height: 4096 })
			}
		];

		if (bannerURL) {
			setFetching(true);
			items.push(
				bannerURL && {
					url: bannerURL,
					...(await getFittedDims(displayProfile.getBannerURL({ canAnimate: true, size: 20 })))
				}
			);
			setFetching(false);
		}

		if (!bannerURL || Settings.state.bannerColor) items.push(colorToImg(color));

		MediaViewerModal({ items: items.map(a => ({ type: "IMAGE", ...a })) });
	};

	return (
		<Tooltip note="View profile picture">
			<div
				onClick={fetching ? null : handler}
				className={join("VPP-Button", className, showOnHover && "VPP-hover")}>
				{fetching ? <Spinner type={Spinner.Type.SPINNING_CIRCLE_SIMPLE} /> : <ImageIcon />}
			</div>
		</Tooltip>
	);
};
