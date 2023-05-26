import invariant from 'tiny-invariant'
import { sessionStorage } from './session-storage.ts'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export async function getSession(request: Request) {
	const cookie = request.headers.get('Cookie')
	return sessionStorage.getSession(cookie)
}
