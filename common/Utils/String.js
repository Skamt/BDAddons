export function isValidString(string) {
	return string && string.length > 0;
}

export function getAcronym(string) {
	if (!isValidString(string)) return "";

	return string
		.replace(/'s /g, " ")
		.replace(/\w+/g, e => e[0])
		.replace(/\s/g, "");
}

export function join(char = "", ...strs) {
	return strs.filter(Boolean).join(char);
}
