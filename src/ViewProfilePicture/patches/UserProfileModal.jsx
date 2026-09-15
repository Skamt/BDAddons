import React, { useMemo, insertChild } from "@React";
import ErrorBoundary from "@Components/ErrorBoundary";
import ErrorIcon from "@Components/icons/ErrorIcon";
import Plugin from "@common/Plugin";
import { Filters, getModule } from "@Webpack";
import VPPButton from "../components/VPPButton";
import { before } from "@common/Patcher";

const UserProfileModal = getModule(Filters.byKeys("Overlay", "render"));

Plugin.onStart(() => {
	before(UserProfileModal, "render", ({ args: [props] }) => {
		const target = useMemo(() => props?.children.find(a => a?.props?.children && !a?.props?.className), [props.children]);
		if (!target) return;

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
