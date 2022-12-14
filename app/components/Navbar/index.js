/**
 *
 * Navbar
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';
import {Link} from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import styled from 'styled-components';

import { Icon } from 'react-icons-kit';
import {list} from 'react-icons-kit/fa/list'
import {lineChart} from 'react-icons-kit/fa/lineChart';
import {exchange} from 'react-icons-kit/fa/exchange';
import {suitcase} from 'react-icons-kit/fa/suitcase';

import {isMobile} from 'react-device-detect';

const NavbarContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 1.5em 1em 0 1em;
  padding: 0 0 1em 0;
  color: white;
  border-bottom-style: solid;
  border-bottom-width: 2px;
  border-bottom-color: white;
  ${props => props.isMobile && 'visibility: hidden; height: 0; margin: 0;'}
  
`

const NavbarTab = styled.div`
  display: flex;
  flex-direction: row;
  outline: none;
  box-shadow: none;
  min-width: 100px;
  justify-content: space-around;
  align-items: center;
  margin: 0 0.5em 0 0.5em;
  padding: 0.5em 1em 0.5em 1em;
  border-radius: 5px;
  ${props => props.active && `
    background-color: #00d395;
    -webkit-box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.75);
    -moz-box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.75);
    box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.75);
  `}
  -moz-transition: background-color 0.15s linear;
  -webkit-transition: background-color 0.15s linear;
  -o-transition: background-color 0.15s linear;
  transition: background-color 0.15s linear;

  &:hover {
    cursor: pointer;
    opacity: ${props => !props.active && '0.65'};
  }
`

const NavbarColumn = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: ${props => props.justify || 'flex-start'};
`


const StyledMessage = styled.div`
  margin: 0 0.5em 0 1em;
  outline: none;
  box-shadow: none;
  width: 100%;
`

const StyledLink = styled(Link)`
  text-decoration: none;
  color: white;
  outline: none;
  box-shadow: none;
`

class Navbar extends React.Component {

  state = {
    active: '/',
  }

  // Detect the active key depending on the route
  componentDidMount = () => {
    const {pathname} = window.location;
    this.setState({active: pathname});
  }

  selectActive = (active) => {
    this.setState({active});
  }

  render () {
    const {active} = this.state;
     return ( 
      <NavbarContainer
        isMobile={isMobile}
      >
        <NavbarColumn>
          <StyledLink to="/"
            onClick={() => this.selectActive('/')}
          >
            <NavbarTab 
              active={active === '/'}
              onClick={() => this.selectActive('/')}
            >
              <Icon icon={lineChart} style={{margin: '-3px 0 0 0'}}/>
              <StyledMessage>
                <FormattedMessage {...messages.invest} />
              </StyledMessage>
            </NavbarTab>
          </StyledLink>
          <StyledLink to="/swap"
            onClick={() => this.selectActive('/swap')}
          >
            <NavbarTab 
              active={active === '/swap'}
              onClick={() => this.selectActive('/swap')}
            >
              <Icon icon={exchange} style={{margin: '-3px 0 0 0'}}/>
              <StyledMessage>
                <FormattedMessage {...messages.swap} />
              </StyledMessage>
            </NavbarTab>
          </StyledLink>
        </NavbarColumn>
        <NavbarColumn justify="flex-end">
          {/* <StyledLink to="/vote">
            <NavbarTab
              active={active === '/vote'}
              onClick={() => this.selectActive('/vote')}
            >
              <FaVoteYea />
              <StyledMessage>
                <FormattedMessage {...messages.vote} />
              </StyledMessage>
            </NavbarTab>
          </StyledLink> */}
          <StyledLink to="/transactions" 
            onClick={() => this.selectActive('/transactions')}
          >
            <NavbarTab
              active={active === '/transactions'}
              onClick={() => this.selectActive('/transactions')}
            >
              <Icon icon={list} style={{margin: '-3px 0 0 0'}}/>
              <StyledMessage>
                <FormattedMessage {...messages.transactions} />
              </StyledMessage>
            </NavbarTab>
          </StyledLink>
          <StyledLink to="/balance"
            onClick={() => this.selectActive('/balance')}
          >
            <NavbarTab
              active={active === '/balance'}
              onClick={() => this.selectActive('/balance')}
            >
              <Icon icon={suitcase} style={{margin: '-3px 0 0 0'}}/>
              <StyledMessage>
                <FormattedMessage {...messages.balance} />
              </StyledMessage>
            </NavbarTab>
          </StyledLink>
        </NavbarColumn>


      </NavbarContainer>
    );
  }
 
}

Navbar.propTypes = {};

export default Navbar;
