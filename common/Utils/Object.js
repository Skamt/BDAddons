export const map = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn({value, key})]));
export const mapDeep = (obj, fn) => Object.entries(obj).reduce((a, [key, value]) => ((a[key] = typeof value === "object" && !Array.isArray(value) ? mapDeep(value, ({ path, ...rest }) => fn({ ...rest, path: `${key}.${path}` })) : fn({ value, path: key, key })), a), {});

export function getObjectKey(object = {}, filter) {
	for (const key in object) if (filter(object[key])) return key;
}

export function getInObject(object = {}, filter) {
	for (const key in object) if (filter(object[key])) return object[key];
}

export function hasOwn(object, key) {
	return object && key && key in object;
}

export function getNestedProp(obj, path) {
	return path.split(".").reduce((ob, prop) => ob?.[prop], obj);
}

export function setProp(obj, path, value) {
	obj = { ...obj };
	path = path.split(".");
	const last = path.pop();
	path.reduce((ob, prop) => ob?.[prop], obj)[last] = value;
	return obj;
}
