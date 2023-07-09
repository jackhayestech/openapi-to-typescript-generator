import { generateInterface, getComponentNameFromRef } from '../common'
import { Components, RequestBodies, RequestBody } from '../types/component.types'

export const generateRequestBody = (imports: string[], requestBody: RequestBody, components?: Components): string => {
	if (requestBody['$ref']) return getComponent(imports, requestBody['$ref'], components?.requestBodies)

	throw new Error('Non ref request bodies not supported')
}

const getComponent = (imports: string[], path: string, requestBodies?: RequestBodies): string => {
	if (!requestBodies) throw new Error('Missing request body component')

	const componentName = getComponentNameFromRef(path)
	const requestBody = requestBodies[componentName].content['application/json'].schema

	if ('properties' in requestBody) {
		return `${generateInterface(`RequestBody`, requestBody, imports)}`
	}

	throw new Error('Request body without parameters not supported')
}
