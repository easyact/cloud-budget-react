import firebase from 'firebase/app'
import 'firebase/firestore'
import {useEffect, useState} from 'react'
import * as R from 'ramda'

const firebaseConfig = {
    apiKey: 'AIzaSyDxW7o8GCSkKfRZkqOlkyx7jdhYLdysdd4',
    authDomain: 'easyact.firebaseapp.com',
    databaseURL: 'https://easyact.firebaseio.com',
    projectId: 'easyact',
    storageBucket: 'easyact.appspot.com',
    messagingSenderId: '916526582357',
    appId: '1:916526582357:web:bb77a980892741d0b122dc',
    measurementId: 'G-LKPPG7T5HY'
}
const db = firebase.initializeApp(firebaseConfig).firestore()

const environment = {
    production: process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
}

export function useBudget(userId = 'default', version = 'current') {
    const [budget, setBudget] = useState()
    if (!environment.production) {
        db.settings({
            host: 'xhcxjz8nw8.execute-api.ap-southeast-1.amazonaws.com/db',
            experimentalForceLongPolling: true
        })
    }
    useEffect(() => {
            db.collection('projects').doc('cb').collection('users').doc(userId)
                .collection('statements').doc(version)
                .get()
                .then(R.invoker(0, 'data'))
                .then(setBudget)
        }
        , [userId, version])
    return [budget, setBudget]
}
