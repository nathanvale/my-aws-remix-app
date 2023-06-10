import { faker } from '@faker-js/faker'
import type { User } from '~/models/user/user.server.ts'

function getDates() {
	const today = new Date()
	const createdAt = faker.date
		.between(
			new Date().setDate(today.getDate() - 90),
			new Date().setDate(today.getDate() - 60),
		)
		.toISOString()
	const updatedAt = faker.date
		.between(new Date().setDate(today.getDate() - 30), new Date())
		.toISOString()
	return { createdAt, updatedAt }
}

export function createUserSeed(): User {
	const { createdAt, updatedAt } = getDates()
	const firstName = faker.helpers.unique(faker.name.firstName)
	const lastName = faker.helpers.unique(faker.name.lastName)
	const image = faker.image.avatar()

	const username = faker.internet.userName(
		firstName.toLowerCase(),
		lastName.toLowerCase(),
	)

	return {
		userId: faker.helpers.unique(faker.random.alphaNumeric),
		email: faker.internet.exampleEmail(
			firstName.toLowerCase(),
			lastName.toLowerCase(),
		),
		name: `${firstName} ${lastName}`,
		username,
		password: faker.internet.password(),
		createdAt,
		updatedAt,
		image,
	}
}
