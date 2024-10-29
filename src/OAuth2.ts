import { Model, Mongoose } from "mongoose";
import { v4 as uuidv4 } from "uuid";

/**
 * OAuth2
 */
export default class OAuth2 {
	OAuthClients: Model<any>;
	OAuthAuthorizationCodes: Model<any>;
	OAuthAccessTokens: Model<any>;
	OAuthRefreshTokens: Model<any>;

	constructor(mongoose: Mongoose) {
		this.OAuthClients = mongoose.model("OAuthClients");
		this.OAuthAuthorizationCodes = mongoose.model(
			"OAuthAuthorizationCodes"
		);
		this.OAuthAccessTokens = mongoose.model("OAuthAccessTokens");
		this.OAuthRefreshTokens = mongoose.model("OAuthRefreshTokens");
	}

	/**
	 * Get client
	 */
	async getClient(clientId: string, clientSecret: string) {
		const client: any = await this.OAuthClients.findOne({
			clientId,
			...(clientSecret && { clientSecret }),
		}).lean();

		if (!client) {
			throw new Error("Client not found");
		}

		return {
			id: client.clientId,
			grants: client.grants,
			redirectUris: [client.callbackUrl],
		};
	}

	/**
	 * Save authorization code
	 */
	async saveAuthorizationCode(code: any, client: any, user: any) {
		const authorizationCode = {
			authorizationCode: code.authorizationCode,
			expiresAt: code.expiresAt,
			redirectUri: code.redirectUri,
			scope: code.scope,
			clientId: client.id,
			userId: user._id,
		};
		await this.OAuthAuthorizationCodes.create({ _id: uuidv4() });
		return authorizationCode;
	}

	/**
	 * Get authorization code
	 */
	async getAuthorizationCode(authorizationCode: string) {
		const code: any = await this.OAuthAuthorizationCodes.findOne({
			authorizationCode,
		}).lean();
		if(!code) {
			throw new Error("Authorization code not found");
		}
		
		return {
			code: code.authorizationCode,
			expiresAt: code.expiresAt,
			redirectUri: code.redirectUri,
			scope: code.scope,
			client: {
				id: code.clientId
			},
			user: {
				id: code.userId,
			}
		};
	}
}
