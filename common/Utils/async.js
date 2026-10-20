export const promiseHandler = promise => promise.then(data => [undefined, data]).catch(err => [err]);

export function sleep(delay) {
	return new Promise(done => setTimeout(() => done(), delay * 1000));
}

export class Defer {
	dispose() {
		this.caller = null;
	}
	then(fn = nop) {
		this.caller = fn;
	}
	success(payload) {
		this.caller(payload);
	}
}

export const queue = (fn, concurrent=1) => {
	const queue = [];
	let runningCount = 0;

	const next = async () => {
		if (runningCount >= concurrent || queue.length === 0) return;
		const { resolve, reject, args } = queue.shift();
		try {
			runningCount++;
			resolve(await fn(...args));
		} catch (error) {
			reject(error);
		} finally {
			runningCount--;
			next();
		}
	};

	return (...args) => {
		const { promise, resolve, reject } = Promise.withResolvers();
		queue.push({ resolve, reject, args });
		next();
		return promise;
	};
};

