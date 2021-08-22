// import mixpanel from 'mixpanel-browser'

export function track(action: string = 'PUT_ITEM', otherParams = {}) {
    const params = {
        'event_category': 'engagement',
        'event_label': 'action'
    }
    gtag('event', action, {...params, ...otherParams})
    // @ts-ignore
    window.analytics && window.analytics.track(action, otherParams)
    // mixpanel.track(action)
}

export function init() {
    if (process.env.NODE_ENV === 'production') {
        gtag('config', 'G-3ZE3YFHFZY')
        // mixpanel.init('a578b85c3ac38e9679b31602d1160994')
        // mixpanel.track('page_view')
    } else console.log('Ignore analytics because NODE_ENV', process.env.NODE_ENV)
}

export function sign_up() {
    console.log('First login!')
    track('sign_up', {method: 'auth0'})
}
