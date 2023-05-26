import { redirect } from '@remix-run/node'
import { getSession } from './get-session.ts'
import { sessionStorage } from './session-storage.ts'

export async function logout(request: Request) {
	const session = await getSession(request)
	return redirect('/', {
		headers: {
			'Set-Cookie': await sessionStorage.destroySession(session),
		},
	})
}
