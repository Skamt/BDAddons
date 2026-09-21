import "./styles";
import React from "@React";
import { classNameFactory } from "@Utils/css";

const c = classNameFactory("gap");

export default function Gap({ direction = Gap.direction.HORIZONTAL, gap=8 }) {
	return (
		<div
			style={{ marginTop: gap }}
			className={c("base",  direction )}
		/>
	);
}

Gap.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};
