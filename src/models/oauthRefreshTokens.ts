import { Mongoose } from "mongoose";

/**
 * Define OAuth refresh tokens
 */
export default function defineOAuthRefreshTokens(mongoose: Mongoose) {
	const { Schema } = mongoose;
	return mongoose.model(
		"OAuthAccessTokens",
		new Schema({
			_id: {
				type: String,
				auto: true,
			},
			refreshToken: {
				type: String,
			},
			refreshTokenExpiresAt: {
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
			},
		}),
		"oauth-refresh-tokens"
	);
}
