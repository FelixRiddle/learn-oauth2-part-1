import { Mongoose } from "mongoose";
import OAuth2 from "@/OAuth2";
import OAuth2Server from "oauth2-server";

/**
 * OAuth2 service
 */
export default class OAuth2Service {
	server: OAuth2Server;
	
	/**
	 * Construct it
	 */
	constructor(mongoose: Mongoose) {
		const oauth = new OAuth2(mongoose);
		
		this.server = new OAuth2Server({
			model: oauth
		});
	}
}
