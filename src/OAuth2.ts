import { Model, Mongoose } from "mongoose";
import {
	AuthorizationCode,
	AuthorizationCodeModel,
	ClientCredentialsModel,
	ExtensionModel,
	Falsey,
	PasswordModel,
	RefreshTokenModel,
} from "oauth2-server";
import { v4 as uuidv4 } from "uuid";

/**
 * OAuth2
 *
 * Has to follow this specification:
 * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#verifyscope-accesstoken-scope-callback
 */
export default class OAuth2 {
	OAuthClients: Model<any>;
	OAuthAuthorizationCodes: Model<any>;
	OAuthAccessTokens: Model<any>;
	OAuthRefreshTokens: Model<any>;

	/**
	 * Constructor
	 */
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
	async getClient(clientId: string, clientSecret?: string) {
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
	async saveAuthorizationCode(
		code: any,
		client: any,
		user: any
	): Promise<
		| AuthorizationCodeModel
		| ClientCredentialsModel
		| RefreshTokenModel
		| PasswordModel
		| ExtensionModel
	> {
		const authorizationCode = {
			authorizationCode: code.authorizationCode,
			expiresAt: code.expiresAt,
			redirectUri: code.redirectUri,
			scope: code.scope,
			clientId: client.id,
			userId: user._id,
		};
		await this.OAuthAuthorizationCodes.create({ _id: uuidv4() });
		return this;
	}

	/**
	 * Get authorization code
	 */
	async getAuthorizationCode(
		authorizationCode: string
	): Promise<AuthorizationCode | Falsey> {
		const code: any = await this.OAuthAuthorizationCodes.findOne({
			authorizationCode,
		}).lean();
		if (!code) {
			throw new Error("Authorization code not found");
		}

		return {
			authorizationCode: code.authorizationCode,
			expiresAt: code.expiresAt,
			redirectUri: code.redirectUri,
			scope: code.scope,
			client: {
				id: code.clientId,
				grants: "authorization_code",
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

		if (token.refreshToken) {
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
		if (!token) {
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
			},
		};
	}

	/**
	 * Get refresh token
	 */
	async getRefreshToken(refreshToken: string) {
		const token: any = await this.OAuthRefreshTokens.findOne({
			refreshToken,
		}).lean();
		if (!token) {
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
			},
		};
	}

	/**
	 * Verify scope
	 */
	async verifyScope(token: any, scope: string) {
		if (!token.scope) {
			return false;
		}

		const requestedScopes = scope.split(":");
		const authorizedScopes = token.scope.split(":");

		return requestedScopes.every((s) => authorizedScopes.indexOf(s) >= 0);
	}

	/**
	 * Create a new client
	 */
	async createClient(clientData: any) {
		// Validate client data
		const newClient = await this.OAuthClients.create(clientData);
		return newClient;
	}

	/**
	 * Update client
	 */
	async updateClient(clientId: string, clientData: any) {
		// Validate client ID and data
		const updatedClient = await this.OAuthClients.findOneAndUpdate(
			{ clientId },
			clientData,
			{ new: true }
		);
		return updatedClient;
	}

	/**
	 * Delete client
	 */
	async deleteClient(clientId: string) {
		const deletedCount = await this.OAuthClients.deleteOne({ clientId });
		return deletedCount.deletedCount === 1;
	}
	
	/**
	 * Revoke access token
	 */
	async revokeAccessToken({ accessToken }: any) {
		const res = await this.OAuthAccessTokens.deleteOne({ accessToken });
		return res.deletedCount === 1;
	}
	
	/**
	 * Validate client redirect URI
	 */
	async validateClientRedirectUri(clientId: string, redirectUri: string) {
		const client = await this.getClient(clientId);
		return client.redirectUris.includes(redirectUri);
	}
}
