import { getComponentNameFromRef } from '../common'
import { Components, RequestBodies, RequestBody } from '../types/component.types'

export const generateRequestBody = (operationId: string, requestBody: RequestBody, components: Components): string => {
	let body: any
	if (requestBody['$ref']) body = getComponent(components.requestBodies, requestBody['$ref'])

	let requestBodyString = ''

	return ''
}

const getComponent = (requestBodies: RequestBodies | undefined, path: string): any => {
	if (!requestBodies) throw new Error('Missing request body component')

	const componentName = getComponentNameFromRef(path)

	return requestBodies[componentName].content['application/json'].schema
}
