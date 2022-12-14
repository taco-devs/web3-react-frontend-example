import {
  call, put, select, takeLatest, fork, all
} from 'redux-saga/effects';

import { GET_TRANSACTIONS_REQUEST } from './constants';
import { getTransactionsSuccess, getTransactionsError } from './actions';
import request from 'utils/request'
import NetworkData from 'contracts';
import { makeSelectCurrrentNetwork } from '../App/selectors';
import { makeSelectPagination } from './selectors';

const get_query = (address, pagination) =>  {
  return `
    {
      transactions(
        first: 10,
        skip: ${pagination * 10},
        orderBy: block, 
        orderDirection: desc, 
        where: {
          from: "${address}"
        }
      ) {
        id
        from
        action
        type
        sent
        received
        date
        block
        token {
          id
          name
          symbol
        }
      }
    }
`
}

function* getTransactionsSaga(params) {

  const {address} = params;

  if (!address) {
    yield put(getTransactionsError('No wallet detected'));
  }

  try { 

    // Get network
    const network = yield select(makeSelectCurrrentNetwork());
    const pagination = yield select(makeSelectPagination());
    const Network = NetworkData[network];

    if (Network) {

      // Get the correct pairs to fetch price
      const query = get_query(address, pagination);

      // Fetch Pairs price
      const options = {
        method: 'POST',
        body: JSON.stringify({ query })
      };

      const response = yield call(request, process.env.GROWTH_GRAPH_URL, options);

      if (response && response.data) {
        const { transactions } = response.data;
        yield put(getTransactionsSuccess(transactions));
      } 
      
    }

  } catch (error) {
    console.log(error);
    // const jsonError = yield error.response ? error.response.json() : error;
    yield put(getTransactionsError('Could not fetch transactions at this moment'));
  }
}

function* getTransactionsRequest() {
  yield takeLatest(GET_TRANSACTIONS_REQUEST, getTransactionsSaga);
}

export default function* rootSaga() {
  yield all([
    fork(getTransactionsRequest),
  ]);
}