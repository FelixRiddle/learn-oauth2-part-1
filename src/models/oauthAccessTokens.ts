import { Mongoose } from "mongoose";

/**
 * Define OAuth2 clients
 */
export default function defineOAuthAccessTokens(mongoose: Mongoose) {
	const { Schema } = mongoose;
	return mongoose.model(
		"OAuthAccessTokens",
		new Schema({
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
		}),
		"oauth-access-tokens"
	);
}
