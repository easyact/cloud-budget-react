import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
// import './../node_modules/bulma/css/bulma.css'
import {Auth0Provider} from '@auth0/auth0-react'
import {BrowserRouter as Router} from 'react-router-dom'

export const domain = 'easyact.auth0.com'
export const scope = 'openid profile email read:current_user update:current_user_metadata offline_access'
export const audience = `https://${domain}/api/v2/`
ReactDOM.render(
    <Auth0Provider
        domain={domain}
        clientId="Bwz18PS92Z990oihatGERFIFrVsveVtm"
        redirectUri={window.location.origin + '/loggedIn'}
        // scope={scope}
        // audience={audience}
        // useRefreshTokens={true}
        // advancedOptions={{defaultScope: scope}}
        // prompt="none"
    >
        <Router><App/></Router>
    </Auth0Provider>,
    document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
