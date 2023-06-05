import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { clsx } from 'clsx'
export const menuContentAnimation =
	'will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade'
export const MenuContent = ({
	children,
	...rest
}: DropdownMenu.DropdownMenuContentProps) => {
	return (
		<DropdownMenu.Content
			{...rest}
			className={clsx(
				'z-50',
				'mt-14 min-w-[220px] p-[5px] md:mt-2 md:bg-white',
				'flexd w-screen flex-col bg-blue-500 md:w-auto',
				'md:shadow-[0px_8px_38px_-8px_rgba(22,_23,_24,_0.2),_0px_8px_8px_-8px_rgba(22,_23,_24,_0.2)]',
				menuContentAnimation,
			)}
			sideOffset={8}
		>
			{children}
		</DropdownMenu.Content>
	)
}
