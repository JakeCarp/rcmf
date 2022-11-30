import { initialize } from "@bcwdev/auth0provider-client";
import { AppState } from "../AppState";
import { audience, clientId, domain } from "../env";
import { router } from "../router";
import { accountService } from "./AccountService";
import { mySQL } from "./AxiosService";
import { donationsService } from "./DonationsService.js";
import { grantsService } from "./GrantsService.js";
import { playersService } from "./PlayersService.js";
import { socketService } from "./SocketService";
import { sponsorsService } from "./SponsorsService.js";
import { teamsService } from "./TeamsService.js";

export const AuthService = initialize({
  domain,
  clientId,
  audience,
  useRefreshTokens: true,
  onRedirectCallback: (appState) => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    );
  },
});

AuthService.on(AuthService.AUTH_EVENTS.AUTHENTICATED, async function () {
  mySQL.defaults.headers.authorization = AuthService.bearer;
  mySQL.interceptors.request.use(refreshAuthToken);
  AppState.user = AuthService.user;
  await accountService.getAccount();
  socketService.authenticate(AuthService.bearer);
  sponsorsService.getSponsors()
  grantsService.getGrants()
  donationsService.getDonors()
  teamsService.getTeams()
  playersService.getPlayers()
  // NOTE if there is something you want to do once the user is authenticated, place that here
});

async function refreshAuthToken(config) {
  if (!AuthService.isAuthenticated) {
    return config;
  }
  const expires = AuthService.identity.exp * 1000;
  const expired = expires < Date.now();
  const needsRefresh = expires < Date.now() + 1000 * 60 * 60 * 12;
  if (expired) {
    await AuthService.loginWithPopup();
  } else if (needsRefresh) {
    await AuthService.getTokenSilently();
    mySQL.defaults.headers.authorization = AuthService.bearer;
    socketService.authenticate(AuthService.bearer);
  }
  return config;
}
