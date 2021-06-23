export function active(action: string = 'PUT_ITEM') {
    gtag('event', action, {
        'event_category': 'engagement',
        'event_label': 'action'
    })
}

export function init() {
    if (process.env.NODE_ENV === 'production')
        gtag('config', 'G-3ZE3YFHFZY')
    else console.log('Ignore GA because NODE_ENV', process.env.NODE_ENV)
}
