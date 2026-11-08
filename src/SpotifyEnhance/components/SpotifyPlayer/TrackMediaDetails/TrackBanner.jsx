import React from "@React";
import { ImageComponent } from "@Components/ImageModal";
import { openModal } from "@Utils/Modals";
import Tooltip from "@Components/Tooltip";
import Store from "@/store";
import { showToast, fit } from "@Utils";

export default function TrackBanner() {
	const { bannerLg } = Store.getSongBanners();

	const thumbnailClickHandler = () => {
		if (!bannerLg.url) return showToast("error","Could not open banner");
		const { url, ...rest } = bannerLg;

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
