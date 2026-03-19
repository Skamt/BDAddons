import React from "@React";
import Settings from "@Utils/Settings";
import Tooltip from "@Components/Tooltip";
import ImageIcon from "@Components/icons/ImageIcon";
import { join } from "@Utils/css";
import { promiseHandler, fit, getImageDimensions } from "@Utils";
import { Filters, getModule } from "@Webpack";
import { MediaViewerModal } from "@Discord/Modules";
import Color from "@Modules/Color";

function getColorImg(color) {
	const canvas = document.createElement("canvas");
	const width = window.innerWidth * 0.7;
	const height = window.innerHeight * 0.5;
	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = Color(color || "#555").hex();
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	return {
		url: canvas.toDataURL(),
		...fit({ width, height })
	};
}

async function getFittedDims(url) {
	const [err, dims] = await promiseHandler(getImageDimensions(url));
	return err ? {} : fit(dims);
}

const palletHook = getModule(Filters.byStrings("toHexString", "toHsl", "palette"), { searchExports: true }) || {};

export default ({ className, user, displayProfile }) => {
	const showOnHover = Settings(Settings.selectors.showOnHover);
	const colorFromPfp = palletHook(user.getAvatarURL(displayProfile?.guildId, 80))[0];

	const handler = async () => {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({ canAnimate: true, size: 4096 });
		const color = displayProfile.accentColor || displayProfile.primaryColor || colorFromPfp;

		const items = [
			{
				url: avatarURL,
				...fit({ width: 4096, height: 4096 })
			},
			bannerURL && {
				url: bannerURL,
				...await getFittedDims(displayProfile.getBannerURL({ canAnimate: true, size: 20 }))
			},
			(!bannerURL || Settings.getState().bannerColor) && getColorImg(color)
		]
			.filter(Boolean)
			.map(a => ({ "type": "IMAGE", ...a }));

		MediaViewerModal({ items });
	};

	return (
		<Tooltip note="View profile picture">
			<div
				onClick={handler}
				className={join(className, showOnHover && "VPP-hover")}>
				<ImageIcon />
			</div>
		</Tooltip>
	);
};
