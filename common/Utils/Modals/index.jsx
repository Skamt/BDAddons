import "./styles";
import { React } from "@Api";
import { getModule, Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";

import ModalRoot from "@Modules/ModalRoot";
import ModalSize from "@Modules/ModalSize";

const _openModal = getModule(Filters.byStrings("onCloseCallback", "onCloseRequest", "modalKey", "backdropStyle"), { searchExports: true });

export const openModal = (children, tag, modalClassName = "") => {
	const id = `${tag ? `${tag}-` : ""}modal`;

	_openModal(props => {
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

export function closeModal() {}
