import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import Button from "@Components/Button";
// import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

export default class Spotify extends Disposable {
	Init() {
		const EmbedComponent = getModule(a => a.prototype.getSpoilerStyles);
		if (EmbedComponent)
			this.patches = [
				Patcher.after(EmbedComponent.prototype, "render", (_, args, ret) => {
					const { props } = _;
					console.log(_);
					if (props.embed?.provider?.name !== "Spotify") return;
					return [ret, <SpotifyControls embed={props.embed} />];
				})
			];
		else Logger.patch("Spotify");
	}
}

function SpotifyControls({ embed }) {
	const { thumbnail, rawTitle, rawDescription } = embed;
	return (
		<div class="spotifyEmbed-Container">
			<div
				className="spotifyEmbed-thumbnail"
				style={{ "--thumbnail": `url(${thumbnail.url})` }}></div>
			<div className="spotifyEmbed-details">
				<div className="spotifyEmbed-info">
					<h2 className="spotifyEmbed-title">{rawTitle}</h2>
					<p className="spotifyEmbed-description">{rawDescription}</p>
				</div>
				<div className="spotifyEmbed-controls">
					<AddToQueue />
					<AddToQueue />
					<Play />
					<AddToQueue />
				</div>
			</div>
		</div>
	);
}

function AddToQueue() {
	return (
		<div className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 -960 960 960">
				<path
					className="solid"
					d="M450-360h60v-130h130v-60H510v-130h-60v130H320v60h130v130ZM330-120v-80H140q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H630v80H330Z"
				/>
				<path
					className="outlined"
					d="M450-360h60v-130h130v-60H510v-130h-60v130H320v60h130v130ZM330-120v-80H140q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H630v80H330ZM140-260h680v-520H140v520Zm0 0v-520 520Z"
				/>
			</svg>
		</div>
	);
}

function Play() {
	return (
		<div className="spotifyEmbed-btn spotifyEmbed-btn-play">
			<svg
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg">
				<path
					d="M16.6582 9.28638C18.098 10.1862 18.8178 10.6361 19.0647 11.2122C19.2803 11.7152 19.2803 12.2847 19.0647 12.7878C18.8178 13.3638 18.098 13.8137 16.6582 14.7136L9.896 18.94C8.29805 19.9387 7.49907 20.4381 6.83973 20.385C6.26501 20.3388 5.73818 20.0469 5.3944 19.584C5 19.053 5 18.1108 5 16.2264V7.77357C5 5.88919 5 4.94701 5.3944 4.41598C5.73818 3.9531 6.26501 3.66111 6.83973 3.6149C7.49907 3.5619 8.29805 4.06126 9.896 5.05998L16.6582 9.28638Z"
					stroke="currentColor"
					fill="currentColor"
					stroke-width="2"
					stroke-linejoin="round"></path>
			</svg>
		</div>
	);
}
