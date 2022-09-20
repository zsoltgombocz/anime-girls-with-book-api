const express = require("express");
let file;

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
	} else
		res.status(500).json({
			error: "No data file found, try executing 'npm run scrape' on the backend.",
		});
});

app.get("/", (req, res) => {
	res.json("asd");
});

app.listen(process.env.PORT || 5000, () => {
	/* eslint-disable no-console */
	console.log(`Listening: http://localhost:${process.env.PORT || 5000}`);
	/* eslint-enable no-console */
});
