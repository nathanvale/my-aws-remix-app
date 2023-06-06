import { cssBundleHref } from '@remix-run/css-bundle'
import type {
	DataFunctionArgs,
	LinksFunction,
	V2_MetaFunction,
} from '@remix-run/node'

import { json } from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'

import tailwindStylesheetUrl from './styles/tailwind.css'
import { GeneralErrorBoundary } from './components/error-boundary'
import { Container } from './components/container'
import { Navbar } from './components/navbar/navbar'
import { readUser } from './models/user/user.server'
import { authenticator, getUserId } from './utils/auth.server'
import { getEnv } from './utils/env.server'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
		},
		// NOTE: Architect deploys the public directory to /_static/
		{ rel: 'icon', href: '/_static/favicon.ico' },
		{ rel: 'stylesheet', href: tailwindStylesheetUrl },
		cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
	].filter(Boolean)
}

export const meta: V2_MetaFunction = () => {
	return [
		{ title: 'Chord connect' },
		{ name: 'description', content: 'Manage your tutors' },
	]
}

export async function loader({ request }: DataFunctionArgs) {
	console.log('loader')
	const userId = await getUserId(request)
	console.log('userId', userId)
	const user = userId ? await readUser(userId) : null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await authenticator.logout(request, { redirectTo: '/' })
	}

	return json({ user, ENV: getEnv() })
}
interface AppShellProps {
	children: React.ReactNode
}

const AppShell = ({ children }: AppShellProps) => {
	return (
		<html lang="en" className="dark h-full">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="h-full  bg-night-700 text-white">{children}</body>
		</html>
	)
}

export default function App() {
	const { user } = useLoaderData<typeof loader>()
	return (
		<AppShell>
			<Navbar user={user} />
			<div className="pb-20 pt-28">
				<Container>
					<Outlet></Outlet>
					<ScrollRestoration />
					<Scripts />
					<LiveReload />
				</Container>
			</div>
		</AppShell>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			defaultStatusHandler={({ error }) => {
				console.error(error)
				if (!error.internal) error.statusText = 'Internal Server Error'
				return (
					<AppShell>
						<div className="flex h-full items-center justify-center">
							<div className="mx-auto max-w-screen-sm text-center">
								<h1 className="text-primary-600 dark:text-primary-500 mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl">
									{error.status}
								</h1>
								<p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
									{error.statusText}
								</p>
							</div>
						</div>
					</AppShell>
				)
			}}
		/>
	)
}
