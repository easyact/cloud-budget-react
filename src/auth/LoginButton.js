import React from 'react'
import {useAuth0} from '@auth0/auth0-react'

const LoginButton = ({fullWidth = false}) => {
    const {loginWithRedirect} = useAuth0()

    return <button className={`button is-success ${fullWidth ? 'is-fullwidth' : ''}`}
                   onClick={() => loginWithRedirect()}>登录</button>
}

export default LoginButton
