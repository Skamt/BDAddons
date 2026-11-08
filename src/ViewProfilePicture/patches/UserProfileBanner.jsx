import React from "@React";
import { joinClassNames } from "@Utils";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/icons/ErrorIcon";
import Plugin from "@common/Plugin";
import { isSelf } from "@Utils/discord/User";
import { Filters, getMangled } from "@Webpack";
import VPPButton from "../components/VPPButton";
import { after } from "@common/Patcher";

const UserProfileBanner = getMangled(Filters.bySource("themeType", "showGifTag", "canUsePremiumProfileCustomization"), {
	Banner: Filters.byStrings("canUsePremiumProfileCustomization")
});

Plugin.onStart(() => {
	after(UserProfileBanner, "Banner", ({ args: [props], ret }) => {
		if (props.themeType !== "MODAL_V2") return ret;
		const isMe = isSelf(props.user);
		return (
			<>
				{ret}
				<ErrorBoundary
					id="UserProfileBanner"
					fallback={<ErrorIcon className="VPP-Button" />}>
					<VPPButton
						className={joinClassNames("VPP-float", { isMe })}
						user={props.user}
						displayProfile={props.displayProfile}
					/>
				</ErrorBoundary>
			</>
		);
	});
});
