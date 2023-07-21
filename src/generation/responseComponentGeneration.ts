import { createSchemaFile, generateExportLine, generateInterface } from '../common'
import { ReqResponse, Responses } from '../types/component.types'
import { ImportCollection } from './importCollection'

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

		return `export ${generateInterface(key, schema, this.imports)}`
	}

	getExport() {
		return generateExportLine(this.fileName)
	}
}
