import React from "@React";
import config from "@Config";
import { classNameFactory } from "@Utils/css";
const c = classNameFactory(`${config.info.name}-menuitem`);

export function wrapMenuItem(item){
	if(!item?.label) return item;
	const tag = item.label.toLowerCase().replace(/^[^a-z]+|[^\w-]+/gi, "-");
	return {
		id:c(tag),
		className:c(tag),
		...item,
	}
}