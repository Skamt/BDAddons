const avatarSizes = {
	32: "SIZE_24",
	30: "SIZE_20",
	28: "SIZE_20",
	26: "SIZE_16",
	24: "SIZE_16"
};

// const sizes = {
// 	32: 24,
// 	30: 20,
// 	28: 20,
// 	26: 16,
// 	24: 16
// };

export function getSize(e) {
	if (e >= 32) return { size: 24, avatarSize: "SIZE_24" };
	if (e >= 28 && e < 32) return { size: 20, avatarSize: "SIZE_20" };
	if (e >= 24 && e < 28) return { size: 16, avatarSize: "SIZE_16" };
	
	return { size: 20, avatarSize: "SIZE_20" };
}
