import { Model, Mongoose } from "mongoose";

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
		const client = await this.OAuthClients.findOne({
			clientId,
			...(clientSecret && { clientSecret }),
		}).lean();
		
		if(!client) {
			throw new Error("Client not found");
		}
		
		return {
			id: client.clientId,
			grants: client.grants,
			redirectUris: [client.callbackUrl]
		};
	}
	
	/**
	 * 
	 */
}
