import { ulid } from 'ulid'

/**
 * In the future this function could be used to create a unique id and send it to a logging serivce such as sumo logic
 * @returns a unique id
 */
export const logError = () => ulid()
