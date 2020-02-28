import Vue from 'vue';
import Vuex from 'vuex';

import { getters } from './getters';
import mutations from './mutations';
import actions from './actions';
import persistState from './plugins/persistState'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    account: {},
    balance: 0,
    current: {
      language: '',
      token: 0,
      currencyRate: 0,
      currency: 'eur',
    },
    currencies: [
      { value: 'eur', text: 'EUR'},
      { value: 'cny', text: 'YEN'},
      { value: 'usd', text: 'USD'},
    ],
    tips: [],
    tipsOrdering: null,
    isLoggedIn: false,
  },
  getters,
  mutations,
  actions,
  plugins: [
    persistState(
      state => state,
      ({ current }) => ({
        current,
      })
    )
  ]
});