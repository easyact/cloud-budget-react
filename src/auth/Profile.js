import React from 'react'
import {useAuth0} from '@auth0/auth0-react'
import LogoutButton from './LogoutButton'
import LoginButton from './LoginButton'
import {Link} from 'react-router-dom'
import {FaBug, FaSignOutAlt} from 'react-icons/all'

const Profile = () => {
    const {user, isAuthenticated, isLoading} = useAuth0()

    if (isLoading) {
        return <div>Loading ...</div>
    }

    return isAuthenticated ? <div className="navbar-item has-dropdown is-hoverable">
        <div className="navbar-link" style={{'margin-right': '150px'}}>
            {user.name}
        </div>
        <div className="navbar-dropdown">
            <img src={user.picture} alt={user.name}/>
            <div>{user.email}</div>
            <Link to="https://jinshuju.net/f/JXBXK2" className="navbar-item">
                <div>
                    <FaBug className="is-small"/>
                    上报bug
                </div>
            </Link>
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
