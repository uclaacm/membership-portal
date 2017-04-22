let applyDelta = (delta, target) => {
	for (let key in delta) {
		if (delta[key].constructor === Object)
			applyDelta(delta[key], target[key])
		else {
			if (delta[key].constructor === String && delta[key].trim() === "-" ||
				delta[key].constructor === Array && delta[key].length === 1 && delta[key][0].trim() === '-') {
				target[key] = undefined;
			} else
				target[key] = delta[key]
		}
	}
};

let update = function(from, to) {
	if (!from)
		return;
	applyDelta(from, to);
};

module.exports = { update };
