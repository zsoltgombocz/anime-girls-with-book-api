const express = require("express");
const { paginateData } = require("./paginateData");
const { filterData } = require("./filterData");
const _ = require("lodash");
let file;
const IMAGE_PER_PAGE = 16;

try {
	file = require("./data.json");
} catch (error) {
	file = null;
}

require("dotenv").config();

const app = express();

let SHUFFLED_ALL = [];

app.use((req, res, next) => {
	if (file) {
		if (SHUFFLED_ALL.length === 0) {
			SHUFFLED_ALL = _.shuffle(filterData(file, null));
		}

		next();
	} else {
		res.status(500).json({
			error: "No data file found, try executing 'npm run scrape' on the backend.",
		});
	}
});

app.get("/", (req, res) => {
	let filteredData =
		req.query.filter && req.query.filter !== "all"
			? filterData(file, req.query.filter)
			: SHUFFLED_ALL;
	let paginatedData = paginateData(filteredData, req.query.page, IMAGE_PER_PAGE);
	res.json(_.shuffle(paginatedData));
});

app.listen(5000, () => {
	/* eslint-disable no-console */
	console.log(`Started server...`);
	/* eslint-enable no-console */
});
