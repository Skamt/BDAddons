import { CopyIcon, ShareIcon, ImageIcon, ListenIcon, AddToQueueIcon } from "@Components/Icon";
import Store from "@/Store";
import { spotifyCopy, copySpotifyUrl, spotifyShare } from "@/utils";

export const copyMenu = (songUrl, bannerUrl) => {
	return {
		className: "spotify-menuitem",
		id: "copy",
		label: "copy",
		type: "submenu",
		leadingAccessory: { type: "icon", icon: CopyIcon },
		items: [
			{
				className: "spotify-menuitem",
				id: "copy-song-link",
				action: () => copySpotifyUrl(songUrl),
				leadingAccessory: { type: "icon", icon: ListenIcon },
				label: "Copy song url",
			},
			{
				className: "spotify-menuitem",
				id: "copy-poster-link",
				action: () => spotifyCopy(bannerUrl),
				leadingAccessory: { type: "icon", icon: ImageIcon },
				label: "Copy poster url",
			},
		],
	};
};

export const shareMenu = (songUrl, bannerUrl) => {
	return {
		className: "spotify-menuitem",
		id: "share",
		label: "share",
		leadingAccessory: { type: "icon", icon: ShareIcon },
		type: "submenu",
		items: [
			{
				className: "spotify-menuitem",
				id: "share-song-link",
				action: () => spotifyShare(songUrl),
				leadingAccessory: { type: "icon", icon: ListenIcon },
				label: "Share song in current channel",
			},
			{
				className: "spotify-menuitem",
				id: "share-poster-link",
				action: () => spotifyShare(bannerUrl),
				leadingAccessory: { type: "icon", icon: ImageIcon },
				label: "Share poster in current channel",
			},
		],
	};
};

export const storeContextMenu = (...args) => {
	const copyContextMenu = copyMenu(...args);
	const shareContextMenu = shareMenu(...args);

	copyContextMenu.items.push({
		className: "spotify-menuitem",
		id: "copy-song-name",
		action: () => spotifyCopy(Store.getFullSongName()),
		leadingAccessory: { type: "icon", icon: CopyIcon },
		label: "Copy name",
	});

	if (Store.state.context?.type === "playlist")
		shareContextMenu.items.push({
			className: "spotify-menuitem",
			id: "share-playlist-link",
			action: () => spotifyShare(Store.getPlaylistUrl()),
			leadingAccessory: { type: "icon", icon: AddToQueueIcon },
			label: "Share playlist in current channel",
		});

	return [copyContextMenu, shareContextMenu];
};
