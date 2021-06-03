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

const migrateEventsIf1stLogin = (localUser: Option<string>, email: string) => pipe(
    localUser,
    O.fold(
        () => migrateEventsToUser(email),
        RTE.right
    )
)

export default function useUser(eventStore: EventStore) {
    const {user: {email} = {}} = useAuth0()
    const [uid, setUid] = useState(email ?? defaultUser)
    const [isAuthenticated, setAuthenticated] = useState(false)
    const notifyAuthed = () => setAuthenticated(true)
    const [error, notifyError] = useState<string>()
    const localUser: Option<string> = loadUser()()
    const task: ReaderTaskEither<EventStore, string, string> = email ? pipe(
        migrateEventsIf1stLogin(localUser, email),
        RTE.chainFirst(() => RTE.fromIO(saveUser(email))),
        RTE.chain(() => RTE.fromOption(() => `读不到用户数据`)(loadUser()())),
    ) : pipe(localUser, O.getOrElse(() => defaultUser), RTE.right)
    useEffect(function execTask() {
        task(eventStore)().then(E.fold(
            notifyError,
            flow(setUid, notifyAuthed))
        ).catch(notifyError)
    }, [task, eventStore])
    return {uid, error, isAuthenticated}
}
