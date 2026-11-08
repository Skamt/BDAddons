/* eslint-disable @eslint-react/no-clone-element */
import "./styles";
import config from "@Config";
import React from "@React";
import { joinClassNames } from "@Utils";
import { getBySource, getModule, getMangled, Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";

export const ModalActions = /*@__PURE__*/ (() =>
	getBySource("?.stackNextByDefault", {
		map: {
			openModal: Filters.byStrings("?.stackNextByDefault"),
			closeModal: Filters.byStrings(".setState", ".getState()["),
			closeAllModals: Filters.byStrings(".getState();for"),
			useModalsStore: a => a.getState
		}
	}))();

export const Modals = /*@__PURE__*/ (() =>
	getBySource("MODAL_ROOT", "transitionState", {
		map: {
			ModalRoot: Filters.byStrings("transitionState"),
			ModalFooter: Filters.byStrings(".HORIZONTAL_REVERSE"),
			ModalContent: Filters.byStrings("scrollbarType", "scrollerRef"),
			ModalHeader: Filters.byStrings("headerIdIsManaged", "headerId", ".HORIZONTAL"),
			Animations: a => a.SUBTLE,
			Sizes: a => a.DYNAMIC,
			ModalCloseButton: Filters.byStrings("withCircleBackground")
		}
	}))();

export const openModal = (children, tag, { className, ...modalRootProps } = {}) => {
	const id = `${tag ? `${tag}-` : ""}modal`;

	return ModalActions.openModal(props => {
		return (
			<ErrorBoundary
				id={id}
				plugin={config.info.name}>
				<Modals.ModalRoot
					onClick={props.onClose}
					transitionState={props.transitionState}
					className={joinClassNames("transparent-background", className)}
					size={Modals.Sizes.DYNAMIC}
					{...modalRootProps}>
					{React.cloneElement(children, { ...props })}
				</Modals.ModalRoot>
			</ErrorBoundary>
		);
	});
};

export const closeModal = id => ModalActions.closeModal(id);

export const openImageModal = /*@__PURE__*/ getMangled("Media Viewer Modal", { openImageModal: a => typeof a !== "string" });
