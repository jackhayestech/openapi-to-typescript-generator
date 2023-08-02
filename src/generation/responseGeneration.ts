import { Response, Responses } from '../types/types'
import { ImportCollection } from './common/importCollection'
import { generateInterfaceKey, getComponentNameFromRef, newLine } from './common/utilities'

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
