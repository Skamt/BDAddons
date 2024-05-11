import { React } from "@Api";
import { getImageModalComponent, openModal } from "@Utils";
import Toast from "@Utils/Toast";
import Tooltip from "@Components/Tooltip";
import { Store } from "../../Store";

export default function TrackBanner() {
	const { bannerLg: bannerObj } = Store.state.getSongBanners();

	const thumbnailClickHandler = () => {
		if (!bannerObj.url) return Toast.error("Could not open banner");
		const { url, ...rest } = bannerObj;
		openModal(<div className="spotify-banner-modal">{getImageModalComponent(url, rest)}</div>);
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
