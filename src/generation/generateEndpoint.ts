import {
	capitalizeFirstLetter,
	generateExportLine,
	generateImportString,
	generateInterface,
	getComponentNameFromRef,
} from '../common'
import { ConvertedParameters, Ref } from '../types/common.types'
import { Components, RequestBody } from '../types/component.types'
import { Endpoint, PathParameters } from '../types/types'
import { EndpointFile } from './endpointFile'
import { generateExpressJsTypedRequest } from './generateTypedRequest'
import {
	generateParamTypescript,
	generateParameterInterface,
	generateParameterObject,
	generateParameterObjectFromRef,
} from './parameterGeneration'
import { generateEndpointResponses } from './responseGeneration'

export class GenerateEndpoint {
	components: Components
	operationId: string
	file = new EndpointFile()
	hasParameters = false
	hasBody = false

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
			this.hasParameters,
			this.hasBody,
			typedRequestImports,
		)

		this.file.createEndpointFile(outputFolderName, this.operationId)
	}

	getExportLine(): string {
		return generateExportLine(this.operationId, ` as ${this.operationId}`)
	}

	private generateParameters(parameters?: PathParameters) {
		if (!parameters) return

		this.hasParameters = true

		const convertedParameters: ConvertedParameters = {}
		const localImports: string[] = []
		let paramString = ''

		parameters.forEach((param) => {
			if ('in' in param) {
				paramString += generateParamTypescript(param)
				generateParameterObject(convertedParameters, param, localImports)
			} else {
				this.generateParameterFromRef(convertedParameters, param)
			}
		})

		paramString += generateParameterInterface(convertedParameters)
		paramString = `${generateImportString(localImports, './schemas.types')}${paramString}`

		this.file.paramString = paramString
	}

	private generateParameterFromRef(convertedParameters: ConvertedParameters, { $ref }: Ref) {
		let name = getComponentNameFromRef($ref)
		let unmodifiedName = name
		const parameters = this.components.parameters

		if (parameters?.[name]) {
			const param = parameters[name]
			name = `${capitalizeFirstLetter(param.name)} as ${unmodifiedName}`
		}

		this.file.componentImports.add(name)

		generateParameterObjectFromRef(convertedParameters, unmodifiedName, parameters)
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

		const bodyString = `${generateInterface(`RequestBody`, requestBodySchema, this.file.componentImports)}`
		this.file.requestBodyString = bodyString
	}
}
