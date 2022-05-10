import Config from "config";
import Immutable from "immutable";
import Storage from "storage";

import { replace } from "react-router-redux";

/***********************************************
 ** Constants                                 **
 ***********************************************/

const AUTH_USER = Symbol();
const UNAUTH_USER = Symbol();
const AUTH_ERROR = Symbol();

const initState = () => {
  const token = Storage.get("token");
  return Immutable.fromJS({
    error: null,
    timestamp: null,
    authenticated: !!token,
    isAdmin: !!token && tokenIsAdmin(token),
    isSuperAdmin: !!token && tokenIsSuperAdmin(token),
    isRegistered: !!token && tokenIsRegistered(token),
  });
};

/***********************************************
 ** Helper Functions                          **
 ***********************************************/

// Get claims from JSON Web Token (JWT)
// JWT is signed on backend, sent with every request, and verified on backend
const tokenGetClaims = token => {
  if (!token) {
    return {};
  }
  const tokenArray = token.split(".");
  if (tokenArray.length !== 3) {
    return {};
  }

  return JSON.parse(window.atob(tokenArray[1].replace("-", "+").replace("_", "/")));
};

const tokenIsAdmin = token => !!tokenGetClaims(token).admin;
const tokenIsSuperAdmin = token => !!tokenGetClaims(token).superAdmin;
const tokenIsRegistered = token => !!tokenGetClaims(token).registered;

/***********************************************
 ** Auth States                               **
 ***********************************************/

class State {
  static Auth(error, token) {
    return {
      type: error ? AUTH_ERROR : AUTH_USER,
      isAdmin: error ? undefined : tokenIsAdmin(token),
      isSuperAdmin: error ? undefined : tokenIsSuperAdmin(token),
      isRegistered: error ? undefined : tokenIsRegistered(token),
      error: error || undefined,
    };
  }

  static UnAuth(error) {
    return {
      type: UNAUTH_USER,
    };
  }
}

/***********************************************
 ** Actions                                   **
 ***********************************************/

const LoginUser = tokenId => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.auth.login, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tokenId: tokenId }),
    });

    const data = await response.json();

    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    Storage.set("token", data.token);
    dispatch(State.Auth(null, data.token));
  } catch (err) {
    dispatch(State.Auth(err.message));
  }
};

const LogoutUser = error => async dispatch => {
  dispatch(State.UnAuth());
  Storage.remove("token");
  dispatch(replace("/login"));
};

const RefreshToken = token => async dispatch => {
  Storage.set("token", token);
  dispatch(State.Auth(null, token));
};

/***********************************************
 ** Auth Reducer                              **
 ***********************************************/

const Auth = (state = initState(), action) => {
  switch (action.type) {
    case AUTH_USER:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("timestamp", Date.now());
        val.set("authenticated", true);
        val.set("isRegistered", action.isRegistered);
        val.set("isAdmin", action.isAdmin);
        val.set("isSuperAdmin", action.isSuperAdmin);
      });

    case UNAUTH_USER:
      return state.withMutations(val => {
        val.set("authenticated", false);
        val.set("isRegistered", false);
        val.set("isAdmin", false);
        val.set("isSuperAdmin", false);
      });

    case AUTH_ERROR:
      return state.withMutations(val => {
        val.set("error", action.error);
        val.set("timestamp", Date.now());
      });

    default:
      return state;
  }
};

export { Auth, LoginUser, LogoutUser, RefreshToken };
