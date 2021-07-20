import './App.css'
import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom'
import {FaCalendarAlt, FaSync} from 'react-icons/all'
import BudgetView from './components/BudgetView'
import {LandingPage} from './components/LandingPage'
import {useState} from 'react'
import Profile from './auth/Profile'
import {useAuth0} from '@auth0/auth0-react'
import LoginButton from './auth/LoginButton'
import {LoggedIn} from './auth/LoggedIn'
import {init} from './components/budget/service/analytics'
import {Price} from './components/price/Price'

function Sync() {
    return <div className="hero is-light">
        <div className="hero-body">
            <p>登录后即可同步至云端</p>
            <LoginButton/>
        </div>
    </div>
}

function App() {
    init()
    const [active, setActive] = useState(false)
    const {isAuthenticated} =
        // {isAuthenticated: true}
        useAuth0()
    return <Router>
        <div className="App">
            <header>
                <nav className="navbar has-shadow is-primary">
                    <div className="navbar-brand">
                        <Link className="navbar-item" to="/">
                            <img alt="EasyAct" src={'logo.png'}/>
                        </Link>
                        <div className="navbar-item">
                            <small>云预算: 从996到财务自由</small>
                        </div>
                        <div onClick={() => setActive(!active)}
                             className={`navbar-burger burger ${active ? 'is-active' : null}`}>
                            <span/>
                            <span/>
                            <span/>
                        </div>
                    </div>
                    <div className={`navbar-menu ${active ? 'is-active' : null}`}>
                        <div className="navbar-start">
                            <Link to="budget" className="navbar-item">
                                <FaCalendarAlt/>
                                <span>预算</span>
                            </Link>
                            {/*<Link to="target" className="navbar-item">*/}
                            {/*    <FaDoorOpen/>*/}
                            {/*    <span>目标</span>*/}
                            {/*</Link>*/}
                            {isAuthenticated ? null : <Link to="sync" className="navbar-item">
                                <FaSync/>
                                <span>同步至云端</span>
                            </Link>}
                            {/*<div className="navbar-item">*/}
                            {/*    定价(限时免费)*/}
                            {/*</div>*/}
                            <Link to="price" className="navbar-item">
                                定价
                            </Link>
                        </div>
                        <div className="navbar-end"><Profile/></div>
                    </div>
                </nav>

                {/*<UserPicker/>*/}
            </header>

            <Routes>
                <Route path="" element={<LandingPage/>}/>
                <Route path="budget" element={<BudgetView/>}/>
                <Route path="target" element={<BudgetView/>}/>
                <Route path="sync" element={<Sync/>}/>
                <Route path="loggedIn" element={<LoggedIn/>}/>
                <Route path="price" element={<Price/>}/>
            </Routes>
            <footer className="footer">
                <div className="columns">
                    <div className="column is-3">
                        {/*<p className="bd-footer-link-title"></p>*/}
                        <p><a href="https://beian.miit.gov.cn/">沪ICP备2021014272号</a></p>
                        <p>v{process.env.REACT_APP_VERSION}-{process.env.NODE_ENV}</p>
                    </div>
                </div>
            </footer>
        </div>
    </Router>
}

export default App
