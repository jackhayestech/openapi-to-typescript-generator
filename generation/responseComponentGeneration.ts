import { writeFile } from 'fs'
import { generateExportLine, generateImportString, generateInterface } from '../common'
import { ReqResponse, Responses } from '../types/component.types'

const fileName = 'responses.types'

export const generateResponseComponents = (responses?: Responses): string => {
	if (!responses) return ''

	const imports: string[] = []
	let fileString = ''
	let response

	for (const key in responses) {
		response = generateResponse(key, responses[key], imports)
		if (response) {
			fileString += response
		}
	}

	fileString = `${generateImportString(imports, 'schemas')}${fileString}`

	writeFile(`./generated/${fileName}.ts`, fileString, () => {})

	return generateExportLine(fileName)
}

const generateResponse = (key: string, response: ReqResponse, imports: string[]): string => {
	return `export ${generateInterface(key, response.content['application/json'].schema, imports)}`
}
