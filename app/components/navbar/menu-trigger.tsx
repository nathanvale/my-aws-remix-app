import { clsx } from 'clsx'
import React from 'react'
import { useOptionalUser } from '~/utils'

export const getInitials = (name: string) => {
	const [first, last] = name.split(' ')
	return `${first[0]}${last[0]}`.toLocaleUpperCase()
}

export const MenuTrigger = React.forwardRef<
	HTMLDivElement,
	React.ComponentPropsWithoutRef<'button'> & { open?: boolean }
>((props, _ref) => {
	const currentUser = useOptionalUser()
	return (
		<div ref={_ref} className="flex" aria-label="Customise options">
			<button
				className={clsx(
					'c-hamburger--collapse c-hamburger focus:shadow-[0_0_0_2px] focus:shadow-black  md:hidden',
					{
						active: props.open,
					},
				)}
				{...props}
			>
				<div className="--hamburger-color:red c-hamburger-inner">
					<span className="c-hamburger-bar"></span>
					<span className="c-hamburger-bar"></span>
					<span className="c-hamburger-bar"></span>
				</div>
			</button>
			<button
				className="hover:bg-red hidden h-14 w-14 items-center justify-center rounded-full bg-gray-300 outline-none focus:shadow-[0_0_0_2px]  focus:shadow-black md:flex"
				{...props}
			>
				<span className="text-2xl font-semibold text-gray-600">
					{getInitials(currentUser?.name ?? 'Anonymous User')}
				</span>
			</button>
		</div>
	)
})

MenuTrigger.displayName = 'MenuTrigger'
