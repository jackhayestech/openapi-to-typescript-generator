import { writeFile } from 'fs'
import { generateImportString, generateInterface } from '../common'
import { ReqResponse, Responses } from '../types/component.types'

export const generateResponseComponents = (responses?: Responses) => {
	if (!responses) return

	const imports: string[] = []
	let fileString = ''
	let response

	for (const key in responses) {
		response = generateResponse(key, responses[key], imports)
		if (response) {
			fileString += response
		}
	}

	fileString = `${generateImportString(imports)}${fileString}`

	writeFile(`./generated/responses.types.ts`, fileString, () => {})
}

const generateResponse = (key: string, response: ReqResponse, imports: string[]): string => {
	return `export ${generateInterface(key, response.content['application/json'].schema, imports)}`
}
