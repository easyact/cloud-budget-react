import {BudgetRepository} from '../BudgetRepository'
import * as _ from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
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
const rootDoc = db.collection('projects').doc('cb')

function getDoc(userId: string, version: string) {
    return rootDoc
        .collection('users').doc(userId)
        .collection('statements').doc(version)
}

export class BudgetRepositoryFirebase implements BudgetRepository {

    getBudget = (userId = 'default', version = 'current') => _.fromTask(() => getDoc(userId, version)
        .get()
        .then(doc => doc.exists ? O.some(doc.data()) : O.none)
    )

    patchBudgetList = (userId = 'default', version = 'current', name: string, v: any) => _.fromTask(
        () => getDoc(userId, version).update({[name]: v}))

    setBudget = (userId = 'default', version = 'current', v: any) => _.fromTask(
        () => getDoc(userId, version).set(v))

}
