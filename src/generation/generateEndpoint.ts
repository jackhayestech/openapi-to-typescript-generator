import {
	capitalizeFirstLetter,
	createSchemaFile,
	generateExportLine,
	generateImportString,
	generateInterface,
	getComponentNameFromRef,
} from '../common'
import { Params, Ref, TypedRequestKeys } from '../types/common.types'
import { Components, Parameters, RequestBody } from '../types/component.types'
import { Endpoint, Responses } from '../types/types'
import { generateTypedRequest } from './generateTypedRequest'
import {
	generateParamTypescript,
	generateParameterInterface,
	generateParameterObject,
	generateParameterObjectFromRef,
} from './parameterGeneration'
import { generateResponses } from './responseGeneration'

export class GenerateEndpoint {
	components: Components
	operationId: string
	endpointFile: string = ''
	componentImports: string[] = []
	responsesImports: string[] = []
	typedRequestImports: string[] = []
	typedRequest: TypedRequestKeys = { body: false, params: false }

	constructor(
		outputFolderName: string,
		components: Components,
		{ parameters, requestBody, responses, operationId }: Endpoint,
	) {
		if (!operationId) throw new Error('Operation Id required.')

		this.components = components
		this.operationId = operationId

		this.generateParameters(parameters)
		this.generateRequestBody(requestBody)
		this.createEndpointFile(outputFolderName, responses)
	}

	getExportLine(): string {
		return generateExportLine(this.operationId, ` as ${this.operationId}`)
	}

	addToEndpointFile(str: string) {
		this.endpointFile += str
	}

	addToStartOfEndpointFile(str: string) {
		this.endpointFile = `${str}${this.endpointFile}`
	}

	private createEndpointFile(outputFolderName: string, responses?: Responses) {
		this.addToEndpointFile(generateResponses(this.responsesImports, responses))
		this.addToEndpointFile(generateTypedRequest(this.typedRequest, this.typedRequestImports))

		this.addToStartOfEndpointFile(generateImportString(this.typedRequestImports, 'express-serve-static-core'))
		this.addToStartOfEndpointFile(generateImportString(this.componentImports, './schemas.types'))
		this.addToStartOfEndpointFile(generateImportString(this.responsesImports, './responses.types'))

		createSchemaFile(`${outputFolderName}/${this.operationId}.ts`, this.endpointFile)
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

		this.addToEndpointFile(paramString)
	}

	private generateParameterFromRef(convertedParameters: Params, { $ref }: Ref) {
		let name = getComponentNameFromRef($ref)
		let unmodifiedName = name

		if (this.components.parameters?.[name]) {
			name = `${capitalizeFirstLetter(this.components.parameters[name].name)} as ${unmodifiedName}`
		}

		this.addToComponentImports(name)

		generateParameterObjectFromRef(convertedParameters, unmodifiedName, this.components.parameters)
	}

	private addToComponentImports(name: string) {
		if (this.componentImports.includes(name)) return

		this.componentImports.push(name)
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

		this.addToEndpointFile(`${generateInterface(`RequestBody`, requestBodySchema, this.componentImports)}`)
	}
}
