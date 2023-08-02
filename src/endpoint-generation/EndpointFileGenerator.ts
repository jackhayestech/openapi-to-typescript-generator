import { ImportCollection } from '../common/ImportCollection'
import { createSchemaFile } from '../common/utilities'

export class EndpointFileGenerator {
	fileString = ''
	responsesString = ''
	expressJsTypedRequest = ''
	paramString = ''
	requestBodyString = ''

	componentImports = new ImportCollection('./schemas.types')
	responsesImports = new ImportCollection('./responses.types')
	typedRequestImports = new ImportCollection('express-serve-static-core')

	addToEndpointFile(str: string) {
		this.fileString += str
	}

	addToStartOfEndpointFile(str: string) {
		this.fileString = `${str}${this.fileString}`
	}

	createEndpointFile(outputFolderName: string, operationId: string) {
		this.addToEndpointFile(this.paramString)
		this.addToEndpointFile(this.requestBodyString)
		this.addToEndpointFile(this.responsesString)
		this.addToEndpointFile(this.expressJsTypedRequest)

		this.addToStartOfEndpointFile(this.typedRequestImports.generateImportString())
		this.addToStartOfEndpointFile(this.componentImports.generateImportString())
		this.addToStartOfEndpointFile(this.responsesImports.generateImportString())

		createSchemaFile(`${outputFolderName}/${operationId}.ts`, this.fileString)
	}
}
