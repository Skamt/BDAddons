import { ContextMenu as CM, React } from "@Api";
import Popout from "@Components/Popout";
import Flex from "@Components/Flex";

const { Item: MenuItem, Menu, Separator: MenuSeparator } = CM;


function parseMenuItems(items) {
	return items.map(({ type, children, ...rest }) => {
		if (type === "separator") return <MenuSeparator key={rest.id} />;
		if (children)
			children = Array.isArray(children) ? (
				parseMenuItems(children)
			) : (
				<MenuItem
					key={rest.id}
					{...rest}>
					{children}
				</MenuItem>
			);

		return (
			<MenuItem
				key={rest.id}
				{...rest}>
				{children}
			</MenuItem>
		);
	});
}

export default function ContextMenu({ children, menuItems, position = "top", align = "left", className, menuClassName }) {
	return (
		<Popout
			renderPopout={t => (
				<Menu
					className={menuClassName}
					onClose={t.closePopout}>
					{parseMenuItems(menuItems)}
				</Menu>
			)}
			align={align}
			position={position}
			animation="1"
			className={className}>
			{children}
		</Popout>
	);
}

export function MenuLabel({ label, icon }) {
	return (
		<Flex
			className={`${config.info.name}-menu-label-icon`}
			direction={Flex.Direction.HORIZONTAL}
			align={Flex.Align.CENTER}
			style={{ gap: 8 }}>
			{icon}
			<div>{label}</div>
		</Flex>
	);
}
