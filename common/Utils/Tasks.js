

export const queue = (fn, concurrent) => {
	const queue = [];
	let runningCount = 0;
	
	const next = async() => {
		if (runningCount >= concurrent || queue.length === 0)
			return;
		const { resolve, reject, args } = queue.shift();
		try {
			runningCount++;
			resolve(await fn(...args));
		} catch (error) {
			reject(error);
		}finally{
			runningCount--;
			next()
		}
	};

	return (...args) => {
		const {promise,resolve,reject} = Promise.withResolvers();
		queue.push({ resolve, reject, args});
		next();
		return promise;
	};
};
