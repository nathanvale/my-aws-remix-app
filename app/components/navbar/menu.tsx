import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MenuContent } from './menu-content.tsx'
import { MenuTrigger } from './menu-trigger.tsx'
import { clsx } from 'clsx'
import { Form, Link, useSubmit } from '@remix-run/react'

interface MenuProps {
	onOpenChange: (open: boolean) => void
}

const args = [
	'relative flex select-none items-center px-6 py-4 text-2xl leading-none text-white outline-none  md:px-4 md:py-2 md:text-base md:text-neutral-900',
	'data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-blue-600 data-[highlighted]:text-white',
]
export const Menu: React.FC<MenuProps> = ({ onOpenChange }) => {
	const [open, setOpen] = React.useState(false)
	const submit = useSubmit()
	return (
		<>
			<DropdownMenu.Root
				onOpenChange={() => {
					onOpenChange(!open)
					setOpen(!open)
				}}
				open={open}
			>
				<DropdownMenu.Trigger asChild>
					<MenuTrigger open={open} />
				</DropdownMenu.Trigger>
				<DropdownMenu.Portal>
					<MenuContent>
						<DropdownMenu.Item className={clsx(args)} asChild>
							<Link to="/settings">Settings</Link>
						</DropdownMenu.Item>
						<DropdownMenu.Item className={clsx(args)} asChild>
							<Form
								action="/logout"
								method="POST"
								onClick={e => submit(e.currentTarget)}
							>
								<button type="submit">Logout</button>
							</Form>
						</DropdownMenu.Item>
						<DropdownMenu.Arrow className="fill-blue-500 md:fill-white" />
					</MenuContent>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>
		</>
	)
}
