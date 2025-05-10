import React from "@React";
import { getImageComponent } from "@Utils/ImageModal";
import { openModal } from "@Utils/Modals";
import Toast from "@Utils/Toast";
import Tooltip from "@Components/Tooltip";
import { Store } from "../../Store";

function fit(width, height) {
	const ratio = Math.min(innerWidth / width, innerHeight / height);
	width = Math.round(width * ratio);
	height = Math.round(height * ratio);
	return {
		width,
		height,
		maxHeight: height * 0.8,
		maxWidth: width * 0.8
	};
}

export default function TrackBanner() {
	const { bannerLg: bannerObj } = Store.state.getSongBanners();

	const thumbnailClickHandler = () => {
		if (!bannerObj.url) return Toast.error("Could not open banner");
		const { url, ...rest } = bannerObj;

		openModal(<div className="spotify-banner-modal">{getImageComponent(url, { ...rest, ...fit(rest.width, rest.height) })}</div>);
	};

	return (
		<Tooltip note="View">
			<div
				onClick={thumbnailClickHandler}
				className="spotify-player-banner"
			/>
		</Tooltip>
	);
}
