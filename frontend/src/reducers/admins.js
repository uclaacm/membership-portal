import Config from "config";
import Immutable from "immutable";
import Storage from "storage";

import { LogoutUser } from "./auth";

/***********************************************
 ** Constants                                 **
 ***********************************************/

const FETCH_ADMINS_SUCCESS = Symbol();
const FETCH_ADMINS_ERROR = Symbol();

const DELETE_ADMIN_SUCCESS = Symbol();
const DELETE_ADMIN_ERROR = Symbol();

const ADD_ADMIN_SUCCESS = Symbol();
const ADD_ADMIN_ERROR = Symbol();

const PROMOTE_ADMIN_SUCCESS = Symbol();
const PROMOTE_ADMIN_ERROR = Symbol();

const defaultState = Immutable.fromJS({
  admins: [],
  error: null,
  adminAdded: false,
  adminDeleted: false,
  adminPromoted: false,
  adminAddSuccess: false,
  adminDeleteSuccess: false,
  adminPromoteSuccess: false,
});

/***********************************************
 ** Admins States                             **
 ***********************************************/

class State {
  static FetchAdmins(error, admins) {
    return {
      type: error ? FETCH_ADMINS_ERROR : FETCH_ADMINS_SUCCESS,
      admins: error ? undefined : admins,
      error: error || undefined,
    };
  }

  static AddAdmin(error) {
    return {
      type: error ? ADD_ADMIN_ERROR : ADD_ADMIN_SUCCESS,
      error: error || undefined,
    };
  }

  static DeleteAdmin(error) {
    return {
      type: error ? DELETE_ADMIN_ERROR : DELETE_ADMIN_SUCCESS,
      error: error || undefined,
    };
  }

  static PromoteAdmin(error) {
    return {
      type: error ? PROMOTE_ADMIN_ERROR : PROMOTE_ADMIN_SUCCESS,
      error: error || undefined,
    };
  }
}

/***********************************************
 ** Actions                                   **
 ***********************************************/

const FetchAdmins = () => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.admins, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Storage.get("token")}`,
      },
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      return dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    // Put superadmins first for admins modal
    const order = ["SUPERADMIN", "ADMIN"];
    const admins = data.admins.sort(function (a, b) {
      return order.indexOf(a.accessType) - order.indexOf(b.accessType);
    });

    dispatch(State.FetchAdmins(null, admins));
  } catch (err) {
    dispatch(State.FetchAdmins(err.message));
  }
};

const AddAdmin = email => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.admins, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Storage.get("token")}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    dispatch(State.AddAdmin());
    dispatch(FetchAdmins());
  } catch (err) {
    dispatch(State.AddAdmin(err.message));
  }
};

const DeleteAdmin = email => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.admins, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Storage.get("token")}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    dispatch(State.DeleteAdmin());
    dispatch(FetchAdmins());
  } catch (err) {
    dispatch(State.DeleteAdmin(err.message));
  }
};

const ChangeSuperAdmin = email => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.admins, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Storage.get("token")}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    dispatch(State.PromoteAdmin());
    dispatch(LogoutUser()); // should be just an admin when they log back in
  } catch (err) {
    dispatch(State.PromoteAdmin(err.message));
  }
};

/***********************************************
 ** Admins Reducer                            **
 ***********************************************/

const Admins = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_ADMINS_SUCCESS:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("admins", action.admins);
      });

    case FETCH_ADMINS_ERROR:
      return state.withMutations(val => {
        val.set("error", action.error);
        val.set("admins", []);
      });

    case DELETE_ADMIN_SUCCESS:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("adminDeleted", true);
        val.set("adminDeleteSuccess", true);
      });

    case DELETE_ADMIN_ERROR:
      return state.withMutations(val => {
        val.set("error", action.error);
        val.set("adminDeleted", true);
        val.set("adminDeleteSuccess", false);
      });

    case ADD_ADMIN_SUCCESS:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("adminAdded", true);
        val.set("adminAddSuccess", true);
      });

    case ADD_ADMIN_ERROR:
      return state.withMutations(val => {
        val.set("error", action.error);
        val.set("adminAdded", true);
        val.set("adminAddSuccess", false);
      });

    case PROMOTE_ADMIN_SUCCESS:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("adminPromoted", true);
        val.set("adminPromoteSuccess", true);
      });

    case PROMOTE_ADMIN_ERROR:
      return state.withMutations(val => {
        val.set("error", action.error);
        val.set("adminPromoted", true);
        val.set("adminPromoteSuccess", false);
      });

    default:
      return state;
  }
};

export { Admins, FetchAdmins, AddAdmin, DeleteAdmin, ChangeSuperAdmin };
