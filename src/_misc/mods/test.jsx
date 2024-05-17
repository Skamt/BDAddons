import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import Button from "@Components/Button";
// import TheBigBoyBundle from "@Modules/TheBigBoyBundle";


const EmbedComponent = getModule(a => a.prototype.getSpoilerStyles);

export default class Spotify extends Disposable {
	Init() {
		if(EmbedComponent)
			this.patches = [
				Patcher.after(EmbedComponent.prototype, "render", ({ props }) =>{
					// console.log(embed);
					if(props.embed?.provider?.name !== "Spotify") return;
					return <SpotifyControls />
				})
			];
		else
			Logger.patch("Spotify");
	}
}



function SpotifyControls(props){
	const {url} = props;
	return <div className="spotifyEmbedControls">
		<Button color={Button.Colors?.GREEN} size={Button.Sizes?.TINY}>Copy Link</Button>
		<Button color={Button.Colors?.GREEN} size={Button.Sizes?.TINY}>Added to queue</Button>
		<Button color={Button.Colors?.GREEN} size={Button.Sizes?.TINY}>Play now</Button>
		<Button color={Button.Colors?.GREEN} size={Button.Sizes?.TINY}>Add to favorite</Button>
	</div>;
}
