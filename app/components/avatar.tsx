interface AvatarProps {
	src: string | null | undefined
}

export const Avatar: React.FC<AvatarProps> = ({ src }) => {
	return <div className="h-30 w-30 bg-red rounded-full" />
}
