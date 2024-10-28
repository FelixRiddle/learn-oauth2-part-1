import mongoose from "mongoose";
import defineOauthClients from "./oauthClients";

/**
 * Mongoose instance
 */
export default function mongooseInstance() {
	
	defineOauthClients(mongoose);
	
	return mongoose;
}
