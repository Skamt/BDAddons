import React, { useState, useEffect } from "@React";
import {  waitForComponent, reactRefMemoFilter } from "@Webpack";
import { getUserName } from "@Utils/User";

import { join } from "@Utils/String";
import Tooltip from "@Components/Tooltip";
const TypingDots = waitForComponent(reactRefMemoFilter("type", "dotRadius", "className"), { searchExports: true });

export default function ({ users }) {
	const typingUsersNames = users?.map(getUserName).join(", ");

	return (
		<Tooltip note={typingUsersNames}>
			<div className={join(" ", "typing-dots", "fcc")}>
				<TypingDots dotRadius={2.5} />
			</div>
		</Tooltip>
	);
}
