import React, { Component } from 'react';
import AssetCard from './AssetCard';
import styled from 'styled-components';
import NetworkData from 'contracts';
import { Icon } from 'react-icons-kit';
import {info} from 'react-icons-kit/icomoon/info';
import ReactTooltip from 'react-tooltip';

const AssetContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: ${props => props.isMobile ? '0' : '1em 0 1em 0'} ;
`

const AssetHeader = styled.div`
    display: flex;
    flex-direction: row;
    color: white;
    margin: ${props => props.isMobile ? '0' : '0 2em 0 2em'};
    font-size: 0.80em;
`

const AssetHeaderColumn = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex: ${props => props.flex || '1'};
    margin: ${props => props.margin || '0'};
`


export default class AssetList extends Component {

    state = {
        currentOpenExtension: null,
    }

    showAvailableAssets = (currentOpenExtension) => {
        const {assets, pagination, Network, search} = this.props;
        if (!assets || !Network) return;
        const assets_per_page = 10;
        const slice_start = pagination * assets_per_page;
        const slice_end = (pagination + 1) * assets_per_page;
        const page_assets = 
            assets
                .filter(asset_key => {
                    if (!search) return true;
                    if (search.length < 1) return true;
                    return `g${asset_key}`.toUpperCase().indexOf(search.toUpperCase()) > -1;
                })
                .slice(slice_start, slice_end);
                
        return page_assets.map((asset_key) => (
            <AssetCard  
                key={asset_key}
                {...this.props} 
                asset_key={asset_key}
                currentOpenExtension={currentOpenExtension}
                asset={Network.available_assets[asset_key]} 
                toggleExtension={this.toggleExtension}
            />
            )
        )
    }


    toggleExtension = (asset, asset_key) => {
        const {getTokenStats} = this.props;
        const {currentOpenExtension} = this.state;

        if (asset_key === currentOpenExtension) {
            this.setState({currentOpenExtension: null});
        } else {
            getTokenStats({token: asset.gtoken_address});
            this.setState({currentOpenExtension: asset_key});
        }        
    }


    render() {
        const {currentOpenExtension} = this.state;
        const {isMobile, web3} = this.props;
        return (
            <AssetContainer isMobile={isMobile}>
                <AssetHeader isMobile={isMobile}>
                    {/* !isMobile && (
                        <AssetHeaderColumn flex="0.5"/>
                    ) */}
                    <AssetHeaderColumn margin="0 0 0 1em">
                        <p>ASSET</p>
                    </AssetHeaderColumn>
                    <AssetHeaderColumn flex="1.25">
                        <p>MARKET SIZE</p>
                    </AssetHeaderColumn>
                    <AssetHeaderColumn>
                        <p>APY</p>
                        <Icon 
                            icon={info} 
                            style={{color: '#BEBEBE', margin: '0 0 0 10px' }} 
                            data-tip={`
                                 Annual Percentage Yield
                                 <br />
                                 <br />
                                 Rate of return earned on deposit
                                 <br />
                                considering compounding effects.

                            `} 
                        />
                    </AssetHeaderColumn>
                    {!isMobile && (
                        <AssetHeaderColumn flex="1.25">
                            <p>ACTIONS</p>
                        </AssetHeaderColumn>
                    )}
                </AssetHeader>
                {this.showAvailableAssets(currentOpenExtension)}
                <ReactTooltip multiline={true} place="right"/>
            </AssetContainer>     
        )
    }
}
