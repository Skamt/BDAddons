import "./styles";
import React from "@React";
import { classNameFactory } from "@Utils/css";

const c = classNameFactory("divider");

export default function Divider({ gap = 15, gutter=0, direction = Divider.direction.HORIZONTAL }) {
	return (
		<div
			style={{ "--divider-gap": `${gap}px`, "--divider-gutter":`${gutter}%` }}
			className={c("base", direction)}
		/>
	);
}

Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};
