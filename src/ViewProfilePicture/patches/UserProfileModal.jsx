import React, { useMemo, insertChild } from "@React";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/icons/ErrorIcon";
import Plugin from "@common/Plugin";
import Logger from "@Utils/Logger";
import { getNestedProp } from "@Utils/Object";
import { Filters, lazy } from "@Webpack";
import VPPButton from "../components/VPPButton";
import { before } from "@common/Patcher";

const paths = {
	SIDEBAR: "2.props.children.0",
	POPOUT: "2"
};

Plugin.onStart(() => {
	lazy(Filters.bySource("has-animated-banner","profileThemeClassName"), { decFilter: Filters.byStrings("secondaryColor") }).then(UserProfileModal => {
		before(...UserProfileModal, ({ args: [props] }) => {
			const target = useMemo(() => getNestedProp(props.children, paths[props.themeType] || ""), [props]);
			if (!target) return Logger.warn("Unsupported themeType", props.themeType);

			props.className = `${props.className} VPP-container`;

			insertChild(
				target,
				<ErrorBoundary
					id="UserProfileModal"
					fallback={<ErrorIcon className="VPP-Button" />}>
					<VPPButton
						user={props.user}
						displayProfile={props.displayProfile}
					/>
				</ErrorBoundary>,
				0
			);
		});
	});
});
