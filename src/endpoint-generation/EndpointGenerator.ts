import { InterfaceGenerator } from '../common/InterfaceGenerator'
import { generateExportString, getComponentNameFromRef } from '../common/utilities'
import { Components } from '../types/component.types'
import { Endpoint, PathParameters, RequestBody } from '../types/endpoint.types'
import { EndpointFileGenerator } from './EndpointFileGenerator'
import { generateExpressJsTypedRequest } from './generateTypedRequest'
import { ParameterGenerator } from './path-parameter/PathParameterGenerator'
import { generateEndpointResponses } from './responseGeneration'

export class EndpointGenerator {
	components: Components
	operationId: string
	file = new EndpointFileGenerator()
	hasPathParameters = false
	hasQueryParameters = false
	hasBody = false
	exportLine: string

	constructor(
		outputFolderName: string,
		components: Components,
		{ parameters, requestBody, responses, operationId }: Endpoint,
	) {
		if (!operationId) throw new Error('Operation Id required.')

		this.components = components
		this.operationId = operationId
		const { responsesImports, typedRequestImports } = this.file

		this.generateParameters(parameters)
		this.generateRequestBody(requestBody)

		this.file.responsesString = generateEndpointResponses(responsesImports, responses)
		this.file.expressJsTypedRequest = generateExpressJsTypedRequest(
			this.hasPathParameters,
			this.hasQueryParameters,
			this.hasBody,
			typedRequestImports,
		)

		this.file.createEndpointFile(outputFolderName, this.operationId)
		this.exportLine = generateExportString(this.operationId, ` as ${this.operationId}`)
	}

	private generateParameters(parameters?: PathParameters) {
		if (!parameters) return
		const parametersGen = new ParameterGenerator(parameters, this.components.parameters)

		this.file.paramString = parametersGen.parametersString
		this.file.componentImports.addMany(parametersGen.imports)
		this.hasPathParameters = parametersGen.pathParameter
		this.hasQueryParameters = parametersGen.queryParameter
	}

	private generateRequestBody(requestBody?: RequestBody) {
		if (!requestBody) return
		if (!requestBody['$ref']) throw new Error('Non ref request bodies not supported')
		if (!this.components?.requestBodies) throw new Error('Missing request body component')

		this.hasBody = true
		const path = requestBody['$ref']
		const componentName = getComponentNameFromRef(path)
		const requestBodySchema = this.components?.requestBodies?.[componentName]?.content?.['application/json'].schema

		if (!requestBodySchema) throw new Error('Missing request body')
		if (!('properties' in requestBodySchema)) throw new Error('Request body without parameters not supported')

		const interfaceGen = new InterfaceGenerator(`RequestBody`, requestBodySchema, this.file.componentImports)

		const bodyString = interfaceGen.interface

		this.file.requestBodyString = bodyString
	}
}
