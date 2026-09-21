import "./styles";
import React from "@React";
import Heading from "@Modules/Heading";
import { classNameFactory } from "@Utils/css";

const c = classNameFactory("fieldset");

export default function FieldSet({ label, description, children, gap = 15, direction = FieldSet.direction.VERTICAL}) {
	return (
		<fieldset className={c("container")}>
			{label && (
				<Heading
					className={c("label")}
					tag="legend"
					variant="text-lg/medium">
					{label}
				</Heading>
			)}
			{description && (
				<Heading
					className={c("description")}
					variant="text-sm/normal"
					color="text-secondary">
					{description}
				</Heading>
			)}
			<div
				className={c("content", direction )}
				style={{ gap }}>
				{children}
			</div>
		</fieldset>
	);
}

FieldSet.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};