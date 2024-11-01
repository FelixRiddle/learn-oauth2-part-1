import yargs from "yargs";
import dotenv from "dotenv";

import runExpressServer from "@/tutorial-1/server";
import Models from "felixriddle.mongodb-models";
import { initializeDotenv } from "felixriddle.ts-app-models";

/**
 * Cli
 */
export default async function cli() {
	dotenv.config();
	initializeDotenv();

	const models = await Models.create();

	yargs
		.option("port", {
			alias: "p",
			describe: "Port number",
			type: "number",
		})
		.command("server", "Run the Express server", (argv) => {
			const port = (argv as any).port || 3000;
			console.log(`Port: `, port);

			runExpressServer(models, port);
		})
		.parse();
}

cli();
