import {useAuth0} from '@auth0/auth0-react'
import * as O from 'fp-ts/Option'
import {Option} from 'fp-ts/Option'
import {flow, pipe} from 'fp-ts/function'
import {migrateEventsToUser} from '../service/budgetEsService'
import * as RTE from 'fp-ts/ReaderTaskEither'
import {ReaderTaskEither} from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import {EventStore} from '../../es/lib/eventStore'
import {IO} from 'fp-ts/IO'
import {getItem, setItem} from 'fp-ts-local-storage'
import {useEffect, useState} from 'react'

const uidKey = 'user.id'
const loadUser = (): IO<Option<string>> => getItem(uidKey)
const saveUser = (user: string): IO<void> => setItem(uidKey, user)
const defaultUser = 'default'
export default function useUser(eventStore: EventStore) {
    const {user: {email}} = useAuth0()
    const [uid, setUid] = useState(email ?? defaultUser)
    const [isAuthenticated, setAuthenticated] = useState(false)
    const [error, setError] = useState<string>()
    const localUser: Option<string> = loadUser()()
    const task: ReaderTaskEither<EventStore, string, string> = email ? pipe(
        pipe(localUser, O.fold(
            () => migrateEventsToUser(email),
            RTE.of
        )),
        RTE.chainFirst(() => RTE.fromIO(saveUser(email))),
        RTE.chain(lUser => RTE.fromOption(
            () => `本地存储损坏,因为读不到刚刚覆盖的用户数据: ${lUser}->${email}`
        )(loadUser()())),
    ) : pipe(localUser, O.fold(
        () => RTE.of(defaultUser),
        RTE.of
    ))
    useEffect(function execTask() {
        task(eventStore)().then(E.fold(
            setError,
            flow(setUid, () => setAuthenticated(true)))
        ).catch(setError)
    }, [task, eventStore])
    return {uid, error, isAuthenticated}
}
