export function active(action: string = 'PUT_ITEM', otherParams = {}) {
    const params = {
        'event_category': 'engagement',
        'event_label': 'action'
    }
    gtag('event', action, {...params, ...otherParams})
}

export function init() {
    if (process.env.NODE_ENV === 'production')
        gtag('config', 'G-3ZE3YFHFZY')
    else console.log('Ignore GA because NODE_ENV', process.env.NODE_ENV)
}

export function sign_up() {
    active('sign_up', {method: 'auth0'})
}
