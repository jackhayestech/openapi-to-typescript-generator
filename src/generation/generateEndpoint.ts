import {
	capitalizeFirstLetter,
	generateExportLine,
	generateImportString,
	generateInterface,
	getComponentNameFromRef,
} from '../common'
import { Params, Ref, TypedRequestKeys } from '../types/common.types'
import { Components, Parameters, RequestBody } from '../types/component.types'
import { Endpoint } from '../types/types'
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
	typedRequest: TypedRequestKeys = { body: false, params: false }

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
		this.file.expressJsTypedRequest = generateExpressJsTypedRequest(this.typedRequest, typedRequestImports)

		this.file.createEndpointFile(outputFolderName, this.operationId)
	}

	getExportLine(): string {
		return generateExportLine(this.operationId, ` as ${this.operationId}`)
	}

	private generateParameters(parameters?: Parameters) {
		if (!parameters) return

		this.typedRequest.params = true

		const convertedParameters: Params = {}
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

	private generateParameterFromRef(convertedParameters: Params, { $ref }: Ref) {
		let name = getComponentNameFromRef($ref)
		let unmodifiedName = name

		if (this.components.parameters?.[name]) {
			name = `${capitalizeFirstLetter(this.components.parameters[name].name)} as ${unmodifiedName}`
		}

		this.file.componentImports.add(name)

		generateParameterObjectFromRef(convertedParameters, unmodifiedName, this.components.parameters)
	}

	private generateRequestBody(requestBody?: RequestBody) {
		if (!requestBody) return
		if (!requestBody['$ref']) throw new Error('Non ref request bodies not supported')
		if (!this.components?.requestBodies) throw new Error('Missing request body component')

		this.typedRequest.body = true
		const path = requestBody['$ref']
		const componentName = getComponentNameFromRef(path)
		const requestBodySchema = this.components?.requestBodies?.[componentName]?.content?.['application/json'].schema

		if (!requestBodySchema) throw new Error('Missing request body')
		if (!('properties' in requestBodySchema)) throw new Error('Request body without parameters not supported')

		const bodyString = `${generateInterface(`RequestBody`, requestBodySchema, this.file.componentImports)}`
		this.file.requestBodyString = bodyString
	}
}
