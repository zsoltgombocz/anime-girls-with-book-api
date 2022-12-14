const filterData = (data, filter) => {
	let folders = data.map((x) => x.name);
	if (filter && folders.includes(filter)) {
		return filterByCategory(data, filter);
	} else {
		let returnData = [];
		folders.map((f) => {
			returnData.push(...filterByCategory(data, f));
		});

		return returnData;
	}
};

const filterByCategory = (data, category) => {
	let images = data.filter((x) => x.name === category)[0].content;
	let returnData = [];
	images.map((im) => {
		returnData.push(imageObject(category, im));
	});

	return returnData;
};

const imageObject = (folderName, image) => {
	let title = getTitleFromURL(image.url);

	return {
		title,
		url: image.url,
		category: folderName,
		dimensions: {
			width: image.width,
			height: image.height,
		},
	};
};

const getTitleFromURL = (url) => {
	const extensions = [".jpg", ".png", ".webp", ".bmp", ".jpeg"];
	let splitedUrl = url.split("/");
	let title = splitedUrl[splitedUrl.length - 1].split("_").join(" ");
	extensions.forEach((e) => (title = title.replace(e, "")));
	return title;
};
module.exports = { filterData };
