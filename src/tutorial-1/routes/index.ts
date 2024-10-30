import express from "express";
import Models from "felixriddle.mongodb-models";

import OAuth2Service from "@/tutorial-1/services/OAuth2Service";

/**
 * Main router
 */
export default function mainRouter(models: Models) {
	const router = express.Router();
	
	const oauth2 = new OAuth2Service(models);
	
	router.get("/authorize", oauth2.authorize);
	router.post("/token", oauth2.token);
	router.get("/authenticate", oauth2.authenticate, oauth2.test);
	
	return router;
}
