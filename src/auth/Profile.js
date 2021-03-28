import React from 'react'
import {useAuth0} from '@auth0/auth0-react'
import LogoutButton from './LogoutButton'
import LoginButton from './LoginButton'
import {FaBug, FaSignOutAlt} from 'react-icons/all'
import Loading from './Loading'

const Profile = () => {
    const {user, isAuthenticated, isLoading} = useAuth0()

    if (isLoading) {
        return <div className="navbar-item"><Loading/></div>
    }

    return isAuthenticated ? <div className="navbar-item has-dropdown is-hoverable">
        <div className="navbar-link" style={{marginLeft: '100px'}}>
            {user.name}
        </div>
        <div className="navbar-dropdown">
            <img className="navbar-item" src={user.picture} alt={user.name}/>
            <div className="navbar-item">{user.email}</div>
            <a href="https://jinshuju.net/f/JXBXK2" className="navbar-item" target="_blank" rel="noreferrer">
                <FaBug className="is-small"/>
                上报bug
            </a>
            <hr className="navbar-divider"/>
            <LogoutButton className="navbar-item">
                <FaSignOutAlt className="is-small"/> 登出
            </LogoutButton>
        </div>
    </div> : <div className="navbar-item field is-grouped is-grouped-multiline">
        <p className="control">
            <LoginButton/>
        </p>
    </div>
}

export default Profile
