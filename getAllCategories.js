const getAllCategories = (data) => {
	return data.map((x) => x.name);
};
module.exports = { getAllCategories };
