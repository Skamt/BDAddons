import React from "@React";
import { joinClassNames } from "@Utils/css";
import { DiscordIcon } from "@Components/Icon";

function IconWrapper({ children, className }) {
	return <div className={joinClassNames("card-icon", className)}>{children}</div>;
}

export default function Icon({ size, src, alt, icon, className }) {
	if (src)
		return (
			<IconWrapper className={joinClassNames("icon-wrapper", className)}>
				<img
					width={size}
					height={size}
					src={src}
					alt={alt}
				/>
			</IconWrapper>
		);

	if (icon) return <IconWrapper className={className}>{icon}</IconWrapper>;

	return (
		<IconWrapper className={joinClassNames("icon-wrapper", "discord-icon", className)}>
			<DiscordIcon />
		</IconWrapper>
	);
}
