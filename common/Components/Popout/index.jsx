import config from "@Config";
import { DiscordPopout } from "@Discord/Modules";
import React, { useRef, useCallback } from "@React";
import { concateClassNames } from "@Utils";

export default ({ children, targetElementRef, ...props }) => {
	const ref = useRef();
	const helperRef = useCallback((e) => {
		if (!e) return;
		ref.current = e.nextSibling;
	}, []);

	return (
		<DiscordPopout
			position={"top"}
			align={"center"}
			nudgeAlignIntoViewport={true}
			animation={DiscordPopout.Animation.FADE}
			spacing={4}
			{...props}
			targetElementRef={targetElementRef || ref}
		>
			{(p) => {
				return targetElementRef ? (
					children(p)
				) : (
					<>
						<span ref={helperRef} />
						{children(p)}
					</>
				);
			}}
		</DiscordPopout>
	);
};
