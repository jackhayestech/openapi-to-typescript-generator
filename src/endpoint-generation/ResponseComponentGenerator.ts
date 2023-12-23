import { ImportCollection } from '../common/ImportCollection'
import { InterfaceGenerator } from '../common/InterfaceGenerator'
import { createSchemaFile, generateExportString, newLine } from '../common/utilities'
import { ReqResponse, Responses } from '../types/component.types'

export class ResponseComponentGenerator {
	fileName = 'responses.types'
	output: string
	imports = new ImportCollection('./schemas.types')

	constructor(output: string, responses?: Responses) {
		this.output = output

		this.generateFile(responses)
	}

	private generateFile(responses?: Responses) {
		if (!responses) return

		let fileString = ''

		for (const key in responses) {
			fileString += this.getExpressExportString(key)
			fileString += 'export '
			fileString += this.generateResponse(`${key}Data`, responses[key])
		}

		fileString = `import { ResponseData } from '@jh-tech/response-object'${newLine}${this.imports.generateImportString()}${fileString}`

		createSchemaFile(`${this.output}/${this.fileName}.ts`, fileString)
	}

	private generateResponse = (key: string, response: ReqResponse): string => {
		const schema = response.content['application/json'].schema

		const interfaceGen = new InterfaceGenerator(key, schema, this.imports)

		return `${interfaceGen.interface}`
	}

	getExportString() {
		return generateExportString(this.fileName)
	}

	getExpressExportString(name: string) {
		return `export type ${name} = ResponseData<${name}Data>${newLine}${newLine}`
	}
}
