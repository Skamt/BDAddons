import React from "@React";
import { ImageComponent } from "@Utils/ImageModal";
import { openModal } from "@Utils/Modals";
import Toast from "@Utils/Toast";
import Tooltip from "@Components/Tooltip";
import { Store } from "@/Store";
import { fit } from "@Utils";

export default function TrackBanner() {
	const { bannerLg: bannerObj } = Store.state.getSongBanners();

	const thumbnailClickHandler = () => {
		if (!bannerObj.url) return Toast.error("Could not open banner");
		const { url, ...rest } = bannerObj;

		openModal(
			<div className="spotify-banner-modal">
				<ImageComponent
					url={url}
					{...fit(rest)}
				/>
			</div>
		);
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
