import { Mongoose, Schema } from "mongoose";

export const OAuthAuthorizationCodes = new Schema({
	_id: {
		type: String,
		auto: true,
	},
	authorizationCode: {
		type: String,
	},
	expiresAt: {
		type: Date,
	},
	redirectUri: {
		type: String,
	},
	scope: {
		type: String,
	},
	clientId: {
		type: String,
	},
	userId: {
		type: String,
	},
});

/**
 * Define OAuth2 clients
 */
export default function defineOAuthAuthorizationCodes(mongoose: Mongoose) {
	return mongoose.model(
		"OAuthAuthorizationCodes",
		OAuthAuthorizationCodes,
		"oauth-authorization-codes"
	);
}
