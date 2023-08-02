import { ImportCollection } from '../common/ImportCollection'
import { generateInterfaceKey, getComponentNameFromRef, newLine } from '../common/utilities'
import { Response, Responses } from '../types/endpoint.types'

export const generateEndpointResponses = (imports: ImportCollection, responses?: Responses) => {
	let responsesString = `export interface Responses {${newLine}`

	for (const key in responses) {
		responsesString += generateResponse(imports, key, responses[key])
	}

	responsesString += `}${newLine}${newLine}`

	return responsesString
}

const generateResponse = (imports: ImportCollection, key: string, { $ref }: Response) => {
	if (!$ref) throw new Error('Non ref responses not supported')

	const name = getComponentNameFromRef($ref)
	imports.add(name)

	return generateInterfaceKey(key, name, '')
}
