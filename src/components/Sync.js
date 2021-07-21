import LoginButton from '../auth/LoginButton'

export function Sync() {
    return <div className="hero container is-max-desktop">
        <div className="hero-body has-text-centered">
            <p className="subtitle">登录后即可与云端同步数据</p>
            <LoginButton fullWidth={true}/>
        </div>
    </div>
}
