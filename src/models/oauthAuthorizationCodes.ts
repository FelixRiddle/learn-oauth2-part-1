import { Mongoose } from "mongoose";

/**
 * Define OAuth2 clients
 */
export default function defineOauthClients(mongoose: Mongoose) {
	const { Schema } = mongoose;
	return mongoose.model(
		"OAuthAuthorizationCodes",
		new Schema({
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
		}),
		"oauth-authorization-codes"
	);
}
