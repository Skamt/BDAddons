import "./styles";
import { React } from "@Api";
import { getModule, getMangled, Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";

import ModalRoot from "@Modules/ModalRoot";
import ModalSize from "@Modules/ModalSize";

const ModalActions = BdApi.Webpack.getMangled("onCloseRequest:null!=", {
	openModal: Filters.byStrings("onCloseRequest:null!="),
	closeModal: Filters.byStrings(".setState", ".getState()[")
});

// const _openModal = getModule(Filters.byStrings("onCloseCallback", "onCloseRequest", "modalKey", "backdropStyle"), { searchExports: true });

export const openModal = (children, tag, modalClassName = "") => {
	const id = `${tag ? `${tag}-` : ""}modal`;

	ModalActions.openModal(props => {
		return (
			<ErrorBoundary
				id={id}
				plugin={config.info.name}>
				<ModalRoot
					{...props}
					className={`${modalClassName} transparent-background`}
					onClick={props.onClose}
					size={ModalSize.DYNAMIC}>
					{children}
				</ModalRoot>
			</ErrorBoundary>
		);
	});
};

export function closeModal(id) {
	ModalActions.closeModal(id);
}

export const openImageModal = getMangled("Media Viewer Modal", { openImageModal: a => typeof a !== "string" });
