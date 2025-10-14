import React from "@React";
import { join } from "@Utils/css";
// import Fallback from "./Fallback";
import { DiscordIcon } from "@Components/Icon";

function IconWrapper({ children, className }) {
	return <div className={join("card-icon", className)}>{children}</div>;
}

export default function Icon({ size, src, alt, icon, className }) {
	if (src)
		return (
			<IconWrapper className={join("icon-wrapper", className)}>
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
		<IconWrapper className={join("icon-wrapper", "discord-icon", className)}>
			<DiscordIcon />
		</IconWrapper>
	);
}
