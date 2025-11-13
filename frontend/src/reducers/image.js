import Config from 'config';
import Immutable from 'immutable';
import Storage from 'storage';

import { LogoutUser } from './auth';

/** *********************************************
 ** Constants                                 **
 ********************************************** */

const FETCH_IMAGES_SUCCESS = Symbol();
const FETCH_IMAGES_ERROR = Symbol();

const DELETE_IMAGE_SUCCESS = Symbol();
const DELETE_IMAGE_ERROR = Symbol();

const CREATE_IMAGE_SUCCESS = Symbol();
const CREATE_IMAGE_ERROR = Symbol();

const defaultState = Immutable.fromJS({
  images: [],
  error: null,
  created: false,
  deleted: false,
  createSuccess: false,
  createUuid: null,
  deleteSuccess: false,
})

/** *********************************************
 ** Image States                              **
 ********************************************** */

class State {
  static FetchImages(error, images) {
    return {
      type: error ? FETCH_IMAGES_ERROR : FETCH_IMAGES_SUCCESS,
      images: error ? undefined : images,
      error: error || undefined,
    };
  }

  static CreateImage(error, uuid) {
    return {
      type: error ? CREATE_IMAGE_ERROR : CREATE_IMAGE_SUCCESS,
      error: error || undefined,
      createUuid: error ? undefined : uuid,
    };
  }

  static DeleteImage(error) {
    return {
      type: error ? DELETE_IMAGE_ERROR : DELETE_IMAGE_SUCCESS,
      error: error || undefined,
    };
  }
}

/** ********************************************
 ** Actions                                  **
 ********************************************* */

const GetAllImages = () => async (dispatch) => {
  try {
    const imagesRes = await fetch(Config.API_URL + Config.routes.image.all, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
    });

    let status = await imagesRes.status;
    if (status === 401 || status === 403) {
      return dispatch(LogoutUser());
    }

    const imagesData = await imagesRes.json();
    if (!imagesData) throw new Error('Empty response from server');
    else if (imagesData.error) throw new Error(imagesData.error.message);

    dispatch(State.FetchImages(null, imagesData.images));
  } catch (err) {
    dispatch(State.FetchImages(err.message));
  }
};

const CreateImage = formData => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.image.upload, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Storage.get('token')}`,
      },
      body: formData,
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    dispatch(State.CreateImage(null, data.uuid));
    dispatch(GetAllImages());
  } catch (err) {
    dispatch(State.CreateImage(err.message));
  }
};

const DeleteImage = uuid => async (dispatch) => {
  try {
    const response = await fetch(`${Config.API_URL + Config.routes.image.specific}/${uuid}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response from server');

    dispatch(State.DeleteImage());
    dispatch(GetAllImages());
  } catch (err) {
    dispatch(State.DeleteImage(err.message));
  }
};

/** *********************************************
 ** Images Reducer                            **
 ********************************************** */

const Images = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_IMAGES_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('images', action.images);
      });

    case FETCH_IMAGES_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('images', []);
      });

    case CREATE_IMAGE_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('created', true);
        val.set('createSuccess', true);
        val.set('createUuid', action.createUuid);
      });

    case CREATE_IMAGE_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('created', true);
        val.set('createSuccess', false);
      });

    case DELETE_IMAGE_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', 'null');
        val.set('deleted', true);
        val.set('deleteSuccess', true);
      });

    case DELETE_IMAGE_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('deleted', true);
        val.set('deleteSuccess', false);
      });

    default:
      return state;
  }
};

export {
  Images, GetAllImages, CreateImage, DeleteImage,
};
