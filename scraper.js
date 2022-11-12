const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const probe = require("probe-image-size");

require("dotenv").config();

const excludeLinkName = ["CONTRIBUTING.md", "README.md", "memes"];

const getFolders = async () => {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await axios.get(process.env.SOURCE_URL);
			const folders = [];
			const $ = cheerio.load(response.data);

			const links = $("a.js-navigation-open");
			links.each((i, l) => {
				const text = $(l).text();
				if (!excludeLinkName.includes(text) && $(l).attr("href") !== "") {
					const f = {
						url: "https://github.com" + $(l).attr("href"),
						name: $(l).text(),
						content: [],
					};
					folders.push(f);
				}
			});

			resolve(folders);
		} catch (error) {
			reject(error);
		}
	});
};

const extractImagesFromFolders = async (data) => {
	for (let index = 0; index <= data.length - 1; index++) {
		try {
			if (index === 0) fs.appendFile("data.json", "[\n", (err) => err && console.log(err));
			let content = await getImagesFromURL(data[index].url);
			for (let i = 0; i <= content.length - 1; i++) {
				let { height, width } = await getImageDimension(content[i]);
				const image = {
					url: content[i],
					height,
					width,
				};

				data[index].content.push(image);
			}

			//data[index].content.push(...content);
			fs.appendFile(
				"data.json",
				JSON.stringify(data[index], null, 4) + (index !== data.length - 1 ? ",\n" : ""),
				(err) => err && console.log(err)
			);

			if (index === data.length - 1)
				fs.appendFile("data.json", "\n]", (err) => err && console.log(err));
		} catch (error) {
			console.log(error);
		}
	}
};
const getImagesFromURL = async (url) => {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await axios.get(url);
			const content = [];
			const $ = cheerio.load(response.data);

			const links = $("a.js-navigation-open");
			links.each((i, l) => {
				const imageSrc = $(l).attr("href");
				if (imageSrc !== "") {
					let replaced = (process.env.IMG_URL + imageSrc).replace(
						"blob/master",
						"master"
					);
					content.push(replaced);
				}
			});

			content.shift();

			resolve(content);
		} catch (error) {
			reject(error);
		}
	});
};

const getImageDimension = (imageUrl) => {
	return new Promise(async (resolve, reject) => {
		let { width, height } = await probe(imageUrl);
		resolve({ width, height });
	});
};

getFolders().then((res) => {
	extractImagesFromFolders(res);
});
