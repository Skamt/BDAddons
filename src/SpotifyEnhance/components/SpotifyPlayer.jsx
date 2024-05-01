import { showConfirmationModal, React } from "@Api";
import SpotifyPlayerControls from "./SpotifyPlayerControls";
import TrackMediaDetails from "./TrackMediaDetails";
import TrackTimeLine from "./TrackTimeLine";
import Arrow from "@Components/Icons/Arrow";
import { Store } from "../Store";
import Settings from "@Utils/Settings";
import { shallow } from "@Utils";
import Tooltip from "@Components/Tooltip";
import Button from "@Components/Button";
import Flex from "@Components/Flex";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

export default React.memo(function SpotifyPlayer() {
	const [player, playerCompactMode, playerBannerBackground] = Settings(_ => [_.player, _.playerCompactMode, _.playerBannerBackground], shallow);
	const [isActive, media, mediaType] = Store(_ => [_.isActive, _.media, _.mediaType], shallow);

	if (!player || !isActive || !mediaType) return;

	const { bannerMd, bannerSm, bannerLg } = Store.state.getSongBanners();

	let className = "spotify-player-container";
	if (playerCompactMode) className += " compact";
	if (playerBannerBackground) className += " bannerBackground";

	return (
		<div
			style={{
				"--banner-sm": `url(${bannerSm?.url})`,
				"--banner-md": `url(${bannerMd?.url})`,
				"--banner-lg": `url(${bannerLg?.url})`
			}}
			className={className}>
			<TrackMediaDetails
				mediaType={mediaType}
				name={media?.name}
				artists={media?.artists}
			/>

			{mediaType === "track" && <TrackTimeLine />}
			<SpotifyPlayerControls />
			<Tooltip note="More info">
				<Button
					onClick={() => showConfirmationModal(media?.name, <MoreInfo />)}
					size={Button.Sizes.NONE}
					look={Button.Looks.BLANK}
					innerClassName="flexCenterCenter"
					className="spotify-player-more-info">
					<Arrow />
				</Button>
			</Tooltip>
		</div>
	);
});

const { FormTitle, Anchor } = TheBigBoyBundle;

function MoreInfo() {
	const { bannerMd: banner } = Store.state.getSongBanners();
	const album = Store.state.getAlbum();

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
