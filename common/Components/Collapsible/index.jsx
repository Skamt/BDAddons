import "./styles";
import React from "@React";
import { classNameFactory } from "@Utils/css";
import Heading from "@Modules/Heading";
import {ArrowIcon}from "@Components/Icon";

const c = classNameFactory("collapsible");

export default function Collapsible({ title, children }) {
	const [open, setOpen] = React.useState(false);

	return (
		<div className={c("container", { open })}>
			<div
				className={c("header")}
				onClick={() => setOpen(!open)}>
				
				<Heading
					className={c("title")}
					tag="h5">
					{title}
				</Heading>
				<div className={c("icon")}>
					<ArrowIcon />
				</div>
			</div>
			<div className={c("body")}>{children}</div>
		</div>
	);
}

