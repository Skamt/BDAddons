// import "./styles";
import React from "@React";
import { clsx } from "@Utils";
import { join } from "@Utils/String";

const c = clsx("badge");

function m(e) {
	return e < 10 ? 13 : e < 100 ? 19 : 27;
}

function g(e) {
	return e < 1e3 ? "".concat(e) : "".concat(Math.min(Math.floor(e / 1e3), 9), "k+");
}

export default ({ count, type }) => {
	return (
		<div
			style={{ width: m(count) }}
			className={join(" ", c("pill", type), "fcc", "rounded-full")}>
			{g(count)}
		</div>
	);
};
