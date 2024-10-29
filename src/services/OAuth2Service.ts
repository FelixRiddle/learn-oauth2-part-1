import OAuth2 from "@/OAuth2";
import OAuth2Server, {
	Request as OAuth2Request,
	Response as OAuth2Response,
} from "oauth2-server";
import { NextFunction, Request, Response } from "express";
import Models from "felixriddle.mongodb-models";

/**
 * OAuth2 service
 */
export default class OAuth2Service {
	server: OAuth2Server;
	OAuthClients;
	OAuthAuthorizationCodes;
	OAuthAccessTokens;
	OAuthRefreshTokens;
	User;

	/**
	 * Construct it
	 */
	constructor(models: Models) {
		this.OAuthClients = models.OAuthClients;
		this.OAuthAuthorizationCodes = models.OAuthAuthorizationCodes;
		this.OAuthAccessTokens = models.OAuthAccessTokens;
		this.OAuthRefreshTokens = models.OAuthRefreshTokens;
		this.User = models.User;

		const oauth = new OAuth2(models);

		this.server = new OAuth2Server({
			model: oauth,
		});
	}

	/**
	 * Authorize
	 */
	async authorize(req: Request, res: Response) {
		const request = new OAuth2Request(req);
		const response = new OAuth2Response(res);
		return await this.server
			.authorize(request, response, {
				authenticateHandler: {
					handle: async () => {
						// Present in Flow 1 and Flow 2 ('client_id' is a required for /oauth/authorize
						const { client_id } = req.query || {};
						if (!client_id) {
							throw new Error("Client ID not found");
						}

						// Find a client
						const client = await this.OAuthClients.findOne({
							clientId: client_id,
						});

						if (!client) {
							throw new Error("Client not found");
						}

						// Only present in Flow 2 (authentication screen)
						const { userId } = req.auth || {};

						// At this point, if there's no 'userId' attached to the client or
						// the request doesn't originate from an authentication screen, then
						// do not bind this authorization code to any user, just the client
						if (!client.userId && !userId) {
							return {};
						}
						const user = await this.User.findOne({
							...(client.userId && { _id: client.userId }),
							...(userId && { clerkId: userId }),
						});

						if (!user) {
							throw new Error("User not found");
						}

						return { _id: user._id };
					},
				},
			})
			.then((result) => {
				return res.json(result);
			})
			.catch((err) => {
				console.log(`Error`);
				console.error(err);
				return res
					.status(err.code || 500)
					.json(err instanceof Error ? { error: err.message } : err);
			});
	}

	/**
	 * Token
	 */
	async token(req: Request, res: Response) {
		const request = new OAuth2Request(req);
		const response = new OAuth2Response(res);
		return this.server
			.token(request, response, {
				alwaysIssueNewRefreshToken: true,
			})
			.then((result) => {
				return res.json(result);
			})
			.catch((err) => {
				console.log(`Error`);
				console.error(err);
				return res
					.status(err.code || 500)
					.json(err instanceof Error ? { error: err.message } : err);
			});
	}

	/**
	 * Authenticate
	 */
	async authenticate(req: Request, res: Response, next: NextFunction) {
		const request = new OAuth2Request(req);
		const response = new OAuth2Response(res);
		return this.server
			.authenticate(request, response)
			.then((data) => {
				req.auth = {
					userId: data?.user?.id,
					sessionType: "oauth2",
				};
				return next();
			})
			.catch((err) => {
				console.log("Error");
				console.error(err);
				return res.status(err.code || 500);
			});
	}

	/**
	 * Test
	 */
	async test(req: Request, res: Response) {
		const { userId } = req.auth || {};
		if (!userId) {
			throw new Error("user not found");
		}

		const user = await this.User.findOne({ _id: userId });
		if(!user) {
			throw new Error("User not found");
		}
		
		return res.json({ _id: user._id, username: user.username });
	}
}
