import {BudgetRepository} from '../BudgetRepository'
import {Task} from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import {Option} from 'fp-ts/Option'
import firebase from 'firebase/app'
// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyDxW7o8GCSkKfRZkqOlkyx7jdhYLdysdd4',
    authDomain: 'easyact.firebaseapp.com',
    projectId: 'easyact',
})

const db = firebase.firestore()
const environment = {
    production: process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
}
if (environment.production) {
    console.log('Production now!')
    db.settings({
        host: 'xhcxjz8nw8.execute-api.ap-southeast-1.amazonaws.com/db',
        experimentalForceLongPolling: true
    })
}

export class BudgetRepositoryFirebase implements BudgetRepository {
    getBudget(userId = 'default', version = 'current'): Task<Option<any>> {
        return () => db.collection('projects').doc('cb')
            .collection('users').doc(userId)
            .collection('statements').doc(version)
            .get()
            .then(doc => doc.exists ? O.some(doc.data()) : O.none)
    }

    patchBudgetList(userId = 'default', version = 'current', name: string, v: any): Task<void> {
        return undefined
    }

    setBudget(userId = 'default', version = 'current', v: any): Task<void> {
        return undefined
    }

}
