export function active(action: string = 'PUT_ITEM') {
    gtag('event', action, {
        'event_category' : 'engagement',
        'event_label' : 'action'
    });
}
