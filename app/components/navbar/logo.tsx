import { SvgLogo } from './svg-logo'

export const Logo = () => {
	return (
		<div className="hidden h-10 w-10 cursor-pointer justify-center p-1 md:flex md:h-14 md:w-14">
			<SvgLogo />
		</div>
	)
}
