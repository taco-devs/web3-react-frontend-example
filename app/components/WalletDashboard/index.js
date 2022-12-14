/**
 *
 * WalletDashboard
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';
import styled from 'styled-components';

const WalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 1em;
  border-radius: 5px;
  min-width: 300px;
`

const WalletDashboardHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.5em 0.5em 0 0.5em;
  color: white;
`

const WalletDashboardStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  background-color: #00d395;
  border-radius: 5px;
  margin: 0.5em 0 0 0;
  width: 100%;
  color: white;
  -webkit-box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.75);
  -moz-box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.75);
  box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.75);
`

const WalletDashboardDivider = styled.div`
  width: 90%;
  height: 2px;
  background-color: white;
`

const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  margin: 1em 0 1em 0;
`

const StatLabel = styled.h3`
  margin: 0 3px 0 3px;
  color: ${props => props.color};
`

class WalletDashboard extends React.Component {

  calculatePortfolio = () => {
    const { balances, addGRO } = this.props;

    if (!balances) return '-';
    if (balances.length < 1) return;

    
    // Calculate price by usd
    const portfolio_value = 
        balances
          .reduce((acc, curr) => {

             // If it GRO
             if (addGRO && curr.name === 'GRO') {
               return acc + Number(curr.balance / 1e18) * Number(curr.base_price_usd); 
             } 
             if (curr.name === 'stkGRO') {
               const ratio = curr.total_reserve / curr.total_supply;
               const gro = balances.find(balance => balance.name === 'GRO');
               return acc + (curr.web3_balance / 1e18 ) * ratio * Number(gro.base_price_usd);
             }
             if (curr.web3_balance > 0 && curr.base_price_usd) {
                return acc + Number(curr.web3_balance / curr.decimals * curr.base_price_usd);
             }
             return acc;
          }, 0);


    

    return (Math.round(portfolio_value * 100) / 100).toLocaleString('en-En');
  }

  calculateAPY = () => {

    const { balances, eth_price, relev } = this.props;

    if (!balances) return '-';
    if (balances.length < 1) return;

    const blacklisted_balance = [
      'GRO'
    ]

    const gToken_balances = 
        balances
          .filter(balance => balance.apy > 0)
          .filter(balance => blacklisted_balance.indexOf(balance.name) < 0);

    if (gToken_balances.length < 1) return '-';

    const portfolio_value = 
      gToken_balances
        .reduce((acc, curr) => {
            // If not available balance
            if (Number(curr.balance) <= 0 ) return acc; 
            // Balances
            if (curr.name === 'stkGRO') {
              return acc + Number(curr.balance / 1e18 * curr.base_price_usd);
            }
            if (curr.balance > 0 && curr.base_price_usd) {
              return acc + Number(curr.web3_balance / curr.decimals * curr.base_price_usd);
            }
            return acc;
        }, 0);

        
    const alloc = 
        gToken_balances
          .map((curr) => {

            let assetDecimals = curr.name === 'stkGRO' ? 1e18 : curr.decimals;
            const allocPercentage = Number(curr.web3_balance / assetDecimals * curr.base_price_usd) / portfolio_value;

            return {
              ...curr,
              allocPercentage
            }
          })
            
    const apy = 
        alloc.reduce((acc, curr) => {
          return acc + (Number(curr.apy) * curr.allocPercentage);
        }, 0)
        
    return Math.round(apy * 100) / 100;
  }
  


  render () {
    const {address, isMobileSized, hideBalances} = this.props;
    this.calculatePortfolio();
    return (
      <WalletContainer isMobileSized={isMobileSized} >
        <WalletDashboardHeader>
          <FormattedMessage {...messages.balance} />
          {/* <FormattedMessage {...messages.more} /> */}
        </WalletDashboardHeader>
        <WalletDashboardStats>
          <InfoRow>
            {address ? (
              <StatLabel>{hideBalances ? '*****' : `$ ${this.calculatePortfolio()}`}</StatLabel>
            ) : (
              <StatLabel>-</StatLabel>
            )}            
            <StatLabel color="#161d6b">USD</StatLabel>
          </InfoRow>
          <WalletDashboardDivider />
          <InfoRow>
            {address ? (
              <StatLabel>{this.calculateAPY()} %</StatLabel>
            ) : (
              <StatLabel>-</StatLabel>
            )}   
            <StatLabel color="#161d6b">APY</StatLabel>
          </InfoRow>
        </WalletDashboardStats>
      </WalletContainer>
    );
  }
}

WalletDashboard.propTypes = {};

export default WalletDashboard;
