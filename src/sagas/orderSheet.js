import { put, call, all, fork, take, takeLatest } from 'redux-saga/effects';
import { eventChannel } from '@redux-saga/core';
import { io } from 'socket.io-client';
import axios from 'axios';

import {
  GET_ORDER_ORDER_SHEET_REQUEST,
  GET_ORDER_ORDER_SHEET_SUCCESS,
  GET_ORDER_ORDER_SHEET_FAILURE,
  ADD_ORDER_ORDER_SHEET_REQUEST,
  ADD_ORDER_ORDER_SHEET_SUCCESS,
  ADD_ORDER_ORDER_SHEET_FAILURE,
  QUAN_INCR_ORDER_SHEET_REQUEST,
  QUAN_INCR_ORDER_SHEET_SUCCESS,
  QUAN_INCR_ORDER_SHEET_FAILURE,
  RESET_ORDER_ORDER_SHEET_REQUEST,
  RESET_ORDER_ORDER_SHEET_SUCCESS,
  RESET_ORDER_ORDER_SHEET_FAILURE,
} from '../reducers/orderSheet';

const socket = io('/api/ordersheet', { path: '/socket', transports: ['websocket'] });

const getOrderAPI = ({ table }) => {
  return eventChannel((emitter) => {
    socket.emit('GET /api/ordersheet Request', table);
    socket.on('GET /api/ordersheet Success', emitter);
  });
};

const addOrderAPI = async ({ table, wishData }) => {
  const menu_name = wishData.menu_name;
  const order_quantity = wishData.wish_quantity;
  await axios.post(`/api/ordersheet/${table}`, { menu_name, order_quantity });
  return await axios.get(`/api/ordersheet/${table}`);
};

const quanIncrAPI = async ({ table, wishData, orderData }) => {
  const menu_name = orderData.menu_name;
  const order_quantity = orderData.order_quantity + wishData.wish_quantity;
  await axios.patch(`/api/ordersheet/${table}`, { menu_name, order_quantity });
  return await axios.get(`/api/ordersheet/${table}`);
};

const resetOrderAPI = async ({ table }) => {
  await axios.delete(`/api/ordersheet/${table}`);
  return await axios.get(`/api/ordersheet/${table}`);
};

function* getOrder(action) {
  try {
    const result = yield call(getOrderAPI, { table: action.payload.table });
    while (true) {
      const channel = yield take(result);
      yield put(GET_ORDER_ORDER_SHEET_SUCCESS({ table: channel.table, data: channel.data }));
    }
  } catch (err) {
    yield put(GET_ORDER_ORDER_SHEET_FAILURE({ error: err.response.data }));
  }
}

function* addOrder(action) {
  try {
    const result = yield call(addOrderAPI, {
      table: action.payload.table,
      wishData: action.payload.wishData,
    });
    yield put(ADD_ORDER_ORDER_SHEET_SUCCESS({ table: action.payload.table, data: result.data }));
  } catch (err) {
    yield put(ADD_ORDER_ORDER_SHEET_FAILURE({ error: err.response.data }));
  }
}

function* quanIncr(action) {
  try {
    const result = yield call(quanIncrAPI, {
      table: action.payload.table,
      wishData: action.payload.wishData,
      orderData: action.payload.orderData,
    });
    yield put(QUAN_INCR_ORDER_SHEET_SUCCESS({ table: action.payload.table, data: result.data }));
  } catch (err) {
    yield put(QUAN_INCR_ORDER_SHEET_FAILURE({ error: err.response.data }));
  }
}

function* resetOrder(action) {
  try {
    const result = yield call(resetOrderAPI, { table: action.payload.table });
    yield put(RESET_ORDER_ORDER_SHEET_SUCCESS({ table: action.payload.table, data: result.data }));
  } catch (err) {
    yield put(RESET_ORDER_ORDER_SHEET_FAILURE({ error: err.response.data }));
  }
}

function* watchGetOrder() {
  yield takeLatest(GET_ORDER_ORDER_SHEET_REQUEST, getOrder);
}

function* watchAddOrder() {
  yield takeLatest(ADD_ORDER_ORDER_SHEET_REQUEST, addOrder);
}

function* watchQuanIncr() {
  yield takeLatest(QUAN_INCR_ORDER_SHEET_REQUEST, quanIncr);
}

function* watchResetOrder() {
  yield takeLatest(RESET_ORDER_ORDER_SHEET_REQUEST, resetOrder);
}

export default function* orderSheet() {
  yield all([fork(watchGetOrder), fork(watchAddOrder), fork(watchQuanIncr), fork(watchResetOrder)]);
}
