/* ignore file coverage */
import { installGlobals } from '@remix-run/node'

class NoErrorThrownError extends Error {}
installGlobals()
process.env.SESSION_SECRET = 'shhhhhhhhh'

global.getError = async <TError>(call: () => unknown): Promise<TError> => {
	// Even though the error is caught, it still gets printed to the console
	// so we mock that out to avoid the printed error message.
	let logSpy = vitest.spyOn(console, 'log').mockImplementation(() => '')
	let errorSpy = vitest.spyOn(console, 'error').mockImplementation(() => '')
	try {
		await call()
		logSpy.mockRestore()
		errorSpy.mockRestore()
		throw new NoErrorThrownError()
	} catch (error: unknown) {
		logSpy.mockRestore()
		errorSpy.mockRestore()
		return error as TError
	}
	// Yes i know we could use finally to restore these mocks but thats too hard
	// to test that branch and I want the best test coverage lol.
}
