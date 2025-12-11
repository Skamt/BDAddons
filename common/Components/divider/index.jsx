import "./styles";
import React from "@React";
import { classNameFactory } from "@Utils/css";

const c = classNameFactory("divider");

export default function Divider({ direction = Divider.HORIZONTAL, gap }) {
	return (
		<div
			style={{
				marginTop: gap,
				marginBottom: gap
			}}
			className={c("base", { direction })}
		/>
	);
}

Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};
