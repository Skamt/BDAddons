import fs from "fs";

export function saveFile(path, content) {
	fs.writeFileSync(path, content, "utf8");
}

export function mkdir(path){
	if (!fs.existsSync(path)) fs.mkdirSync(path);
}