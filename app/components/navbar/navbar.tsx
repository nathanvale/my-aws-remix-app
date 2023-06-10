import type { User } from '~/models/user/user.server.ts'
import { Container } from '../container.tsx'
import { Logo } from './logo.tsx'
import { Menu } from './menu.tsx'
import React from 'react'

import { clsx } from 'clsx'
import { menuContentAnimation } from './menu-content.tsx'
import { ButtonLink } from '~/utils/forms.tsx'
import { Link, useLocation } from '@remix-run/react'
interface NavbarProps {
	user?: User | null
}
const LoginButton = () => {
	const location = useLocation()
	return location.pathname !== '/login' ? (
		<ButtonLink to="/login" size="sm" variant="primary">
			Log In
		</ButtonLink>
	) : null
}
export const Navbar: React.FC<NavbarProps> = ({ user }) => {
	const [open, setOpen] = React.useState(false)
	return (
		<nav className="fixed z-10 w-full shadow-sm">
			<div
				className={clsx('fixed h-screen w-screen bg-blue-500 md:hidden', {
					hidden: !open,
					animation: menuContentAnimation,
				})}
			></div>
			<div className="py-4 md:py-5">
				<Container>
					<div className="flex flex-row items-center justify-between gap-3 md:gap-0">
						<Link to="/">
							<Logo />
						</Link>
						{user ? <Menu onOpenChange={setOpen} /> : <LoginButton />}
					</div>
				</Container>
			</div>
		</nav>
	)
}
