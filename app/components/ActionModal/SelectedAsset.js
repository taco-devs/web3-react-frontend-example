import React, { Component } from 'react';
import styled from 'styled-components';

const IconLogo = styled.img`
  height: 25px;
  width: 25px;
`

const AssetLabel = styled.b`
  color: #161d6b;
  font-size: 0.85em;
`

const SelectorRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  border-radius: 5px;
  padding: 5px 0 5px 0;
`

const SelectedAsset = ({modal_type, is_native, asset, calcFromCost}) => {
    return (
        <>
            {modal_type === 'mint' && !calcFromCost && (
                <SelectorRow>
                    <IconLogo src={require(`images/tokens/${asset.gtoken_img_url}`)}/>
                    <AssetLabel>{asset.g_asset}</AssetLabel>
                </SelectorRow>
            )}
            {modal_type === 'mint' && is_native && calcFromCost && (
                <SelectorRow>
                    <IconLogo src={require(`images/tokens/${asset.native_img_url}`)}/>
                    <AssetLabel>{asset.native}</AssetLabel>
                </SelectorRow>
            )}
            {modal_type === 'mint' && !is_native && calcFromCost && (
                <SelectorRow>
                    <IconLogo src={require(`images/tokens/${asset.img_url}`)}/>
                    <AssetLabel>{asset.base_asset}</AssetLabel>
                </SelectorRow>
                
            )}
            {modal_type === 'redeem' && calcFromCost && (
                <SelectorRow>
                   <IconLogo src={require(`images/tokens/${asset.gtoken_img_url}`)}/> 
                    <AssetLabel>{asset.g_asset}</AssetLabel>
                </SelectorRow>
                
            )}
            {modal_type === 'redeem' && is_native && !calcFromCost && (
                <SelectorRow>
                  <IconLogo src={require(`images/tokens/${asset.native_img_url}`)}/>  
                  <AssetLabel>{asset.native}</AssetLabel>
                </SelectorRow>
                
            )}
            {modal_type === 'redeem' && !is_native && !calcFromCost && (
                <SelectorRow>
                    <IconLogo src={require(`images/tokens/${asset.img_url}`)}/>
                    <AssetLabel>{asset.base_asset}</AssetLabel> 
                </SelectorRow>
                
            )}
        </>
    )
}

export default SelectedAsset;