import { generateInterfaceKey, getComponentNameFromRef, newLine } from '../common'
import { Response, Responses } from '../types/types'

export const generateResponses = (imports: string[], responses?: Responses) => {
	let responsesString = `export interface Responses {${newLine}`

	for (const key in responses) {
		responsesString += generateResponse(imports, key, responses[key])
	}

	responsesString += `}${newLine}${newLine}`

	return responsesString
}

const generateResponse = (imports: string[], key: string, response: Response) => {
	if (!response.$ref) {
		throw new Error('Non ref responses not supported')
	}

	const name = getComponentNameFromRef(response.$ref)
	imports.push(name)

	return generateInterfaceKey(key, name, '')
}
