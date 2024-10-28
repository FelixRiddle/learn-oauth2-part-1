import { Mongoose, Schema } from "mongoose";

export const OAuthAccessTokens = new Schema({
	_id: {
		type: String,
		auto: true,
	},
	accessToken: {
		type: String,
	},
	accessTokenExpiresAt: {
		type: Date,
	},
	scope: {
		type: String,
	},
	clientId: {
		type: String,
	},
	userId: {
		type: String,
	}
});

/**
 * Define OAuth2 clients
 */
export default function defineOAuthAccessTokens(mongoose: Mongoose) {
	return mongoose.model(
		"OAuthAccessTokens",
		OAuthAccessTokens,
		"oauth-access-tokens"
	);
}
