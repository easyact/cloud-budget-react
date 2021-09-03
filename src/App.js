import './App.css'
import {Link, Route, Routes} from 'react-router-dom'
import {FaChartPie, FaSync, FaUmbrellaBeach} from 'react-icons/all'
import BudgetView from './components/BudgetView'
import {LandingPage} from './components/LandingPage'
import {useState} from 'react'
import Profile from './auth/Profile'
import {useAuth0} from '@auth0/auth0-react'
import {LoggedIn} from './auth/LoggedIn'
import {init} from './util/analytics'
import {Price} from './components/price/Price'
import {Pay} from './components/price/Pay'
import {Sync} from './components/Sync'
import {useSegmentPages} from './util/segment'
import {DreamView} from './components/DreamView'
import './i18n'
import {Privacy} from './Privacy'

function App() {
    init()
    useSegmentPages()
    const [active, setActive] = useState(false)
    const {isAuthenticated} =
        // {isAuthenticated: true}
        useAuth0()
    return <div className="App">
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
                            <FaChartPie/>
                            <span>预算</span>
                        </Link>
                        <Link to="dream" className="navbar-item">
                            <FaUmbrellaBeach/>
                            <span>圆梦计划</span>
                        </Link>
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
            <Route path="dream" element={<DreamView/>}/>
            <Route path="sync" element={<Sync/>}/>
            <Route path="loggedIn" element={<LoggedIn/>}/>
            <Route path="price" element={<Price/>}/>
            <Route path="pay" element={<Pay/>}/>
            <Route path="privacy" element={<Privacy/>}/>
        </Routes>
        <footer className="footer">
            <div className="columns">
                <div className="column">
                    {/*<p className="bd-footer-link-title"></p>*/}
                    <p><a href="https://beian.miit.gov.cn/">沪ICP备2021014272号</a></p>
                    <p>v{process.env.REACT_APP_VERSION}-{process.env.NODE_ENV}</p>
                </div>
                <div className="column">
                    <p><Link to="privacy">隐私政策</Link></p>
                </div>
            </div>
        </footer>
    </div>
}

export default App
