/* eslint-disable react/jsx-key */
import { React, Patcher } from "@Api";
// import Settings from "@Utils/Settings";
import { Store } from "../Store";
import SpotifyApi from "../SpotifyAPIWrapper";
import Logger from "@Utils/Logger";
import Button from "@Components/Button";
import { getModule, Filters } from "@Webpack";

const SpotifyInviteParty = getModule(Filters.byPrototypeKeys("isDeadInvite", "isPartyFull"));

export default () => {
	if (SpotifyInviteParty)
		Patcher.after(SpotifyInviteParty.prototype, "renderActionButton", ({props}, args, ret) => {
			console.log(props, ret);
			if (props.applicationId !== "spotify") return;
			if (props.isSender) return;
			if (!props.activity) return;

			return [
				<Button
					onClick={() => SpotifyApi.listen(props.activity.metadata.type, props.activity.sync_id)}
					color={Button.Colors.GREEN}
					size={Button.Sizes.SMALL}>
					Listen
				</Button>,
				ret
			];
		});
	else Logger.patch("patchSpotifyInviteParty");
};
