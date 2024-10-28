import dotenv from "dotenv";
import mongooseInstance from "@/models";

/**
 * Main
 */
async function main() {
	dotenv.config();
	
	const mongoose = mongooseInstance();
}

main();
