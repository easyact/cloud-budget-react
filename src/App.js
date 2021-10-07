import './App.scss'
import {Link, Route, Routes} from 'react-router-dom'
import {FaChartPie, FaSync} from 'react-icons/all'
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
import {Doc} from './components/Doc'

// import 'bulma'

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
                        {/*<Link to="dream" className="navbar-item">*/}
                        {/*    <FaUmbrellaBeach/>*/}
                        {/*    <span>圆梦计划</span>*/}
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
                        <Link to="doc" className="navbar-item">
                            文档
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
            <Route path="doc" element={<Doc/>}/>
        </Routes>
        <footer className="footer">
            <div className="columns">
                <div className="column">
                    <p>技术支持电话/微信：17317767650</p>
                    <p>技术支持邮箱：support@easyact.cn</p>
                    <p><a href="https://tieba.baidu.com/f?kw=easyact">百度贴吧</a></p>
                </div>
                <div className="column">
                    <p><a href="https://jinshuju.net/f/KdziDP" className="button is-primary is-light">参与访谈成为内测用户</a></p>
                    <p>v{process.env.REACT_APP_VERSION}-{process.env.NODE_ENV}</p>
                </div>
                <div className="column">
                    <p><Link to="privacy">隐私政策</Link></p>
                    <p>上海易习互联网科技有限公司 ©2021</p>
                </div>
                <div className="column">
                    {/*<p className="bd-footer-link-title"></p>*/}
                    <p><a href="https://beian.miit.gov.cn/">沪ICP备2021014272号</a></p>
                    <div>
                        <a target="_blank"
                           href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31011502018266"
                           rel="noreferrer">
                            <img src="/beian.png" style={{float: 'left'}} alt=""/>
                            <p>沪公网安备 31011502018266号</p></a>
                    </div>
                    {/*<p>chrome</p>*/}
                </div>
            </div>
        </footer>
        <a target="_blank" rel="noreferrer" style={{
            border: '1px solid white',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
            borderRadius: '2px 2px 2px 2px',
            fontSize: '12px',
            lineHeight: '14px',
            position: 'fixed',
            zIndex: 999,
            display: 'inline-block',
            width: '25px',
            wordWrap: 'break-word',
            padding: '10px 6px',
            color: '#FFFFFF',
            background: '#866892',
            right: '0',
            bottom: '240px',
        }} href="https://jinshuju.net/f/KdziDP">内测用户邀请</a>
    </div>
}

export default App
