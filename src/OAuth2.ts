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
		if (!code) {
			throw new Error("Authorization code not found");
		}

		return {
			code: code.authorizationCode,
			expiresAt: code.expiresAt,
			redirectUri: code.redirectUri,
			scope: code.scope,
			client: {
				id: code.clientId,
			},
			user: {
				id: code.userId,
			},
		};
	}

	/**
	 * Revoke authorization code
	 */
	async revokeAuthorizationCode({ code }: any) {
		const res = await this.OAuthAuthorizationCodes.deleteOne({
			authorizationCode: code,
		});
		return res.deletedCount === 1;
	}

	/**
	 * Revoke a refresh token
	 */
	async revokeRefreshToken({ refreshToken }: any) {
		const res = await this.OAuthRefreshTokens.deleteOne({
			authorizationCode: refreshToken,
		});
		return res.deletedCount === 1;
	}

	/**
	 * Save token
	 */
	async saveToken(token: any, client: any, user: any) {
		await this.OAuthAccessTokens.create({
			accessToken: token.accessToken,
			accessTokenExpiresAt: token.accessTokenExpiresAt,
			scope: token.scope,
			_id: uuidv4(),
			clientId: client.id,
			userId: user.id,
		});
		
		if(token.refreshToken) {
			await this.OAuthRefreshTokens.create({
				refreshToken: token.refreshToken,
				refreshTokenExpiresAt: token.refreshTokenExpiresAt,
				scope: token.scope,
				_id: uuidv4(),
				clientId: client.id,
				userId: user.id,
			});
		}
		
		return {
			accessToken: token.accessToken,
			accessTokenExpiresAt: token.accessTokenExpiresAt,
			refreshToken: token.refreshToken,
			refreshTokenExpiresAt: token.refreshTokenExpiresAt,
			scope: token.scope,
			client: {
				id: client.id,
			},
			user: {
				id: user.id,
			},
			
			// other formats, i.e. for Zapier
			access_token: token.accessToken,
			refresh_token: token.refreshToken,
		};
	}
	
	/**
	 * Get access token
	 */
	async getAccessToken(accessToken: string) {
		const token = await this.OAuthAccessTokens.findOne({ accessToken });
		if(!token) {
			throw new Error("Refresh token not found");
		}
		
		return {
			accessToken: token.accessToken,
			accessTokenExpiresAt: token.accessTokenExpiresAt,
			scope: token.scope,
			client: {
				id: token.clientId,
			},
			user: {
				id: token.userId,
			}
		};
	}
	
	/**
	 * Get refresh token
	 */
	async getRefreshToken(refreshToken: string) {
		const token: any = await this.OAuthRefreshTokens.findOne({
			refreshToken,
		}).lean();
		if(!token) {
			throw new Error("Refresh token not found");
		}
		
		return {
			refreshToken: token.refreshToken,
		    // refreshTokenExpiresAt: token.refreshTokenExpiresAt, // never expires
			scope: token.scope,
			client: {
				id: token.clientId,
			},
			user: {
				id: token.userId,
			}
		};
	}
}
