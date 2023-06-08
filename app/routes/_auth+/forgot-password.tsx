import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import {
	json,
	redirect,
	type DataFunctionArgs,
	type V2_MetaFunction,
} from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { getUserByEmail, getUserByUsername } from '~/models/user/user.server'
import { sendEmail } from '~/utils/email.server'
import { decrypt, encrypt } from '~/utils/encryption.server'
import { Button, ErrorList, Field } from '~/utils/forms'
import { getDomainUrl } from '~/utils/misc.server'
import { commitSession, getSession } from '~/utils/session.server'
import { usernameSchema } from '~/utils/user-validation'

export const resetPasswordSessionKey = 'resetPasswordToken'
const resetPasswordTokenQueryParam = 'token'
const tokenType = 'forgot-password'

const tokenSchema = z.object({
	type: z.literal(tokenType),
	payload: z.object({
		username: usernameSchema,
	}),
})
const minUsernameOrEmailLength = 3
export const usernameOrEmailSchema = z
	.string()
	.min(minUsernameOrEmailLength, { message: 'Username or email is too short' })

export async function loader({ request }: DataFunctionArgs) {
	const resetPasswordTokenString = new URL(request.url).searchParams.get(
		resetPasswordTokenQueryParam,
	)
	if (resetPasswordTokenString) {
		const submission = tokenSchema.safeParse(
			JSON.parse(decrypt(resetPasswordTokenString)),
		)
		if (!submission.success) return redirect('/signup')
		const token = submission.data

		const session = await getSession(request.headers.get('cookie'))
		session.set(resetPasswordSessionKey, token.payload.username)
		return redirect('/reset-password', {
			headers: {
				'Set-Cookie': await commitSession(session),
			},
		})
	}

	return json({})
}

function createSchema(
	constraints: {
		isUsernameEmailUnique?: (usernameOrEmail: string) => Promise<boolean>
	} = {},
) {
	const forgotPasswordSchema = z.object({
		usernameOrEmail: usernameOrEmailSchema.superRefine(
			(usernameOrEmail, ctx) => {
				// if constraint is not defined, throw an error
				if (typeof constraints.isUsernameEmailUnique === 'undefined') {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: conform.VALIDATION_UNDEFINED,
					})
					return
				}
				if (usernameOrEmail.length < minUsernameOrEmailLength) return
				// if constraint is defined, validate uniqueness
				return constraints
					.isUsernameEmailUnique(usernameOrEmail)
					.then(isUnique => {
						if (isUnique) {
							return
						}
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: `A user doesn't exists with this ${
								usernameOrEmail.includes('@') ? 'email' : 'username'
							}`,
						})
					})
			},
		),
	})
	return forgotPasswordSchema
}

const forgotPasswordSchema = createSchema({
	async isUsernameEmailUnique(usernameOrEmail: string) {
		let existingUser = await getUserByUsername(usernameOrEmail)
		if (!existingUser) {
			existingUser = await getUserByEmail(usernameOrEmail)
		}
		return !!existingUser
	},
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const submission = await parse(formData, {
		schema: () => forgotPasswordSchema,
		acceptMultipleErrors: () => true,
		async: true,
	})

	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}
	if (!submission.value) {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}
	const { usernameOrEmail } = submission.value
	let user = null
	console.log('usernameOrEmail', usernameOrEmail)
	user = await getUserByEmail(usernameOrEmail)
	if (!user) {
		user = await getUserByUsername(usernameOrEmail)
	}
	if (user) {
		console.log('sending email')
		void sendPasswordResetEmail({ request, user })
	}

	return json({ status: 'success', submission } as const)
}

async function sendPasswordResetEmail({
	request,
	user,
}: {
	request: Request
	user: { email: string; username: string }
}) {
	const resetPasswordToken = encrypt(
		JSON.stringify({ type: tokenType, payload: { username: user.username } }),
	)
	const resetPasswordUrl = new URL(`${getDomainUrl(request)}/forgot-password`)
	resetPasswordUrl.searchParams.set(
		resetPasswordTokenQueryParam,
		resetPasswordToken,
	)

	await sendEmail({
		to: user.email,
		subject: `Epic Notes Password Reset`,
		text: `Please open this URL: ${resetPasswordUrl}`,
		html: `
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html>
			<head>
				<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
			</head>
			<body>
				<h1>Reset your Epic Notes password.</h1>
				<p>Click the link below to reset the Epic Notes password for ${user.username}.</p>
				<a href="${resetPasswordUrl}">${resetPasswordUrl}</a>
			</body>
		</html>
		`,
	})
}

export const meta: V2_MetaFunction = () => {
	return [{ title: 'Password Recovery for Epic Notes' }]
}

export default function ForgotPasswordRoute() {
	const forgotPasswordFetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'forgot-password-form',
		constraint: getFieldsetConstraint(forgotPasswordSchema),
		lastSubmission: forgotPasswordFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: forgotPasswordSchema })
		},
	})

	return (
		<div className="container mx-auto pb-32 pt-20">
			<div className="flex flex-col justify-center">
				{forgotPasswordFetcher.data?.status === 'success' ? (
					<div className="text-center">
						<img src="" alt="" />
						<h1 className="mt-44 text-h1">Check your email</h1>
						<p className="mt-3 text-body-md text-night-200">
							Instructions have been sent to the email address on file.
						</p>
					</div>
				) : (
					<>
						<div className="text-center">
							<h1 className="text-h1">Forgot Password</h1>
							<p className="mt-3 text-body-md text-night-200">
								No worries, we'll send you reset instructions.
							</p>
						</div>
						<forgotPasswordFetcher.Form
							method="POST"
							{...form.props}
							className="mx-auto mt-16 min-w-[368px] max-w-sm"
						>
							<Field
								labelProps={{
									htmlFor: fields.usernameOrEmail.id,
									children: 'Username or Email',
								}}
								inputProps={conform.input(fields.usernameOrEmail)}
								errors={fields.usernameOrEmail.errors}
							/>

							<ErrorList errors={form.errors} id={form.errorId} />

							<div className="mt-6">
								<Button
									className="w-full"
									size="md"
									variant="primary"
									status={
										forgotPasswordFetcher.state === 'submitting'
											? 'pending'
											: forgotPasswordFetcher.data?.status ?? 'idle'
									}
									type="submit"
									disabled={forgotPasswordFetcher.state !== 'idle'}
								>
									Recover password
								</Button>
							</div>
						</forgotPasswordFetcher.Form>
					</>
				)}
				<Link to="/login" className="mt-11 text-center text-body-sm font-bold">
					Back to Login
				</Link>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
