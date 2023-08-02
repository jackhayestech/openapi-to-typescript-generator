import { ReqResponse, Responses } from '../types/component.types'
import { GenerateInterface } from './common/generateInterface'
import { ImportCollection } from './common/importCollection'
import { createSchemaFile, generateExportLine } from './common/utilities'

export class ResponseComponent {
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
			fileString += this.generateResponse(key, responses[key])
		}

		fileString = `${this.imports.generateImportString()}${fileString}`

		createSchemaFile(`${this.output}/${this.fileName}.ts`, fileString)
	}

	private generateResponse = (key: string, response: ReqResponse): string => {
		const schema = response.content['application/json'].schema

		const interfaceGen = new GenerateInterface(key, schema, this.imports)

		return `export ${interfaceGen.interface}`
	}

	getExport() {
		return generateExportLine(this.fileName)
	}
}
