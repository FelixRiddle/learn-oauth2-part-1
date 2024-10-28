import mongoose from "mongoose";
import defineOAuthClients from "./oauthClients";
import defineOAuthAccessTokens from "./oauthAccessTokens";
import defineOAuthAuthorizationCodes from "./oauthAuthorizationCodes";

/**
 * Mongoose instance
 */
export default function mongooseInstance() {
	
	defineOAuthClients(mongoose);
	defineOAuthAuthorizationCodes(mongoose);
	defineOAuthAccessTokens(mongoose);
	
	return mongoose;
}
