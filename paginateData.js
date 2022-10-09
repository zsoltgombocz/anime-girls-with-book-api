const paginateData = (data, page, IMAGE_PER_PAGE) => {
	let returnObject = {
		total: data.length,
		total_page: null,
		current_page: null,
		from: null,
		to: null,
		data: data,
	};
	if (page && parseInt(page) >= 1) {
		const max_page = Math.ceil(data.length / IMAGE_PER_PAGE);
		page = parseInt(page);
		if (page > max_page) {
			page = max_page;
		}

		const from = (page - 1) * IMAGE_PER_PAGE;
		const to = IMAGE_PER_PAGE * page;
		returnObject.from = parseInt(from);
		returnObject.to = page === max_page ? data.length : parseInt(to);
		returnObject.current_page = parseInt(page);
		returnObject.total_page = Math.ceil(data.length / IMAGE_PER_PAGE);
		returnObject.data = data.slice(from, to);
	}

	return returnObject;
};

module.exports = { paginateData };
