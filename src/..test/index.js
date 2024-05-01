import { DOM, Patcher, React, showConfirmationModal } from "@Api";
// import Tooltip from "@Components/Tooltip";
import Button from "@Components/Button";
import ErrorBoundary from "@Components/ErrorBoundary";
import Flex from "@Components/Flex";
import Arrow from "@Components/Icons/Arrow";
import Tooltip from "@Components/Tooltip";
// import ShareIcon from "@Components/icons/ShareIcon";
// import { getInternalInstance } from "@Api";
import ModalRoot from "@Modules/ModalRoot";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import { getImageModalComponent, openModal } from "@Utils";
import { shallow } from "@Utils";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import css from "./styles";
import dummyMedia from "./test";

const { closeModal, Popout, MenuItem, Menu, MenuGroup } = TheBigBoyBundle;

const { FormTitle, Anchor } = TheBigBoyBundle;

const album = {
	...dummyMedia.album,
	url:dummyMedia.album.external_urls.spotify
};


const banner = dummyMedia?.album?.images[1];

function MoreInfo() {
	// const { bannerMd: banner } = Store.state.getSongBanners();
	

	return (
		<Flex style={{ padding: 10 }}>
			<FormTitle tag="h4">Album: {album.id}</FormTitle>
			<Flex
				direction={Flex.Direction.HORIZONTAL}
				style={{ gap: 10 }}>
				<Flex grow={0}>
					<Anchor href={album.url}>
						<div
							style={{
								background: `url("${banner.url}") center/cover no-repeat`,
								width: 150,
								height: 150
							}}></div>
					</Anchor>
				</Flex>
				<Flex grow={1}>
					<Flex direction={Flex.Direction.VERTICAL}>
						<Anchor href={album.url}>{album.name}</Anchor>
						<FormTitle tag="h5">Release date: {album.release_date}</FormTitle>
						<FormTitle tag="h5">Total tracks: {album.total_tracks}</FormTitle>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	);
}


// window._sdwed && closeModal(window._sdwed);
// window._sdwed = showConfirmationModal(dummyMedia?.name, <MoreInfo />)

export default () => {
	return {
		start() {
			DOM.addStyle(css);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
