import {
  call, put, select, takeLatest, fork, all
} from 'redux-saga/effects';

import { GET_POOLS_REQUEST } from './constants';
import { getPoolsSuccess, getPoolsError } from './actions';
import request from 'utils/request'
import NetworkData from 'contracts';
import { makeSelectCurrrentNetwork } from '../App/selectors';
// import { makeSelectPagination } from './selectors';

const get_query = (pools) =>  {
  return `
  {
    pools(
      where: {
        id_in: ${JSON.stringify(pools)}
      }
    ) {
      id
      finalized
      publicSwap
      swapFee
      totalWeight
      tokensList
      tokens {
        id
        address
        balance
        decimals
        symbol
        denormWeight
      }
    }
  }
`
}

function* getPoolsSaga() {

  try { 

    // Get network
    const network = yield select(makeSelectCurrrentNetwork());
    // const pagination = yield select(makeSelectPagination());
    const Network = NetworkData[network];

    if (Network) {

      // Get the pair pools
      const pools = Object.keys(Network.available_assets).map(asset => Network.available_assets[asset].liquidity_pool_address);
      // Get the correct pairs to fetch price
      const query = get_query(pools);

      // Fetch Pairs price
      const options = {
        method: 'POST',
        body: JSON.stringify({ query })
      };

      const response = yield call(request, 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer', options);

      if (response && response.data) {
        console.log(response.data);
      } 
      
    }

  } catch (error) {
    console.log(error);
    // const jsonError = yield error.response ? error.response.json() : error;
    // yield put(getTransactionsError('Could not fetch transactions at this moment'));
  }
}

function* getPoolsRequest() {
  yield takeLatest(GET_POOLS_REQUEST, getPoolsSaga);
}

export default function* rootSaga() {
  yield all([
    fork(getPoolsRequest),
  ]);
}