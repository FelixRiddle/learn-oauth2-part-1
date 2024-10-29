import express from "express";
import OAuth2Service from "@/services/OAuth2Service";
import Models from "felixriddle.mongodb-models";

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
