import { createSchemaFile, generateExportLine, generateInterface } from '../common'
import { ReqResponse, Responses } from '../types/component.types'
import { ImportCollection } from './importCollection'

const fileName = 'responses.types'

export const generateResponseComponents = (output: string, responses?: Responses): string => {
	if (!responses) return ''

	const imports = new ImportCollection('./schemas.types')
	let fileString = ''
	let response

	for (const key in responses) {
		response = generateResponse(key, responses[key], imports)
		if (response) {
			fileString += response
		}
	}

	fileString = `${imports.generateImportString()}${fileString}`

	createSchemaFile(`${output}/${fileName}.ts`, fileString)

	return generateExportLine(fileName)
}

const generateResponse = (key: string, response: ReqResponse, imports: ImportCollection): string => {
	return `export ${generateInterface(key, response.content['application/json'].schema, imports)}`
}
