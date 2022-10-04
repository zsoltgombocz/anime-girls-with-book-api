const express = require("express");
const { paginateData } = require("./paginateData");
const { filterData } = require("./filterData");
let file;
const IMAGE_PER_PAGE = 5;

try {
	file = require("./data.json");
} catch (error) {
	file = null;
}

require("dotenv").config();

const app = express();

app.use((req, res, next) => {
	if (file) {
		next();
	} else {
		res.status(500).json({
			error: "No data file found, try executing 'npm run scrape' on the backend.",
		});
	}
});

app.get("/", (req, res) => {
	let filteredData = filterData(file, req.query.filter);
	let paginatedData = paginateData(filteredData, req.query.page, IMAGE_PER_PAGE);
	res.json(paginatedData);
});

app.listen(5000, () => {
	/* eslint-disable no-console */
	console.log(`Started server...`);
	/* eslint-enable no-console */
});
