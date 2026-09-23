function transform(...args) {
	const classNames = new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach(name => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return classNames;
}

export const join = (...args) => Array.from(transform(...args)).join(" ");

export const classNameFactory =
	(prefix = "", connector = "-") =>
	(...args) =>
		Array.from(transform(...args), name => `${prefix}${connector}${name}`).join(" ");
