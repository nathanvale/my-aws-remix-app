import { redirect } from '@remix-run/node'
import { getSession } from './get-session'
import { sessionStorage } from './session-storage'

export async function logout(request: Request) {
	const session = await getSession(request)
	return redirect('/', {
		headers: {
			'Set-Cookie': await sessionStorage.destroySession(session),
		},
	})
}
