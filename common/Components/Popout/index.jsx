import { DiscordPopout } from "@Discord/Modules";
import React, { useRef, useCallback } from "@React";

export default Object.assign(({ children, targetElementRef, ...props }) => {
	const ref = useRef();
	const helperRef = useCallback((e) => {
		if (e) ref.current = e.nextElementSibling;
	}, []);

	return (
		<DiscordPopout
			position={"top"}
			align={"center"}
			nudgeAlignIntoViewport={true}
			animation={DiscordPopout.Animation.FADE}
			spacing={4}
			{...props}
			targetElementRef={targetElementRef || ref}>
			{(p) => {
				return targetElementRef ? (
					children(p)
				) : (
					<>
						<span ref={helperRef} style={{ display: "contents" }} />
						{children(p)}
					</>
				);
			}}
		</DiscordPopout>
	);
}, DiscordPopout);
