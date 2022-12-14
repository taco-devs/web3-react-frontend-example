import React, { Component } from 'react';
import * as Drawer from '@accessible/drawer'
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import styled from 'styled-components';
import { Icon } from 'react-icons-kit';
import {exchange} from 'react-icons-kit/fa/exchange';
import {chevronCircleLeft} from 'react-icons-kit/fa/chevronCircleLeft';
import {areaChart} from 'react-icons-kit/fa/areaChart'
import debounce from 'lodash.debounce';
import Loader from 'react-loader-spinner';
import ApproveContainer from 'components/ApproveContainer';
import types from 'contracts/token_types.json';

import AssetTypeToggle from './AssetTypeToggle';
import MobileTabs from './MobileTabs';
import AmountInput from './AmountInput';
import StatsSection from './StatsSection';
import { numberToBN, BNtoNumber } from 'utils/utilities';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
 ${props => {
   if (props.drawer_type === 'interaction') return 'background: white;';
   if (props.drawer_type === 'stats') return `
    background: rgb(255,255,255);
    background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%);
   `
 }}
  z-index: 120;
`

const ActionRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${props => props.justify || 'flex-start'};
  padding: 1em 1em 0.5em 1em;
`

const ActionCol = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`


const PrimaryLabel = styled.b`
  color: #161d6b;
  opacity: 0.75;
  margin: ${props => props.margin || '0'};
  text-align: ${props => props.align || 'left'};
  letter-spacing: ${props => props.spacing || '0'};
`

const Summary = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #E8E8E8;
  flex: 1;
  height: calc(55vh - 260px);
  padding: 2em 1.5em 1em 1.5em;
`

const SummaryRow = styled.div`
  display: flex;
  flex-direction: row;
  flex: ${props => props.flex || '1'};
  align-items: center;
  justify-content: ${props => props.justify || 'space-between'};
`

const SummaryColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: ${props => props.flex || '1'};
  align-items: ${props => props.align || 'flex-start'};
`

const ActionConfirmButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  border-radius: 5px;
  background-color: ${props => {
    if (props.disabled) return '#BEBEBE';
    if (props.asset.type === types.STKGRO) return '#ffe391';
    if (props.modal_type === 'mint') return '#00d395';
    if (props.modal_type === 'redeem') return '#161d6b';
  }};
  padding: 1em 1em 1em 1em;
  margin: 1em 0 0 0;
  width: 300px;
  color: ${props => props.asset.type === types.STKGRO ? '#21262b' : 'white'};;
  border-width: 3px;
  border-style: solid;
  border-color: ${props => {
    if (props.disabled) return '#BEBEBE';
    if (props.asset.type === types.STKGRO) return '#ffe391';
    if (props.modal_type === 'mint') return '#00d395';
    if (props.modal_type === 'redeem') return '#161d6b';
  }};
  
  &:hover {
    opacity: 0.85;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  }
`

const BalanceRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: flex-start;
`

const SwapView = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => {
    if (props.type === 'mint') return '#00d395';
    if (props.type === 'redeem') return '#161d6b';
  }};
  flex: 1;
  height: calc(55vh - 260px);
  padding: 2em 1.5em 1em 1.5em;
  justify-content: center;
  align-items: center;
`

const SwapContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  background-color: rgb(0,0,0, 0.10);
  padding: 1em;
  border-radius: 5px;
`

const SwapSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex: 1;
  height: ${props => props.height || '100%'};
  margin: ${props => props.margin || '0'};
`

const SwapColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: ${props => props.flex || '1'};
`

const SwapLogo = styled.img`
  height: 50px;
  width: 50px;
  background-color: white;
  border-radius: 50%;
`

const StyledText = styled.p`
  text-align: ${props => props.textAlign || 'center'};
  width: 100px;
  margin: ${props => props.margin || ' 0 5px 0 5px'};
  font-size: ${props => props.size || '1em'};
  letter-spacing: 1px;
  color: ${props => {
    if (props.modal_type === 'mint') return '#161d6b';
    if (props.modal_type === 'redeem') return '#00d395';
    return 'white';
  }};
`

const StyledLink = styled.a`
  text-align: ${props => props.textAlign || 'center'};
  width: 100px;
  margin: ${props => props.margin || ' 0 5px 0 5px'};
  font-size: ${props => props.size || '1em'};
  letter-spacing: 1px;
  color: white;
  text-decoration: underline;
`

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    borderWidth: 0,
    padding: 0,
    borderRadius: '5px',
    width: '450px',
    height: '55vh',
  },
  overlay: {
    backgroundColor: 'rgb(0,0,0, 0.50)'
  }
};

export default class ActionDrawer extends Component {

  state = {
    show: false,
    isLoading: false,
    // Avoid dust
    isMintMax: false,
    isMintUnderlyingMax: false,
    isRedeemMax: false,
    modal_type: 'mint',
    value_base: '',
    value_native: '',
    value_redeem: '',
    is_native: false,
    underlying_balance: null,
    asset_balance: null,
    g_balance: null,
    total_supply: null,
    deposit_fee: null,
    withdrawal_fee: null,
    exchange_rate: null,
    total_reserve: null,
    total_native: null,
    total_base: null,
    total_native_redeem: null,
    total_native_cost_redeem: null,
    total_base_redeem: null,
    underlying_conversion: null,
    underlying_allowance: null,
    asset_allowance: null,
    bridge_allowance: null,
  }

    componentDidMount = () => {
      const {type} = this.props;
      this.setState({ modal_type: type });
      this.fetchBalance();
    }
    
    toggleNativeSelector = () => {
      const {currentSwap} = this.props;
      if (currentSwap) return;
      this.setState({is_native: !this.state.is_native})
    }

    handleChange = (values) => {
      this.setState({...values}); 
    }


  
    fetchBalance = async () => {
  
      const { asset, web3, address } = this.props;
      
      const GContractInstance = await new web3.eth.Contract(asset.gtoken_abi, asset.gtoken_address);
      const UnderlyingContractInstance = await new web3.eth.Contract(asset.underlying_abi, asset.underlying_address);
      const BaseContractInstance = await new web3.eth.Contract(asset.base_abi, asset.base_address);
  
      let total_supply;    
      let deposit_fee;   
      let withdrawal_fee;  
      let exchange_rate;   
      let total_reserve;  
      let total_reserve_underlying;
      let g_balance;
      let bridge_allowance;
      
      if (GContractInstance) {
        total_supply    = await GContractInstance.methods.totalSupply().call();
        deposit_fee     = await GContractInstance.methods.depositFee().call();
        withdrawal_fee  = await GContractInstance.methods.withdrawalFee().call();
        total_reserve   = await GContractInstance.methods.totalReserve().call();
        g_balance       = await GContractInstance.methods.balanceOf(address).call(); 

        if (asset.type === types.TYPE1 || asset.type === types.TYPE_ETH) {
          exchange_rate   = await GContractInstance.methods.exchangeRate().call();
          total_reserve_underlying = await GContractInstance.methods.totalReserveUnderlying().call();
        }
      }
  
      let underlying_balance;
      let underlying_allowance;
  
      if (UnderlyingContractInstance) {

        if (asset.type === types.TYPE_ETH) {
          underlying_balance = await web3.eth.getBalance(address);
          underlying_allowance = 1000000 * 1e18;
          bridge_allowance = await GContractInstance.methods.allowance(address, asset.bridge_address).call();
        } else {
          underlying_balance = await UnderlyingContractInstance.methods.balanceOf(address).call(); 
          underlying_allowance = await UnderlyingContractInstance.methods.allowance(address, asset.gtoken_address).call();
        }
        
      }
      
      let asset_balance;
      let asset_allowance;
  
      if (BaseContractInstance) {
        if (asset.type === types.GETH) {
          asset_balance = await web3.eth.getBalance(address);
          asset_allowance = 1000000 * 1e18;
          bridge_allowance = await GContractInstance.methods.allowance(address, asset.bridge_address).call();
        } else {
          asset_balance = await BaseContractInstance.methods.balanceOf(address).call();
          asset_allowance = await BaseContractInstance.methods.allowance(address, asset.gtoken_address).call();
        }
      }
  
      this.setState({
        total_supply, deposit_fee, withdrawal_fee, exchange_rate, total_reserve, 
        total_reserve_underlying, underlying_balance, 
        asset_balance, g_balance, isLoading: false, 
        underlying_allowance, asset_allowance, bridge_allowance
      });
    }
  
    toggleModal = (modal_type) => {
      this.setState({show: !this.state.show, isLoading: true});
      this.fetchBalance();
  
      if (modal_type) {
        this.changeType(modal_type);
      }
    }
  
  
    changeType = (modal_type) => {
      const {currentSwap} = this.props;
      if (currentSwap) return;
      this.setState({modal_type});
    }
  
    handleInputChange = (value) => {
      const {modal_type, is_native} = this.state;
      
      if (value < 0) {
        this.setState({value: 0});
      } else {
  
        // Route total logic
        if (modal_type === 'mint') {
          this.calculateMintingTotal(value);
  
          // Route native field
          if (is_native) {
            this.setState({value_native: value})
          } else {
            this.setState({value_base: value});
          }
        } 
      
        if (modal_type === 'redeem') {
          this.calculateBurningTotal(value, true);
          this.setState({value_redeem: value})
        }
      }
    }
  
    calculateBurningFee = () => {
      const {asset} = this.props;
      const total_minting = ((1 - asset.burning_fee) * asset.base_total_supply) / asset.total_supply;
      return total_minting;
    }
  
    getWei = (value_number, decimals) => {
      const {web3} = this.props;
      if (decimals === 1e18) {
        const value = value_number.toString();
        return web3.utils.toWei(value);
      }
      if (decimals === 1e8) {
        return value_number * 1e8;
      }
      if (decimals === 1e6) {
        const value = value_number.toString();
        return web3.utils.toWei(value, 'mwei');
      }
    }
  
    
    toggleNativeSelector = () => {
      this.setState({is_native: !this.state.is_native})
  
    }
  
    parseNumber = (number, decimals) => {
      const float_number = number / decimals;
      
      if (float_number < 1000) {
        return Math.round(float_number * 1e6) / 1e6;
      } else {
        return (Math.round(float_number * 100) / 100).toLocaleString('en-En');
      }
      
    }
  
    handleDeposit = async () => {
      const {
        asset, web3, address,
        mintGTokenFromCToken,
        mintGTokenFromBridge,
        mintGTokenFromUnderlying,
        mintGTokenFromUnderlyingBridge
      } = this.props;
  
      const { is_native, value_base, value_native, total_native, total_base, isMintMax, isMintUnderlyingMax, underlying_balance, asset_balance } = this.state;
  
      // Avoid clicks when the user is not allowed to make an action
      if (this.isDisabled()) return alert('Insufficient Balance');
      
      // Handle depending the asset
      if (is_native) {
  
        let GContractInstance;

          if (asset.type === types.TYPE_ETH) {
              const _cost = numberToBN(value_native, asset.underlying_decimals);
              GContractInstance = await new web3.eth.Contract(asset.bridge_abi, asset.bridge_address);
              mintGTokenFromUnderlyingBridge({
                  GContractInstance, 
                  _cost, 
                  growthToken: asset.gtoken_address,
                  address,
                  web3,
                  asset: {
                  from: asset.native,
                  to: asset.g_asset,
                  sending: _cost,
                  receiving: total_native,
                  fromDecimals: asset.underlying_decimals,
                  toDecimals: asset.base_decimals,
                  fromImage: asset.native_img_url,
                  toImage: asset.gtoken_img_url,
                  },
                  toggle: this.toggleModal
              })
          } else {
              const _cost = isMintUnderlyingMax ? underlying_balance : numberToBN(value_native, asset.underlying_decimals);
              GContractInstance = await new web3.eth.Contract(asset.gtoken_abi, asset.gtoken_address);
              mintGTokenFromUnderlying({
                  GContractInstance, 
                  _cost, 
                  address,
                  web3,
                  asset: {
                  from: asset.native,
                  to: asset.g_asset,
                  sending: _cost,
                  receiving: total_native,
                  fromDecimals: asset.underlying_decimals,
                  toDecimals: asset.base_decimals,
                  fromImage: asset.native_img_url,
                  toImage: asset.gtoken_img_url,
                  },
                  toggle: this.toggleModal
              })
          }          

      } else {
        let GContractInstance;

        if (asset.type === types.GETH) {
            const _cost = numberToBN(value_base, asset.base_decimals);
            GContractInstance = await new web3.eth.Contract(asset.bridge_abi, asset.bridge_address);
            mintGTokenFromBridge({
                GContractInstance, 
                _cost,
                growthToken: asset.gtoken_address,
                address,
                web3,
                asset: {
                    from: asset.base_asset ,
                    to: asset.g_asset,
                    sending: _cost,
                    receiving: total_base,
                    fromDecimals: asset.base_decimals,
                    toDecimals: asset.base_decimals,
                    fromImage: asset.img_url,
                    toImage: asset.gtoken_img_url,
                },
                toggle: this.toggleModal
            }) 
        } else {
            GContractInstance = await new web3.eth.Contract(asset.gtoken_abi, asset.gtoken_address);
            const _cost = isMintMax ? asset_balance : numberToBN(value_base, asset.base_decimals);
            mintGTokenFromCToken({
                GContractInstance, 
                _cost, 
                address,
                web3,
                asset: {
                from: asset.base_asset ,
                to: asset.g_asset,
                sending: _cost,
                receiving: total_base,
                fromDecimals: asset.base_decimals,
                toDecimals: asset.base_decimals,
                fromImage: asset.img_url,
                toImage: asset.gtoken_img_url,
                },
                toggle: this.toggleModal
            }) 
        }
      }
    }
  
  
    handleRedeem = async () => {
      const {
        asset, web3, address,
        redeemGTokenToCToken,
        redeemGTokenToUnderlying,
        redeemGTokenToBridge,
        redeemGTokenToUnderlyingBridge
      } = this.props;
  
      const { is_native, value_redeem, total_native_cost_redeem, total_base_cost_redeem, total_native_redeem, total_base_redeem, isRedeemMax , g_balance} = this.state;
      
      // Validate Balance
      if (this.isDisabled()) return alert('Insufficient Balance');;

      const _grossShares = isRedeemMax ? g_balance : numberToBN(value_redeem, asset.base_decimals);
  
      // Handle depending the asset
      if (is_native) {
        let GContractInstance;
        
        if (asset.type === types.TYPE_ETH) {
            GContractInstance = await new web3.eth.Contract(asset.bridge_abi, asset.bridge_address);
            redeemGTokenToUnderlyingBridge({
                GContractInstance, 
                _grossShares,
                growthToken: asset.gtoken_address,
                address,
                web3,
                asset: {
                    from: asset.g_asset,
                    to: asset.native,
                    sending: total_native_cost_redeem,
                    receiving: total_native_redeem,
                    fromDecimals: asset.base_decimals,
                    toDecimals: asset.underlying_decimals,
                    fromImage: asset.gtoken_img_url,
                    toImage: asset.native_img_url,
                },
                toggle: this.toggleModal
            })

        } else {
            GContractInstance = await new web3.eth.Contract(asset.gtoken_abi, asset.gtoken_address);
            redeemGTokenToUnderlying({
                GContractInstance, 
                _grossShares,
                address,
                web3,
                asset: {
                    from: asset.g_asset,
                    to: asset.native,
                    sending: total_native_cost_redeem,
                    receiving: total_native_redeem,
                    fromDecimals: asset.base_decimals,
                    toDecimals: asset.underlying_decimals,
                    fromImage: asset.gtoken_img_url,
                    toImage: asset.native_img_url,
                },
                toggle: this.toggleModal
            })
        }
        


    } else {

        let GContractInstance;

        if (asset.type === types.GETH) {
            GContractInstance = await new web3.eth.Contract(asset.bridge_abi, asset.bridge_address);
            redeemGTokenToBridge({
                GContractInstance, 
                _grossShares,
                growthToken: asset.gtoken_address,
                address,
                web3,
                asset: {
                    from: asset.g_asset,
                    to: asset.base_asset,
                    sending: total_native_cost_redeem,
                    receiving: total_base_redeem,
                    fromDecimals: asset.base_decimals,
                    toDecimals: asset.base_decimals,
                    fromImage: asset.gtoken_img_url,
                    toImage: asset.img_url,
                },
                toggle: this.toggleModal
            })
        } else {
            GContractInstance = await new web3.eth.Contract(asset.gtoken_abi, asset.gtoken_address);
            redeemGTokenToCToken({
                GContractInstance, 
                _grossShares,
                address,
                web3,
                asset: {
                    from: asset.g_asset,
                    to: asset.base_asset,
                    sending: total_native_cost_redeem,
                    receiving: total_base_redeem,
                    fromDecimals: asset.base_decimals,
                    toDecimals: asset.base_decimals,
                    fromImage: asset.gtoken_img_url,
                    toImage: asset.img_url,
                },
                toggle: this.toggleModal
            })
        }   
      }
    }
    
    // Check if a button should be disabled
    isDisabled = () => {
      const { asset, currentSwap } = this.props;
      if (currentSwap) return true;
      const {
        modal_type, is_native,
        value_base, value_native, value_redeem,
        underlying_balance, asset_balance, g_balance
      } = this.state;
  
      // Validate when input a mint function
      if (modal_type === 'mint') {
        // Validate against native balance
        if (is_native) {
          if (!value_native || Number(value_native) <= 0) return true;
          return  Number(value_native * asset.underlying_decimals) > Number(underlying_balance);
        } else {
          if (!value_base || Number(value_base) <= 0) return true;
          return Number(value_base * asset.base_decimals) > Number(asset_balance);
        }
      }
  
      if (modal_type === 'redeem') {
        if (!value_redeem) return true;
        return Number(value_redeem * asset.base_decimals) > Number(g_balance);
      }
      return true;
    }
  
    // Check for allowance 
    hasEnoughAllowance = () => {
      const {asset} = this.props;
      const {value_native, value_base, underlying_allowance, asset_allowance, is_native} = this.state;
  
      // Only apppliable on Mint
      if (is_native) {
        if (!value_native || !underlying_allowance) return true;
        return Number(value_native * asset.underlying_decimals) <= Number(underlying_allowance);
      } else {
        if (!value_base || !asset_allowance) return true;
        return Number(value_base * asset.base_decimals) <= Number(asset_allowance);
      }
  
    }
  
    // Update the current balance on allowance 
    updateApprovalBalance = (total_supply) => {
      const {is_native} = this.state;
      if (is_native) {
        this.setState({underlying_allowance: total_supply});
      } else {
        this.setState({asset_allowance: total_supply});
      }
    }
  
    // Calculate correct fee
    calculateFee = () => {
      const { asset } = this.props;
      const {is_native, modal_type, deposit_fee, withdrawal_fee, value_native, value_base, value_redeem, total_supply, total_reserve } = this.state;
  
      if (!deposit_fee || !withdrawal_fee) return 0;

      const assetPrice = total_reserve / total_supply;
  
      // Validate when input a mint function
      if (modal_type === 'mint') {
        // Validate against native balance
        if (is_native) {
          if (!value_native || Number(value_native) <= 0) return true;
          return  Number(value_native * asset.underlying_decimals) * (deposit_fee / 1e18) * assetPrice;
        } else {
          if (!value_base || Number(value_base) <= 0) return true;
          return Number(value_base * asset.base_decimals) * (deposit_fee / 1e18) * assetPrice;
        }
      }
  
      if (modal_type === 'redeem') {
        return Number(value_redeem * asset.base_decimals) * (withdrawal_fee / asset.base_decimals) * assetPrice;
      }
    }


    // Get current asset price
    getPrice = (is_native, revert) => {
      const { asset } = this.props; 
      const {total_supply, total_reserve, total_reserve_underlying} = this.state;
      if (!asset) return '-';

      if (!asset || !total_supply || !total_reserve ) return '-';

      if (is_native) {
        if (revert) {
            let price = Math.round((total_supply / asset.base_decimals) / (total_reserve_underlying / asset.underlying_decimals) * 10000) / 10000;
            return `${price} ${asset.g_asset} = 1 ${asset.native}`
        } else {
            let price = Math.round((total_supply / asset.base_decimals)  / (total_reserve_underlying / asset.underlying_decimals) * 10000) / 10000;
            return `${price} ${asset.g_asset} = 1 ${asset.native}`
        }
      } else {
          if (revert) {
              let price = Math.round(total_reserve / total_supply * 10000) / 10000;
              return `${price} ${asset.base_asset} = 1 ${asset.g_asset}`
          } else {
          let price = Math.round(total_supply / total_reserve * 10000) / 10000;
              return `${price} ${asset.g_asset} = 1 ${asset.base_asset}`
          }
      }
    }
  
    abbreviateNumber = (value) => {
      var newValue = value;
      if (value >= 1000) {
          var suffixes = ["", "K", "M", "B","T"];
          var suffixNum = Math.floor( (""+value).length/3 );
          var shortValue = '';
          for (var precision = 2; precision >= 1; precision--) {
              shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
              var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
              if (dotLessShortValue.length <= 2) { break; }
          }
          if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
          newValue = shortValue+suffixes[suffixNum];
      }
      return newValue;
    }

    render() {
        const {type, asset, isMobileDrawerOpen, toggleMobileDrawer, currentSwap, web3, drawer_type, toggleDrawerType} = this.props;
        const {modal_type, is_native, value_base, value_native, value_redeem, total_supply, total_reserve, isLoading, deposit_fee, withdrawal_fee, total_native, total_base, total_base_redeem, total_native_redeem} = this.state;
        if (web3 && !total_supply) {
          this.fetchBalance();
        }
        return (
            <div>
                <Drawer.Drawer 
                    open={isMobileDrawerOpen}
                >
                   <Drawer.Trigger>
                        {this.props.children}
                    </Drawer.Trigger>
                    <Drawer.Target 
                        placement="right"
                        preventScroll={true}
                    >
                        <Container
                          drawer_type={drawer_type}
                        >
                          <ActionRow justify="space-between">
                            <ActionCol onClick={() => toggleMobileDrawer()}>
                              <Icon icon={chevronCircleLeft} style={{margin: '-2.5px 5px 0 5px', color: '#161d6b'}} /> 
                              <PrimaryLabel>RETURN</PrimaryLabel>
                            </ActionCol>
                            {drawer_type === 'interaction' && (
                              <ActionCol onClick={() => toggleDrawerType()}>
                                <PrimaryLabel>STATS</PrimaryLabel>
                                <Icon icon={areaChart} style={{margin: '-2.5px 5px 0 10px', color: '#161d6b'}} /> 
                              </ActionCol>
                            )}
                            {drawer_type === 'stats' && (
                              <ActionCol onClick={() => toggleDrawerType()}>
                                <PrimaryLabel>DEPOSIT</PrimaryLabel>
                                <Icon icon={exchange} style={{margin: '-2.5px 5px 0 10px', color: '#161d6b'}} /> 
                              </ActionCol>
                            )}
                            
                          </ActionRow>
                          {drawer_type === 'interaction' && (
                            <React.Fragment>
                              <AmountInput 
                                {...this.props}
                                {...this.state}
                                handleChange={this.handleChange}
                                getWei={this.getWei}
                              />
                              {(asset.type === types.TYPE1 || asset.type === types.TYPE_ETH) && (
                                <AssetTypeToggle 
                                  {...this.props}
                                  {...this.state}
                                  toggleNativeSelector={this.toggleNativeSelector}
                                />
                              )} 
                              {currentSwap ? (
                                <SwapView
                                  type={modal_type}
                                >
                                  <SwapContainer> 
                                    <SwapSection>
                                      <SwapColumn>
                                        <SwapLogo src={require(`images/tokens/${currentSwap.fromImage}`)}/>
                                      </SwapColumn>
                                      <SwapColumn flex="3">
                                        <StyledText size="1em">{this.parseNumber(currentSwap.sending, currentSwap.fromDecimals)}</StyledText>
                                        <StyledText>{currentSwap.from}</StyledText>
                                      </SwapColumn>
                                    </SwapSection>
                                    <div style={{display: 'flex', justifyItems: 'center', height: '50px', alignItems: 'center', color: 'white'}} color="white">
                                      <Icon icon={exchange} size="1.5em" />
                                    </div>
                                    <SwapSection>
                                      <SwapColumn>
                                        <SwapLogo src={require(`images/tokens/${currentSwap.toImage}`)}/>
                                      </SwapColumn>
                                      <SwapColumn flex="3">
                                        <StyledText size="1em">{this.parseNumber(currentSwap.receiving, currentSwap.toDecimals)}</StyledText>
                                        <StyledText>{currentSwap.to}</StyledText>
                                      </SwapColumn>
                                    </SwapSection>
                                  </SwapContainer>
                                  {currentSwap.status === 'loading' && (
                                    <StyledText modal_type={currentSwap.modal_type} size="0.9em" margin="1em 0 0 0" style={{width: '250px'}}>Waiting for Confirmation</StyledText>
                                  )}
                                  {currentSwap.status === 'confirmed' && (
                                    <StyledText modal_type={currentSwap.modal_type} size="0.9em" margin="1em 0 0 0" style={{width: '250px'}}>Transaction Confirmed</StyledText>
                                  )}
                                  {currentSwap.status === 'receipt'  && (
                                    <StyledText modal_type={currentSwap.modal_type} size="0.9em" margin="1em 0 0 0" style={{width: '250px'}}>Transaction ID</StyledText>
                                  )}
                                  {(currentSwap.status === 'receipt' || currentSwap.status === 'confirmed')  && (
                                    <StyledLink href={`https://etherscan.io/tx/${currentSwap.hash}`} target="_blank" modal_type={currentSwap.modal_type} size="0.9em" margin="1em 0 0 0" style={{width: '250px'}}>{currentSwap.hash}</StyledLink>
                                  )}
                                </SwapView>
                              ) : (
                                <Summary>
                                  <SummaryRow>
                                    <SummaryColumn flex="1">
                                      <PrimaryLabel>PRICE</PrimaryLabel>
                                    </SummaryColumn>
                                    <SummaryColumn align="flex-end" flex="2.5">
                                      <SummaryRow>
                                        <PrimaryLabel margin="0 5px 0 5px">{this.getPrice(is_native, true)}</PrimaryLabel>
                                      </SummaryRow>
                                    </SummaryColumn>
                                  </SummaryRow>
                                  <SummaryRow>
                                    <SummaryColumn>
                                      <PrimaryLabel>{asset.base_asset} RESERVE</PrimaryLabel>
                                    </SummaryColumn>
                                    <SummaryColumn align="flex-end">
                                      <PrimaryLabel>{total_reserve && Math.round(total_reserve / asset.base_decimals).toLocaleString('En-en')} {asset.base_asset}</PrimaryLabel>
                                    </SummaryColumn>
                                  </SummaryRow>
                                  <SummaryRow>
                                    <SummaryColumn>
                                      <PrimaryLabel>{asset.g_asset} SUPPLY</PrimaryLabel>
                                    </SummaryColumn>
                                    <SummaryColumn align="flex-end">
                                      <PrimaryLabel>
                                        {total_supply && Math.round(total_supply / asset.base_decimals).toLocaleString('En-en')} {asset.g_asset}
                                      </PrimaryLabel>
                                    </SummaryColumn>
                                  </SummaryRow>
                                  <SummaryRow>
                                    <SummaryColumn flex="1">
                                      <SummaryRow>
                                        <PrimaryLabel margin="0 5px 0 0">FEE</PrimaryLabel>
                                      </SummaryRow>
                                    </SummaryColumn>
                                    <SummaryColumn align="flex-end" flex="3">
                                        {modal_type === 'mint' && <PrimaryLabel spacing="1px">{this.parseNumber(this.calculateFee(), is_native ? asset.underlying_decimals : asset.base_decimals).toLocaleString('en-En')} {is_native ? asset.native : asset.base_asset}  ({this.parseNumber(deposit_fee, 1e16).toFixed(2)}%)</PrimaryLabel>}
                                        {modal_type === 'redeem' && <PrimaryLabel spacing="1px">{this.parseNumber(this.calculateFee(), 1e18).toLocaleString('en-En')} {asset.g_asset}  ({this.parseNumber(withdrawal_fee, 1e16).toFixed(2)}%)</PrimaryLabel>}   
                                    </SummaryColumn>
                                  </SummaryRow>
                                  <SummaryRow>
                                    <SummaryColumn flex="1">
                                      <SummaryRow>
                                        <PrimaryLabel margin="0 5px 0 0">TOTAL</PrimaryLabel>
                                        {/* <BsInfoCircleFill style={{color: '#BEBEBE' }} /> */}
                                      </SummaryRow>
                                    </SummaryColumn>
                                    <SummaryColumn align="flex-end" flex="3">
                                      {modal_type === 'mint'&& is_native && <PrimaryLabel spacing="1px">{total_native ? this.parseNumber(total_native, asset.base_decimals) : '-'} {asset.g_asset}</PrimaryLabel>}
                                      {modal_type === 'mint'&& !is_native && <PrimaryLabel spacing="1px">{total_base ? this.parseNumber(total_base, asset.base_decimals) : '-'} {asset.g_asset}</PrimaryLabel>}
                                      {modal_type === 'redeem'&& is_native && <PrimaryLabel spacing="1px">{total_native_redeem ? this.parseNumber(total_native_redeem, asset.underlying_decimals) : '-'} {asset.native}</PrimaryLabel>}
                                      {modal_type === 'redeem'&& !is_native && <PrimaryLabel spacing="1px">{total_base_redeem ? this.parseNumber(total_base_redeem, asset.base_decimals) : '-'} {asset.base_asset}</PrimaryLabel>}
                                    </SummaryColumn>
                                  </SummaryRow>
                                  <SummaryRow justify="center" flex="2">
                                  {modal_type === 'mint' &&  (
                                    <React.Fragment>
                                      {this.hasEnoughAllowance() ? (
                                        <ActionConfirmButton
                                          asset={asset}
                                          modal_type={modal_type}
                                          onClick={() => this.handleDeposit()}
                                          disabled={this.isDisabled()}
                                        >
                                          {this.isDisabled() ? 'NOT ENOUGH BALANCE' : asset.type === types.STKGRO ? 'CONFIRM STAKE' : 'CONFIRM MINT'}
                                        </ActionConfirmButton>
                                      ) : (
                                        <ApproveContainer 
                                          {...this.props}
                                          {...this.state}
                                          updateApprovalBalance={this.updateApprovalBalance}
                                        />
                                      )}
                                    </React.Fragment>
                                  )}
                                  {modal_type === 'redeem' &&  (
                                    <ActionConfirmButton 
                                      asset={asset}
                                      modal_type={modal_type}
                                      onClick={() => this.handleRedeem()}
                                      disabled={this.isDisabled()}
                                    >
                                      {this.isDisabled() ? 'NOT ENOUGH BALANCE' :  asset.type === types.STKGRO ? 'CONFIRM UNSTAKE' : 'CONFIRM REDEEM'}
                                    </ActionConfirmButton>
                                  )}
                                  </SummaryRow>
                                </Summary>
                              )}
                              <MobileTabs 
                                {...this.props}
                                {...this.state}
                                handleChange={this.handleChange}
                              />
                              </React.Fragment>
                            )}
                            {drawer_type === 'stats' && (
                              <StatsSection 
                                {...this.props}
                                {...this.state}
                                toggleDrawerType={this.toggleDrawerType}
                              />
                            )}
                        </Container>
                    </Drawer.Target>
                </Drawer.Drawer>
            </div>
            
        )
    }
}
