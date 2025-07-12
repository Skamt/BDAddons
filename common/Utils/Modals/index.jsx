import "./styles";
import config from "@Config";
import { React } from "@Api";
import { concateClassNames } from "@Utils";
import { getModule, getMangled, Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";

import ModalRoot from "@Modules/ModalRoot";
import ModalSize from "@Modules/ModalSize";

export const ModalActions = /*@__PURE__*/ getMangled("onCloseRequest:null!=", {
	openModal: /*@__PURE__*/ Filters.byStrings("onCloseRequest:null!="),
	closeModal: /*@__PURE__*/ Filters.byStrings(".setState", ".getState()[")
});

export const Modals = /*@__PURE__*/ getMangled(/*@__PURE__*/ Filters.bySource("root", "headerIdIsManaged"), {
	ModalRoot: /*@__PURE__*/ Filters.byStrings("rootWithShadow"),
	ModalFooter: /*@__PURE__*/ Filters.byStrings(".footer"),
	ModalContent: /*@__PURE__*/ Filters.byStrings(".content"),
	ModalHeader: /*@__PURE__*/ Filters.byStrings(".header", "separator"),
	Animations: /*@__PURE__*/ a => a.SUBTLE,
	Sizes: /*@__PURE__*/ a => a.DYNAMIC
});

// const _openModal = /*@__PURE__*/ getModule(/*@__PURE__*/Filters.byStrings("onCloseCallback", "onCloseRequest", "modalKey", "backdropStyle"), { searchExports: true });

export const openModal = (children, tag, { className, ...modalRootProps }={}) => {
	const id = `${tag ? `${tag}-` : ""}modal`;

	return ModalActions.openModal(props => {
		return (
			<ErrorBoundary
				id={id}
				plugin={config.info.name}>
				<ModalRoot
					onClick={props.onClose}
					transitionState={props.transitionState}
					className={concateClassNames("transparent-background", className)}
					size={ModalSize.DYNAMIC}
					{...modalRootProps}>
					{React.cloneElement(children, { ...props })}
				</ModalRoot>
			</ErrorBoundary>
		);
	});
};

export function closeModal(id) {
	ModalActions.closeModal(id);
}

export const openImageModal = /*@__PURE__*/ getMangled("Media Viewer Modal", { openImageModal: a => typeof a !== "string" });
